import mongoose from "mongoose";
import {PrivateChatTypes} from "../types/privateChatTypes";
import User from "./User";

const Schema = mongoose.Schema;

const PrivateChatSchema = new Schema<PrivateChatTypes>({
    firstPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        validate: {
            validator: async function (firstId: string): Promise<boolean> {
                const user = await User.findById(firstId);

                if (!user) {
                    return false;
                }

                return ["trainer", "admin", "superAdmin"].includes(user.role);
            },
            message: "firstPerson must be with the trainer, admin or superAdmin role",
        },
    },
    secondPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        validate: {
            validator: async function (secondId: string): Promise<boolean> {
                return this.firstPerson.toString() !== secondId.toString();
            },
            message: "second Person cannot be the same user as the first Person",
        },
    },
    availableTo: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users",
            },
        ],
    },
})

const PrivateChat = mongoose.model('PrivateChat', PrivateChatSchema);
export default PrivateChat;