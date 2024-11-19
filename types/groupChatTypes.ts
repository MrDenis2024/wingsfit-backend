import {Types} from "mongoose";

export interface ChatType {
    group: Types.ObjectId | string;
    title: string;
    subscribers?: Types.ObjectId[];
}