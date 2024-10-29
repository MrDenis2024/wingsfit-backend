import mongoose from "mongoose";
import { UserFields, UserMethods, UserModel } from "../types/userTypes";
import { randomUUID } from "node:crypto";

const Schema = mongoose.Schema;

const UserSchema = new Schema<UserFields, UserModel, UserMethods>({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["client", "trainer"],
  },
  token: {
    type: String,
    required: true,
  },
});

UserSchema.methods.getToken = function () {
  this.token = randomUUID();
};

const User = mongoose.model<UserFields, UserModel>("User", UserSchema);

export default User;
