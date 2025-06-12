import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute =async(req, res, next)=>{
  try{
    // Get JWT from cookies
    const token = req.cookies.jwt
    // If token not provided, return Unauthorized response
    if(!token){
      return res.status(401).json({ message: 'Unauthorized - No Token Provided' })
    }
    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User no longer exists" });
    }
    // Attach user ID to request object for downstream access
    req.user = user;
    next();

  } catch(error){
    console.log(error.message)
    return res.status(500).json({ message: 'Not authorized, token failed'});
  }
};