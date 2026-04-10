import { useRef } from "react";
import "./CourseForm.css";

export default function CourseForm({
  asModal = false,
  title,
  subtitle,
  idSuffix = "new",
  formData,
  onChange,
  onSubmit,
  error,
  onClose,
  onCancel,
  showCancel = false,
  canDelete = false,
  onDelete,
  submitting = false,
  submitLabel,
  submittingLabel,
  deleting = false,
  deleteLabel = "Delete course",
  deletingLabel = "Deleting…",
  disableSubmit = false,
  imageUrl = "",
  onImageSelect,
  imageBusy = false,
  imageButtonLabel = "Upload / Change Image",
  imageBusyLabel = "Uploading…",
}) {
  const fileInputRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onImageSelect) return;
    onImageSelect(file);
  }

  const controlsDisabled = submitting || deleting || imageBusy;

  return (
    <div className={asModal ? "course-form course-form--modal" : "course-form"}>
      <form className={asModal ? "course-form__body course-form__body--modal" : "course-form__body"} onSubmit={onSubmit}>
        <div className="course-form__top">
          <legend className="course-form__legend">{title}</legend>
          {asModal && onClose ? (
            <button
              type="button"
              className="course-form__close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          ) : null}
        </div>

        {subtitle ? <p className="course-form__subtitle">{subtitle}</p> : null}

        {typeof onImageSelect === "function" ? (
          <div className="course-form__image-block">
            {imageUrl ? (
              <img
                className="course-form__image"
                src={imageUrl}
                alt="Course"
              />
            ) : null}
            <button
              type="button"
              className="course-form__button course-form__button--secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={controlsDisabled}
            >
              {imageBusy ? imageBusyLabel : imageButtonLabel}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </div>
        ) : null}

        <fieldset className="course-form__fieldset">
          <label className="course-form__label" htmlFor={`course-name-${idSuffix}`}>
            Course Name:
          </label>
          <input
            type="text"
            id={`course-name-${idSuffix}`}
            name="name"
            className="course-form__input"
            value={formData.name}
            onChange={onChange}
            required
            disabled={controlsDisabled}
          />
        </fieldset>

        <fieldset className="course-form__fieldset">
          <label className="course-form__label" htmlFor={`course-code-${idSuffix}`}>
            Course Code:
          </label>
          <input
            type="text"
            id={`course-code-${idSuffix}`}
            name="code"
            className="course-form__input"
            value={formData.code}
            onChange={onChange}
            required
            disabled={controlsDisabled}
          />
        </fieldset>

        <fieldset className="course-form__fieldset">
          <label className="course-form__label" htmlFor={`course-desc-${idSuffix}`}>
            Course Description:
          </label>
          <textarea
            id={`course-desc-${idSuffix}`}
            name="description"
            rows={4}
            className="course-form__textarea"
            value={formData.description}
            onChange={onChange}
            disabled={controlsDisabled}
          />
        </fieldset>

        {error ? <p className="course-form__error">{error}</p> : null}

        <div className="course-form__actions">
          {showCancel && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="course-form__button course-form__button--secondary course-form__button--action"
              disabled={controlsDisabled}
            >
              Cancel
            </button>
          ) : null}

          {canDelete && onDelete ? (
            <button
              type="button"
              className="course-form__button course-form__button--danger course-form__button--action"
              onClick={onDelete}
              disabled={controlsDisabled}
            >
              {deleting ? deletingLabel : deleteLabel}
            </button>
          ) : null}

          <button
            type="submit"
            className="course-form__button course-form__button--primary course-form__button--action"
            disabled={controlsDisabled || disableSubmit}
          >
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
