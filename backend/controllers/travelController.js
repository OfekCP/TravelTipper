const TravelExperience = require('../models/TravelModel');
const multer = require('multer');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});


const upload = multer({ storage: storage }).array('photos'); 

exports.createExperience = async (req, res) => {
  try {
    upload(req, res, async function (err) {

      if (err instanceof multer.MulterError) {
       
        console.error(err);
        return res.status(500).json({ message: 'File upload error' });
      } else if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Unknown error occurred' });
      }
      
      try {
        const userId = req.user.id;
        const { location,city, startDate, endDate, writtenAccount } = req.body;

        if (!startDate || !endDate) {
          return res.status(400).json({ message: 'Both start date and end date are required' });
        }

        const photos = req.files.map(file => ({ imageUrl: file.path }));

        const newExperience = new TravelExperience({
          userId,
          location,
          city,
          startDate,
          endDate,
          photos,
          writtenAccount,
          createdBy: userId
        });

        await newExperience.save();
        res.status(201).json({ message: 'Travel experience created successfully', newExperience });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

     
exports.viewAllExperiences = async (req, res) => {
  try {
    const userId = req.user.id;
    const userExperiences = await TravelExperience.find({createdBy: userId});
    console.log("user", userExperiences);
    res.status(200).json(userExperiences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.viewAllCreatorExperiences = async (req, res) => {
  try {
    const userId = req.params.id;
    const userExperiences = await TravelExperience.find({createdBy: userId});
    console.log("user", userExperiences);
    res.status(200).json(userExperiences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.viewSingleExperience = async (req, res) => {
    try {
      const experienceId = req.params.id;
      const experience = await TravelExperience.findById(experienceId);
  
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }

      res.status(200).json(experience);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
exports.updateExperience = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error(err);
        return res.status(500).json({ message: 'File upload error' });
      } else if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Unknown error occurred' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files were uploaded' });
      }
      
   
      const experienceId = req.params.id;
      const { location, startDate, endDate, writtenAccount } = req.body;
      const photos = req.files.map(file => ({ imageUrl: file.path }));

     
      const experience = await TravelExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }
      
    
      experience.location = location;
      experience.startDate = startDate;
      experience.endDate = endDate;
      experience.writtenAccount = writtenAccount;
      experience.photos = photos;

     
      await experience.save();
      
      res.status(200).json({ message: 'Travel experience updated successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteExperience = async (req, res) => {
    try {
      const experienceId = req.params.id;
  
      const experience = await TravelExperience.findById(experienceId);
  
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }
      await experience.deleteOne();

      res.status(200).json({ message: 'Travel experience deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  exports.getAllExperiences = async (req, res) => {
    try {
      const allExperiences = await TravelExperience.find();
      res.status(200).json(allExperiences);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  exports.searchExperiences = async (req, res) => {
    try {
        const { location, startDate, endDate, keyword } = req.query;
        const filter = {};
        if (location) {
            filter.location = { $regex: new RegExp(location, 'i') };
        }
        if (startDate && endDate) {
            filter['tripDates.startDate'] = { $gte: new Date(startDate) };
            filter['tripDates.endDate'] = { $lte: new Date(endDate) };
        }
        if (keyword) {
            filter.writtenAccount = { $regex: new RegExp(keyword, 'i') };
        }
        const searchResults = await TravelExperience.find(filter);

        res.status(200).json(searchResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.addComment = async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.session.user.id; 
  
      const newComment = { content, user: userId };
      const experienceId = req.params.experienceId;
  
      const experience = await TravelExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({ message: 'Travel experience not found' });
      }
  
      experience.comments.push(newComment);
      await experience.save();
  
      res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


