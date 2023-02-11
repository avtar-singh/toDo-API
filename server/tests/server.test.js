let chai = require('chai');
let request = require('supertest');
let { ObjectId } = require("mongodb");

let app = require("./../server");
let {Todo} = require('./../models/todo');

let expect = chai.expect;

const todos = [{
  _id: new ObjectId(),
  text: 'First test todo'
}, {
  _id: new ObjectId(),
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.deleteMany({}).then(() => {
    Todo.insertMany(todos);
    done();
  });
});


// TEST NEW TODO ITEM
describe("POST /todos", () => {
  it("should create a new todo", (done) => {
    var text = "Test todo text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).to.equal(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
            expect(todos.length).to.equal(3);
            expect(todos[2].text).to.equal(text);
            done();
          })
          .catch((e) => done(e));
      });
  });

  it("should not create todo with invalid body data", () => {
    request(app)
      .post("/todos")
      .send({}).then((req,res,done) => {
        expect(res.statusCode.should.have(400));
        done();
      }).catch((e) => end(done));
  });
});

// TEST FETCH TODO ITEM
describe('Get Todo Item', () => {
  var hexId = todos[0]._id.toHexString();
  it('should fetch single item', (done) => {
    request(app)
    .get(`/todos/${hexId}`)
    .end((err, res) => {
      expect(res.statusCode).to.equal(200);
      let textToBeChecked = res.body.todo.text;
      expect(todos[0].text).to.equal(textToBeChecked);
      done();
    });
    
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectId().toHexString();
    request(app).get(`/todos/${hexId}`).expect(404).end(done);
  });

  it('should return 404 for non object-id', (done) => {
    request(app).get("/todos/abc").expect(404).end(done);
  });
});

//TEST DELETE ITEM
describe("Delete Todo Item", () => {
  it("should fetch single item and delete", () => {
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.todo._id).to.equal(hexId);
        if (err) {
          return done(err);
        }
      });
  });

  it("should return 404 if todo not found", (done) => {
    var hexId = new ObjectId().toHexString();
    request(app).delete(`/todos/${hexId}`).expect(404).end(done);
  });

  it("should return 404 for non object-id", (done) => {
    request(app).delete("/todos/abc").expect(404).end(done);
  });
});
