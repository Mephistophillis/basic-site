const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("views", path.resolve(__dirname, "..", "client/views"));
app.set("view engine", "pug");

app.use("/static", express.static(path.join(__dirname, "..", "client/public")));

app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes/home"));
app.use("/courses", require("./routes/courses"));
app.use("/add", require("./routes/add"));
app.use("/cart", require("./routes/cart"));

app.listen(PORT, () => {
  console.log(`Express running → PORT ${PORT}`);
});
