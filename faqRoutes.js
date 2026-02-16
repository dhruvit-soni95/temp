import express from "express";
import FAQ from "../models/FAQ.js";

const router = express.Router();

/* ================= GET ALL FAQs ================= */
router.get("/", async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= CREATE FAQ ================= */
router.post("/", async (req, res) => {
  try {
    const { category, question, answer } = req.body;

    const newFaq = new FAQ({
      category,
      question,
      answer,
    });

    const savedFaq = await newFaq.save();
    res.status(201).json(savedFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ================= UPDATE FAQ ================= */
router.put("/:id", async (req, res) => {
  try {
    const { category, question, answer } = req.body;

    const updatedFaq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { category, question, answer },
      { new: true }
    );

    res.json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ================= DELETE FAQ ================= */
router.delete("/:id", async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
