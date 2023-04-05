import Express from "express"
import fs from "fs-extra"
import { fileURLToPath } from "url" 
import { dirname, join } from "path" 
import uniqid from "uniqid"
import multer from "multer"
import { extname } from "path"
import AuthorModel from "./model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const authorsRouter = Express.Router()

const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "authors.json")

const imagesJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/authors")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesJSONPath)
  },
  filename: function (req, file, cb) {
    const originalFileExtension = extname(file.originalname)
    cb(null, req.params.id + originalFileExtension)
  }
})

const upload = multer({ storage: storage })





authorsRouter.get("/", (req, res) => {

  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
  res.send(authorsArray);
});


authorsRouter.get("/:id", (req, res) => {

  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

  const foundAuthor = authorsArray.find(author => author.id === req.params.id)

  res.send(foundAuthor);
});



authorsRouter.post("/", (req, res) => {
  const newAuthor = { ...req.body, createdAt: new Date(), updatedAt: new Date(), id: uniqid() }


  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

  authorsArray.push(newAuthor)

  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray))


  res.status(201).send({id: newAuthor.id})
})

authorsRouter.post("/register", async(req, res)=> {
  const authorExist = await AuthorModel.findOne({email: req.body.email})
  if(authorExist){
   return res.status(400).json("Email already exists")
  } 
  
  const hashedPassword = bcrypt.hashSync(req.body.password, 12)

  const author = new AuthorModel({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    dob: req.body.dob,
    avatar: req.body.avatar,
    password: hashedPassword
  })
  await author.save()

  const token = jwt.sign({authorId: author._id}, "abc", {expiresIn: "1d"})
  res.json({token, author})

})

authorsRouter.post("/login", async (req, res)=> {
  const author = await AuthorModel.findOne({email: req.body.email})
  if(!author){
    return res.status(400).json("Wrong Email")
  }
  if(!bcrypt.compareSync(req.body.password, author.password)){
    return res.status(400).json("Wrong Password")
  }
  const token = jwt.sign({authorId: author._id}, "abc", {expiresIn: "1d"})
  res.json({token, author})

})


authorsRouter.put("/", (req, res) => {
  
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
  const index = authorsArray.findIndex(author => author.id === req.params.id)
  const oldAuthor = authorsArray[index]
  const updatedAuthor = {...oldAuthor, ...req.body, updatedAt: new Date()}
  authorsArray[index] = updatedAuthor

  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray))


  res.send(updatedAuthor)
})




authorsRouter.delete("/:id", (req, res) => {

  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));

  const remainingAuthorsArray = authorsArray.filter(author => author.id !== req.params.id)

  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthorsArray))

  
  res.status(204).send();
});



authorsRouter.post("/:id/uploadAvatar", upload.single("avatar"), (req, res)=> {
  const imgURL = `http://localhost:3001/public/${req.params.id}${ extname(req.file.originalname)}`
 
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
  const index = authorsArray.findIndex(author => author.id === req.params.id)
  const oldAuthor = authorsArray[index]
  const updatedAuthor = {...oldAuthor, avatar: imgURL}
  authorsArray[index] = updatedAuthor

  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray))

  res.send(updatedAuthor)
})






export default authorsRouter