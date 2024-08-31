// app.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const {User, Personal} = require("./models/UserAndPersonal");


dotenv.config();

const app = express();
app.use(express.static("public"));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  

  try {
    const user = new User({
      username,
      email,
      password,
    });

    await user.save(); // Save the user to the database
    res.render("dashboard");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.isValidPassword(password))) {
      req.session.userId = user._id;
      res.redirect("/dashboard");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
});

app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("dashboard");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.redirect("/login");
  });
});


app.get('/personal-details', async (req, res) => {
  if (!req.session.userId) {
      return res.redirect('/login');
  }

  try {
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.redirect('/login');
      }
      res.render('personal-details', { user });
  } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(500).send("Internal server error");
  }
});

app.post("/personal-details", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const {
    gender,
    bloodGroup,
    mobile,
    aadhar,
    aabha,
    guardianName,
    guardianMobile,
    guardianEmail,
    nationality,
    address,
    pincode,
    state,
    city,
  } = req.body;

  try {
    const personalDetails = await Personal.findOneAndUpdate(
      { userId: req.session.userId },
      {
        gender,
        bloodGroup,
        mobile,
        aadhar,
        aabha,
        guardianName,
        guardianMobile,
        guardianEmail,
        nationality,
        address,
        pincode,
        state,
        city,
      },
      { new: true, upsert: true }
    );

    if (!personalDetails) {
      console.error("Failed to save personal details.");
    } else {
      console.log("Personal details saved successfully:", personalDetails);
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error updating personal details:", error);
    res.status(500).send("Error updating personal details");
  }
});

app.get("/history", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("history");
});

app.get("/profile", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("profile");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});