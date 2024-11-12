import {Types} from "mongoose";

export interface ReviewTypes {
    clientId: Types.ObjectId | string;
    trainerId: Types.ObjectId | string;
    rating: number;
    comment: string;
    createdAt: string;
}