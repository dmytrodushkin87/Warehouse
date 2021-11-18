/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const sendToQueue = require('../RabbitMQ/sendDeleteAllProductsFromRemovedCategory');
const receiveFromQueue = require('../RabbitMQ/receiveDeleteAllProductsFromRemovedCategory');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

categorySchema.set('toJSON', { virtuals: true });

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

categorySchema.pre('remove', async function (next) {
  const category = this;
  sendToQueue(category._id);
  receiveFromQueue();
  next();
});


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
