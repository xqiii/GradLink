module.exports = {
  server: {
    port: 5001,
    host: 'localhost'
  },
  database: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/link-map-dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  jwt: {
    secret: 'your_jwt_secret_key_development',
    expiresIn: '24h'
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173']
  }
};