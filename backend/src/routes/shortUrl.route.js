import express from "express";
import {
  createShortUrl,
  getAnalytics,
} from "../controllers/shortUrl.controller.js";

const router = express.Router();

router.post("/create", createShortUrl);
router.get("/analytics/:shortUrl", getAnalytics);

export default router;
