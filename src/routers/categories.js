/* eslint-disable consistent-return */
const express = require('express');
const passport = require('passport');

const router = new express.Router();
const Category = require('../models/category');


// read all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('products');
    res.send(categories);
  } catch (e) {
    // old ver --- res.status(500).send('Something went wrong');
    return res.boom.badImplementation('Something went wrong');
  }
});

// create a new categories
router.post('/categories', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const category = new Category(req.body);
  try {
    await category.save();
    res.status(201).send(category);
  } catch (e) {
    // old ver --- res.status(400).send(e.message);
    return res.boom.badRequest(e.message);
  }
});

// delete category by id
router.delete('/categories/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      // old ver --- return res.status(404).send('category not found');
      return res.boom.notFound('category not found');
    }
    await category.remove();
    res.status(204).send();
  } catch (e) {
    // old ver --- res.status(404).send(e.message);
    return res.boom.notFound(e.message);
  }
});

// update category
router.patch('/categories/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id,
      req.body,
      { new: true });
    if (!category) {
      // old ver --- return res.status(404).send('category not found');
      return res.boom.notFound('category not found');
    }
    res.send(category);
  } catch (e) {
    // old ver --- res.status(404).send(e.message);
    return res.boom.notFound(e.message);
  }
});

// read category
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      // old ver --- return res.status(404).send('category not found');
      return res.boom.notFound('category not found');
    }
    res.send(category);
  } catch (e) {
    // old ver --- res.status(404).send(e.message);
    return res.boom.notFound(e.message);
  }
});
module.exports = router;
