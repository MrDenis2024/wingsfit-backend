import mongoose from "mongoose";

const Schema = mongoose.Schema;

const LessonTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  isPublished: {
    type: Boolean,
    default: false,
  },
});

const LessonType = mongoose.model("LessonType", LessonTypeSchema);

export default LessonType;
