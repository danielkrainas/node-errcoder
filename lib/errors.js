const { interpolate, trimPrefix } = require('./util')

class Errors {
  constructor ({ items = [], registrar = null } = {}) {
    items = items || []
    Object.assign(this, {
      items,
      registrar: registrar || null,
    })
  }

  toString () {
    return `\n${ this.items.map(x=>'    - ' + trimPrefix(x.toString(), 'Error: ').replace('\n', '\n    ')).join('\n') }`
  }

  toJSON () {
    const errors = this.items.map(err => {
      if (err instanceof ErrorCode) {
        err = err.withDetails(null)
      } else if (!(err instanceof ErrorEx)) {
        if (err instanceof Error) {
          err = this.registrar.ErrorCodeUnknown.withDetails(err).withMessage(trimPrefix(err.toString(), 'Error: '))
        } else {
          err = this.registrar.ErrorCodeUnknown.withDetails(err)
        }
      }

      const msg = err.message
      if (!msg) {
        msg = err.code.message()
      }

      return {
        code: err.code.toString(),
        message: msg,
        details: err.details,
      }
    })

    return { errors }
  }
}

class ErrorDesc {
  constructor ({ code, value, message, description, httpStatusCode }) {
    Object.assign(this, {
      code,
      value,
      message,
      description,
      httpStatusCode,
    })
  }
}

class ErrorCode {
  constructor (code) {
    Object.defineProperty(this, '_code', {
      value: code,
      writable: false,
    })
  }

  error () {
    return this.toString().replace('_', ' ').toLowerCase()
  }

  descriptor () {
    return this.registrar.codeToDesc.get(this._code)
  }

  toString () {
    return this.descriptor().value
  }

  message () {
    return this.descriptor().message
  }

  withDetails (details) {
    return new ErrorEx({
      code: this,
      message: this.message(),
      details,
    })
  }

  withMessage (message) {
    return new ErrorEx({
      code: this,
      message: message || '',
    })
  }

  withArgs (args) {
    return new ErrorEx({
      code: this,
      message: this.message(),
      args,
    })
  }
}

class ErrorEx extends Error {
  constructor ({ code, message, details, inner, args, stackContext }) {
    if (args) {
      message = interpolate(message || code.message(), args)
    }

    super(`${code.error()}: ${message}`)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, stackContext || ErrorEx)
    }

    Object.defineProperties(this, {
      rawMessage: {
        value: message,
        writable: false,
      },
      innerError: {
        value: inner || null,
        writable: false,
      },
      code: {
        value: code,
        writable: false,
      },
      details: {
        value: details || null,
        writable: false,
      },
    })
  }

  withDetails (details) {
    return new ErrorEx({
      code: this.code,
      message: this.rawMessage,
      innerError: this.innerError,
      stackContext: ErrorEx.prototype.withDetails,
      details,
    })
  }

  withMessage (message) {
    return new ErrorEx({
      code: this.code,
      message: message || '',
      innerError: this.innerError,
      stackContext: ErrorEx.prototype.withMessage,
      details: this.details,
    })
  }

  withArgs (args) {
    return new ErrorEx({
      code: this.code,
      message: this.rawMessage,
      innerError: this.innerError,
      stackContext: ErrorEx.prototype.withMessage,
      details: this.details,
      args,
    })
  }

  errorCode () {
    return this.code
  }

  toJSON () {
    return {
      message: this.message,
      code: this.code.toString(),
      details: this.details,
    }
  }
}


module.exports = {
  ErrorEx,
  ErrorCode,
  ErrorDesc,
  Errors,
}
