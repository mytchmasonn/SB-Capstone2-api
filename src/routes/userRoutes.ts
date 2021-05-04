import * as express from "express";

import middleware from "../middlewares/middleware";
import chalkErrorLog from "../utils/chalkErrorLog";

const router = express.Router();

router.use(middleware);

router.post("/", async (req, res) => {
  try {
    res.status(202).send(req.user);
  } catch (err) {
    chalkErrorLog("Error occured on /user/", err);
    res.status(401).send("No Token Found");
  }
});

export default router;
