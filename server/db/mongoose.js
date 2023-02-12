var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGODB_URI).catch((err) => console.log(err));

module.exports = {mongoose};