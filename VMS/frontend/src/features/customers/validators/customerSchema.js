/**
 * Client-side validation aligned with backend CustomerCreate / CustomerUpdate (length rules).
 */

const MAX_NAME = 255
const MAX_PHONE = 32
const MAX_EMAIL = 255

export function validateCustomerForm(values) {
  const errors = {}
  const name = values.customer_name?.trim() ?? ''

  if (!name) {
    errors.customer_name = 'Customer name is required.'
  } else if (name.length > MAX_NAME) {
    errors.customer_name = `Must be at most ${MAX_NAME} characters.`
  }

  const phone = values.phone?.trim() ?? ''
  if (phone.length > MAX_PHONE) {
    errors.phone = `Must be at most ${MAX_PHONE} characters.`
  }

  const email = values.email?.trim() ?? ''
  if (email.length > MAX_EMAIL) {
    errors.email = `Must be at most ${MAX_EMAIL} characters.`
  }

  return errors
}

/** Normalize empty strings to null for optional fields (matches API). */
export function toCreatePayload(values) {
  return {
    customer_name: values.customer_name.trim(),
    phone: values.phone?.trim() ? values.phone.trim() : null,
    email: values.email?.trim() ? values.email.trim() : null,
  }
}

/** PATCH body: only defined keys with non-empty strings or nulls where cleared */
export function toUpdatePayload(values) {
  const payload = {}
  if (values.customer_name !== undefined) {
    payload.customer_name = values.customer_name.trim()
  }
  if (values.phone !== undefined) {
    payload.phone = values.phone.trim() ? values.phone.trim() : null
  }
  if (values.email !== undefined) {
    payload.email = values.email.trim() ? values.email.trim() : null
  }
  return payload
}

export default {
  validateCustomerForm,
  toCreatePayload,
  toUpdatePayload,
}
