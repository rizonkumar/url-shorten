import { createShortUrlService } from "../services/shortUrl.service.js";
import shortUrlModel from "../model/shortUrl.model.js";

export const createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const shortUrl = await createShortUrlService(url);

    res.status(201).json({
      shortUrl: process.env.APP_URL + "/" + shortUrl.shortUrl,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Short URL collision, please try again" });
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
