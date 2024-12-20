import mongoose, { HydratedDocument } from "mongoose";
import {
  UserFields,
  UserMethods,
  UserModel,
  UserVirtuals,
} from "../types/userTypes";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

const SALT_WORK_FACTOR = 10;

const Schema = mongoose.Schema;

const TimeZoneSchema = new Schema({
  value: String,
  label: String,
});

const UserSchema = new Schema<
  UserFields,
  UserModel,
  UserMethods,
  {},
  UserVirtuals
>(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,5})+$/,
        "Please fill a valid email address",
      ],
      validate: {
        validator: async function (value: string): Promise<boolean> {
          if (!(this as HydratedDocument<UserFields>).isModified("email")) {
            return true;
          }
          const user = await User.findOne({ email: value });
          return !user;
        },
        message: "This user is already registered!",
      },
    },
    userName: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: async function (value: string): Promise<boolean> {
          if (!(this as HydratedDocument<UserFields>).isModified("userName")) {
            return true;
          }
          const admin = await User.findOne({ userName: value });
          return !admin;
        },
        message: "This admin userName is already registered!",
      },
    },
    password: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["client", "trainer", "admin", "superAdmin"],
    },
    firstName: String,
    lastName: String,
    phoneNumber: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, "Некорректный формат номера телефона"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    timeZone: TimeZoneSchema,
    dateOfBirth: Date,
    avatar: {
      type: String,
      default: null,
    },
    notification: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
    lastActivity: {
      type: Date,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    virtuals: {
      confirmPassword: {
        get() {
          return this.__confirmPassword;
        },
        set(confirmPassword: string) {
          this.__confirmPassword = confirmPassword;
        },
      },
    },
  },
);

UserSchema.path("password").validate(function (v) {
  if (!this.isModified("password")) {
    return;
  }

  if (v !== this.confirmPassword) {
    this.invalidate("confirmPassword", "Passwords do not match!");
    this.invalidate("password", "Passwords do not match!");
  }
});

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.getToken = function () {
  this.token = randomUUID();
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model<UserFields, UserModel>("User", UserSchema);

export default User;
