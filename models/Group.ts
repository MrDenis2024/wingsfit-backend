import mongoose from "mongoose";

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  clients: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  clientsLimit: {
    type: Number,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  trainingLevel: {
    type: String,
    enum: ["junior", "middle", "advanced"],
    required: true,
  },
});

const Group = mongoose.model("Group", GroupSchema);

export default Group;
