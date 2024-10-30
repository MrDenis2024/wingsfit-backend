import { Types } from 'mongoose';

export interface TrainerTypes{
    user: Types.ObjectId | string;
    firstName:string;
    lastName:string;
    timeZone:string;
    courseTypes: string[];
    rating:number;
    avatar:string;
}