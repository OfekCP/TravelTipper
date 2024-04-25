const TravelExperience = require('../models/TravelModel');
const User=require('../models/LoginModel')
exports.createComment = async (req, res) => {
  try {
    const experienceId = req.params.experienceId;
    const { content } = req.body;
    const userId = req.user.id;
    const user=await User.findById(userId)
    const newComment = {
      content,
      user:userId,
      username: user.username,
      createdAt: new Date()
    };
    
    const experience = await TravelExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Travel experience not found' });
    }

    experience.comments.push(newComment);
    await experience.save();

    res.status(201).json({ message: 'Comment created successfully', comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const experienceId = req.params.experienceId;
    const experience = await TravelExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Travel experience not found' });
    }
    const comments = experience.comments;
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const experienceId = req.params.experienceId;
    const commentId = req.params.commentId;
    const experience = await TravelExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Travel experience not found' });
    }
    const comment = experience.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateComment = async (req, res) => {
    try {
      const experienceId = req.params.experienceId;
      const commentId = req.params.commentId;
      const { content } = req.body;
  
      const experience = await TravelExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }
      const comment = experience.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      comment.content = content;
      await experience.save();
  
      res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  exports.deleteComment = async (req, res) => {
    try {
      const experienceId = req.params.experienceId;
      const commentId = req.params.commentId;
  
      const experience = await TravelExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }
  
      // Find the comment by its ID
      const comment = experience.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      // Remove the comment from the array
      experience.comments.pull(comment);
  
      // Save the updated experience document
      await experience.save();
  
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
