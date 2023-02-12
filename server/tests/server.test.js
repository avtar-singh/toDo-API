let chai = require('chai');
let request = require("supertest");
let { ObjectId } = require("mongodb");

let app = require("./../server");
let {Todo} = require('./../models/todo');

let expect = chai.expect;

const todos = [{
  _id: new ObjectId(),
  text: 'First test todo'
}, {
  _id: new ObjectId(),
  text: 'Second test todo',
  completed: true,
  completedAt: 3434
}];

beforeEach((done) => {
  Todo.deleteMany({})
    .then(() => {
      Todo.insertMany(todos);
      done();
    })
    .catch((e) => {
      return done(e);
    });
});


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
  it("should update todo item", () => {
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
        expect(res.body.todo.completedAt).is.a("number");
      });
  });
});