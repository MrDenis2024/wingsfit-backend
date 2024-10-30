import mongoose, { Types } from "mongoose";
import User from "./User";
import { ClientTypes } from "../types/clientTypes";

const Schema = mongoose.Schema;

const ClientSchema = new Schema<ClientTypes>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        if (user?.role !== "client") {
          return false;
        }
        const client = await Client.findOne({ user: value });
        if (client) {
          return false;
        }
        return Boolean(user);
      },
      message: "User does not exist!",
    },
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  health: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["female", "male", "another"],
  },
  age: {
    type: Number,
  },
  subscribes: {
    type: [Schema.Types.ObjectId],
  },
  timeZone: {
    type: String,
    required: true,
  },
  avatar: String,
});

const Client = mongoose.model("Client", ClientSchema);

export default Client;
