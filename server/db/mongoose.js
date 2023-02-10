var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const password = encodeURIComponent("ZlDeYP8cWxOVTZ8x");

mongoose.set("strictQuery", false);

mongoose.connect(`mongodb+srv://super-admin:${password}@personal-use.2jyblbz.mongodb.net/toDoApp?retryWrites=true&w=majority` || 'mongodb://localhost:27017/toDoApp').catch((err) => console.log(err.reason));


module.exports = {mongoose};