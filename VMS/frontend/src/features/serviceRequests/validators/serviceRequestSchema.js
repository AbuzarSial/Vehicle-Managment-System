/** Align with backend ServiceRequestCreate / ServiceRequestUpdate field rules. */

const MAX_TYPE = 128
const MAX_STATUS = 64

export const STATUS_OPTIONS = ['open', 'in_progress', 'completed', 'cancelled']

export function validateServiceRequestForm(values) {
  const errors = {}

  const vid = values.vehicle_id
  if (vid === '' || vid === undefined || vid === null || Number(vid) < 1) {
    errors.vehicle_id = 'Select a vehicle.'
  }

  const cid = values.center_id
  if (cid === '' || cid === undefined || cid === null || Number(cid) < 1) {
    errors.center_id = 'Select a service center.'
  }

  const rd = values.request_date?.trim() ?? ''
  if (!rd) {
    errors.request_date = 'Request date is required.'
  }

  const rt = values.request_type?.trim() ?? ''
  if (rt.length > MAX_TYPE) {
    errors.request_type = `At most ${MAX_TYPE} characters.`
  }

  const st = values.status?.trim() ?? ''
  if (!st) {
    errors.status = 'Status is required.'
  } else if (st.length > MAX_STATUS) {
    errors.status = `At most ${MAX_STATUS} characters.`
  }

  return errors
}

export function toCreatePayload(values) {
  return {
    vehicle_id: Number(values.vehicle_id),
    center_id: Number(values.center_id),
    request_date: values.request_date.trim(),
    request_type: values.request_type?.trim() ? values.request_type.trim() : null,
    problem_description: values.problem_description?.trim()
      ? values.problem_description.trim()
      : null,
    status: values.status.trim(),
  }
}

/** Full PATCH body from the form (all fields the user can edit). */
export function toUpdatePayload(values) {
  return {
    vehicle_id: Number(values.vehicle_id),
    center_id: Number(values.center_id),
    request_date: values.request_date.trim(),
    request_type: values.request_type?.trim() ? values.request_type.trim() : null,
    problem_description: values.problem_description?.trim()
      ? values.problem_description.trim()
      : null,
    status: values.status.trim(),
  }
}

export default {
  STATUS_OPTIONS,
  validateServiceRequestForm,
  toCreatePayload,
  toUpdatePayload,
}
