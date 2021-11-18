/* eslint-disable no-console */
const amqp = require('amqplib/callback_api');

const send = (categoryId) => amqp.connect('amqp://localhost', (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    const queue = 'ID_queue';
    const msg = categoryId.toString();
    channel.assertQueue(queue, {
      durable: true,
    });
    channel.sendToQueue(queue, Buffer.from(msg), {
      persistent: true,
    });
    console.log('[x] SentId ', msg);
  });
  setTimeout(() => {
    connection.close();
  }, 500);
});
module.exports = send;
