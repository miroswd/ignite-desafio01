const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUserByUsername = users.find((user) => user.username === username);

  if (!findUserByUsername) {
    return response.status(404).json({ error: "User does not exists" });
  }

  request.user = findUserByUsername;

  return next();
}

function findTodoById(id, user) {
  return user.todos.find((todo) => todo.id === id);
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const checkIfUserExists = users.find((user) => user.username === username);

  if (checkIfUserExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  // deadline => ano-mes-dia e converter para date js
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = findTodoById(id, user);
  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = findTodoById(id, user);
  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = findTodoById(id, user);
  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  const indexTodo = user.todos.indexOf(todo);
  user.todos.splice(indexTodo, 1);

  return response.status(204).json();
});

module.exports = app;
