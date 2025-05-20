import express from "express";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import connectDB from "./src/config/mongo.config.js";
import shortUrlModel from "./src/model/shorturl.mode.js";

dotenv.config("./.env");

const app = express();
app.use(express.json());

app.post("/api/create", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const shortUrl = nanoid(10);
    console.log("Short URL:", shortUrl);
    const newUrl = new shortUrlModel({
      originalUrl: url,
      shortUrl: shortUrl,
      clicks: 0,
      users: null,
    });
    await newUrl.save();
    res.status(201).json({ shortUrl });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Short URL collision, please try again" });
    }
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/:shortUrl", async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await shortUrlModel.findOne({ shortUrl: shortUrl });
    console.log("Url", url);
    if (!url) {
      return res.status(404).send("Short URL not found");
    }

    await shortUrlModel.updateOne({ _id: url._id }, { $inc: { clicks: 1 } });

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
