const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

var app = express()
  .use(express.static(path.join(__dirname, "dist")))
  .use(express.static(__dirname + "/images"))
  .set("view engine", "ejs")
  .get("*", (req, res) => {
    res.sendFile("index.html", { root: "dist" });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
