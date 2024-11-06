import mongoose from "mongoose";
import {LessonsTypes} from "../types/lessonsTypes";

const Schema = mongoose.Schema;

const LessonSchema = new Schema<LessonsTypes>({
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    timeZone:{
        type: String,
        required: true,
    },
    groupLevel:{
        type: Number,
        required: true,
    },
    quantityClients:{
        type: Number,
        required: true,
    },
    ageLimit:{
        type: Number,
    },
    description: {
        type: String,
    },
    participants:{
        type: [mongoose.Schema.Types.ObjectId],
    },
    presentUser:{
        type: [mongoose.Schema.Types.ObjectId],
    }
})

const Lessons = mongoose.model("Lessons", LessonSchema);
export default Lessons;