import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//See services/userService.userSignin for the fields inside user
export function verifyAccessToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!process.env.ACCESS_TOKEN_SECRET_KEY) {
    throw new Error("Missing JWT secret");
  }

  if (!authHeader || authHeader.split(" ").length !== 2) {
    return res.status(401).send("Invalid Authorization header format.");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer") {
    return res.status(401).send("Unsupported authentication scheme.");
  }

  if (!token) {
    res.status(401).json({ error: "No access token found" });
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }
    if (!user || !user.id) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    req.user = user;
    req.userId = user.id;
    req.admin = user.admin;
    next();
  });
}

export function decodeAccessToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    req.noTokenFlag = true;
    return next();
  }

  if (!process.env.ACCESS_TOKEN_SECRET_KEY) {
    throw new Error("Missing JWT secret");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    req.user = user;
    req.err = err;
    next();
  });
}
