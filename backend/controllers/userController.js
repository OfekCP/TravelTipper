// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/LoginModel');
const TravelExperience=require('../models/TravelModel')
const generateToken = (userId) => {
  // Create a payload containing the user ID
  const payload = {
    userId: userId
  };

  // Sign the payload with your secret key and set the expiration time
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }); // Change the expiration time as needed

  return token;
};
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ username, email, password });
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id)
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ message: 'Login successful',userid:user._id,token:token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createOrUpdateBio = async (req, res) => {
  const userId = req.user.id; // Assuming user id is extracted from the request
  
  try {
    // Find the user by id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract bio from request body
    const { bio } = req.body;

    // Update user bio
    user.bio = bio;
    await user.save();

    res.status(200).json({ message: 'User bio updated successfully', bio: user.bio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const logout = (req, res) => {
    try {
      // Clear the authentication token cookie
      res.clearCookie('token');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  const getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  const getUserById = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  const getFriendById = async (req, res) => {
    try {
      const userId = req.params.friendId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

const uploadProfilePicture = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    user.profilePicture = req.file.path; // Save the path to the profile picture
    await user.save();
    
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// userController.js
const fs = require('fs');

const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if user has a profile picture
    if (user.profilePicture) {
      // Remove the profile picture file from the server
      fs.unlinkSync(user.profilePicture);
      // Update the user's profile picture field in the database to null
      user.profilePicture = null;
      await user.save();
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const updateUserById = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Check if the updates contain a password field
    if (updates.password) {
      // Hash the password before updating the user
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      updates.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const getExperienceById = async (req, res) => {
  try {
      const experienceId = req.params.id;
      // Fetch the experience data
      const experience = await TravelExperience.findById(experienceId);
      
      if (!experience) {
          return res.status(404).json({ message: 'Travel experience not found' });
      }
      
      // Fetch the creator's information using the createdBy field
      const creator = await User.findById(experience.createdBy);
      if (!creator) {
          // If creator is not found, set default values or handle as needed
          experience.creator = {
              username: 'Unknown',
              profilePicture: 'default-profile-picture.jpg'
          };
      } else {
          // If creator is found, include the creator's information
          experience.creator = {
              username: creator.username,
              profilePicture: creator.profilePicture ,
              id:creator._id// Assuming you have a profilePicture field in your User model
          };
      }

      res.status(200).json(experience.creator);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

const creatorProfile=async(req,res)=>{
  try {
    const experienceId = req.params.id;
    // Fetch the experience data
    const experience = await TravelExperience.findById(experienceId);
    
    if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
    }
    
    // Fetch the creator's information using the createdBy field
    const creator = await User.findById(experience.createdBy);
    if (!creator) {
      return res.status(404).json({ message: 'user not found' });
    }
    res.status(200).json(creator);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}
};
  // userController.js

// Send Friend Request
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; // ID of the user sending the request
    const recipientId = req.params.recipientId; // ID of the recipient user

    // Check if the recipient user exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Add senderId to recipient's friend requests array
    recipient.friendRequests.push(senderId);
    await recipient.save();

    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get All Friend Requests
const getAllFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id; // ID of the user

    // Fetch the user's friend requests
    const user = await User.findById(userId).populate('friendRequests');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friendRequests = user.friendRequests;
    res.status(200).json(friendRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Accept Friend Request
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id; // ID of the user
    const senderId = req.params.senderId; // ID of the sender user

    // Find the user and the sender in the database
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!user || !sender) {
      return res.status(404).json({ message: 'User or sender not found' });
    }

    // Add senderId to user's friends array
    user.friends.push(senderId);
    await user.save();
    sender.friends.push(userId)
    await sender.save();

    // Remove senderId from user's friend requests array
    user.friendRequests.pull(senderId);
    await user.save();

    res.status(200).json({ message: 'Friend request accepted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const declineFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id; // ID of the user
    const senderId = req.params.senderId; // ID of the sender user

    // Find the user and the sender in the database
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!user || !sender) {
      return res.status(404).json({ message: 'User or sender not found' });
    }

    // Remove senderId from user's friend requests array
    user.friendRequests.pull(senderId);
    await user.save();

    res.status(200).json({ message: 'Friend request declined successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const removeFriend=async(req,res)=>{
  try{
  const userId=req.user.id
  const friendId=req.params.friendId
  const user=await User.findById(userId)
  const friend=await User.findById(friendId)
  if(!user){
    res.status(401).json({message:"user not found"})
  }
  user.friends.pull(friendId)
  user.save()
  friend.friends.pull(userId)
  friend.save()
res.status(200).json({message:"friend removed successfully"})
}catch(error){
  console.log(error)
  res.status(500).json({message:"internal server error"})
}

}

  module.exports = {removeFriend,getFriendById,createOrUpdateBio, declineFriendRequest,sendFriendRequest, getAllFriendRequests, acceptFriendRequest,creatorProfile,getExperienceById, register, login, logout, getAllUsers, getUserById,uploadProfilePicture,deleteProfilePicture,updateUserById };
  
