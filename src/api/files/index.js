import Express from "express"
import multer from "multer"
//import { extname } from "path"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { saveUsersAvatars } from "../../lib/fs-tools.js"

const filesRouter = Express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "../authors",
    },
  }),
}).single("avatar")

filesRouter.post("/:id/uploadAvatar", cloudinaryUploader, async (req, res, next) => {
  try {
    console.log("FILE:", req.file)
    res.send({ message: "file uploaded" })
  } catch (error) {
    next(error)
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

export default filesRouter