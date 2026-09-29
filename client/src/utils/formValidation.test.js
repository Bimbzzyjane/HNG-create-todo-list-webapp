import { describe, expect, it } from 'vitest';
import { isFormValid, toNotePayload, toTodoPayload, validateNoteForm, validateTodoForm } from './formValidation.js';

describe('form validation', () => {
  it('requires a todo title', () => {
    const errors = validateTodoForm({ title: '   ' });

    expect(errors.title).toBe('Title is required');
    expect(isFormValid(errors)).toBe(false);
  });

  it('accepts a valid todo form', () => {
    const errors = validateTodoForm({ title: 'Ship it', description: 'Details', due_date: '2030-04-01' });

    expect(isFormValid(errors)).toBe(true);
  });

  it('rejects a todo title that is too long', () => {
    const errors = validateTodoForm({ title: 'x'.repeat(121) });

    expect(errors.title).toContain('120 characters');
  });

  it('requires a note title', () => {
    expect(validateNoteForm({ title: '' }).title).toBe('Title is required');
    expect(isFormValid(validateNoteForm({ title: 'Ideas' }))).toBe(true);
  });

  it('converts todo form values into an API payload', () => {
    expect(
      toTodoPayload({ title: '  Trim me  ', description: ' body ', priority: '', due_date: '', completed: undefined }),
    ).toEqual({
      title: 'Trim me',
      description: 'body',
      priority: 'medium',
      due_date: null,
      completed: false,
    });

    expect(toTodoPayload({ title: 'A', due_date: '2030-04-01', completed: true }).due_date).toBe('2030-04-01');
  });

  it('converts note form values into an API payload', () => {
    expect(toNotePayload({ title: ' Note ', content: ' Body ' })).toEqual({
      title: 'Note',
      content: 'Body',
    });
  });
});
