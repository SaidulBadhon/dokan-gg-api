const axios = require("axios");
const express = require("express");
const bcrypt = require("bcryptjs-then");
const crypto = require("crypto");
const Customer = require("../models/customer");
const Store = require("../models/store");

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const slugify = require("../utils/slugify");
// const Company = require("../models/company");
const User = require("../models/user");
// const Token = require("../models/token");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const getAccessToken = require("../utils/getAccessToken");

const router = express.Router();

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// async function generateValidationToken(user) {
//   // const user = await User.findOne({ email });
//   console.log(user);

//   // if (!user) throw new Error("User does not exist");
//   // let token = await Token.findOne({ userId: user?.id });
//   // if (token) await token.deleteOne();
//   let resetToken = crypto.randomBytes(32).toString("hex");

//   const otp = generateOTP();

//   // await new Token({
//   //   userId: user?.id,
//   //   token: resetToken,
//   //   otp,
//   //   createdAt: new Date(),
//   // }).save();

//   // TODO: will add Email send feature here when we have email support api
//   const responce = await sendEmail({
//     to: user?.email,
//     username: `${user?.firstName} ${user?.lastName}`,
//     otp: otp,
//     link: `${process.env.APP_BASE_URL}/login/token?token=${resetToken}`,
//   });

//   console.log("EMAIL RESPONCE : ", responce);

//   return responce;
// }

