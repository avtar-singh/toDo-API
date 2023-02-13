const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        required: true,
        type: String,
      },
      token: {
        required: true,
        type: String,
      }
    }
  ]
});

UserSchema.methods.toJSON = function () {
  var user = this;

  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({id: user._id.toHexString(), access}, process.env.SECRET_KEY).toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });

};

var User = mongoose.model('User', UserSchema);

module.exports = {User}
