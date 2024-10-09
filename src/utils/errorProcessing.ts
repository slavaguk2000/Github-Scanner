export const getErrorMessage = (error: unknown, allowedStatuses: Array<number>) => {
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

  return "Internal Error";
};
