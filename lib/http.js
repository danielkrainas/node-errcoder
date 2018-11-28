const { Errors } = require('./errors')
const { fromErrorCoder } = require('./util')

const FALLBACK_STATUS_CODE = 500

function createErrorHandler () {
  return (err, req, res, next) => {
    if (res.headersSent) {
      return next(err)
    }

    let status = 0
    if (err instanceof Errors) {
      if (err.length > 0) {
        const ec = fromErrorCoder(err[0])
        if (ec) {
          status = ec.descriptor().httpStatusCode
        }
      }
    } else {
      const ec = fromErrorCoder(err)
      if (ec) {
        status = ec.descriptor().httpStatusCode
      } else {
        err = new Errors(err)
      }
    }

    if (status === 0) {
      status = FALLBACK_STATUS_CODE
    }

    res.status(status).json(err)
  }
}

module.exports = {
  createErrorHandler,
}
