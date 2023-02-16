const chai = require('chai');
const express = require("express");
const request = require("supertest");
const { ObjectId } = require("mongodb");
const {User} = require("./../models/user");
const app = require("./../server");
const { todos, users, populateTodos, populateUsers } = require('./seed/seed');

let expect = chai.expect;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
beforeEach(populateUsers);
beforeEach(populateTodos);

// TEST NEW TODO ITEM
describe("POST /todos", () => {
  it("should create a new todo", (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .post("/todos")
      .set("x-auth", token)
      .send({ 'text': 'Test todo text'})
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body.text).to.equal('Test todo text');
        done();
      });
  });

  it("should not create todo with invalid body data", (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .post("/todos")
      .set("x-auth", token)
      .send({})
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        done();

        if (err) {
          return done(err);
        }
      });
  });
});

// TEST FETCH TODO LIST
describe("Fetch list of todos", () => {
  it("should show todo list of authorized user", (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .get("/todos")
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(200)
      .end((err, res) => {
        expect(res.body.todos.length).is.equal(1);
        done();
      });
  });
})

// TEST FETCH TODO ITEM
describe('Get Todo Item', () => {
  it('should fetch single item', (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        let textToBeChecked = res.body.todo.text;
        expect(todos[0].text).to.equal(textToBeChecked);
        done();

        if (err) {
          return done(err);
        }
      });
    
  });

  it('should not fetch another user item', (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectId().toHexString();
    const token = users[0].tokens[0].token;
    request(app)
      .get(`/todos/${hexId}`)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        done();

        if (err) {
          return done(err);
        }
      });
  });

  it('should return 404 for non object-id', (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .get("/todos/abc")
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        done();

        if (err) {
          return done(err);
        }
      });
  });
});

//TEST DELETE ITEM
describe("Delete Todo Item", () => {
  it("should fetch single item and delete", (done) => {
    const token = users[1].tokens[0].token;
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.todo._id).to.equal(hexId);
        done();
        if (err) {
          return done(err);
        }
      });
  });

  it("should not delete item of another user", (done) => {
    const token = users[1].tokens[0].token;
    var hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(404)
      .end(done);
  });

  it("should return 404 if todo not found", (done) => {
    var hexId = new ObjectId().toHexString();
    const token = users[1].tokens[0].token;
    request(app)
      .delete(`/todos/${hexId}`)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        done();

        if (err) {
          return done(err);
        }
      });
  });

  it("should return 404 for non object-id", (done) => {
    const token = users[1].tokens[0].token;
    request(app)
      .delete("/todos/abc")
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        done();

        if (err) {
          return done(err);
        }
      });
  });
});

//TEST PATCH ITEM
describe('Patch todo item', () => {
  it("should update todo item", (done) => {
    const token = users[0].tokens[0].token;
    var hexId = todos[0]._id.toHexString();
    var toBeUpdated = {
      'completed': true,
      'completedAt': new Date().getTime()
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .send(toBeUpdated)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.todo.completed).to.equal(toBeUpdated.completed);
        expect(res.body.todo.completedAt).to.be.a('number');
        done();
      });
  });

  it("should not update todo item of another user", (done) => {
    const token = users[0].tokens[0].token;
    var hexId = todos[1]._id.toHexString();
    var toBeUpdated = {
      completed: true,
      completedAt: new Date().getTime(),
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .send(toBeUpdated)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(404)
      .end(done);
  });

  it("should clear completedAt when item is incomplete", (done) => {
    var hexId = todos[0]._id.toHexString();
    var toBeUpdated = {
      completed: false,
      text: "This should be new text",
    };
    const token = users[0].tokens[0].token;

    request(app)
      .patch(`/todos/${hexId}`)
      .send(toBeUpdated)
      .set("x-auth", token)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(200);
        expect(res.body.todo.text).to.equal(toBeUpdated.text);
        expect(res.body.todo.completed).to.equal(false);
        expect(res.body.todo.completedAt).to.be.null;
        done();
      });
  });
});

// TEST USER AUTHENTICATION
describe('Check if User is valid', () => {
  it('should return user if authenticate', (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .get("/users/me")
      .set("x-auth", token)
      .set("Connection", "keep-alive")
      .expect((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body._id).to.equal(users[0]._id.toHexString());
        expect(res.body.email).to.equal(users[0].email);
      })
      .end(done);
  });
  
  it("should return 401 if not authenticate", (done) => {
    request(app)
      .get("/users/me")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("x-auth", "fdssdffdsfds")
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        done();

        if (err) {
          return done(err);
        }
      });
  });
  
});


//TEST NEW USER
describe('Adding new user', () => {
  it('should create a user', (done) => {
    request(app)
      .post("/user")
      .send({ email: "john.doe3@test3.com", password: "test@123" })
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body.email).to.equal("john.doe3@test3.com");
        done();
      });
  });

  it('should return validation error if request invalid', (done) => {
    request(app)
      .post("/user")
      .send({ email: "john.dotest3.com", password: "tes21ds@t" })
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(400);
        done();
      });
  });

  it("should not create user if email already in use", (done) => {
    request(app)
      .post("/user")
      .send({ email: process.env.SEED_EMAIL, password: "test@dssd12" })
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(400);
        done();
      });
  });
}); 

// TEST USER LOGIN
describe('User login', () => {
  it('should login if valid user', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200).expect((res) => {
        expect(res.headers["x-auth"]).to.be.a("string");
      }).end((err, res) => {
        if(err) {
          return done(err);
        }

        User.findById((users[1]._id)).then((user) => {
          expect(user.tokens[1]).to.include({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not login if invalid user', (done) => {
    request(app)
      .post("/users/login")
      .send({
        email: 'wrong.email@mail.com',
        password: users[1].password,
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).to.be.an("object").that.is.empty;
        expect(res.headers["x-auth"]).to.be.undefined;
        done();
      });
    });
});

// TEST USER LOGOUT
describe('User logout', () => {
  it('should remove token on successful logout', (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .delete("/users/me/token")
      .set("x-auth", token)
      .set("Connection", "keep-alive")
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).is.equal(0);
            done();
          })
          .catch((e) => done(e));
      });
  });
});