import { NextFunction, Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import { UserFields, UserMethods } from "../types/userTypes";
import User from "../models/User";

export interface RequestWithUser extends Request {
  user?: HydratedDocument<UserFields, UserMethods>;
}

const auth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const headerValue = req.get("Authorization");
  if (!headerValue) {
    return res.status(401).send({ error: 'Header "Authorization" not found' });
  }
  const [_bearer, token] = headerValue.split(" ");
  if (!token) {
    return res.status(401).send({ error: "Token not found" });
  }
  const user = await User.findOne({ token });
  if (!user) {
    return res.status(401).send({ error: "Wrong Token!" });
  }
  req.user = user;
  return next();
};

export default auth;
