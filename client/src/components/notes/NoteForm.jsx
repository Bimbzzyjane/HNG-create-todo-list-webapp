import { useId, useState } from 'react';
import Button from '../ui/Button.jsx';
import { isFormValid, toNotePayload, validateNoteForm } from '../../utils/formValidation.js';

/**
 * Create / edit form for a note: a title and a free-form content area.
 */
export default function NoteForm({
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
    content: initialValues.content ?? '',
  }));
  const [errors, setErrors] = useState({});

  function handleChange(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateNoteForm(values);
    setErrors(validationErrors);
    if (!isFormValid(validationErrors)) return;

    await onSubmit(toNotePayload(values));
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
          placeholder="Give this note a name"
          maxLength={160}
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
        <label className="field__label" htmlFor={`${formId}-content`}>
          Content
        </label>
        <textarea
          id={`${formId}-content`}
          name="content"
          className={errors.content ? 'textarea input--invalid' : 'textarea'}
          value={values.content}
          onChange={handleChange('content')}
          rows={8}
          maxLength={5000}
          placeholder={'One idea per line, for example:\nDraft the release notes\nReview the open pull requests'}
          aria-invalid={errors.content ? 'true' : undefined}
          aria-describedby={errors.content ? `${formId}-content-error` : `${formId}-content-hint`}
        />
        {errors.content ? (
          <p className="field__error" id={`${formId}-content-error`}>
            {errors.content}
          </p>
        ) : (
          <p className="field__hint" id={`${formId}-content-hint`}>
            Each line is shown as a bullet point on the note card.
          </p>
        )}
      </div>

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
          {mode === 'edit' ? 'Save note' : 'Add note'}
        </Button>
      </div>
    </form>
  );
}
