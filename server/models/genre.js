import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const Genre = mongoose.model("Genre", genreSchema);
export default Genre;