const getExtraData = async (user, accessToken) => {
  //

  let rtn;

  if (["seller", "manager", "employee"].includes(user?.role)) {
    let stores = await Store.find({
      $or: [
        { owner: user?._id },
        { managers: { $in: [user?._id] } },
        { employees: { $in: [user?._id] } },
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
      const user = await User.findOne({ email });

      if (!user) return next(new Error("Email does not exist"));
      if (!user.emailVerified) {
        // generateValidationToken(user?.email);

        return res.status(404).json({
          redirect: true,
          message:
            "Your email address is not verified. Please verify your email.",
        });
      }
      if (!user.isActive) {
        return next(
          new Error("Your account has been deactivated by team campusJapan")
        );
      }

      const validPassword = await validatePassword(password, user.password);
      if (!validPassword) return next(new Error("Password is not correct"));
      const accessToken = getAccessToken(user._id);

      if (["seller", "manager", "employee"].includes(user?.role)) {
        let stores = await Store.find({
          $or: [
            { owner: user?._id },
            { managers: { $in: [user?._id] } },
            { employees: { $in: [user?._id] } },
          ],
        });

        return res.status(200).json({
          ...user.toObject(),
          accessToken,
          stores,
        });
      } else if (user?.role === "buyer") {
        let customer = await Customer.findOne({ user: user._id });
        if (!customer) customer = await Customer.create({ user: user._id });

        return res.status(200).json({
          ...user.toObject(),
          accessToken,
          customer,
        });
      } else {
        return res.status(200).json({ ...user.toObject(), accessToken });
      }
    } catch (error) {
      next(error);
    }
  })
  .post("/signup", async (req, res, next) => {
    try {
      const { email, password, role, firstName, lastName } = req.body;
      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        lastName,
        firstName,
        userName: (firstName + lastName).trim().replace(/ /g, "-") + Date.now(),
        email,
        password: hashedPassword,
        role,

        emailVerified: false,
      });

      // const user = await saveAccessToken(newUser);
      // generateValidationToken(user);

      // if (user?.role === "buyer") {
      //   let customer = await Customer.findOne({ user: user._id });
      //   if (!customer) customer = await Customer.create({ user: user._id });

      //   return res.status(200).json({
      //     ...user.toObject(),
      //     accessToken,
      //     customer,
      //   });
      // } else {
      //   return res.status(200).json({ ...user.toObject(), accessToken });
      // }

      // generateValidationToken(user)

      res.status(200).json({
        message:
          "Account created successfully, Please verify your email to continue.",
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
  .post("/:id/changePassword", async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(req.params.id);

      const validPassword = await validatePassword(oldPassword, user.password);

      if (!validPassword) return next(new Error("Password is not correct"));

      const hashedPassword = await hashPassword(newPassword);

      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        password: hashedPassword,
      });

      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
  .get("/validation/request/:email/", async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.params.email });
      if (!user) throw new Error("User does not exist");

      // let returnStatus = generateValidationToken(user);

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

      // if (tokenString.length <= 6) {
      //   token = await Token.findOne({ otp: tokenString });
      // } else {
      //   token = await Token.findOne({ token: tokenString });
      // }
      if (!token) return next(new Error("Token does not exist"));

      const user = await User.findByIdAndUpdate(token.userId, {
        emailVerified: true,
      });

      await token.deleteOne();

      if (!user) return next(new Error("User does not exist"));

      const accessToken = getAccessToken(user._id);

      // if (user?.role === "applicant") {
      //   let applicant = await Applicant.findOne({ user: user._id });
      //   if (!applicant) applicant = await Applicant.create({ user: user._id });

      //   return res.status(200).json({
      //     ...user.toObject(),
      //     accessToken,
      //     applicant,
      //   });
      // } else if (user?.role === "company") {
      //   let company = await Company.findOne({ user: user._id });
      //   if (!company) company = await Company.create({ user: user._id });

      //   return res.status(200).json({
      //     ...user.toObject(),
      //     accessToken,
      //     company,
      //   });
      // } else {
      // if (user?.role === "admin") {
      return res.status(200).json({ ...user.toObject(), accessToken });
      // }
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
  .post("/google", async (req, res, next) => {
    try {
      axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${req.body.access_token}` },
        })
        .then(async (userInfo) => {
          console.log(userInfo.data);

          const user = await User.findOneAndUpdate(
            { email: userInfo.data?.email },
            { emailVerified: true },
            { new: true }
          );
          console.log("YOLO", user);

          if (user) {
            const accessToken = getAccessToken(user._id);
            console.log("SX", user);
            getExtraData(user, accessToken)
              .then((rx) => {
                return res.status(200).json(rx);
              })
              .catch((err) => {
                next(err);
              });
          } else {
            console.log("xxxxxx");
            const newUser = await User.create({
              firstName: userInfo.data?.given_name,
              lastName: userInfo.data?.family_name,
              userName:
                (userInfo.data?.given_name + userInfo.data?.family_name)
                  .trim()
                  .replace(/ /g, "-") + Date.now(),
              email: userInfo.data?.email,
              avatar: reuserInfo.data?.picture,
              role: req.body.role,
              emailVerified: userInfo.data?.email_verified,
              provider: "google",
              googleId: userInfo.data?.sub,
            });
            console.log("newUser", newUser);
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
      const user = await User.findOneAndUpdate(
        { email: req.body?.email },
        { emailVerified: true },
        { new: true }
      );

      if (user) {
        const accessToken = getAccessToken(user._id);

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
              .replace(/ /g, "-") + Date.now(),
          email: req.body?.email,
          avatar: req.body?.picture?.data?.url,
          role: req.body?.role,
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
// .post("/:id/resetPassword/request", async (req, res, next) => {
//   const user = await User.findOne({ email });

//   if (!user) throw new Error("User does not exist");
//   let token = await Token.findOne({ userId: user._id });
//   if (token) await token.deleteOne();
//   let resetToken = crypto.randomBytes(32).toString("hex");

//   await new Token({
//     userId: user._id,
//     token: resetToken,
//     createdAt: Date.now(),
//   }).save();

//   const link = `${process.env.APP_BASE_URL}/passwordReset/${user._id}/${resetToken}`;
//   console.log(link);
//   res.send(link);
// })
// .post("/:id/resetPassword/:token", async (req, res, next) => {
//   try {
//     const { password } = req.body;
//     const hashedPassword = await hashPassword(password);

//     console.log(hashedPassword);

//     const user = await User.findByIdAndUpdate(req.params.id, {
//       password: hashedPassword,
//     });

//     res.status(200).json(user);
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// });

module.exports = router;
