import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true, unique: true, trim: true },
    courseCode: { type: String, required: true, unique: true, uppercase: true },
    students: [
      {
        studentCode: { type: String, required: true },
        fullName: String,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const Course =
  mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;
