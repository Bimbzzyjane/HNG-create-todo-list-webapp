import { useId, useState } from 'react';
import Button from '../ui/Button.jsx';
import {
  isFormValid,
  toTodoPayload,
  toDateInputValue,
  validateTodoForm,
} from '../../utils/formValidation.js';
import { PRIORITY_OPTIONS } from '../../utils/priority.js';

/**
 * Create / edit form for a todo.
 *
 * Validation happens on the client for instant feedback, and again on the API.
 * Server errors are passed in through `serverError` so they are never swallowed.
 */
export default function TodoForm({
  initialValues = {},
  mode = 'create',
  onSubmit,
  onCancel,
  submitting = false,
  serverError = '',
}) {
  const formId = useId();
  const [values, setValues] = useState(() => ({
    title: initialValues.title ?? '',
    description: initialValues.description ?? '',
    priority: initialValues.priority ?? 'medium',
    due_date: toDateInputValue(initialValues.due_date),
    completed: Boolean(initialValues.completed),
  }));
  const [errors, setErrors] = useState({});

  function handleChange(field) {
    return (event) => {
      const { type, checked, value } = event.target;
      setValues((current) => ({ ...current, [field]: type === 'checkbox' ? checked : value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateTodoForm(values);
    setErrors(validationErrors);
    if (!isFormValid(validationErrors)) return;

    await onSubmit(toTodoPayload(values));
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="field__label" htmlFor={`${formId}-title`}>
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${formId}-title`}
          name="title"
          type="text"
          className={errors.title ? 'input input--invalid' : 'input'}
          value={values.title}
          onChange={handleChange('title')}
          placeholder="What needs to be done?"
          maxLength={120}
          required
          aria-required="true"
          aria-invalid={errors.title ? 'true' : undefined}
          aria-describedby={errors.title ? `${formId}-title-error` : undefined}
          data-autofocus
        />
        {errors.title ? (
          <p className="field__error" id={`${formId}-title-error`}>
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${formId}-description`}>
          Description
        </label>
        <textarea
          id={`${formId}-description`}
          name="description"
          className={errors.description ? 'textarea input--invalid' : 'textarea'}
          value={values.description}
          onChange={handleChange('description')}
          rows={3}
          maxLength={1000}
          placeholder="Add any details worth remembering"
          aria-invalid={errors.description ? 'true' : undefined}
          aria-describedby={errors.description ? `${formId}-description-error` : undefined}
        />
        {errors.description ? (
          <p className="field__error" id={`${formId}-description-error`}>
            {errors.description}
          </p>
        ) : null}
      </div>

      <div className="form__row">
        <div className="field">
          <label className="field__label" htmlFor={`${formId}-priority`}>
            Priority
          </label>
          <select
            id={`${formId}-priority`}
            name="priority"
            className="select"
            value={values.priority}
            onChange={handleChange('priority')}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`${formId}-due-date`}>
            Due date
          </label>
          <input
            id={`${formId}-due-date`}
            name="due_date"
            type="date"
            className={errors.due_date ? 'input input--invalid' : 'input'}
            value={values.due_date}
            onChange={handleChange('due_date')}
            aria-invalid={errors.due_date ? 'true' : undefined}
          />
          {errors.due_date ? <p className="field__error">{errors.due_date}</p> : null}
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="checkbox-field">
          <input
            id={`${formId}-completed`}
            name="completed"
            type="checkbox"
            className="checkbox"
            checked={values.completed}
            onChange={handleChange('completed')}
          />
          <label htmlFor={`${formId}-completed`}>Mark this todo as completed</label>
        </div>
      ) : null}

      {serverError ? (
        <p className="form__error" role="alert">
          {serverError}
        </p>
      ) : null}

      <div className="form__actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" icon={mode === 'edit' ? 'check' : 'plus'} loading={submitting}>
          {mode === 'edit' ? 'Save changes' : 'Add todo'}
        </Button>
      </div>
    </form>
  );
}
