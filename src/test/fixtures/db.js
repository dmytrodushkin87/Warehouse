const mongoose = require('mongoose');
const User = require('../../models/user');
const Category = require('../../models/category');
const Product = require('../../models/product');

const testData = {
  testUser: {
    id: new mongoose.Types.ObjectId(),
    name: 'userOne',
    email: 'userOne@gmail.com',
    password: 'userOne123',
  },
  newTestUser: {
    name: 'userTwo',
    email: 'userTwo123',
    password: 'userTwo@gmail.com',
  },
  shortPassword: 'short',
  testCategory: {
    id: new mongoose.Types.ObjectId(),
    name: 'drink',
    description: 'water and other to drink',
  },
  newTestCategory: {
    name: 'eat',
    description: 'meal and other',
  },
  testProduct: {
    id: new mongoose.Types.ObjectId(),
    name: 'beer',
    description: 'alcohol drink',
    amount: 10,
    price: 35,
  },
  newTestProduct: {
    name: 'water',
    description: 'non alcohol drink',
    amount: 1000,
    price: 1,
  },
};

const setupDatabase = async () => {
  const userOne = new User({
    _id: testData.testUser.id,
    name: testData.testUser.name,
    email: testData.testUser.email,
    password: testData.testUser.password,
  });
  const drinkCategory = new Category({
    _id: testData.testCategory.id,
    name: testData.testCategory.name,
    description: testData.testCategory.description,
  });
  const beerProduct = new Product({
    _id: testData.testProduct.id,
    name: testData.testProduct.name,
    description: testData.testProduct.description,
    category: testData.testCategory.id,
    amount: testData.testProduct.amount,
    price: testData.testProduct.price,
  });

  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await beerProduct.save();
  await userOne.save();
  await drinkCategory.save();
};

module.exports = { testData, setupDatabase };
