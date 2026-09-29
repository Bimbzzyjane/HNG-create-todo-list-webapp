import { Router } from 'express';
import * as noteController from '../controllers/noteController.js';
import { validateBody, validateQuery, validateIdParam } from '../middleware/validate.js';
import { validateCreateNote, validateUpdateNote, validateNoteQuery } from '../validators/noteValidator.js';

/**
 * Note routes - route definitions only.
 */
const router = Router();

router
  .route('/')
  .get(validateQuery(validateNoteQuery), noteController.listNotes)
  .post(validateBody(validateCreateNote), noteController.createNote);

router
  .route('/:id')
  .all(validateIdParam('id'))
  .get(noteController.getNote)
  .put(validateBody(validateCreateNote), noteController.replaceNote)
  .patch(validateBody(validateUpdateNote), noteController.updateNote)
  .delete(noteController.deleteNote);

export default router;
