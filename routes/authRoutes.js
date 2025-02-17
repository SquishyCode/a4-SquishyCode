const express = require("express");
const passport = require("passport");
const {ObjectId} = require("mongodb");

const checkAuth = (req, res, next) => {
    if(req.session && req.session.user) {
        return res.status(200).json({message: "Already logged in", user: req.session.user});
    }
    next();
};

module.exports = (usersCollection, dataCollection) => {
    const router = express.Router();

    // Root route
    router.get("/", (req, res) => {
        res.redirect("http://localhost:5173/login");
    });

    // Register Page
    router.get("/register", (req, res) => res.render("http://localhost:5173/register"));

    // Login Page
    router.get("/login", (req, res) => {
        res.render("http://localhost:5173/login");
    });

    // Login Logic
    router.post("/login", (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                console.error("Authentication error:", err);
                return next(err);
            }
            if (!user) {
                console.log("Login failed:", info.message);
                return res.status(400).json({message: info?.message || "Invalid credentials"});
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.error("Login error:", err);
                    return next(err);
                }
                console.log("Login successful, redirecting...");
                return res.status(200).json({message: "Login successful", user: req.user});
            });
        })(req, res, next);
    });



    // Logout Route
    router.get("/logout", (req, res, next) => {
        req.logout();
        req.session.destroy((err) => {
            if(err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("Error logging out");
            }
            res.redirect("/login");
        })
    });

    router.post("/logout", (req, res) => {
        res.clearCookie("session");
        res.json({message: "Logged out successfully"});
    });

    //Route for Debug
    router.get("/session", (req, res) => {
        console.log("Session Data", req.session);
        res.json(req.session);
    })

    //Results Page
    function isAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            console.log("User is authenticated, proceeding to results page");
            return next();
        }
        console.log("User is not authenticated, redirecting to login");
        res.redirect("/login");
    }

    router.get("/results", isAuthenticated, async (req, res) => {
        try {
            console.log("Fetching data for user:", req.user._id);

            const userData = await dataCollection.find({userId: req.user._id.toString()}).toArray();
            console.log("Fetched userData:", userData);

            const user = await usersCollection.findOne({_id: req.user._id});
            console.log("Fetched user:", user);

            if (!user) {
                console.error("User not found in database.");
                return res.status(404).send("User not found.");
            }

            res.json({userData, user});
        } catch (error) {
            console.error("Error fetching results:", error);
            res.status(500).send("Internal Server Error");
        }
    });


    // Route to add
    router.post("/add", isAuthenticated, async (req, res) => {
        try {
            console.log("User in request before insert:", req.user);

            if (!req.user || !req.user._id) {
                console.error("Error: User ID is missing before inserting data.");
                return res.status(400).send("User not authenticated.");
            }

            const userId = req.user._id.toString();

            const newData = {
                userId: userId,
                title: req.body.title,
                description: req.body.description,
                timestamp: new Date().toISOString()
            };

            console.log("Data being inserted:", newData);

            await dataCollection.insertOne(newData);

            console.log("Data successfully inserted.");
            res.redirect("/results");
        } catch (error) {
            console.error("Error adding data:", error);
            res.status(500).send("Internal Server Error");
        }
    });


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
        await dataCollection.deleteOne({_id: new ObjectId(req.params.id)});
        res.json({message: "Deleted successfully"});
    });

    //Auth Github routes
    router.get('/auth/github', passport.authenticate("github", {scope: ["user:email"]}));

    router.get('/auth/github/callback',
        passport.authenticate("github", {failureRedirect: "/"}),
        (req, res) => {
            res.redirect("http://localhost:5173/results");
        }
    );

    router.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) {
            return res.json({user: null});
        }
        res.json({user: req.user});
        res.redirect("/register");
    });

    //Register Route for React
    router.post("/register", async (req, res) => {
        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({message: "Username and password are required"});
        }

        try {
            const existingUser = await usersCollection.findOne({username});

            if(existingUser) {
                console.log("This user already exists!");
                return res.status(400).json({message: "User already exists"});
            }

            console.log("Attempting to insert user:", username);
            await usersCollection.insertOne({username, password});
            console.log("User inserted successfully");
            res.status(201).json({message: "User registered successfully"});
        } catch(error){
            res.status(500).json({message: "Internal server error"});
        }
    });

    router.get("/api/results", isAuthenticated, async (req, res) => {
        try {
            const userData = await dataCollection.find({ userId: req.user._id.toString()}).toArray();
            const user = await usersCollection.findOne({_id: new ObjectId(req.user._id)});

            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            res.json({userData, user});
        } catch (error) {
            console.error("Error fetching results:", error);
            res.status(500).json({message: "Internal Server Error"});
        }
    });




    return router;
};
