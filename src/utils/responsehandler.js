export const errorResponse = (error) => {
  return {
    error: error.message,
    stackTrace: error.stack,
    data: null,
  }
}
