import express from "express";
import Author from "../models/author.js";

const router = express.Router();


router.get("/", async (req, res) => {
  const authors = await Author.find();
  res.json(authors);
});

router.post("/", async (req, res) => {
  const author = new Author(req.body);
  await author.save();
  res.status(201).json(author);
});

router.put("/:id", async (req, res) => {
  const updated = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Author.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa tác giả" });
});

export default router;
