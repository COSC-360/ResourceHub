import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "../models/user.js";

const DEFAULT_ADMIN_USERS = [
  {
    username: "taadmin",
    email: "taadmin@gmail.com",
    password: "ABCdef123",
    posts: 0,
    comments: 0,
  },
  {
    username: "zanderstupidiot",
    email: "zanderholo@gmail.com",
    password: "12345678Up",
    posts: 6,
    comments: 12,
  },
];

export async function bootstrapAdminUsers() {
  if (mongoose.connection.readyState !== 1) {
    console.warn("Skipping admin bootstrap: database is not connected.");
    return;
  }

  for (const account of DEFAULT_ADMIN_USERS) {
    const password = await bcrypt.hash(account.password, 10);

    await User.updateOne(
      { email: account.email.toLowerCase() },
      {
        $set: {
          username: account.username,
          email: account.email.toLowerCase(),
          password,
          isAdmin: true,
          enabled: true,
          posts: account.posts,
          comments: account.comments,
        },
      },
      { upsert: true },
    );
  }

  console.log("Default admin accounts are ready.");
}
