/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { expect } = require('chai');
const User = require('../models/user');
require('../db/mongodb');
const app = require('../app.js');
const { testData, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase);
describe('Tests for user routers', () => {
  it('Should signup a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: testData.newTestUser.name,
        email: testData.newTestUser.email,
        password: testData.newTestUser.password,
      })
      .expect(201);
    const user = await User.findById(response.body.user._id);
    expect(user).not.to.be.null;
    expect(response.body.user.name).to.equal(testData.newTestUser.name);
    expect(response.body.token).to.exist;
  });

  it('Should do not permission to signup a new user because there is no pass', async () => {
    await request(app)
      .post('/users')
      .send({
        name: testData.newTestUser.name,
        email: testData.newTestUser.email,
      })
      .expect(400);
  });

  it('Should do not permission to signup a new user because pass less then 6 character', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: testData.newTestUser.name,
        email: testData.newTestUser.email,
        password: testData.shortPassword,
      })
      .expect(400);
    expect(response.text).to.equal('{"statusCode":400,"error":"Bad Request","message":"Password less than 6 character"}');
  });

  it('Should do not login my user profile because of a bad pass', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.newTestUser.password,
      })
      .expect(302);
    await request(app)
      .get(response.header.location)
      .send()
      .expect(401);
  });

  it('Should login my user profile', async () => {
    await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
  });

  it('Should fetched my user profile', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .expect(200);
    expect(response.body.name).to.equal(testData.testUser.name);
  });

  it('Should delete my user profile', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .expect(204);
    const userOneFromDB = await User.findById(testData.testUser.id);
    expect(response.body.name).to.be.undefined;
    expect(userOneFromDB).to.be.null;
  });

  it('Should update email of my user profile', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .send({
        email: testData.newTestUser.email,
      })
      .expect(200);
    const userOneFromDB = await User.findById(testData.testUser.id);
    expect(userOneFromDB.email).to.equal(testData.newTestUser.email);
    expect(userOneFromDB.email).to.equal(response.body.email);
  });

  it('Should do not update my user profile because of Invalid fields for updates!', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .send({
        age: 18,
      })
      .expect(400);
    expect(response.body.error).to.equal('Bad Request');
  });

  it('Should do not update my user profile because pass less then 6 character', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .send({
        password: testData.shortPassword,
      })
      .expect(400);
    expect(response.text).to.equal('{"statusCode":400,"error":"Bad Request","message":"Password less than 6 character"}');
  });

  it('Should update all fields of my user profile', async () => {
    // logging user for taking a token
    const responseLogin = await request(app)
      .post('/users/login')
      .send({
        email: testData.testUser.email,
        password: testData.testUser.password,
      })
      .expect(200);
    await request(app)
      .patch('/users/me')
      .set('Authorization', `bearer ${responseLogin.body.token}`)
      .send({
        email: testData.newTestUser.email,
        name: testData.newTestUser.name,
        password: testData.newTestUser.password,
      })
      .expect(200);
    const userOneFromDB = await User.findById(testData.testUser.id);
    expect(userOneFromDB.email).to.equal(testData.newTestUser.email);
    expect(userOneFromDB.name).to.equal(testData.newTestUser.name);
    const match = await bcrypt.compare(testData.newTestUser.password, userOneFromDB.password);
    expect(match).to.equal(true);
  });
});
