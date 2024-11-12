import express from "express";
import TrainerReview from "../models/TrainerReview";
import auth, {RequestWithUser} from "../middleware/auth";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import {Types} from "mongoose";

export const trainerReviewRouter = express.Router();

trainerReviewRouter.get("/:id" , async (req, res) => {
    const trainerId = req.params.id;

    const oneTrainer = await TrainerReview.findById(trainerId);

    if (!oneTrainer){
        return res.status(404).send({error:'The trainer has not been found or has no reviews'});
    }

    return res.send(oneTrainer)
})

trainerReviewRouter.post("/", auth ,async (req: RequestWithUser, res, next) => {
    const {trainerId, rating, comment} = req.body;
    const clientId = req.user?._id;

    const isEmpty = (value: string) => !value || value.trim() === "";

    if (isEmpty(trainerId) || !rating || rating < 1 || rating > 5 || isEmpty(comment)) {
        return res.status(400).json({ error: 'Make sure that all fields are filled in correctly.' });
    }

    try {
        if (!(clientId instanceof Types.ObjectId)) {
            return res.status(400).json({ error: 'Invalid Client ID.' });
        }

        const course = await Course.findOne({ user: trainerId });
        if (!course) {
            return res.status(404).json({ error: 'Trainer not found in courses.' });
        }

        const lessons = await Lesson.find({ course: course._id });
        if (!lessons || lessons.length === 0) {
            return res.status(404).json({ error: 'No lessons found for this course.' });
        }

        let isParticipant = false;
        for (const lesson of lessons) {
            if (lesson.participants.includes(clientId)) {
                isParticipant = true;
                break;
            }
        }

        if (!isParticipant) {
            return res.status(403).json({ error: 'You must have attended a session with this trainer to leave a review.' });
        }

        const newReview = new TrainerReview({
            clientId,
            trainerId,
            comment,
            rating,
        });

        await newReview.save();

        return res.status(200).send(newReview)
    }catch (e) {
        next(e)
    }
    res.send('Data received');
})