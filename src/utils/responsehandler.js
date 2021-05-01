export const errorResponse = (error) => {
  return {
    error: { message: error.message },
    stackTrace: error.stack,
    data: null,
  }
}
