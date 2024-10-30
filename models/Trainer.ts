import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TrainerSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    timeZone:{
        type: String,
        required: true,
    },
    courseType:{
        type: [String],
    },
    rating:{
        type: Number,
    },
    avatar:{
        type: String,
    }
})

const Trainer = mongoose.model('Trainer',TrainerSchema);
export default Trainer;