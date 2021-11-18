#!/usr/bin/env node
/* eslint-disable no-console */


const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const Product = require('../models/product');

const recive = () => amqp.connect('amqp://localhost', (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    const queue = 'ID_queue';

    channel.assertQueue(queue, {
      durable: true,
    });
    channel.prefetch(1);
    channel.consume(queue, async (msg) => {
      const receivedId = msg.content.toString();
      console.log('[x] ReceivedId', receivedId);
      const objectidFromRecievedString = new mongoose.Types.ObjectId(receivedId);
      const product = await Product.deleteMany({ category: objectidFromRecievedString });
      console.log('product ', product);
      channel.ack(msg);
    }, {
      noAck: false,
    });
  });
});

module.exports = recive;
