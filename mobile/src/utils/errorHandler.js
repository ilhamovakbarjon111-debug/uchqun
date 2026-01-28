export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  // Network error
  if (error.message === 'Network Error' || !error.response) {
    return 'No internet connection';
  }

  const status = error.response?.status;
  const serverMessage = error.response?.data?.error || error.response?.data?.message;

  if (serverMessage) return serverMessage;

  switch (status) {
    case 400: return 'Invalid request';
    case 401: return 'Session expired, please login again';
    case 403: return "You don't have permission";
    case 404: return 'Not found';
    case 409: return 'Conflict — this resource already exists';
    case 422: return 'Invalid data provided';
    case 429: return 'Too many requests, please try again later';
    case 500: return 'Server error, please try again';
    case 502: return 'Server is temporarily unavailable';
    case 503: return 'Service unavailable, please try again later';
    default: return error.message || 'Something went wrong';
  }
}
