const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5004;
app.use(express.json());
app.use(cors());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xzkprd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const campCollection = client.db("mediCamp").collection("camp");
    const joinCampCollection = client.db("mediCamp").collection("joinCamp");
    const userCollection = client.db("mediCamp").collection("users");

    app.get("/camp", async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result);
    });

    app.get("/campdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(query);
      res.send(result);
    });

    app.get("/popularCamps", async (req, res) => {
      const result = await campCollection
        .find()
        .sort({ participantCount: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/joinCamp", async (req, res) => {
      const result = await joinCampCollection.find().toArray();
      res.send(result);
    });

    app.post("/joinCamp", async (req, res) => {
      const camp = req.body;

      await campCollection.updateOne(
        { _id: new ObjectId(camp.campId) },
        { $inc: { participantCount: 1 } }
      );

      const result = await joinCampCollection.insertOne(camp);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("medical camp side server is running");
});

app.listen(port, (req, res) => {
  console.log(`medical camp server is running on port:${port}`);
});
