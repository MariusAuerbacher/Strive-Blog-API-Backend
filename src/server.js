import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import cors from "cors";
import {
  forbiddenErrorHandler,
  genericErroHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler,
} from "../src/errorsHandler.js"
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import createHttpError from "http-errors";
import filesRouter from "./api/files/index.js";
import mongoose from "mongoose";
import authMiddleware from "./api/lib/auth.js";
import { getBlogPosts } from "./api/lib/fs-tools.js";
import passport from "passport";
import googleStrategy from "./api/lib/googleauth.js";

const server = Express();
const port = process.env.PORT || 3001;



const publicFolderPath = join(process.cwd(), "./public");
const imagesJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "./public/img/authors"
);
const coverJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "./public/img/blogPosts"
);

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(Express.static(publicFolderPath));

passport.use("google", googleStrategy)

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Origin ${currentOrigin} is not in the whitelist!`
          )
        );
      }
    },
  })
);

/*server.use("/public", Express.static(imagesJSONPath))
server.use("/public", Express.static(coverJSONPath))
server.use(cors())*/
server.use(Express.json());
server.use(passport.initialize())


server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/blogPosts", filesRouter);
server.get("/me/stories", authMiddleware, async(req, res)=>{
  const blogPostsArray = await getBlogPosts();
 const authorPosts = blogPostsArray.filter((post)=>{
    if(post.authorId === req.authorId){
      return true
    }
  })
  res.json(authorPosts)
})

server.use(unauthorizedErrorHandler);
server.use(forbiddenErrorHandler);
server.use(notFoundErrorHandler);
server.use(genericErroHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log(`✅ Successfully connected to Mongo!`);
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
