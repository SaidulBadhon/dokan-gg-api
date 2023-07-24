const axios = require("axios");
const express = require("express");
const Customer = require("../models/customer");
const Store = require("../models/store");
const Token = require("../models/token");
const crypto = require("crypto");

const User = require("../models/user");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const getAccessToken = require("../utils/getAccessToken");
const hashPassword = require("../utils/hashPassword");
const validatePassword = require("../utils/validatePassword");
const generateRandomString = require("../utils/generateRandomString");

const router = express.Router();

async function generateValidationToken(user) {
  // const user = await User.findOne({ email });
  console.log(user);

  if (!user) throw new Error("User does not exist");
  await Token.findOneAndDelete({ userId: user?._id });

  let resetToken = crypto.randomBytes(32).toString("hex");

  const otp = generateOTP();

  await new Token({
    userId: user?._id,
    token: resetToken,
    otp,
    type: "validateEmail",
  }).save();

  const responce = await sendEmail({
    templateId: "d-357612253fd940f184d76884907dbc8f",
    to: user?.email,
    subject: `Here is your OTP for Dokan.gg: ${otp}`,
    username: `${user?.firstName} ${user?.lastName}`,
    otp: otp,
    link: `${process.env.APP_BASE_URL}/login/token?token=${resetToken}`,
  });

  return responce;
}

const getExtraData = async (user, accessToken) => {
  //

  let rtn;

  if (["seller", "manager", "employee"].includes(user?.role)) {
    let stores = await Store.find({
      $and: [
        {
          $or: [
            { owner: user?._id },
            { managers: { $in: [user?._id] } },
            { employees: { $in: [user?._id] } },
          ],
        },
        { isDeleted: false },
      ],
    });

    rtn = {
      ...user.toObject(),
      accessToken,
      stores,
    };
  } else if (user?.role === "buyer") {
    let customer = await Customer.findOne({ user: user._id });
    if (!customer) customer = await Customer.create({ user: user._id });

    rtn = {
      ...user.toObject(),
      accessToken,
      customer,
    };
  } else {
    rtn = { ...user.toObject(), accessToken };
  }
  //

  return rtn;
};

