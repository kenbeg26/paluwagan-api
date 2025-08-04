//Dependency
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Name is Required']
  },
  codename: {
    type: String,
    required: [true, 'Codename is Required']
  },
  password: {
    type: String,
    required: [true, 'Password is Required']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});


module.exports = mongoose.model('User', userSchema);
