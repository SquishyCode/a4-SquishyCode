const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const GithubStrategy = require("passport-github").Strategy;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path');
const MongoStore = require("connect-mongo");

passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await usersCollection.findOne({ username });
    if (!user) return done(null, false, { message: 'Invalid username' });
    if (user.password !== password) return done(null, false, { message: 'Invalid password' });
    return done(null, user);
}));

console.log("GITHUB CLIENT with parenthesis", process.env["GITHUB_CLIENT_ID"]);
console.log("GITHUB CLIENT without parenthesis", process.env.GITHUB_CLIENT_ID);


passport.use(new GithubStrategy({
    clientID: process.env["GITHUB_CLIENT_ID"],
    clientSecret: process.env["GITHUB_CLIENT_SECRET"],
    callbackURL: "https://a4-squishycode.onrender.com/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    let user = await usersCollection.findOne({ githubId: profile.id });
    if (!user) {
        user = await usersCollection.insertOne({ githubId: profile.id, username: profile.username });
    }
    return done(null, user);
}));

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);  // Debugging log
    done(null, { id: user._id, username: user.username });
});
passport.deserializeUser(async (userObj, done) => {
    console.log("Deserializing user:", userObj);  // Debugging log
    const user = await usersCollection.findOne({ _id: new ObjectId(userObj.id) });
    console.log("User found in deserialize:", user);
    done(null, user);
});



const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://a4-squishycode-front.onrender.com",
    credentials: true
}));

app.use(session({
    secret: process.env["SESSION_SECRET"],
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env["MONGO_URI"],
        collectionName: "sessions",
        ttl: 24 * 60 * 60
    }),
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none"
    }
}));



app.use(passport.initialize());
app.use(passport.session());

app.set("trust proxy", 1);

const client = new MongoClient(process.env["MONGO_URI"]);
(async () => { try { await client.connect(); console.log("Connected to MongoDB Successfully!"); } catch (error) { console.error("MongoDB Connection Error:", error); process.exit(1); } })();

const db = client.db("A3-HomeworkDB");
const usersCollection = db.collection("users");
const dataCollection = db.collection("data");
const sessionCollection = db.collection("sessions");

const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes(usersCollection, dataCollection));

app.get("/check-session", (req, res) => {
    console.log("Session Data:", req.session);
    console.log("User Data:", req.user);
    console.log("Sessions", sessionCollection.find());
    res.json({ session: req.session, user: req.user });
});

// app.use(express.static(path.join(__dirname, 'client', 'dist')));
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => { console.log(`Server is running on: http://localhost:${PORT}`); });
