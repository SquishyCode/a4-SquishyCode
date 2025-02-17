const dotenv = require("dotenv");
dotenv.config();

console.log("Github client ID:", process.env.GITHUB_CLIENT_SECRET);
console.log("Github client secret:", process.env.GITHUB_CLIENT_SECRET);

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const GithubStrategy = require("passport-github").Strategy;
const cors = require("cors");

//pg4aw1pIlYuWWcOy password for the mongo acc

const app = express();
app.set("view engine", "ejs");

app.use(session({
    secret: process.env.SESSION_SECRET, // EDIT LATER
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

const client = new MongoClient(process.env["MONGO_URI"]);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Successfully!");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1); // Exit if database connection fails
    }
}

connectDB();

const db = client.db("A3-HomeworkDB");
const usersCollection = db.collection("users");
const dataCollection = db.collection("data");

// Passport Auth Strategy
passport.use(new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
        console.log(`Attempting to authenticate user: ${username}`);

        const user = await usersCollection.findOne({ username });

        if (!user) {
            console.log("User not found");
            return done(null, false, { message: "Incorrect username." });
        }

        if (user.password !== password) {
            console.log("Incorrect password");
            return done(null, false, { message: "Incorrect password." });
        }

        console.log("User authenticated successfully");
        return done(null, user);
    }
));

//Passport Github Strategy
passport.use(new GithubStrategy({
    clientID: process.env["GITHUB_CLIENT_ID"],
    clientSecret: process.env["GITHUB_CLIENT_SECRET"],
    callbackURL: "http://localhost:3000/auth/github/callback"
}, async(accessToken, refreshToken, profile, done) => {
    console.log("Github Profile", profile);

    try {
        let user = await usersCollection.findOne({githubId: profile.id});

        if(!user) {
            user = await usersCollection.insertOne({
                githubId: profile.id,
                username: profile.username,
                displayName: profile.displayName,
                profileUrl: profile.profileUrl
            });

            user = await usersCollection.findOne({githubId: profile.id});
        }

        done(null, user);
    } catch(error) {
        done(error);
    }
}));

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user._id);
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    console.log("Deserializing user ID:", id);

    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!user) {
            console.error("Error: User not found in DB.");
            return done(new Error("User not found."));
        }

        user._id = user._id.toString(); // Ensure it's a string before attaching to req.user
        console.log("User found in DB:", user);
        done(null, user);
    } catch (error) {
        console.error("Error deserializing user:", error);
        done(error);
    }
});


app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(cors({origin: "http://127.0.0.1:5173/register", credentials: true}));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes(usersCollection, dataCollection));

//Listen
const PORT = process.env.PORT || 3000;
const HOST = "localhost";
app.listen(PORT, () => {
    console.log(`Server is running on: http://${HOST}:${PORT}`);
});
