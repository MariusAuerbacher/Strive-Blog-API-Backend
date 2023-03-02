import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import cors from "cors";
import { errorsHandler } from "./errorsHandler.js";
import { dirname, join } from "path"
import { fileURLToPath } from "url";

const server = Express();
const port = 3001;
const publicFolderPath = join(process.cwd(), "./public")
const imagesJSONPath = join(dirname(fileURLToPath(import.meta.url)), "./public/img/authors")
//const coverJSONPath = join(dirname(fileURLToPath(import.meta.url)), "./public/img/blogPosts")

server.use("/public", Express.static(imagesJSONPath))
//server.use("/public", Express.static(coverJSONPath))
server.use(cors())
server.use(Express.json());




server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);


server.use(errorsHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`server running on port", ${port}`);
});
