import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

const userFinder = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  const decodedUser: any = token
    ? jwt.verify(token, process.env.SECRET_KEY)
    : {};
  req.user = decodedUser;
  next();
};

export default userFinder;
