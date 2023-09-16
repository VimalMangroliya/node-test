const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());
app.set("view engine", "pug");

const foodItems = JSON.parse(
  fs.readFileSync(__dirname + "/data.json").toString()
);

app.get("/", (req, res) => {
  res.render("index", { foodItems });
});

app.listen(8000, () => {
  console.log("Server started...");
});
