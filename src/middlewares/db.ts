import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
const connString = process.env.PG_CONN_STRING;
const pool = new Pool({ connectionString: connString });

const database = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  req.db = client;
  return next();
};

export default database;
