import express from "express";
import multer from "multer";
import CommunityPage from "../models/CommunityPage.js";


import SelectedCommunities from "../models/SelectedCommunities.js";

const router = express.Router();

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* =================================================
   CREATE / UPDATE (UPSERT)
   POST /api/admin/community-pages
================================================= */
router.post(
  "/admin/community-pages",
  upload.single("heroImage"),
  async (req, res) => {
    try {
      const body = req.body;

      if (!body.community || !body.slug) {
        return res.status(400).json({ error: "Community & slug required" });
      }

      const data = {
        community: body.community,
        slug: body.slug,
        tagline: body.tagline,
        description: body.description,
        schools: body.schools,
        safety: body.safety,

        commute: {
          downtown: body.downtown,
          airport: body.airport,
          mall: body.mall,
        },

        keyFeatures: body.keyFeatures
          ? body.keyFeatures.split(",").map(f => f.trim())
          : [],

        marketSnapshot: {
          startingPrice: body.startingPrice,
          avgDaysOnMarket: body.avgDaysOnMarket,
          propertyType: body.propertyType,
        },

        seo: {
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
        },

        updatedAt: new Date(),
      };

      if (req.file) {
        data.heroImage = req.file.filename;
        data.heroImageURL = undefined;
      } else if (body.heroImageURL) {
        data.heroImageURL = body.heroImageURL;
        data.heroImage = undefined;
      }

      const page = await CommunityPage.findOneAndUpdate(
        { community: body.community },
        data,
        { upsert: true, new: true }
      );

      res.json(page);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save community page" });
    }
  }
);

/* =================================================
   READ ALL (Admin list)
   GET /api/admin/community-pages
================================================= */
router.get("/admin/community-pages", async (req, res) => {
  try {
    const pages = await CommunityPage.find().sort({ updatedAt: -1 });
    res.json(pages);
  } catch {
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

/* =================================================
   READ ONE (Admin edit)
   GET /api/admin/community-pages/:id
================================================= */
router.get("/admin/community-pages/:id", async (req, res) => {
  try {
    const page = await CommunityPage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Not found" });
    res.json(page);
  } catch {
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

/* =================================================
   READ ONE (Public by slug)
   GET /api/community-pages/:slug
================================================= */
router.get("/community-pages/:slug", async (req, res) => {
  try {
    const page = await CommunityPage.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: "Not found" });
    res.json(page);
  } catch {
    res.status(500).json({ error: "Failed to fetch community" });
  }
});

/* =================================================
   DELETE
   DELETE /api/admin/community-pages/:id
================================================= */
router.delete("/admin/community-pages/:id", async (req, res) => {
  try {
    await CommunityPage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete page" });
  }
});


router.post("/save-selected", async (req, res) => {
  try {
    const { selected } = req.body;

    if (!Array.isArray(selected)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Check if record exists
    let record = await SelectedCommunities.findOne();

    if (record) {
      record.selected = selected;
      await record.save();
    } else {
      await SelectedCommunities.create({ selected });
    }

    res.json({ message: "Selected communities saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================================
   GET SELECTED COMMUNITIES
================================ */

router.get("/selected", async (req, res) => {
  try {
    const record = await SelectedCommunities.findOne();

    if (!record) {
      return res.json({ selected: [] });
    }

    res.json({ selected: record.selected });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/public", async (req, res) => {
  try {
    const record = await SelectedCommunities.findOne();
    const selectedIds = record?.selected || [];

    const communities = await CommunityPage.find({
      _id: { $in: selectedIds }
    });

    res.json(communities);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
