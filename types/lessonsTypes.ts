import { Types } from "mongoose";
import { CourseTypes } from "./courseTypes";

export interface LessonsTypes {
  lessonURL: string;
  group: Types.ObjectId | CourseTypes;
  createdAt: Date;
  notPresent: Types.ObjectId[];
  arePresent: Types.ObjectId[];
}
