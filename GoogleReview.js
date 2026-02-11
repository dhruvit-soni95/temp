import mongoose from "mongoose";

const GoogleReviewSchema = new mongoose.Schema({
  googleReviewId: {
    type: String,
    required: true,
    unique: true,
  },
  authorName: String,
  rating: Number,
  content: String,
  profilePhoto: String,
  reviewDate: String,
  isSelected: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("GoogleReview", GoogleReviewSchema);
