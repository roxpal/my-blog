import express from "express";
import fs from 'fs';
import admin from 'firebase-admin';
import { db, connectToDb } from "./db.js";

const credentials = JSON.parse(
    fs.readFileSync("./credentials.json")
);

// initialize the firebase admin package on our server and connect it to our firebase project
// it will enable our admin to verify users that make requests to our server
admin.initializeApp({credential: admin.credential.cert(credentials)});

const app = express();

// Allows us to get the request.body whenever the client side sends extra information with their request
app.use(express.json());

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

// Connecting to a port
connectToDb(() => {
    app.listen(8000, () => {
        console.log("Server is listening on port 8000")
    })
})