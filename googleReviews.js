import express from "express";
import axios from "axios";
import GoogleReview from "../models/GoogleReview.js";

const router = express.Router();

/* =================================================
   FETCH FROM GOOGLE AND SAVE TO DB
================================================= */

router.get("/admin/fetch-google-reviews", async (req, res) => {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID;

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: PLACE_ID,
          fields: "reviews",
          key: GOOGLE_API_KEY,
        },
      }
    );

    const reviews = response.data.result.reviews || [];

    for (const review of reviews) {
      await GoogleReview.findOneAndUpdate(
        { googleReviewId: review.time.toString() },
        {
          googleReviewId: review.time.toString(),
          authorName: review.author_name,
          rating: review.rating,
          content: review.text,
          profilePhoto: review.profile_photo_url,
          reviewDate: new Date(review.time * 1000)
            .toISOString()
            .split("T")[0],
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Google reviews synced successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch Google reviews" });
  }
});

/* =================================================
   GET ALL REVIEWS FOR ADMIN
================================================= */

router.get("/admin/google-reviews", async (req, res) => {
  try {
    const reviews = await GoogleReview.find().sort({ reviewDate: -1 });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/* =================================================
   SAVE SELECTED REVIEWS
================================================= */

router.post("/admin/google-reviews/select", async (req, res) => {
  try {
    const { selectedIds } = req.body;

    await GoogleReview.updateMany({}, { isSelected: false });

    await GoogleReview.updateMany(
      { _id: { $in: selectedIds } },
      { isSelected: true }
    );

    res.json({ message: "Selected reviews saved" });

  } catch {
    res.status(500).json({ error: "Failed to save selection" });
  }
});

/* =================================================
   GET ONLY SELECTED REVIEWS (FRONTEND)
================================================= */

router.get("/google-reviews", async (req, res) => {
  try {
    const reviews = await GoogleReview.find({ isSelected: true });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch selected reviews" });
  }
});

export default router;
