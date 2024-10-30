import express from 'express';
import Trainer from '../models/Trainer';
import auth, { RequestWithUser } from '../middleware/auth';

const trainersRouter = express.Router();

trainersRouter.get('/', async (req, res) => {
    const allTrainers = await Trainer.find().populate('user' , 'displayName');
    return res.status(200).json(allTrainers);
})

trainersRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    const allTrainers = await Trainer.findById(id).populate('user' , 'displayName');
    return res.status(200).json(allTrainers);
})

trainersRouter.put('/:id', auth , async (req: RequestWithUser, res) => {
    try{
        const trainerId = req.params.id;
        const user = req.user;

        if(!user) return res.status(401).send({ error: 'User not found' });

        const trainer = await Trainer.findById(trainerId);
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        if (trainer.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'You do not have the rights to change this profile' });
        }
        const updatedTrainer = await Trainer.findByIdAndUpdate(trainerId, req.body, { new: true });

        res.json(updatedTrainer);
    }catch (e) {
        res.status(500).json({ message: 'Error updating trainer profile', e });
    }
})

export default trainersRouter;