import { Model } from "mongoose";

export interface UserFields {
  email: string;
  password: string;
  userName: string;
  role: string;
  token: string;
  googleId?: string;
  __confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: string;
  timeZone: {
    value: string;
    label: string;
  };
  phoneNumber?: string;
  avatar: string | null;
  dateOfBirth: Date;
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
