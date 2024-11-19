import mongoose from "mongoose";
import {GroupChatMessages} from "../types/groupChatMessagesTypes";

const Schema = mongoose.Schema;

const GroupChatMessageSchema = new Schema<GroupChatMessages>({
    groupChat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupChat",
        required: true,
    },
    author:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
    },
    isRead: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users",
                required: true,
            },
            read: {
                type: Boolean,
                required: true,
                default: false,
            },
        },
    ],
})

const GroupChatMessage = mongoose.model("GroupChatMessages", GroupChatMessageSchema);
export default GroupChatMessage;