import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import cors from "cors";
import { errorsHandler } from "./errorsHandler.js";

const server = Express();
const port = 3001;

server.use(Express.json());
server.use(cors())

server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);


server.use(errorsHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`server running on port", ${port}`);
});
