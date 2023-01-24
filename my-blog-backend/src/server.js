import express from "express";
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import 'dotenv/config';
import { db, connectToDb } from "./db.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentials = JSON.parse(
    fs.readFileSync("./credentials.json")
);

// initialize the firebase admin package on our server and connect it to our firebase project
// it will enable our admin to verify users that make requests to our server
admin.initializeApp({credential: admin.credential.cert(credentials)});

const app = express();

// Allows us to get the request.body whenever the client side sends extra information with their request
app.use(express.json());
app.use(express.static(path.join(__dirname, "../build")));

// Route handler when we receive a request that isn't to one of our /api/ routes
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, "../build/index.html"));
})

// Allows us to get the request.user property whenever the client side sends credentials (authtoken)
app.use(async (req, res, next) => {
    const { authtoken } = req.headers;
    
    if (authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
        } catch (e) {
            return res.sendStatus(400);
        }
    }

    req.user = req.user || {};
    
    next(); // make sure the program execution continues to the route handlers
})

// Route handlers
app.get("/api/articles/:name", async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection("articles").findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || [];
        article.canUpvote = uid && !upvoteIds.includes(uid);
        res.json(article);
    } else {
        res.sendStatus(404);
    }
});

// middleware
app.use((req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401); // not allowed to access that resource
    }
})

app.put("/api/articles/:name/upvote", async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection("articles").findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || [];
        const canUpvote = uid && !upvoteIds.includes(uid);
        if (canUpvote) {
            await db.collection("articles").updateOne({ name }, { 
                $inc: { upvotes: 1 },
                $push: { upvoteIds: uid }
            });
        }
        const updatedArticle = await db.collection("articles").findOne({ name });
   
        res.json(updatedArticle);
    } else {
        res.send("That article doesn\'t exist");
    }
});

app.post("/api/articles/:name/comments", async (req, res) => {
    const { name } = req.params;
    const { text } = req.body;
    const { email } = req.user;

    await db.collection("articles").updateOne({ name }, { $push: { comments: { postedBy: email, text } }});

    const article = await db.collection("articles").findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.send("That article doesn\'t exist");
    }
})

// Allows the hosting platform to specify the port our app should listen to
const PORT = process.env.PORT || 8000;

// Connecting to a port
connectToDb(() => {
    console.log('Successfully connected to database!');
    app.listen(PORT, () => {
        console.log("Server is listening on port " + PORT);
    })
})