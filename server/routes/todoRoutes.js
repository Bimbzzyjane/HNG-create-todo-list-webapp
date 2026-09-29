import { Router } from 'express';
import * as todoController from '../controllers/todoController.js';
import { validateBody, validateQuery, validateIdParam } from '../middleware/validate.js';
import { validateCreateTodo, validateUpdateTodo, validateTodoQuery } from '../validators/todoValidator.js';

/**
 * Todo routes - route definitions only.
 * Each route wires together validation, a controller and nothing else.
 */
const router = Router();

router
  .route('/')
  .get(validateQuery(validateTodoQuery), todoController.listTodos)
  .post(validateBody(validateCreateTodo), todoController.createTodo);

// Must be declared before "/:id" so "completed" is not read as an id.
router.delete('/completed', todoController.clearCompletedTodos);

router
  .route('/:id')
  .all(validateIdParam('id'))
  .get(todoController.getTodo)
  .put(validateBody(validateCreateTodo), todoController.replaceTodo)
  .patch(validateBody(validateUpdateTodo), todoController.updateTodo)
  .delete(todoController.deleteTodo);

export default router;