router
  .post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email?.toLowerCase() });

      if (!user) return next(new Error("Email does not exist"));
      if (!user.emailVerified) {
        generateValidationToken(user?.email);

        return res.status(404).json({
          redirect: true,
          message:
            "Your email address is not verified. Please verify your email.",
        });
      }
      if (!user.isActive) {
        return next(new Error("Your account has been disabled"));
      }

      if (!user?.password) {
        return next(new Error('Invalid password! Please use "Social Login".'));
      }

      const validPassword = await validatePassword(password, user?.password);
      if (!validPassword) return next(new Error("Password is not correct"));
      const accessToken = getAccessToken(user._id);

      getExtraData(user, accessToken)
        .then((rx) => {
          return res.status(200).json(rx);
        })
        .catch((err) => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  })
  .post("/signup", async (req, res, next) => {
    try {
      const { email, password, role, firstName, lastName } = req.body;
      const hashedPassword = await hashPassword(password);

      let oldAccount = await User.findOne({ email: email?.toLowerCase() });

      if (oldAccount) {
        return next(new Error("Account already exists"));
      }

      const user = await User.create({
        lastName,
        firstName,
        userName:
          (firstName + lastName).trim().replace(/ /g, "-") +
          generateRandomString(4),
        email: email?.toLowerCase(),
        password: hashedPassword,
        role,

        emailVerified: false,
      });

      generateValidationToken(user);

      res.status(200).json({
        message:
          "Account created successfully, Please verify your email to continue.",
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
  .get("/validation/request/:email/", async (req, res, next) => {
    try {
      const user = await User.findOne({
        email: req.params.email?.toLowerCase(),
      });
      if (!user) throw new Error("User does not exist");

      let returnStatus = generateValidationToken(user);

      returnStatus?.then((status) => {
        if (!status) {
          res.status(404).send("Failed to send email");
        } else {
          res.status(200).send({ status: "success" });
        }
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
  .post("/validation/confirm/:token", async (req, res, next) => {
    try {
      const { token: tokenString } = req.params;

      let token;

      if (tokenString.length <= 6) {
        token = await Token.findOne({ otp: tokenString });
      } else {
        token = await Token.findOne({ token: tokenString });
      }
      if (!token) return next(new Error("Token does not exist"));

      const user = await User.findByIdAndUpdate(token.userId, {
        emailVerified: true,
      });

      await token.deleteOne(token);

      if (!user) return next(new Error("User does not exist"));

      const accessToken = getAccessToken(user._id);

      getExtraData(user, accessToken)
        .then((rx) => {
          return res.status(200).json(rx);
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      console.log(JSON.stringify(err));
      next(err);
    }
  })
  .post("/forgotPassword/request", async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email?.toLowerCase() });

      if (!user) throw new Error("User does not exist");

      let token = await Token.findOne({ userId: user._id });
      if (token) await token.deleteOne();
      let resetToken = crypto.randomBytes(32).toString("hex");

      const otp = generateOTP();

      await new Token({
        userId: user._id,
        token: resetToken,
        otp,
        type: "forgotPassword",
      }).save();

      const deliverEmail = await sendEmail({
        templateId: "d-2acb2a43c5344a5a811d4c97b178ccca",
        to: user?.email,
        subject: `Reset password - Dokan.gg`,
        username: `${user?.firstName} ${user?.lastName}`,
        otp: otp,
        link: `${process.env.APP_BASE_URL}/forgot-password/new?token=${resetToken}`,
      });

      if (deliverEmail) {
        return res.status(200).json({ status: "success" });
      } else {
        return res.status(400).send({ message: "Faild to deliver email." });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .post("/forgotPassword/:token", async (req, res, next) => {
    try {
      const { token: tokenString } = req.params;
      console.log(tokenString);

      let token;
      if (tokenString.length <= 6) {
        token = await Token.findOne({ otp: tokenString });
      } else {
        token = await Token.findOne({ token: tokenString });
      }

      if (!token) return next(new Error("Token does not exist"));

      const { password } = req.body;
      const hashedPassword = await hashPassword(password);

      console.log(hashedPassword);

      const user = await User.findByIdAndUpdate(
        token.userId,
        {
          password: hashedPassword,
        },
        { new: true }
      );
      await token.deleteOne(token);

      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
  .post("/google", async (req, res, next) => {
    try {
      await axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${req.body.access_token}` },
        })
        .then(async (userInfo) => {
          console.log(userInfo.data);

          let user = await User.findOneAndUpdate(
            { email: userInfo.data?.email },
            { emailVerified: true },
            { new: true }
          );

          // googleId: userInfo.data?.sub

          if (
            (!user?.avatar && userInfo.data?.picture) ||
            user?.googleId !== userInfo.data?.sub
          ) {
            let update = {};
            update["avatar"] = userInfo.data?.picture;
            update["googleId"] = userInfo.data?.sub;

            console.log("user update : ", update);

            user = await User.findByIdAndUpdate(user?._id, update, {
              new: true,
            });
          }

          if (user) {
            const accessToken = getAccessToken(user._id);

            if (!user.isActive) {
              return next(new Error("Your account has been disabled"));
            }

            getExtraData(user, accessToken)
              .then((rx) => {
                return res.status(200).json(rx);
              })
              .catch((err) => {
                next(err);
              });
          } else {
            const newUser = await User.create({
              firstName: userInfo.data?.given_name,
              lastName: userInfo.data?.family_name || "",
              userName:
                (userInfo.data?.given_name + (userInfo.data?.family_name || ""))
                  .trim()
                  .replace(/ /g, "-") + generateRandomString(4),
              email: userInfo.data?.email,
              avatar: userInfo.data?.picture,
              role: req.body.role || "buyer",
              emailVerified: userInfo.data?.email_verified,
              provider: "google",
              googleId: userInfo.data?.sub,
            });

            const accessToken = getAccessToken(newUser._id);

            getExtraData(newUser, accessToken)
              .then((rx) => {
                return res.status(200).json(rx);
              })
              .catch((err) => {
                next(err);
              });
          }
        })
        .catch((error) => {
          // console.log(error);
          return res.status(404).send(error);
        });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .post("/facebook", async (req, res, next) => {
    try {
      let user = await User.findOneAndUpdate(
        { email: req.body?.email },
        { emailVerified: true },
        { new: true }
      );

      if (
        (!user?.avatar && req.body?.picture?.data?.url) ||
        user?.facebookId !== req.body.id
      ) {
        let update = {};
        update["avatar"] = req.body?.picture?.data?.url;
        update["facebookId"] = req.body.id;

        console.log("user update : ", update);

        user = await User.findByIdAndUpdate(user?._id, update, {
          new: true,
        });
      }

      if (user) {
        const accessToken = getAccessToken(user._id);

        if (!user.isActive) {
          return next(new Error("Your account has been disabled"));
        }

        getExtraData(user, accessToken)
          .then((rx) => {
            return res.status(200).json(rx);
          })
          .catch((err) => {
            next(err);
          });
        // console.log(sx);
      } else {
        const newUser = await User.create({
          firstName: req.body.first_name,
          lastName: req.body.last_name,
          userName:
            (req.body.first_name + req.body.last_name)
              .trim()
              .replace(/ /g, "-") + generateRandomString(4),
          email: req.body?.email,
          avatar: req.body?.picture?.data?.url,
          role: req.body.role || "buyer",
          emailVerified: true,
          provider: "facebook",
          facebookId: req.body.id,
        });

        const accessToken = getAccessToken(newUser._id);

        getExtraData(newUser, accessToken)
          .then((rx) => {
            return res.status(200).json(rx);
          })
          .catch((err) => {
            next(err);
          });
      }
    } catch (err) {}
  });

module.exports = router;
