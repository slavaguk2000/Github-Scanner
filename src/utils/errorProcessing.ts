/**
 * Extracts and returns a custom error message if the error's status is allowed.
 * Otherwise, returns a generic "Internal Error" message to handle unexpected statuses.
 *
 * @param {unknown} error - The error object caught in the try-catch block.
 * @param {Array<number>} allowedStatuses - Array of allowed HTTP status codes.
 * @returns {string} - The error message or a default message for unrecognized errors.
 */
export const getErrorMessage = (
  error: unknown,
  allowedStatuses: Array<number>
) => {
  const { response } = error as {
    response?: { data?: { status?: string; message?: string } };
  };

  if (
    (allowedStatuses as Array<number | undefined>).includes(
      Number(response?.data?.status)
    ) &&
    response?.data?.message
  ) {
    return response.data.message;
  }

  return 'Internal Error';
};
