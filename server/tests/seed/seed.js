const {ObjectId} = require('mongodb');
const jwt = require("jsonwebtoken");

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const users = [
  {
    _id: userOneId,
    email: process.env.SEED_EMAIL,
    password: process.env.SEED_PASS,
    tokens: [
      {
        access: "auth",
        token: jwt.sign(
          { _id: userOneId, access: "auth" },
          process.env.SECRET_KEY
        )
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'john.doe@test.com',
    password: 'fake_pass2',
    tokens: [
      {
        access: "auth",
        token: jwt.sign(
          { _id: userTwoId, access: "auth" },
          process.env.SECRET_KEY
        )
      }
    ]
  }
];

const todos = [
  {
    _id: new ObjectId(),
    text: "First test todo",
    _creator: userOneId
  },
  {
    _id: new ObjectId(),
    text: "Second test todo",
    completed: true,
    completedAt: 3434,
    _creator: userTwoId
  }
];

const populateTodos = (done) => {
  Todo.deleteMany({})
    .then(() => {
      Todo.insertMany(todos);
      done();
    })
    .catch((e) => {
      return done(e);
    });
};

const populateUsers = (done) => {
    User.deleteMany({})
      .then(async () => {
        var userOne = await new User(users[0]).save();
        var userTwo = await new User(users[1]).save();

        return Promise.all(["userOne", "userTwo"]);
      })
      .then(() => done());
};

module.exports = { todos, users, populateTodos, populateUsers };
