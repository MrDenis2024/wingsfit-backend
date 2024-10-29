import { Model } from "mongoose";

export interface UserFields {
  googleId: string;
  role: string;
  token: string;
}

export interface UserMethods {
  getToken(): void;
}

export type UserModel = Model<UserFields, {}, UserMethods>;
