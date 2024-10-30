import mongoose, { Types } from 'mongoose';
import User from './User';

const Schema = mongoose.Schema;

const TrainerSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async (value: Types.ObjectId) => {
                const user = await User.findById(value);
                return Boolean(user && user.role === "trainer");
            },
            message: "There can only be one role",
        }
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
        default: 0,
    },
    avatar:{
        type: String,
    }
})

const Trainer = mongoose.model('Trainer',TrainerSchema);
export default Trainer;