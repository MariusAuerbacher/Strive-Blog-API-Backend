import Express from "express";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { checkBlogPostsSchema, triggerBadRequest } from "./validation.js";
//import createHttpError from "http-errors"
import {
  getBlogPosts,
  getBlogPostsJSONReadableStream,
  //getBlogPostsJSONReadableStream,
  writeBlogPosts,
} from "../lib/fs-tools.js";
import multer from "multer";
import { extname } from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
//import { saveUsersAvatars } from "../../lib/fs-tools.js"
import { pipeline } from "stream";
import { getPDFReadableStream } from "../lib/pdf-tools.js";
//import { createGzip } from "zlib"
import { sendsBlogPostCreatedEmail } from "../lib/email.tools.js";
import { Transform } from "@json2csv/node";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "hw-u4-w1-d2/blogPosts",
    },
  }),
}).single("cover");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, coverJSONPath);
  },
  filename: function (req, file, cb) {
    const originalFileExtension = extname(file.originalname);
    cb(null, req.params.id + originalFileExtension);
  },
});

const upload = multer({ storage: storage });

const coverJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/img/blogPosts"
);

const blogPostsRouter = Express.Router();

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const theOgMiddleware = (req, res, next) => {
  console.log("I am the OG middleware!");
  next();
};

blogPostsRouter.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body;
    await sendsBlogPostCreatedEmail(email);
    res.send();
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/", theOgMiddleware, (req, res) => {
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  res.send(blogPostsArray);
});

blogPostsRouter.get("/csv", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=posts.csv");
    const source = getBlogPostsJSONReadableStream();
    const transform = new Transform({ fields: ["category", "title"] });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:id", (req, res, next) => {
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));

  const foundBlogPosts = blogPostsArray.find(
    (blogPost) => blogPost.id === req.params.id
  );

  if (!foundBlogPosts) {
    next({ status: 400, message: "Post not found" });
    return;
  }

  res.send(foundBlogPosts);
});

blogPostsRouter.post(
  "/",
  theOgMiddleware,
  //checkBlogPostsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    const newBlogPost = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uniqid(),
    };

    /*if(!req.body.title){
    next({status: 400, message: "Please enter the title"})
    return 
  }
  if(!req.body.cover){
    next({status: 400, message: "Please enter the cover"})
    return 
  }*/
    const blogPostsArray = await getBlogPosts(); //JSON.parse(fs.readFileSync(blogPostsJSONPath));

    blogPostsArray.push(newBlogPost);

    await writeBlogPosts(blogPostsArray); //fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

    //send email +++++++++++++++++++++
    await sendsBlogPostCreatedEmail(newBlogPost.email, newBlogPost.title);
    console.log("email succesfully sent")

    res.status(201).send({ id: newBlogPost.id });
  }
);

blogPostsRouter.put("/", (req, res) => {
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  const index = blogPostsArray.findIndex(
    (blogPost) => blogPost.id === req.params.id
  );
  const oldBlogPost = blogPostsArray[index];
  const updatedBlogPost = {
    ...oldBlogPost,
    ...req.body,
    updatedAt: new Date(),
  };
  blogPostsArray[index] = updatedBlogPost;

  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

  res.send(updatedBlogPost);
});

blogPostsRouter.delete("/:id", (req, res, next) => {
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));

  const remainingBlogPostsArray = blogPostsArray.filter(
    (blogPost) => blogPost.id !== req.params.id
  );

  if (blogPostsArray.length == remainingBlogPostsArray.length) {
    next({ message: "Couldn't delete Post, not found" });
    return;
  }

  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(remainingBlogPostsArray));

  res.status(204).send();
});

blogPostsRouter.post("/:id/comments", (req, res, next) => {
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  const index = blogPostsArray.findIndex(
    (blogPost) => blogPost.id === req.params.id
  );
  const oldBlogPost = blogPostsArray[index];
  oldBlogPost.comments.push(req.body);
  blogPostsArray[index] = oldBlogPost;
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

  res.send(oldBlogPost);
});

blogPostsRouter.post("/:id/uploadCover", upload.single("cover"), (req, res) => {
  const imgURL = `http://localhost:3001/public/${req.params.id}${extname(
    req.file.originalname
  )}`;

  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  const index = blogPostsArray.findIndex(
    (blogPost) => blogPost.id === req.params.id
  );
  const oldBlogPost = blogPostsArray[index];
  const updatedBlogPost = { ...oldBlogPost, cover: imgURL };
  blogPostsArray[index] = updatedBlogPost;

  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

  res.send(updatedBlogPost);
});

blogPostsRouter.post(
  "/:id/uploadAvatar",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const blogsArray = await getBlogPosts();
      const index = blogsArray.findIndex(
        (blog) => blog._id === req.params.blogId
      );
      if (index !== -1) {
        const blogToUpdate = blogsArray[index];
        const updatedBlog = {
          ...blogToUpdate,
          ...req.body,
          cover: req.file.path,
          updatedAt: new Date(),
        };
        blogsArray[index] = updatedBlog;
        await writeBlogs(blogsArray);
      }
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const foundBlogPost = blogPosts.find((b) => b.id === req.params.id);

    if (foundBlogPost) {
      res.setHeader("Content-Disposition", "attachment; filename=anything.pfd");
      const source = getPDFReadableStream(foundBlogPost);
      const destination = res;

      pipeline(source, destination, (err) => {
        if (err) console.log(err);
      });
    }
  } catch (error) {
    next(error);
  }
});



export default blogPostsRouter;
