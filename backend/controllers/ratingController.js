const TravelExperience = require('../models/TravelModel');

exports.createRating = async (req, res) => {
    try {
      const experienceId = req.params.experienceId;
      const { value } = req.body;
      const userId = req.user.id;
  
      const experience = await TravelExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }
  
      // Check if the user has already rated the experience
      const existingRating = experience.ratings.find(rating => rating.user.toString() === userId);
      if (existingRating) {
        // Update the existing rating with the new value
        existingRating.value = value;
        await experience.save();
        return res.status(200).json({ message: 'Rating updated successfully' });
      }
  
      // If the user hasn't already rated the experience, create a new rating
      experience.ratings.push({ user: userId, value });
      await experience.save();
  
      res.status(201).json({ message: 'Rating created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

exports.getAllRatings = async (req, res) => {
  try {
    const experienceId = req.params.experienceId;
    const experience = await TravelExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Travel experience not found' });
    }

    const ratings = experience.ratings;
    res.status(200).json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const experienceId = req.params.experienceId;
    const experience = await TravelExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Travel experience not found' });
    }

    const ratings = experience.ratings;
    if (ratings.length === 0) {
      return res.status(200).json({ averageRating: 0 });
    }

    const totalRating = ratings.reduce((acc, curr) => acc + curr.value, 0);
    const averageRating = totalRating / ratings.length;

    res.status(200).json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.removeRating = async (req, res) => {
    try {
      const userId = req.session.user.id;
      const experienceId = req.params.experienceId;
  
      // Find the experience
      const experience = await TravelExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }
  
      // Check if the user has already rated the experience
      const ratingIndex = experience.ratings.findIndex(rating => rating.user.toString() === userId);
      if (ratingIndex === -1) {
        return res.status(404).json({ message: 'User has not rated this experience' });
      }
  
      // Remove the user's rating
      experience.ratings.splice(ratingIndex, 1);
  
      // Save the updated experience document
      await experience.save();
  
      res.status(200).json({ message: 'Rating removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  