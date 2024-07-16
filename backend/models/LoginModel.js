const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: {type:String,required:false},
  profilePicture: { type: String, default: '' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]

});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
