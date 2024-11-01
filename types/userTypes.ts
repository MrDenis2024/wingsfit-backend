import { Model } from "mongoose";

export interface UserFields {
  email: string;
  password: string;
  role: string;
  token: string;
  googleId?: string;
  __confirmPassword: string;
}

export interface UserVirtuals {
  confirmPassword: string;
}

export interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
  getToken(): void;
}

export type UserModel = Model<UserFields, {}, UserMethods, UserVirtuals>;
