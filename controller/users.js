var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var User = require('../models/user');
var verifyToken = require('../auth/verifyToken');

// Create User
router.post('/signup', (req, res, next) => {
  const data =  {
    email: req.body.email,
    password: req.body.password
  }

  User.create(data, (err, user) => {
    if (err) return res.status(500).send("There was a problem registering the user.")
    // create a token
    var token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).send({ auth: true, message: user, token: token });
  
})
});

// get All Users
router.get('/all', (req, res, next) => {
  User.find({}, (error, user) => {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
      res.status(200).send({message: user,decoded});
    });
})
});

// get one User
router.get('/profile', verifyToken, function(req, res, next) {
  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    
    res.status(200).send(user);
  });
});

// login user
router.post('/login', function(req, res) {

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    // create token
    var token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: 86400 // expires in 24 hours
    });
    
    res.status(200).send({ message: user, auth: true, token: token });
  });
  
});

module.exports = router;
