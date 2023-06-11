const mongoose = require('mongoose');
const fs = require('fs');
const {
  CONFIG
} = require('@helpers/constants')
const url = CONFIG.MONGODB_URI;

if (CONFIG.MONGO_CONFIG === 'aws') {
  mongoose.connect(url, {
    useNewUrlParser: true,
    autoIndex: true,
    ssl: true,
    sslValidate: false,
    sslCA: fs.readFileSync('./rds-combined-ca-bundle.pem'),
  });
} else if (CONFIG.MONGO_CONFIG === 'atlas') {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  });

} else {
  mongoose.connect(url, {
    useNewUrlParser: true,
    autoIndex: true,

  });
}