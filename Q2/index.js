"use strict";

const cuid2 = require("@paralleldrive/cuid2");
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    resetMailSentAt: {
      type: Number,
      required: false,
    },
    pwdResetKey: {
      type: String,
      required: false,
    },
  })
);

const transporter = nodemailer.createTransport({
  host: "smtp.forwardemail.net",
  port: 465,
  secure: true,
  auth: {
    user: "REPLACE-WITH-YOUR-ALIAS@YOURDOMAIN.COM",
    pass: "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");

const resetPassword = async (name, email) => {
  const user = await User.findOne({
    name,
    email,
  });

  if (!user) return;

  try {
    const pwdResetKey = cuid2.createId();

    await user.updateOne({
      $set: {
        resetMailSentAt: Date.now(),
        pwdResetKey,
      },
    });

    await transporter.sendMail({
      from: "Vimal Mangroliya <vamangroliya@gmail.com>",
      to: `${name} <${email}>`,
      subject: "Reset your password!",
      text: `Reset your password using http://localhost/reset/${pwdResetKey}`,
    });
  } catch (err) {
    return false;
  }

  return true;
};

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/sent", async (req, res) => {
  const userFound = await resetPassword(req.body.name, req.body.email);
  if (userFound) res.render("sent");
  else res.render("error");
});

app.get("/reset/:key", async (req, res) => {
  const user = await User.findOne({
    pwdResetKey: req.params.key,
  });
  if (!user) return res.render("error");
  if (!user.resetMailSentAt || user.resetMailSentAt + 1000 * 2 > Date.now())
    return res.render("error");
  else res.render("reset");
});

app.listen(8000, () => {
  console.log("Server started...");
});
