import express from "express";

const app = express();

app.listen(5000, () => {
  console.log("Server is running on PORT 5000");
});

// GET -> Redirection
// POST -> Create Short URL
