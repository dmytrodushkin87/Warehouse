/* eslint-disable consistent-return */
const express = require('express');

const router = new express.Router();
const passport = require('passport');
const User = require('../models/user');

// register page
router.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  // check required fields
  if (!name || !email || !password) {
    // old ver --- return res.sendStatus(400);
    return res.boom.badRequest('Required fields');
  }
  // check password length
  if (password.length < 6) {
    // old ver --- return res.status(400).send('password less than 6 character');
    return res.boom.badRequest('Password less than 6 character');
  }
  try {
    // create a new user
    let user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    user = await user.publicFields();
    res.status(201).send({ user, token });
  } catch (e) {
    // old ver --- res.status(400).send(e.message);
    return res.boom.badRequest(e.message);
  }
});

// error logging handle
router.get('/users/login/error', (req, res) => {
  // old ver --- res.status(401).send('error logging');
  res.boom.unauthorized('Error logging');
});

// login handle
router.post('/users/login',
  passport.authenticate('local', {
    failureRedirect: '/users/login/error',
  }),
  async (req, res) => {
    const { user } = req;
    const token = await user.generateAuthToken();
    const welcomeMassage = `Welcome ${user.name}!!`;
    res.send({ welcomeMassage, token });
  });

// login google handle
router.get('/users/login/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'openid',
    ],
  }));

// callback route for google
router.get('/users/login/google/redirect', passport.authenticate('google'), async (req, res) => {
  const { user } = req;
  const token = await user.generateAuthToken();
  const welcomeMassage = `Welcome ${user.name}!!`;
  res.send({ welcomeMassage, token });
});

// get my profile
router.get('/users/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const publicUser = await req.user.publicFields();
    res.send(publicUser);
  } catch (e) {
    return res.boom.badImplementation();
  }
});

// update my profile
router.patch('/users/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    // old ver --- return res.status(400).send({ error: 'Invalid filds for updates!' });
    return res.boom.badRequest('Invalid filds for updates!');
  }
  if (req.body.password && req.body.password.length < 6) {
    // old ver --- return res.status(400).send('password less than 6 character');
    return res.boom.badRequest('Password less than 6 character');
  }
  try {
    // eslint-disable-next-line no-underscore-dangle
    let user = await User.findById(req.user._id);
    if (!user) {
      // old ver --- return res.status(404).send('user not found');
      return res.boom.notFound('user not found');
    }
    Object.assign(user, req.body);
    await user.save();
    user = await user.publicFields();
    res.send(user);
  } catch (e) {
    // old ver --- res.status(404).send(e.message);
    return res.boom.notFound(e.message);
  }
});

// delete my profile
router.delete('/users/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await req.user.remove();
    res.status(204).send();
  } catch (e) {
    // old ver --- res.status(500).send(e.message);
    return res.boom.badImplementation(e.message);
  }
});

module.exports = router;
