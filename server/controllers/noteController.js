import { asyncHandler } from '../utils/asyncHandler.js';
import * as noteService from '../services/noteService.js';

/** Note controller - HTTP glue only, mirroring the todo controller. */

/** GET /api/notes */
export const listNotes = asyncHandler(async (req, res) => {
  const { items, meta } = await noteService.listNotes(req.validated?.query ?? {});
  res.status(200).json({ data: items, meta });
});

/** GET /api/notes/:id */
export const getNote = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(req.validated.params.id);
  res.status(200).json({ data: note });
});

/** POST /api/notes */
export const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.validated.body);
  res.status(201).json({ data: note, message: 'Note created successfully' });
});

/** PUT /api/notes/:id - full replace */
export const replaceNote = asyncHandler(async (req, res) => {
  const note = await noteService.replaceNote(req.validated.params.id, req.validated.body);
  res.status(200).json({ data: note, message: 'Note replaced successfully' });
});

/** PATCH /api/notes/:id - partial update */
export const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.validated.params.id, req.validated.body);
  res.status(200).json({ data: note, message: 'Note updated successfully' });
});

/** DELETE /api/notes/:id */
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await noteService.deleteNote(req.validated.params.id);
  res.status(200).json({ data: note, message: 'Note deleted successfully' });
});
