import express from "express";
import Genre from "../models/genre.js";

const router = express.Router();


router.get("/", async (req, res) => {
  const genres = await Genre.find();
  res.json(genres);
});

router.post("/", async (req, res) => {
  const genre = new Genre(req.body);
  await genre.save();
  res.status(201).json(genre);
});

router.put("/:id", async (req, res) => {
  const updated = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Genre.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa thể loại" });
});

export default router;
