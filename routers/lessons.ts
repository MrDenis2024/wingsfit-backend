import express from "express";
import Lessons from "../models/Lessons";
import auth, {RequestWithUser} from "../middleware/auth";

const lessonsRouter = express.Router();

lessonsRouter.get("/",async (req, res) => {
    const allLessons = await Lessons.find()
    return res.status(200).send(allLessons)
})

lessonsRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    const oneLesson = await Lessons.findById(id);
    return res.status(200).send(oneLesson);
})

lessonsRouter.post("/", auth, async (req: RequestWithUser, res, next) => {
    try {
        const user = req.user;

        if (!user) return res.status(401).send({ error: "User not found" });

        if (user.role !== "trainer") {
            return res.status(400).send({
                error: "Bad Request! Lesson create only for users with role trainer!",
            });
        }

        if (req.body.title.trim() === '' || req.body.quantityClients <= 0) {
            return res.status(400).send({error: "Please enter a title or quantity clients"});
        }

        const lessonMutation = {
            course: req.body.course,
            title: req.body.title,
            quantityClients: req.body.quantityClients,
            timeZone: req.body.timeZone? req.body.timeZone : null,
            groupLevel: req.body.groupLevel? req.body.groupLevel : null,
            ageLimit: req.body.ageLimit ? req.body.ageLimit : null,
            description: req.body.description ? req.body.description : null,
        }

        const lesson = await Lessons.create(lessonMutation)
        return res.status(200).send(lesson)
    }catch(error) {
        next(error);
    }
})

export default lessonsRouter