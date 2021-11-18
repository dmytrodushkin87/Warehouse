const request = require('supertest');
const app = require('../app.js');

describe('Tests for home page', () => {
  it('Should get response status 200 from home page', async () => {
    await request(app)
      .get('/')
      .expect(200);
  });
});
