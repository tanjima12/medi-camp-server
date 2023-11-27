const express = require("express");
const cors = require("cors");
const app = express();
var jwt = require("jsonwebtoken");
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
const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const campCollection = client.db("mediCamp").collection("camp");
const joinCampCollection = client.db("mediCamp").collection("joinCamp");
const userCollection = client.db("mediCamp").collection("users");

// app.get("/camp", async (req, res) => {
//   const result = await campCollection.find().toArray();
//   res.send(result);
// });

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
  let query = {};
  if (req.query?.email) {
    query = { email: req.query.email };
  }
  const result = await userCollection.find(query).toArray();
  res.send(result);
});
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await userCollection.deleteOne(query);
  res.send(result);
});
app.patch("/users/admin/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: "admin",
    },
  };

  app.get("/updateCamp/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await campCollection.findOne(query);
    res.send(result);
  });

  app.get("/camp", async (req, res) => {
    // let query = {};
    let sortObj = {};
    let queryObj = {};
    const category = req.query.category;
    console.log(category);

    const sortField = req.query.sortField;
    const sortOrder = req.query.sortOrder;

    if (sortField && sortOrder) {
      sortObj[sortField] = sortOrder;
    }
    if (category) {
      queryObj.Category = category;
    }
    const cursor = campCollection.find(queryObj).sort(sortObj);
    const result = await cursor.toArray();
    res.send(result);
  });
});

app.post("/campUpdateInfo/:id", async (req, res) => {
  const id = req.params.id;

  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const Camp = req.body;
  const campInfo = {
    $set: {
      campName: Camp.campName,
      specializedServices: Camp.specializedServices,
      scheduledDate: Camp.scheduledDate,
      scheduledTime: Camp.scheduledTime,
      venueLocation: Camp.venueLocation,
    },
  };
  const result = await campCollection.updateOne(filter, campInfo, options);
  res.send(result);
});
app.delete("/campDlt/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await campCollection.deleteOne(query);

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Camp deleted successfully" });
    } else {
      res.status(404).json({ message: "Camp not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("medical camp side server is running");
});

app.post("/addCamp", async (req, res) => {
  const newCamp = req.body;
  console.log(newCamp);
  // newCamp.time = parseInt(newCamp.time);
  const result = await campCollection.insertOne(newCamp);
  res.send(result);
});

app.post("/updateInfo/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const profileInfo = req.body;
  const Info = {
    $set: {
      name: profileInfo.name,
      photoURL: profileInfo.photoURL,
      role: profileInfo.roll,
    },
  };
  const result = await userCollection.updateOne(filter, Info, options);
  res.send(result);
});

app.listen(port, (req, res) => {
  console.log(`medical camp server is running on port:${port}`);
});
