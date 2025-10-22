// ...existing code...
import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
   bio: { type: String, required: true },
   dateOfBirth: { type: Date },
   dateOfDeath: { type: Date },
   images: { type: String },
   bio: { type: String },
   dateOfBirth: { type: Date },
   dateOfDeath: { type: Date },    image: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Author = mongoose.model("Author", authorSchema);
export default Author;