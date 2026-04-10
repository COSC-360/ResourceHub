import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as userRepository from "../repositories/userRepository.js";

dotenv.config();

export const ACCOUNT_DISABLED_MESSAGE =
  "Your account has been disabled. Contact an admin to reactivate your account.";

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

    void (async () => {
      try {
        const doc = await userRepository.getUserById(user.id);
        if (!doc || doc.enabled === false) {
          res.status(403).json({
            error: ACCOUNT_DISABLED_MESSAGE,
            code: "ACCOUNT_DISABLED",
          });
          return;
        }
        req.user = user;
        req.userId = user.id;
        req.admin = user.admin;
        next();
      } catch {
        res.status(500).json({ error: "Unable to verify account status" });
      }
    })();
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
    if (err) {
      req.user = null;
      req.err = err;
      next();
      return;
    }

    void (async () => {
      try {
        const doc = await userRepository.getUserById(user?.id);
        if (!doc || doc.enabled === false) {
          req.user = null;
          req.err = Object.assign(new Error("ACCOUNT_DISABLED"), {
            code: "ACCOUNT_DISABLED",
          });
        } else {
          req.user = user;
          req.err = null;
        }
      } catch {
        req.user = null;
        req.err = new Error("Unable to verify account");
      }
      next();
    })();
  });
}
