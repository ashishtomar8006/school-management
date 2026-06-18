import { ApiError } from './api/client'

/**
 * Handles a caught error inside a react-hook-form onSubmit.
 *
 * - If it's a 409 field-conflict (e.g. duplicate email), sets the specific
 *   field's error so react-hook-form highlights and scrolls to it.
 * - Otherwise sets the banner error message for a generic server alert.
 *
 * Returns true when a field error was set (caller can skip setting serverError).
 */
export function handleFormError(
  err: unknown,
  setFieldError: (field: string, error: { type: string; message: string }) => void,
  setServerError: (msg: string) => void,
  fallback = 'Something went wrong. Please try again.'
): void {
  if (err instanceof ApiError) {
    if (err.isFieldConflict && err.field) {
      // Server told us exactly which field is duplicate — highlight it
      setFieldError(err.field, { type: 'server', message: err.message })
      return
    }
    setServerError(err.message || fallback)
    return
  }

  if (err instanceof Error) {
    setServerError(err.message || fallback)
    return
  }

  setServerError(fallback)
}
