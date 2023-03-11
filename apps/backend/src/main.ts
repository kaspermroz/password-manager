import express from "express";
import cors from "cors";

export const app = express();
app.use(cors());

app.get("/", (_, res) => {
  res.send("Hello, World");
});

if (import.meta.env.PROD) {
  app.listen(3000);
}
