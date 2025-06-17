import { generateToken, statusHandler, isValidEmail, validatePasswordStrength } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import cloudinary from "../lib/cloudinary.js";



export const signup = async(req, res)=>{
  const { fullName, email, password } = req.body
  try{
    //Check if all fields are filled
    if(!fullName || !email || !password){
      return statusHandler(res, 400, 'Please fill all fields');
    }

    if(!isValidEmail(email)){
      return statusHandler(res, 400, 'Invalid Email Format');
    }

    if(!validatePasswordStrength(password)){
      return statusHandler(res, 400,
        'Password must be atleast 6 characters and include a mix of letters and numbers');
    }

    const user = await User.findOne({ email });

    if(user){
      return statusHandler(res, 400, 'User Already Exist');
    }
    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword
    });

    generateToken(newUser._id, res);

    const handleData = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic
    }

    statusHandler(res, 201, 'User Added', handleData);

  } catch(error){
    console.log('Error in signup controller', error.message);
    statusHandler(res, 500, "Internal Server Error");
  }
};

export const login = async(req, res)=>{
  const { email, password } = req.body;

  try{
    const user = await User.findOne({ email });

    if(!user || !(await bcrypt.compare(password, user.password))){
      return statusHandler(res, 401, 'Invalid Credentials');
    }

    generateToken(user._id, res);

     const handleData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
     };
 
     statusHandler(res, 200, 'User Logged In', handleData);

  } catch(error){
    console.log("Error in login controller", error.message);
    return statusHandler(res, 500, 'Internal Server Error');
  }
};

export const logout = async(req, res)=>{
  res.cookie('jwt', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });

  statusHandler(res, 200, 'Logged out successfully');
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, email } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    statusHandler(res, 200, 'Update Successfully', updatedUser);
  } catch (error) {
    console.log(error);
    statusHandler(res, 500, 'Internal Server Error');
  }
};

export const checkAuth = (req, res) => {
  try {
    statusHandler(res, 200, 'Successfully authenticated', req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    statusHandler(res, 200, 'Internal Server Error');
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    statusHandler(res, 200, 'Account deleted successfully');
  } catch (error) {
    console.log('Error deleting account:', error.message);
    statusHandler(res, 500, 'Internal Server Error');
  }
};

