import express from "express";
import {
  createShortUrl,
  getOriginalUrl,
} from "../controllers/shortUrl.controller.js";

const router = express.Router();

router.post("/create", createShortUrl);
router.get("/:shortUrl", getOriginalUrl);

export default router;
