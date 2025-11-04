import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String },
    dateOfBirth: { type: Date },
    dateOfDeath: { type: Date },
    image: { type: String }, // đường dẫn ảnh hoặc URL
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Author = mongoose.model("Author", authorSchema);
export default Author;
