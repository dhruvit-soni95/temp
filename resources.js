import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Resource from "../models/Resource.js";

const router = express.Router();

/* ===============================
   CREATE UPLOAD FOLDER IF MISSING
================================ */
const uploadDir = "uploads/resources";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===============================
   MULTER CONFIG (Large Files)
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  },
});

/* ===============================
   UPLOAD RESOURCE
================================ */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const newResource = new Resource({
      title,
      fileUrl: `/uploads/resources/${req.file.filename}`,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    await newResource.save();

    res.status(201).json({
      message: "Resource uploaded successfully",
      data: newResource,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* ===============================
   GET ALL RESOURCES
================================ */
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

/* ===============================
   DELETE RESOURCE + FILE
================================ */
router.delete("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Remove file from server
    const filePath = path.join(process.cwd(), resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
