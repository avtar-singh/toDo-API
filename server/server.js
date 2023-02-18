require("./config/config");

const _ = require("lodash");
const express = require("express");
const { ObjectId } = require("mongodb");

const { mongoose } = require("./db/mongoose.js");
const { User } = require("./models/user.js");
const { authenticate } = require("./middleware/authenticate.js");
const { Todo } = require("./models/todo.js");


const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/todos', authenticate, async (req, res) => {
  const todo = await new Todo({'text': req.body.text,'_creator': req.user._id});
  try {
    const doc = await todo.save();
    res.send(doc);
  } catch(e) {
    res.status(400).send(e);
  }
});

app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({'_creator': req.user._id});
    res.send({ todos });
  } catch(e) {
    res.status(400).send(e);
  }
});

app.get('/todos/:id', authenticate, async (req, res) => {

  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }
  try {
    const todo = await Todo.findOne({'_id': id, '_creator': req.user._id});
    if (todo) {
      res.send({ todo });
    } else {
      return res.status(404).send();
    }
  } catch(e) {
    res.status(400).send(e);
  }
});

app.delete('/todos/:id', authenticate, async (req,res) => {
  const id = req.params.id;

  if(!ObjectId.isValid(id)) {
    return res.status(404).send();
  }
  try {
    const todo = await Todo.findOneAndRemove({'_id': id, '_creator': req.user._id});
    if (todo) {
      res.send({ todo });
    } else {
      return res.status(404).send();
    }
    
  } catch (e) {
    res.status(400).send(e);
  }

});

app.patch('/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = await new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  try {
    const todo = await Todo.findOneAndUpdate({'_id': id,'_creator': req.user._id}, {$set: body}, {new: true});
    if(todo) {
      res.send({ todo });
    } else {
      return res.status(404).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post('/user', async (req, res) => {
  try {
    const body = _.pick(req.body, ["email", "password"]);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header("x-auth", token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/users/me', authenticate, (req, res) => {
 res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header("x-auth", token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = app;
