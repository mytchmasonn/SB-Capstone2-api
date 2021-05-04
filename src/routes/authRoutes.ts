import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as express from "express";
import isEmail from "validator/lib/isEmail";
import normalizeEmail from "validator/lib/normalizeEmail";

import middleware from "../middlewares/middleware";
// =================================== //
const router = express.Router();
// =================================== //
router.use(middleware);
// =================================== //
router.post("/register", async (req, res) => {
  const { name, password: pass } = req.body;
  const email: any = normalizeEmail(req.body.email);
  if (!isEmail(email)) {
    res.status(400).send("The email you entered is invalid.");
    return;
  }
  if (!pass || !name) {
    res.status(400).send("Missing field(s)");
    return;
  }
  const checkExistingEmail = {
    text: `SELECT email FROM users WHERE email = $1;`,
    values: [email],
  };
  if ((await req.db.query(checkExistingEmail)).rowCount === 1) {
    res.status(403).send("The email has already been used.");
    return;
  }

  const password = await bcrypt.hash(pass, 10);

  const emailVerified = "false";
  const addNewUser = {
    text:
      "INSERT INTO users(name, email, password, email_verified) VALUES($1, $2, $3, $4) RETURNING id, name, email, email_verified",
    values: [name, email, password, emailVerified],
  };
  try {
    const response = await req.db.query(addNewUser);
    const user = response.rows[0];
    if (user) {
      const { name, id, email, email_verified } = user;
      const token = jwt.sign(
        { email, name, id, email_verified },
        process.env.SECRET_KEY
      );
      res.status(200).send({ user, token });
    } else {
      res.status(400).json({ message: "something went wrong" });
    }
  } catch (err) {
    console.log(err.stack);
  }
});
// =================================== //
router.post("/login", async (req, res) => {
  const password = req.body.password;
  const email: any = normalizeEmail(req.body.email);
  if (!isEmail(email)) {
    res.status(400).send("The email you entered is invalid.");
    return;
  }
  if (!password) {
    res.status(400).send("Missing field(s)");
    return;
  }

  const doesUserExist = {
    text: "SELECT email FROM users WHERE email = $1",
    values: [email],
  };
  if ((await req.db.query(doesUserExist)).rowCount === 0) {
    res.status(401).send("There is no account associated with that email");
  }

  const findUser = {
    text:
      "SELECT id, email, name, password, email_verified FROM users WHERE email = $1",
    values: [email],
  };

  const response = await req.db.query(findUser);
  const user = response.rows[0];
  if (user) {
    if (await bcrypt.compare(password, user.password)) {
      const { name, id, email, email_verified } = user;
      const token = jwt.sign(
        { email, name, id, email_verified },
        process.env.SECRET_KEY
      );
      return res.json({ message: "Success", token });
    } else {
      res.status(400).send("Email or password invalid.");
    }
  }
});
// =================================== //

export default router;
