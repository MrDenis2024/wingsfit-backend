import mongoose from "mongoose";
import {PrivateMessagesTypes} from "../types/privateMessagesTypes";

const Schema = mongoose.Schema;

const PrivateMessageSchema = new Schema<PrivateMessagesTypes>({
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

const PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);
export default PrivateMessage;