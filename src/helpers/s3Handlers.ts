import * as fs from "fs";
import * as AWS from "aws-sdk";
import * as chalk from "chalk";
import chalkErrorLog from "../utils/chalkErrorLog";
import { Response } from "express";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

export const uploadFile = (
  source: string,
  targetName: string,
  res: Response
) => {
  console.log(chalk.cyan("Preparing to upload..."));
  //
  fs.readFile(source, (err, filedata) => {
    if (err) {
      chalkErrorLog("Error occured on s3Handlers.ts @ uploadFile: ", err);
      return res.status(400).send("Something went wrong");
    } else {
      const putParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: targetName,
        Body: filedata,
      };
      s3.putObject(putParams, (err, data) => {
        if (err) return res.send({ success: false });
        else {
          fs.unlink(source, (cb) =>
            console.log(chalk.yellow("Unlink successful"))
          );
          console.log(chalk.greenBright("Successfully uploaded the file"));
          return res.status(200).send({ success: true, targetName });
        }
      });
    }
  });
};

export const retrieveFile = (filename, res) => {
  const getParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
  };
  s3.getObject(getParams, function (err, data) {
    if (err) {
      chalkErrorLog("Error occured on s3Handlers.ts @ retrieveFile: ", err);

      return res.status(400).send({ success: false, err: err });
    } else {
      return res.send(data.Body);
    }
  });
};
