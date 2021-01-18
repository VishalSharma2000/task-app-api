const express = require('express');
const router = express.Router();
const User = require('./../../models/User');

router.post('/signup', async (req, res) => {
  const user = new User(req.body);

  try {
    // we should create the token after the user data is saved bcoz 
    // first we should check that all the user data are valid or not...if yes then generate the token
    await user.save();
    const token = user.generateAuthToken();
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
});

router.post('/login', async (req, res) => {
  try {
    // Creating a own function in Model file
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.json({ user, token })
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;