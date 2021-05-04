import * as express from "express";
import * as crypto from "crypto";
import * as sgMail from "@sendgrid/mail";
import * as chalk from "chalk";

import middleware from "../middlewares/middleware";
// =================================== //
const router = express.Router();
// =================================== //
router.use(middleware);
// =================================== //
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// =================================== //
router.post("/email-verify", async (req, res) => {
  const { token } = req.body;

  const checkValidToken = {
    text: `SELECT token FROM tokens WHERE token = $1 ;`,
    values: [token],
  };
  if ((await req.db.query(checkValidToken)).rowCount !== 1) {
    res.status(401).send("Something went wrong.");
    return;
  }

  const updateEmailVerification = async (tokenOwnerId: number) => {
    const updateEmailVerified = {
      text: `UPDATE users SET email_verified=$1 WHERE id=$2 RETURNING email_verified;`,
      values: ["true", tokenOwnerId],
    };
    const deleteVerifyToken = {
      text: `DELETE FROM tokens WHERE token=$1;`,
      values: [token],
    };
    try {
      const response = await req.db.query(updateEmailVerified);
      const returned = response.rows[0];
      if (returned.email_verified === "true") {
        await req.db.query(deleteVerifyToken);
        res.status(200).send("success");
      } else {
        res.status(200).send("success, no token deleted");
      }
    } catch (err) {
      console.log(
        chalk.yellow(
          "Error occured on /verify/email-verify @ Function--updateEmailVerification: "
        ),
        chalk.red(err)
      );
    }
  };

  const getTokenOwner = {
    text: `SELECT token, owner_id FROM tokens WHERE token = $1 ;`,
    values: [token],
  };

  try {
    const response = await req.db.query(getTokenOwner);
    const returned = response.rows[0];
    updateEmailVerification(returned.owner_id);
  } catch (err) {
    console.log(
      chalk.yellow("Error occured on /verify/email-verify "),
      chalk.red(err)
    );
  }
});

// =================================== //

router.post("/email", async (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  const ownerId = req.body.id;
  const userEmail = req.body.email;
  const typeOf = "emailVerify";
  const expireAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const addNewToken = {
    text:
      "INSERT INTO tokens(token, type_of, expire_at, owner_id) VALUES($1, $2, $3, $4)",
    values: [token, typeOf, expireAt, ownerId],
  };
  try {
    await req.db.query(addNewToken);
  } catch (err) {
    console.log(
      chalk.yellow("Error occured on /verify/email "),
      chalk.red(err)
    );
  }

  const msg = {
    to: userEmail,
    from: process.env.EMAIL_FROM,
    subject: "Email Confirmation",
    html: `
      <div>
        <p>Hello!</p>
        <p>Please follow <a href="${process.env.WEB_URI}/verify?token=${token}">this link</a> to confirm your email.</p>
        <p></p>
        <p><em>If link does not work correctly, paste the following url in your browser: ${process.env.WEB_URI}/verify?token=${token} </em></p>
      </div>
      `,
  };
  sgMail
    .send(msg)
    .then(() => console.log("Email Sent"))
    .catch((error) => console.log(error));
  res.status(200).send("ok");
});

// =================================== //
export default router;
