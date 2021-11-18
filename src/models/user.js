const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,

  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
});

// create token write to database and return it
// eslint-disable-next-line func-names
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '1h', // expires in 1 hour
  });
  return token;
};

// public fields of user
// eslint-disable-next-line func-names
userSchema.methods.publicFields = async function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

// hash the plain password before saving
// eslint-disable-next-line func-names
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
