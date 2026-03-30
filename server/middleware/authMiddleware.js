import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//See services/userService.userSignin for the fields inside user
export async function verifyAccessToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No access token found" });
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }
    req.user = user;
    req.userId = user.id;
    next();
  });
}

export async function decodeAccessToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    req.noTokenFlag = true;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    req.user = user;
    req.err = err;
    next();
  });
}
