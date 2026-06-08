const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

// Use the URL from .env or fallback to local
const redis = new Redis(process.env.REDIS_URL, {
  // This tells ioredis to use TLS/SSL (mandatory for Upstash/Cloud Redis)
  tls: {
    rejectUnauthorized: false // Allows the cloud certificate to be accepted
  }
});

redis.on('connect', () => {
  console.log('✅ REDIS: Connected for Seat Locking');
});

redis.on('error', (err) => {
  console.error('❌ REDIS ERROR:', err.message);
});

module.exports = redis;