import { asyncHandler } from '../utils/asyncHandler.js';
import * as todoService from '../services/todoService.js';

/**
 * Todo controller - HTTP glue only.
 *
 * Each handler reads validated input from `req.validated`, calls a service and
 * sends a JSON response. No business rules and no data access live here.
 */

/** GET /api/todos */
export const listTodos = asyncHandler(async (req, res) => {
  const { items, meta } = await todoService.listTodos(req.validated?.query ?? {});
  res.status(200).json({ data: items, meta });
});

/** GET /api/todos/:id */
export const getTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.getTodoById(req.validated.params.id);
  res.status(200).json({ data: todo });
});

/** POST /api/todos */
export const createTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.createTodo(req.validated.body);
  res.status(201).json({ data: todo, message: 'Todo created successfully' });
});

/** PUT /api/todos/:id - full replace */
export const replaceTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.replaceTodo(req.validated.params.id, req.validated.body);
  res.status(200).json({ data: todo, message: 'Todo replaced successfully' });
});

/** PATCH /api/todos/:id - partial update (also used to toggle completion) */
export const updateTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.updateTodo(req.validated.params.id, req.validated.body);
  res.status(200).json({ data: todo, message: 'Todo updated successfully' });
});

/** DELETE /api/todos/:id */
export const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.deleteTodo(req.validated.params.id);
  res.status(200).json({ data: todo, message: 'Todo deleted successfully' });
});

/** DELETE /api/todos/completed */
export const clearCompletedTodos = asyncHandler(async (req, res) => {
  const { deletedCount } = await todoService.clearCompletedTodos();
  res.status(200).json({
    data: { deletedCount },
    message: `${deletedCount} completed todo(s) removed`,
  });
});
