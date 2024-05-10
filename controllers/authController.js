const User = require('../models/userModel');
const Role = require('../models/roleModel');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

exports.signup = async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  user.roles = await Role.find({ name: { $in: req.body.roles } });

  try {
    await user.save();
    res.send({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  const passwordIsValid = user.comparePassword(req.body.password);

  if (!passwordIsValid) {
    return res.status(401).send({ message: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id }, authConfig.secret, {
    expiresIn: 86400 // 24 hours
  });

  res.status(200).send({ accessToken: token });
};

exports.signout = async (req, res) => {
  res.status(200).send({ message: 'User signed out successfully' });
};