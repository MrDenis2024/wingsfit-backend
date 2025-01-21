import mongoose from "mongoose";
import { LessonsTypes } from "../types/lessonsTypes";

const Schema = mongoose.Schema;

const LessonSchema = new Schema<LessonsTypes>({
  lessonURL: String,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  notPresent: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
  },
  arePresent: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
});

const Lesson = mongoose.model("Lesson", LessonSchema);
export default Lesson;
