import mongoose from "mongoose";
import { GroupChatMessages } from "../types/groupChatMessagesTypes";

const Schema = mongoose.Schema;

const GroupChatMessageSchema = new Schema<GroupChatMessages>({
  groupChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupChat",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const GroupChatMessage = mongoose.model(
  "GroupChatMessages",
  GroupChatMessageSchema,
);
export default GroupChatMessage;
