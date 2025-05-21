import shortUrlModel from "../model/shortUrl.model.js";
import { generateNanoId } from "../utils/helper.js";

export const createShortUrlService = async (url) => {
  const shortUrl = generateNanoId(7);
  const newUrl = new shortUrlModel({
    originalUrl: url,
    shortUrl: shortUrl,
    // clicks: 0,
    // users: null,
  });

  await newUrl.save();
  return newUrl;
};
