import jwt from "jsonwebtoken"


export const createAccessToken = payload =>{

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" })
  return token

}
 
   // Input: payload, Output: Promise which resolves into the token