const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "linkedin";

// Middleware
app.use(express.json());

let db;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
  try {
    const client = await MongoClient.connect(uri);
    console.log("Connected to MongoDB");

    db = client.db(dbName);

    // Start server after successful DB connection
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if database connection fails
  }
}

// Initialize Database
initializeDatabase();

// Helper: Convert string ID to ObjectId
const toObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
};

// 1. Fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 2. Fetch a specific user
app.get('/users/:userId', async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// 3. Create a new user
app.post('/users', async (req, res) => {
  try {
    const result = await db.collection("users").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// 4. Update user headline
app.patch('/users/:userId', async (req, res) => {
  try {
    const result = await db.collection("users").updateOne(
      { userId: req.params.userId },
      { $set: { headline: req.body.headline } }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// 5. Delete a user
app.delete('/users/:userId', async (req, res) => {
  try {
    const result = await db.collection("users").deleteOne({ userId: req.params.userId });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// 6. Fetch all connections for a user
app.get('/connections/:userId', async (req, res) => {
  try {
    const connections = await db.collection("connections").find({ user1: req.params.userId }).toArray();
    res.json(connections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching connections" });
  }
});

// 7. Send a connection request
app.post('/connections', async (req, res) => {
  try {
    const result = await db.collection("connections").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending connection request" });
  }
});

// 8. Accept a connection request
app.patch('/connections/:connectionId', async (req, res) => {
  try {
    const result = await db.collection("connections").updateOne(
      { connectionId: req.params.connectionId },
      { $set: { status: "connected" } }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error accepting connection request" });
  }
});

// 9. Remove a connection
app.delete('/connections/:connectionId', async (req, res) => {
  try {
    const result = await db.collection("connections").deleteOne({ connectionId: req.params.connectionId });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing connection" });
  }
});

// 10. Fetch all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await db.collection("posts").find({}).toArray();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// 11. Fetch a specific post
app.get('/posts/:postId', async (req, res) => {
  try {
    const post = await db.collection("posts").findOne({ postId: req.params.postId });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// 12. Create a new post
// app.post('/posts', async (req, res) => {
//   try {
//     const result = await db.collection("posts").insertOne(req.body);
//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating post" });
//   }
// });

app.post("/posts", async (req, res) => {
    const { postId, userId, content, likes, createdAt } = req.body;
  
    try {
      const postsCollection = db.collection("posts");
  
      const result = await postsCollection.insertOne({
        postId,
        userId,
        content,
        likes,
        createdAt:new Date()  // If no `createdAt`, use current date
      });
  
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// 13. Add a like to a post
app.patch('/posts/:postId/likes', async (req, res) => {
  try {
    const result = await db.collection("posts").updateOne(
      { postId: req.params.postId },
      { $inc: { likes: 1 } }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error liking post" });
  }
});

// 14. Delete a post
app.delete('/posts/:postId', async (req, res) => {
  try {
    const result = await db.collection("posts").deleteOne({ postId: req.params.postId });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// 15. Fetch messages for a user
app.get('/messages/:userId', async (req, res) => {
  try {
    const messages = await db.collection("messages").find({ to: req.params.userId }).toArray();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// 16. Send a message
app.post('/messages', async (req, res) => {
  try {
    const result = await db.collection("messages").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending message" });
  }
});



app.post("/posts", async (req, res) => {
    const { messageId, from, to, content, sendAt } = req.body;
  
    try {
      const postsCollection = db.collection("posts");
  
      const result = await postsCollection.insertOne({
        messageId,
        from,
        to,
        content,
        sendAt:new Date()  // If no `createdAt`, use current date
      });
  
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// 17. Delete a message
app.delete('/messages/:messageId', async (req, res) => {
  try {
    const result = await db.collection("messages").deleteOne({ _id: toObjectId(req.params.messageId) });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting message" });
  }
});

// 18. Fetch profile views count
app.get('/users/:userId/profile-views', async (req, res) => {
  try {
    const user = await db.collection("users").findOne(
      { userId: req.params.userId },
      { projection: { profileViews: 1 } }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile views" });
  }
});

// 19. Add a skill to a user
app.put('/users/:userId/skills', async (req, res) => {
  try {
    const result = await db.collection("users").updateOne(
      { userId: req.params.userId },
      { $push: { skills: req.body.skill } }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding skill" });
  }
});

// 20. Upgrade to premium account
app.patch('/users/:userId/premium', async (req, res) => {
  try {
    const result = await db.collection("users").updateOne(
      { userId: req.params.userId },
      { $set: { isPremium: true } }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error upgrading account" });
  }
});
