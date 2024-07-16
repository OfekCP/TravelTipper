const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/LoginModel');
const TravelExperience=require('../models/TravelModel')
const generateToken = (userId) => {

  const payload = {
    userId: userId
  };


  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

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
  const userId = req.user.id; 
  
  try {
  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { bio } = req.body;
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
    
    user.profilePicture = req.file.path; 
    await user.save();
    
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const fs = require('fs');

const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    
    if (user.profilePicture) {
      
      fs.unlinkSync(user.profilePicture);
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
    if (updates.password) {
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
      const experience = await TravelExperience.findById(experienceId);
      
      if (!experience) {
          return res.status(404).json({ message: 'Travel experience not found' });
      }
    
      const creator = await User.findById(experience.createdBy);
      if (!creator) {
          experience.creator = {
              username: 'Unknown',
              profilePicture: 'default-profile-picture.jpg'
          };
      } else {
          
          experience.creator = {
              username: creator.username,
              profilePicture: creator.profilePicture ,
              id:creator._id
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
    const experience = await TravelExperience.findById(experienceId);
    
    if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
    }
    
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


const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; 
    const recipientId = req.params.recipientId; 
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    recipient.friendRequests.push(senderId);
    await recipient.save();

    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    
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


const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id; 
    const senderId = req.params.senderId; 
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!user || !sender) {
      return res.status(404).json({ message: 'User or sender not found' });
    }
    user.friends.push(senderId);
    await user.save();
    sender.friends.push(userId)
    await sender.save();
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
    const userId = req.user.id; 
    const senderId = req.params.senderId; 
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!user || !sender) {
      return res.status(404).json({ message: 'User or sender not found' });
    }
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
  
