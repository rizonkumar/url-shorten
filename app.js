import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongo.config.js";
import shortUrlRoute from "./src/routes/shortUrl.route.js";

dotenv.config("./.env");

const app = express();
app.use(express.json());

app.post("/api", shortUrlRoute);

app.get("/api", shortUrlRoute);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
