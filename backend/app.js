// Import Modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet"); // évite l'attaque de cookies
require("dotenv").config();

const userRoutes = require("./routes/User");
const sauceRoutes = require("./routes/Sauce");

mongoose
  .connect(process.env.URL_MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

 // app.use(helmet());

// Initiliasition API
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Système de Routage
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/Sauces", sauceRoutes);
module.exports = app;
