import { createShortUrlService } from "../services/shortUrl.service.js";
import shortUrlModel from "../model/shortUrl.model.js";

const normalizeUrl = (inputUrl) => {
  let normalized = inputUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = "https://" + normalized;
  }
  try {
    const parsed = new URL(normalized);
    return parsed.toString();
  } catch (error) {
    return null;
  }
};

export const createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const validatedUrl = normalizeUrl(url);
    if (!validatedUrl) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const shortUrl = await createShortUrlService(validatedUrl);

    res.status(201).json({
      originalUrl: shortUrl.originalUrl,
      shortUrl: (process.env.APP_URL || "http://localhost:5002") + "/" + shortUrl.shortUrl,
      shortCode: shortUrl.shortUrl,
      clicks: shortUrl.clicks,
      createdAt: shortUrl.createdAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Short URL collision, please try again" });
    }
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getOriginalUrl = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await shortUrlModel.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    await shortUrlModel.updateOne({ _id: url._id }, { $inc: { clicks: 1 } });

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const urlRecord = await shortUrlModel.findOne({ shortUrl });

    if (!urlRecord) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.json({
      originalUrl: urlRecord.originalUrl,
      shortUrl: (process.env.APP_URL || "http://localhost:5002") + "/" + urlRecord.shortUrl,
      shortCode: urlRecord.shortUrl,
      clicks: urlRecord.clicks,
      createdAt: urlRecord.createdAt,
      updatedAt: urlRecord.updatedAt,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
