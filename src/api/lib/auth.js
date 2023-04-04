import jwt from "jsonwebtoken"


const authMiddleware = (req, res, next) => {
  const token = req.get("Authorization")
  try{

   const data = jwt.verify(token, "abc")
   req.authorId = data.authorId
   next()
  } catch(error){
    res.status(401).json("Authorization failed")
  }
}

export default authMiddleware