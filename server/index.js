require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const csrf = require("csurf");
const flash = require("connect-flash");

const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);

const errorHandler = require('./middleware/error')

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/db";
const SECRET_KEY = process.env.SECRET_KEY || "some secret key";

const store = new MongoStore({
  collection: "sessions",
  uri: MONGO_URI
});

app.set("views", path.resolve(__dirname, "..", "client/views"));
app.set("view engine", "pug");

app.use("/static", express.static(path.join(__dirname, "..", "client/public")));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(csrf());
app.use(flash());
app.use(require("./middleware/variables"));
app.use(require("./middleware/user"));

app.use("/", require("./routes/home"));
app.use("/courses", require("./routes/courses"));
app.use("/add", require("./routes/add"));
app.use("/cart", require("./routes/cart"));
app.use("/orders", require("./routes/orders"));
app.use("/auth", require("./routes/auth"));

app.use(errorHandler)

const start = async () => {
  try {
    await mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(() => {
        console.log("Successfully connected to the database");
      });

    app.listen(PORT, () => {
      console.log(`Express running → PORT ${PORT}`);
    });
  } catch (err) {
    console.log("Could not connect to the database. Exiting now...", err);
  }
};

start();
