import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import cors from "cors";
import { errorsHandler } from "./errorsHandler.js";
import { dirname, join } from "path"
import { fileURLToPath } from "url";
import createHttpError from "http-errors";

const server = Express();
const port = process.env.PORT || 3001;

const publicFolderPath = join(process.cwd(), "./public")
//const imagesJSONPath = join(dirname(fileURLToPath(import.meta.url)), "./public/img/authors")
//const coverJSONPath = join(dirname(fileURLToPath(import.meta.url)), "./public/img/blogPosts")

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

server.use(Express.static(publicFolderPath))

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true)
      } else {
        corsNext(createHttpError(400, `Origin ${currentOrigin} is not in the whitelist!`))
      }
    },
  })
)




/*server.use("/public", Express.static(imagesJSONPath))
server.use("/public", Express.static(coverJSONPath))
server.use(cors())*/
server.use(Express.json());


server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);


server.use(errorsHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`server running on port", ${port}`);
});
