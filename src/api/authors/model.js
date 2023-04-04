import { Schema, model } from "mongoose";

const AuthorSchema = new Schema({
  name: String,
  surname: String,
  email: String,
  dob: String,
  avatar: String,
  password: String
}, {
  timestamps: true
});


AuthorSchema.pre("save", async function () {

  const newUserData = this
  if (newUserData.isModified("password")) {
    const plainPW = newUserData.password

    const hash = await bcrypt.hash(plainPW, 11)
    newUserData.password = hash
  }
})
AuthorSchema.methods.toJSON = function () {
  const currentUserDocument = this
  const currentUser = currentUserDocument.toObject()
  delete currentUser.password
  delete currentUser.createdAt
  delete currentUser.updatedAt
  delete currentUser.__v
  return currentUser
}

AuthorSchema.static("checkCredentials", async function (email, plainPW) {
  const user = await this.findOne({ email })

  if (user) {
  
    const passwordMatch = await bcrypt.compare(plainPW, user.password)

    if (passwordMatch) {
   
      return user
    } else {
    
      return null
    }
  } else {
  
    return null
  }
})
const AuthorModel = model("Author", AuthorSchema)

export default AuthorModel
