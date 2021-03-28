const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../model/user');
const signToken = require('../middleware/signToken');
const verify = require('./verifyToken');
const verifyAdmin = require('./verifyAdminToken');
const verifyUser = require('./verifyUserToken');

router.post('/register', async (req, res) => {
  // Check if request body contains all required fields
  if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password || !req.body.role || !req.body.phone) {
    return res.status(400).json({error: true, message: 'One or more required field missing' });
  }
  // Check if user already exists in the database
  const emailExist = await userModel.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json({error: true, message: 'Email already exists'});

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new user
  const user = new userModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
    phone: req.body.phone,
    address: req.body.address || '',
    postcode: req.body.postcode || '',
    city: req.body.city || '',
    state: req.body.state || '',
    country: req.body.country || ''
  });
  try {
    const savedUser = await user.save();
    res.status(200).json({ data: user._id, error: false });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', (req, res) => {
  // Check if request body contains all required fields
  if (!req.body.email || !req.body.password || !req.body.role) {
    return res.status(400).json({error: true, message: 'One or more required field missing' });
  }

  //Check if email already exists in the database
  userModel.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.status(400).json({error: true, message: "Email doesn't exists"});
    }

    if (user.role !== req.body.role) {
      return res.status(400).json({error: true, message: "Invalid access"});
    }

    console.dir(user._id);

    // Check if password is valid
    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if (isMatch) {
        console.log('Password matched');

        signToken({ _id: user._id, role: req.body.role })
          .then(({token}) => {
            const {firstName, lastName, email, phone, address, city, state, postcode, country} = user;
            profile = {firstName, lastName, email, phone, address, city, state, postcode, country}
            res.status(200).json({data: {token, role: req.body.role, profile}, error: false});
          })
          .catch(error => {
            console.log(error);
            return res.status(500).json({ error: true, message: 'Error signing token'});
          });
      } else {
        console.log('Password mismatch');
        return res.status(400).json({error: true, message: 'Invalid password'});
      }
    });
  });
});

router.post('/change-password', verify, async(req, res) => {
  // Check if request body contains all required fields
  if (!req.body.email || !req.body.password || !req.body.newPassword || !req.body.role) {
    return res.status(400).json({error: true, message: 'One or more required field missing' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

  // Check if email already exists in the database
  userModel.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.status(400).json({error: true, message: "Email doesn't exists"});
    }

    if (user.role !== req.body.role) {
      return res.status(400).json({error: true, message: "Invalid access"});
    }

    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if (isMatch) {
        userModel.findOneAndUpdate({email: req.body.email}, {password: hashedPassword}, {upsert: false}).then(() => {
          res.status(200).json({data: null, error: false, message: 'Password changed successfully'});
        }).catch((err) => {
          console.log(err);
          res.status(400).json({error: true, message: 'Error while updating password'});
        });
      } else {
        res.status(400).json({error: true, message: 'Error while updating password'});
      }
    });
  });
});

router.get('/', verifyAdmin, (req, res) => {
  userModel.find({role: 'USER'}).then((record) => {
    res.status(200).json({data: record, error: false});
  }).catch((err) => {
      console.log(err);
      res.status(400).json({error: true, message: 'Error while fetching user'});
  });
});

router.put('/update-profile', verifyUser, (req, res) => {

  if (!req.body.email) {
      res.status(400).json({error: true, message: 'One or more required field missing' });
      return;
  }

  userModel.findOneAndUpdate({email: req.body.email}, req.body, {upsert: false}).then((record) => {
      res.status(200).json({error: false, message: 'Profile Updated'});
  }).catch((err) => {
      console.log(err);
      res.status(400).json({error: true, message: 'Error while updating profile'});
  });
});

module.exports = router;
