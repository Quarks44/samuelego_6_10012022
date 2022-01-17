// Importation module
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const passwordValidator = require("password-validator");
const schema = new passwordValidator();

schema
  .is()
  .min(8)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .not()
  .spaces()
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]);

// Contrôleur inscription
exports.signup = (req, res, next) => {
  if (schema.validate(req.body.password)) {
    //  mot de passe utilisateur "Hash"
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        // Creation User
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé!" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    return res.status(400).json({
      error: `Mot de passe incorrect : ${schema.validate("req.body.password", {
        list: true,
      })}`,
    });
  }
};

// Contrôleur ouverture de session
exports.login = (req, res, next) => {
  // Vérification utilisateur existant
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé!" });
      }
      // Vérification du mot de passe
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect!" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.DB_SECRET_KEY, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
