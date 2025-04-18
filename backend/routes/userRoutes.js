const express = require("express");

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  googleAuth,
  verifyEmail,
  followUser,
  changeSavedLikedBlog
} = require("../controllers/userController");
const verifyUser = require("../middlewares/auth");
const upload = require("../utils/multer");

const route = express.Router();

route.post("/signup", createUser);
route.post("/signin", login);

route.get("/users", getAllUsers);

route.get("/users/:username", getUserById);

route.patch("/users/:id", verifyUser, upload.single("profilePic"), updateUser);

route.delete("/users/:id", verifyUser, deleteUser);

// verify email/token

route.get("/verify-email/:verificationToken", verifyEmail);

//google auth route
route.post("/google-auth", googleAuth);

// follow /unfollow
route.patch("/follow/:id", verifyUser, followUser);
// Add an alias for the new frontend route
route.patch("/users/follow/:id", verifyUser, followUser);

route.patch("/change-saved-liked-blog-visibility" , verifyUser , changeSavedLikedBlog)

// Fix verification status manually
route.get("/fix-verification/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Attempting to fix verification for email:", email);
    
    // Find the user by email
    const user = await require('../models/userSchema')
      .findOne({ email });
    
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    console.log("User found, current isVerify:", user.isVerify, "ID:", user._id);
    
    // Try direct update with updateOne
    const result = await require('../models/userSchema')
      .updateOne({ _id: user._id }, { isVerify: true });
    
    console.log("Update result:", result);
    
    // Verify the update worked
    const updatedUser = await require('../models/userSchema')
      .findOne({ email });
    
    console.log("After update - isVerify:", updatedUser.isVerify);
    
    return res.status(200).json({
      success: true,
      message: "Verification status updated",
      before: user.isVerify,
      after: updatedUser.isVerify
    });
  } catch (error) {
    console.error("Fix verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fixing verification",
      error: error.message
    });
  }
});

module.exports = route;
