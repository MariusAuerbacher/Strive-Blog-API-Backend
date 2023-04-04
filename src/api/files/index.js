import Express from "express"
import multer from "multer"
//import { extname } from "path"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

import { pipeline } from "stream"
import { createGzip } from "zlib"
import { getPDFReadableStream } from "../lib/pdf-tools.js";
import { getBlogPostsJSONReadableStream, getBlogPosts, saveUsersAvatars  } from "../lib/fs-tools.js";

const filesRouter = Express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "hw-u4-w1-d2/blogPosts",
    },
  }),
}).single("avatar")
filesRouter.post("/:blockPostId/single", cloudinaryUploader, async (req, res, next) => {
  try {
    console.log("FILE:", req.file)
    res.send({ message: "file uploaded" })
  } catch (error) {
    next(error)
  }
})

filesRouter.post("/:blockPostmultiple", multer().array("avatars"), async (req, res, next) => {
  try {
    await Promise.all(req.files.map(file => saveUsersAvatars(file.originalname, file.buffer)))
    console.log("REQ FILES:", req.files)
    res.send({ message: "files uploaded" })
  } catch (error) {
    next(error)
  }
})

filesRouter.get("/blogPostsJSON", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=blogPosts.json.gz")
    const source = getBlogPostsJSONReadableStream()
    const destination = res
    const transform = createGzip()

    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})
/*
filesRouter.post("/:id/uploadAvatar", cloudinaryUploader, async (req, res, next) => {
  try {
    const blogsArray = await getBlogs();
      const index = blogsArray.findIndex(
        (blog) => blog._id === req.params.blogId
      );
      if (index !== -1) {
        const blogToUpdate = blogsArray[index];
        const updatedBlog = {
          ...blogToUpdate,
          cover: req.file.path,
        };
        blogsArray[index] = updatedBlog;
        await writeBlogs(blogsArray);
      }
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
})

filesRouter.post("/:id/uploadAvatar", multer().array("avatars"), async (req, res, next) => {
  try {
    await Promise.all(req.files.map(file => saveUsersAvatars(file.originalname, file.buffer)))
    console.log("REQ FILES:", req.files)
    res.send({ message: "files uploaded" })
  } catch (error) {
    next(error)
  }
})
*/
filesRouter.get("/:blogPostsId/pdf", async (req, res, next) => {
  try {
    
    const blogPosts = await getBlogPosts()
    const foundBlogPost = blogPosts.find((b) => b.id === req.params.blogPostsId)
   
    if(foundBlogPost){
      res.setHeader("Content-Disposition", `attachment; filename=${foundBlogPost.id}.pdf`) 
      const source = getPDFReadableStream(foundBlogPost)
      const destination = res
  
      pipeline(source, destination, err => {
        if (err) console.log(err)
      })
    }
  } catch (error) {
    next(error)
  }
})

  


export default filesRouter