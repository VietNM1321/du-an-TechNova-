import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentCode: String,
  fullName: String,
});

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  minStudentCode: { type: Number, required: true },
  maxStudentCode: { type: Number, required: true },
  students: [studentSchema],
});

export default mongoose.model("Course", courseSchema);
