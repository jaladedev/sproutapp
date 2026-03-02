import toast from "react-hot-toast";

/**
 * Extracts and displays error messages from Laravel API error responses.
 *
 * Laravel error shapes:
 *  - Validation (422): { message, errors: { field: ["msg"] } }
 *  - General errors:   { message, errors? }
 *  - Single error:     { error }
 */
export default function handleApiError(error, fallback = "Something went wrong.") {
  if (!error.response) {
    toast.error("Network error. Please check your connection.");
    return;
  }

  const { data, status } = error.response;

  if (status === 422 && data.errors) {
    // Show first validation error
    const firstField = Object.keys(data.errors)[0];
    const firstMsg = Array.isArray(data.errors[firstField])
      ? data.errors[firstField][0]
      : data.errors[firstField];
    toast.error(firstMsg || fallback);
    return;
  }

  if (data?.message) {
    toast.error(data.message);
    return;
  }

  if (data?.error) {
    toast.error(data.error);
    return;
  }

  toast.error(fallback);
}