const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' }
});

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  username:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const travelExperienceSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    },
  endDate: {
    type: Date,
    required: true,
    },
  photos: [imageSchema], 
  writtenAccount: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  comments: [commentSchema],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TravelExperience = mongoose.model("TravelExperience", travelExperienceSchema);

module.exports = TravelExperience;
