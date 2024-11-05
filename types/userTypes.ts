import { Model } from "mongoose";

export interface UserFields {
  email: string;
  password: string;
  role: string;
  token: string;
  googleId?: string;
  __confirmPassword: string;
  firstName: string,
  lastName: string;
  phoneNumber?: string;
  avatar: string;
  notification?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export interface UserVirtuals {
  confirmPassword: string;
}

export interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
  getToken(): void;
}

export type UserModel = Model<UserFields, {}, UserMethods, UserVirtuals>;
