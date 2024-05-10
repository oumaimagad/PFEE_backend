const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!user.roles.includes('admin')) {
      return res.status(403).send({ message: 'Require admin role' });
    }
    next();
  });
};

exports.isClient = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!user.roles.includes('client')) {
      return res.status(403).send({ message: 'Require client role' });
    }
    next();
  });
};