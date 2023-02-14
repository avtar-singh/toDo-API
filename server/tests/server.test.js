const chai = require('chai');
const request = require("supertest");
const { ObjectId } = require("mongodb");
const {User} = require("./../models/user");
const app = require("./../server");
const { todos, users, populateTodos, populateUsers } = require('./seed/seed');

let expect = chai.expect;

beforeEach(populateUsers);
beforeEach(populateTodos);

// TEST NEW TODO ITEM
describe("POST /todos", () => {
  it("should create a new todo", (done) => {
    request(app)
      .post("/todos")
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
    request(app)
      .post("/todos")
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

// TEST FETCH TODO ITEM
describe('Get Todo Item', () => {
  it('should fetch single item', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
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

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectId().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
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
    request(app)
      .get("/todos/abc")
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
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
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

  it("should return 404 if todo not found", (done) => {
    var hexId = new ObjectId().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
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
    request(app)
      .delete("/todos/abc")
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
    var hexId = todos[0]._id.toHexString();
    var toBeUpdated = {
      'completed': true,
      'completedAt': new Date().getTime()
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .send(toBeUpdated)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.todo.completed).to.equal(toBeUpdated.completed);
        expect(res.body.todo.completedAt).to.be.a('number');
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
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body._id).to.equal(users[0]._id.toHexString());
        expect(res.body.email).to.equal(users[0].email);
        done();
      });
  });

  it('should return 401 if not authenticate', (done) => {
    request(app)
      .get("/users/me")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body).is.empty;
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
    request(app).post('/users/login').send({
      email: users[1].email,
      password: users[1].password
    }).expect(200).expect((res) => {
      expect(res.headers["x-auth"]).to.be.a("string");
    }).end((err, res) => {
      if(err) {
        return done(err);
      }

      User.findById((users[1]._id)).then((user) => {
        expect(user.tokens[0]).to.include({
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