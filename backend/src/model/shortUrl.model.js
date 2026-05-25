import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const shortUrlModel = mongoose.model("shortUrl", shortUrlSchema);

export default shortUrlModel;
