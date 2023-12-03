const express = require("express");

const cors = require("cors");
const app = express();
// var jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const port = process.env.PORT || 5005;

app.use(express.json());
app.use(cors());

// app.use(
//   cors({
//     origin: ["http://localhost:5174"],

//     credentials: true,
//   })
// );
// app.use(cookieParser());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xzkprd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// const logger = (req, res, next) => {
//   console.log("log information", req.method, req.url);
//   next();
// };

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
const paymentCollection = client.db("mediCamp").collection("payment");
const feedbackCollection = client.db("mediCamp").collection("feedback");
const upComingCollection = client.db("mediCamp").collection("upComing");
const upComingJoiningCollection = client
  .db("mediCamp")
  .collection("JoinupComing");

app.get("/camp", async (req, res) => {
  const result = await campCollection.find().toArray();
  res.send(result);
});

// app.post("/jwt", async (req, res) => {
//   const user = req.body;
//   console.log(user);

//   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, "secret", {
//     expiresIn: "1h",
//   });
//   res.send(token);

//   res
//     .cookie("token", token, {
//       httpOnly: true,
//       secure: false, // http://localhost:5173/login
//       sameSite: "none",
//     })
//     .send({ success: true, token });
// });

app.get("/campdetails/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await campCollection.findOne(query);
  res.send(result);
});
app.get("/showUpdetails/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await upComingCollection.findOne(query);
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
  let query = {};
  if (req.query?.email) {
    query = { email: req.query.email };
  }
  const result = await joinCampCollection.find(query).toArray();
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
    const cursor = campCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });
});

app.patch("/campUpdateInfo/:id", async (req, res) => {
  const id = req.params.id;

  const filter = { _id: new ObjectId(id) };

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
  const result = await campCollection.updateOne(filter, campInfo);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("medical camp side server is running");
});
app.get("/payment", async (req, res) => {
  let query = {};
  if (req.query?.email) {
    query = { email: req.query.email };
  }
  const result = await paymentCollection.find(query).toArray();
  res.send(result);
});

app.post("/addCamp", async (req, res) => {
  const newCamp = req.body;
  console.log(newCamp);
  //
  const result = await campCollection.insertOne(newCamp);
  res.send(result);
});
app.get("/addUpComing", async (req, res) => {
  const result = await upComingCollection.find().toArray();
  res.send(result);
});

app.post("/addUpComing", async (req, res) => {
  const upCamp = req.body;
  console.log(upCamp);

  const result = await upComingCollection.insertOne(upCamp);
  res.send(result);
});

app.post("/joinUpComing", async (req, res) => {
  const camp = req.body;

  const result = await upComingJoiningCollection.insertOne(camp);
  res.send(result);
});
// app.post("/feedback", async (req, res) => {
//   console.log(feed);

//   const result = await feedbackCollection.insertOne(feed);
//   res.send(result);
// });
app.get("/feedback", async (req, res) => {
  let sortObj = {};
  const sortOrder = req.query.sortOrder || "asc";
  sortObj.date = sortOrder === "asc" ? 1 : -1;

  console.log("Sort Object:", sortObj);

  const cursor = feedbackCollection.find().sort(sortObj);
  const result = await cursor.toArray();

  console.log("Sorted Result:", result);

  res.send(result);
});

app.post("/feedback", async (req, res) => {
  const feed = req.body;
  console.log(feed);
  feed.time = parseInt(feed.time);
  const result = await feedbackCollection.insertOne(feed);
  res.send(result);
});

app.patch("/updateInfo/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  const profileInfo = req.body;
  const Info = {
    $set: {
      name: profileInfo.name,
      photoURL: profileInfo.photoURL,
      role: profileInfo.role,
    },
  };
  const result = await userCollection.updateOne(filter, Info);
  res.send(result);
});

app.delete("/campDlt/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await campCollection.deleteOne(query);
  res.send(result);
});

app.delete("/regisDlt/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await joinCampCollection.deleteOne(query);
  res.send(result);
});

app.post("/create-payment-intent", async (req, res) => {
  const { fees } = req.body;
  const amount = parseInt(fees * 100);
  console.log("Amount:", amount);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
app.post("/payment", async (req, res) => {
  const payment = req.body;
  const paymentResult = await paymentCollection.insertOne(payment);
  console.log("paymentInfo", payment);
  // const query = {
  //   _id: {
  //     $in: payment.registIds.map((id) => new ObjectId(id)),
  //   },
  // };
  // const deleteResult = await joinCampCollection.deleteMany(query);

  res.send({ paymentResult });
});

app.patch("/payment/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: "confirmed",
    },
  };

  const result = await paymentCollection.updateOne(filter, updatedDoc);

  res.send(result);
});

app.patch("/joinCamp/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  const updatedDoc = {
    $set: {
      status: "paid",
    },
  };

  try {
    const result = await joinCampCollection.updateOne(filter, updatedDoc);

    if (result.modifiedCount === 1) {
      res.send({ success: true, message: "Payment confirmed successfully." });
    } else {
      res.status(404).send({ success: false, message: "Payment not found." });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).send({ success: false, message: "Internal Server Error." });
  }
});
// app.post("/addUpComing", async (req, res) => {
//   const upCamp = req.body;
//   console.log(upCamp);

//   const result = await upComingCollection.insertOne(upCamp);
//   res.send(result);
// });

app.delete("/campRegisDlt/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await joinCampCollection.deleteOne(query);
  res.send(result);
});

app.listen(port, (req, res) => {
  console.log(`medical camp server is running on port:${port}`);
});
