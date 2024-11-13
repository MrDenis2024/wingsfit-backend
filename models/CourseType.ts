import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CourseTypeSchema = new Schema({
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

const CourseType = mongoose.model("CourseType", CourseTypeSchema);

export default CourseType;
