import shortUrlModel from "../model/shortUrl.model.js";
import { generateNanoId } from "../utils/helper.js";

export const createShortUrlService = async (url) => {
  const existing = await shortUrlModel.findOne({ originalUrl: url });
  if (existing) {
    return existing;
  }
  const shortCode = generateNanoId(7);
  const newUrl = new shortUrlModel({
    originalUrl: url,
    shortUrl: shortCode,
  });
  await newUrl.save();
  return newUrl;
};
