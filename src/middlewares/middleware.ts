import * as express from "express";
import db from "./db";
import userFinder from "./userFinder";

const middleware = express.Router();
middleware.use(db).use(userFinder);

export default middleware;
