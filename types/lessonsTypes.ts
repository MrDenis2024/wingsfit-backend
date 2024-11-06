import {Types} from "mongoose";

export interface LessonsTypes{
    course: Types.ObjectId | string;
    title: string;
    timeZone: string;
    groupLevel: number;
    quantityClients: number;
    description: string;
    participants: Types.ObjectId[];
    presences: Types.ObjectId[];
}