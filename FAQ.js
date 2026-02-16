import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      default: "General",
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export default mongoose.model("FAQ", faqSchema);
