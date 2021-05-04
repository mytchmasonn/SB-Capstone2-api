import * as express from "express";
import isEmail from "validator/lib/isEmail";
import normalizeEmail from "validator/lib/normalizeEmail";

import middleware from "../middlewares/middleware";
// =================================== //
const router = express.Router();
// =================================== //
router.use(middleware);
// =================================== //
router.post("/contact-us", async (req, res) => {
  const { name, message } = req.body;
  const email: any = normalizeEmail(req.body.email);
  if (!isEmail(email)) {
    res.status(400).send("The email you entered is invalid.");
    return;
  }
  if (!message || !name) {
    res.status(400).send("Missing field(s)");
    return;
  }

  const contactUsForm = {
    text:
      "INSERT INTO contactus(name, email, message) VALUES($1, $2, $3) RETURNING name, email",
    values: [name, email, message],
  };
  try {
    const { rows } = await req.db.query(contactUsForm);
    res.status(200).send(rows[0]);
  } catch (err) {
    console.log(err.stack);
    res.status(400).send(`Something went wrong: ${err}`);
  }
});

// =================================== //
export default router;
