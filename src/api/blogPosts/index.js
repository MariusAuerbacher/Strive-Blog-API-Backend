import Express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

const blogPostsRouter = Express.Router();

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogposts.json"
);

blogPostsRouter.get("/", (req, res) => {
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  res.send(blogPostsArray);
});
