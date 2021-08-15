class AuthurizationError extends Error {
  constructor(message) {
    super(message)

    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)

    this.status = 401
  }
}
class ValidationError extends Error {
  constructor(message) {
    super(message)

    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)

    this.status = 400
  }
}
export { AuthurizationError, ValidationError }
