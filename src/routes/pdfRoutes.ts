import * as express from "express";
import * as fs from "fs";
import * as multer from "multer";
import * as puppeteer from "puppeteer";

import middleware from "../middlewares/middleware";
import chalkErrorLog from "../utils/chalkErrorLog";
import { uploadFile } from "../helpers/s3Handlers";
// =================================== //
const router = express.Router();
// =================================== //
router.use(middleware);
// =================================== //
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
// =================================== //
const chromeOptions = {
  headless: true,
  defaultViewport: null,
  args: ["--incognito", "--no-sandbox", "--no-zygote"],
};
// =================================== //
router.post("/convert-url", async (req, res) => {
  if (!req.user) {
    res.status(401).send("Please login");
    return;
  }
  const { convertUrl, pdfFormat, withBackground, orientation } = req.body;
  const pdfUniqueNameStamp = Date.now();

  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();
  try {
    await page.goto(`${convertUrl}`, {
      waitUntil: "networkidle2",
    });
  } catch (err) {
    return res.status(400).send("Invalid URL");
  }
  await page.pdf({
    path: `uploads/tmp${pdfUniqueNameStamp}.pdf`,
    format: pdfFormat,
    printBackground: withBackground,
    landscape: orientation,
  });
  await browser.close();
  try {
    const timeAt = Date.now().toString();
    const convertUrlName = convertUrl.split("://")[1].replace(/\//g, "-");
    const fileUploadName = `${timeAt}_${convertUrlName}.pdf`;

    await req.db.query({
      text:
        "INSERT INTO files(file_name, created_at, owner_id) VALUES($1, $2, $3) RETURNING file_name",
      values: [fileUploadName, timeAt, req.user.id],
    });
    uploadFile(`uploads/tmp${pdfUniqueNameStamp}.pdf`, fileUploadName, res);
  } catch (err) {
    chalkErrorLog("Error occured on /convert/convert-url: ", err);
  }
});
// =================================== //
router.post("/convert-file", upload.single("fileKey"), async (req, res) => {
  if (!req.user) {
    res.status(401).send("Please login");
    return;
  }
  const { pdfFormat, withBackground, orientation } = req.body;
  const convertFile = req.file.path;
  const convertFileName = req.file.filename;
  const pdfUniqueNameStamp = Date.now();

  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();

  const html = fs.readFileSync(convertFile, "utf8");
  await page.setContent(html, {
    waitUntil: "domcontentloaded",
  });

  await page.pdf({
    path: `uploads/tmp${pdfUniqueNameStamp}.pdf`,
    format: pdfFormat,
    printBackground: withBackground === "true" ? true : false,
    landscape: orientation === "true" ? true : false,
  });

  await browser.close();

  const timeAt = Date.now();
  const createdTime = timeAt.toString();
  const fileUploadName = `${timeAt}_${convertFileName}.pdf`;

  try {
    await req.db.query({
      text:
        "INSERT INTO files(file_name, created_at, owner_id) VALUES($1, $2, $3) RETURNING file_name",
      values: [fileUploadName, createdTime, req.user.id],
    });
    uploadFile(`uploads/tmp${pdfUniqueNameStamp}.pdf`, fileUploadName, res);
    fs.unlink(convertFile, (cb) => console.log("HTML file unlink successful"));
  } catch (err) {
    chalkErrorLog("Error occured on /convert/convert-file: ", err);
  }
});
// =================================== //

export default router;
