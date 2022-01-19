// importation Modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");
const User = require("../models/User");

require("dotenv").config();

const passwordSchema = new passwordValidator();

passwordSchema //https://tarunbatra.com/password-validator/5.2.0/
  .is()
  .min(8)
  .is()
  .max(16)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces();

// Contrôle inscription
exports.signup = (req, res, next) => {
  if (!emailValidator.validate(req.body.email)) {
    return res
      .status(401)
      .json({ message: "Veuillez entrer une adresse email valide !" });
  }

  if (!passwordSchema.validate(req.body.password)) {
    return res.status(401).json({
      message:
        "Le mot de passe doit avoir entre 8 et 16 caractères et contenir 1 chiffre, 1 minuscule et 1 majuscule et aucun espace !",
    });
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) =>
          res.status(400).json({ message: "Cet email est déjà enregsitré !" })
        );
    })
    .catch((error) => res.status(500).json({ error }));
};

// Contrôle session
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Mot de passe incorrect !" });
          }
          // Connexion valide pendant 24h max
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
