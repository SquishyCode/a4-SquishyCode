const express = require("express");
const passport = require("passport");
const { ObjectId } = require("mongodb");

module.exports = (usersCollection, dataCollection) => {
    const router = express.Router();
    let hardCodeUser = null;

    // Login route
    router.post("/login", (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(400).json({ message: info?.message || "Invalid credentials" });

            req.logIn(user, (err) => {
                if (err) return next(err);

                req.session.save((err) => {
                    if (err) return next(err);
                    res.status(200).json({ message: "Login successful", user: { _id: user._id, username: user.username } });
                });
            });
        })(req, res, next);
    });


    // Logout route
    router.post("/logout", (req, res) => {
        req.logout(() => {
            req.session.destroy();
            res.clearCookie("connect.sid");
            res.status(200).json({ message: "Logged out successfully" });
        });
    });

    // Register route
    router.post("/register", async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        await usersCollection.insertOne({ username, password });
        res.status(201).json({ message: "User registered successfully" });
    });

    // Results route
    router.get("/results", async (req, res) => {
        try {
            // Debugging logs
            console.log("Checking authentication for results...");
            console.log("Is Authenticated?:", req.isAuthenticated());
            console.log("Session Data:", req.session);
            console.log("User Data:", req.user);
            console.log(req.body);

            // if (!req.isAuthenticated() || !req.user) {
            //     return res.status(401).json({ message: "Unauthorized - User not logged in" });
            // }

            console.log("Fetching data for user:", req.user._id);

            const userData = await dataCollection.find({ userId: req.user._id.toString() }).toArray();
            //const user = await usersCollection.findOne({ _id: new ObjectId(req.user._id) });
            const user = await usersCollection.findOne({_id: new ObjectId('67b1845aa7cd608cf9898a84') });

            // if (!user) {
            //     return res.status(404).json({ message: "User not found" });
            // }

            res.json({ userData, user: { _id: user._id, username: user.username } });
        } catch (error) {
            console.error("Error fetching results:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });


    // GitHub Auth
    router.get('/auth/github', passport.authenticate("github", { scope: ["user:email"] }));
    router.get('/auth/github/callback', passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
        console.log("User authenticated with GitHub:", req.user);

        // 🔥 Save session before redirecting
        req.session.save((err) => {
            if (err) {
                console.error("Error saving session:", err);
                return res.status(500).send("Session error");
            }
            res.redirect("https://a4-squishycode-front.onrender.com/results");
        });
    });


    // Route to add
    router.post("/add", async (req, res) => {
        try {
            if (!req.user || !req.user._id) {
                return res.status(400).send("User not authenticated.");
            }
            const userId = req.user._id.toString();
            const newData = {
                userId,
                title: req.body.title,
                description: req.body.description,
                timestamp: new Date().toISOString()
            };
            await dataCollection.insertOne(newData);
            res.status(201).json({ message: "Data added successfully", newData });
        } catch (error) {
            console.error("Error adding data:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    // Route to edit
    router.post("/edit/:id", async (req, res) => {
        try {
            const { title, description, timestamp } = req.body;
            await dataCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { title, description, timestamp } }
            );
            res.json({ message: "Entry updated successfully" });
        } catch (error) {
            console.error("Error updating entry:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Route to delete
    router.post("/delete/:id", async (req, res) => {
        try {
            await dataCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.json({ message: "Deleted successfully" });
        } catch (error) {
            console.error("Error deleting entry:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });


    return router;
};
