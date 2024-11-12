import mongoose from "mongoose";
import { LessonsTypes } from "../types/lessonsTypes";

const Schema = mongoose.Schema;

const LessonSchema = new Schema<LessonsTypes>({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  timeZone: {
    type: String,
    required: true,
  },
  groupLevel: {
    type: Number,
    required: true,
  },
  quantityClients: {
    type: Number,
    required: true,
  },
  ageLimit: {
    type: Number,
  },
  description: {
    type: String,
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Users",
  },
  presentUser: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Users",
  },
});

const Lesson = mongoose.model("Lesson", LessonSchema);
export default Lesson;
