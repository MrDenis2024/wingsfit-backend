import { Types } from "mongoose";

export interface CourseTypes {
  user: Types.ObjectId | string;
  title: string;
  courseType: Types.ObjectId | string;
  description: string;
  format: string;
  schedule: string[];
  price: number;
  image: string | null;
}

export interface UpdatedCourse {
  title: string,
  courseType: Types.ObjectId | string,
  description:string,
  format: string,
  schedule: string[],
  price: number,
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
