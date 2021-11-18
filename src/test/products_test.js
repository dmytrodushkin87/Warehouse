/* eslint-disable no-unused-expressions */
const request = require('supertest');
const { expect } = require('chai');
require('../db/mongodb');
const app = require('../app.js');
const Product = require('../models/product');
const { testData, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase);
describe('Tests for product routers', () => {
  it('Should fetched all product from db', async () => {
    const response = await request(app)
      .get('/products')
      .expect(200);
    expect(response.body[0].name).to.equal(testData.testProduct.name);
  });

  it('Should fetched one product from db by ID', async () => {
    const response = await request(app)
      .get(`/products/${testData.testProduct.id}`)
      .expect(200);
    expect(response.body.name).to.equal(testData.testProduct.name);
  });

  it('Should delete beer product', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .delete(`/products/${testData.testProduct.id}`)
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .expect(204);
    expect(response.body.name).to.be.undefined;
    const productOneFromDB = await Product.findById(testData.testProduct.id);
    expect(productOneFromDB).to.be.null;
  });

  it('Should create water product', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .post('/products')
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .send({
        name: testData.newTestProduct.name,
        description: testData.newTestProduct.description,
        category: testData.testCategory.id,
        amount: testData.newTestProduct.amount,
        price: testData.newTestProduct.price,
      })
      .expect(200);
    expect(response.body.name).to.equal(testData.newTestProduct.name);
    const allProductOneFromDB = await Product.find();
    expect(allProductOneFromDB.length).to.equal(2);
  });


  it('Should update beer product to water product', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .patch(`/products/${testData.testProduct.id}`)
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .send({
        name: testData.newTestProduct.name,
        description: testData.newTestProduct.description,
        amount: testData.newTestProduct.amount,
        price: testData.newTestProduct.price,
      })
      .expect(200);
    expect(response.body.name).to.equal(testData.newTestProduct.name);
    const productromDB = await Product.findById(testData.testProduct.id);
    expect(productromDB.name).to.equal(testData.newTestProduct.name);
  });
});
