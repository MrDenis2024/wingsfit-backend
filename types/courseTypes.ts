import { Types } from "mongoose";

export interface WaitList {
  _id?: Types.ObjectId;
  user: Types.ObjectId | string;
  createdAt: Date;
  favoriteGroup: Types.ObjectId | string;
  status: string;
}

export interface CourseTypes {
  user: Types.ObjectId;
  title: string;
  courseType: Types.ObjectId | string;
  description: string;
  format: string;
  schedule: string[];
  price: number;
  image: string | null;
  waitList: WaitList[];
}

export interface UpdatedCourse {
  title: string;
  courseType: Types.ObjectId | string;
  description: string;
  format: string;
  schedule: string[];
  price: number;
}

export interface CourseTypeFields {
  name: string;
  description: string;
}

export interface ICourseRequest {
  course: Types.ObjectId | string;
  client: Types.ObjectId | string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
