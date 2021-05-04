import * as express from "express";

import middleware from "../middlewares/middleware";
import chalkErrorLog from "../utils/chalkErrorLog";
import { retrieveFile } from "../helpers/s3Handlers";

// =================================== //
const router = express.Router();
// =================================== //
router.use(middleware);
// =================================== //
router.post("/get-file-list", async (req, res) => {
  if (!req.user) {
    res.status(401).send("Please sign in.");
  }
  try {
    const { rows } = await req.db.query({
      text: `SELECT id, file_name, created_at, owner_id FROM files WHERE owner_id = $1 ORDER BY created_at DESC;`,
      values: [req.user.id],
    });
    res.status(200).send(rows);
  } catch (err) {
    chalkErrorLog("Error occured on /files/get-file-list: ", err);
    res.status(400).send(`Something went wrong, ${err}`);
  }
});
// =================================== //
router.get("/get-file/:file_name", (req, res) => {
  retrieveFile(req.params.file_name, res);
});
// =================================== //

export default router;
