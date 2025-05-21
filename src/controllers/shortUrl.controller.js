import { generateNanoId } from "../utils/helper";

export const createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const shortUrl = generateNanoId(7);
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
};

export const getOriginalUrl = async (req, res) => {
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
};
