import Express from "express";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { checkBlogPostsSchema, triggerBadRequest } from "./validation.js";
//import createHttpError from "http-errors"
import { getBlogPosts, writeBlogPosts} from "../lib/fs-tools.js"
import multer from "multer"
import { extname } from "path"



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, coverJSONPath)
  },
  filename: function (req, file, cb) {
    const originalFileExtension = extname(file.originalname)
    cb(null, req.params.id + originalFileExtension)
  }
})

const upload = multer({ storage: storage })

const coverJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/blogPosts")


const blogPostsRouter = Express.Router();

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const theOgMiddleware = (req, res, next) => {
  console.log("I am the OG middleware!");
  next();
};

blogPostsRouter.get("/", theOgMiddleware, (req, res) => {
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  res.send(blogPostsArray);
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
  checkBlogPostsSchema,
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

    const blogPostsArray = await getBlogPosts() //JSON.parse(fs.readFileSync(blogPostsJSONPath));

    blogPostsArray.push(newBlogPost);

    await writeBlogPosts(blogPostsArray) //fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

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
  oldBlogPost.comments.push(req.body)
  blogPostsArray[index] = oldBlogPost
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

  res.send(oldBlogPost);
});



blogPostsRouter.post("/:id/uploadCover", upload.single("cover"), (req, res)=> {
  const imgURL = `http://localhost:3001/public/${req.params.id}${ extname(req.file.originalname)}`
 
  const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  const index = blogPostsArray.findIndex(blogPost => blogPost.id === req.params.id)
  const oldBlogPost = blogPostsArray[index]
  const updatedBlogPost = {...oldBlogPost, cover: imgURL}
  blogPostsArray[index] = updatedBlogPost

  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray))

  res.send(updatedBlogPost)
})


export default blogPostsRouter;
