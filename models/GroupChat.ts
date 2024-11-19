import mongoose from "mongoose";
import {ChatType} from "../types/groupChatTypes";

const Schema = mongoose.Schema;

const GroupChatSchema = new Schema<ChatType>({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    subscribers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
})

const GroupChat = mongoose.model("GroupChat", GroupChatSchema);
export default GroupChat;