// Importation module
const jwt = require("jsonwebtoken");

require("dotenv").config();

// Vérification authentification
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "Identifiant invalide !"; // erreur 403
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Requête Invalide !"),
    });
  }
};
