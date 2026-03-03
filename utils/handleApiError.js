import toast from "react-hot-toast";

export default function handleApiError(error, fallback = "Something went wrong.") {

  if (!error.response) {
    throw error;
  }

  const { data, status } = error.response;

  if (status === 401) return;

  if (status === 422 && data.errors) {
    const firstField = Object.keys(data.errors)[0];
    const firstMsg = Array.isArray(data.errors[firstField])
      ? data.errors[firstField][0]
      : data.errors[firstField];
    toast.error(firstMsg || fallback);
    return;
  }

  if (data?.message) { toast.error(data.message); return; }
  if (data?.error)   { toast.error(data.error);   return; }

  toast.error(fallback);
}