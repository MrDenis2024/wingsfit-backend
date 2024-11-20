import mongoose from "mongoose";
import {PrivateChatMessagesTypes} from "../types/privateChatMessagesTypes";

const Schema = mongoose.Schema;

const PrivateChatMessageSchema = new Schema<PrivateChatMessagesTypes>({
    privateChat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PrivateChat",
        required: true,
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    message:{
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
                ref: "Users",
                required: true,
            },
            read: {
                type: Boolean,
                default: false,
            },
        },
    ],
})

const PrivateChatMessage = mongoose.model("PrivateChatMessage", PrivateChatMessageSchema);
export default PrivateChatMessage;