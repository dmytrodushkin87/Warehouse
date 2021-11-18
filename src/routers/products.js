/* eslint-disable consistent-return */
const express = require('express');

const router = new express.Router();
const passport = require('passport');
const Category = require('../models/category');
const Product = require('../models/product');

// create a new product
router.post('/products', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    // old ver --- res.status(404).send('Category not found!');
    res.boom.notFound('product not found!');
  } else {
    try {
      let product = new Product(req.body);
      await product.save();
      product = await product.populate('category').execPopulate();
      res.send(product);
    } catch (e) {
      // old ver --- res.status(400).send(e.message);
      return res.boom.badRequest(e.message);
    }
  }
});

// read all products from all categories
router.get('/products', async (req, res) => {
  try {
    if (req.query.category) {
      const products = await Product.find({ category: req.query.category }).populate('category');
      res.send(products);
    } else {
      const products = await Product.find().populate('category');
      res.send(products);
    }
  } catch (e) {
    // old ver --- res.status(400).send(e.message);
    return res.boom.badRequest(e.message);
  }
});

// delete product
router.delete('/products/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      // old ver --- return res.status(404).send('product not found');
      return res.boom.notFound('product not found!');
    }
    res.status(204).send();
  } catch (e) {
    // old ver --- res.status(404).send(e.message);
    res.boom.notFound(e.message);
  }
});

// update product
router.patch('/products/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let product = await Product
      .findOneAndUpdate({ _id: req.params.id },
        req.body,
        { new: true });
    if (!product) {
      // old ver --- return res.status(404).send('product not found');
      return res.boom.notFound('product not found!');
    }
    product = await product.populate('category').execPopulate();
    res.send(product);
  } catch (e) {
    // old ver --- res.status(404).send(e.message);
    res.boom.notFound(e.message);
  }
});

// read product
router.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) {
    // old ver --- return res.status(404).send('product not found');
    return res.boom.notFound('product not found!');
  }
  res.send(product);
});

module.exports = router;
