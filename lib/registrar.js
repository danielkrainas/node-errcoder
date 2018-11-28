const { ErrorCode, ErrorDesc } = require('./errors')
const { arrayOrEmpty } = require('./util')

class Registrar {
  constructor ({ initCode = 1000, builtinGroup = 'errcoder.api', builtins = true } = {}) {
    Object.assign(this, {
      nextCode: initCode,
      idToDesc: new Map(),
      groupToDesc: new Map(),
      codeToDesc: new Map(),
    })

    if (builtins) {
      this.ErrorCodeUnknown = this.register(builtinGroup, new ErrorDesc({
        value: 'UNKNOWN',
        message: 'unknown error',
        description: 'Generic error used when an error does not have a classification',
        httpStatusCode: 500,
      }))
    }
  }

  register (group, desc) {
    desc.code = new ErrorCode(this.nextCode)
    desc.code.registrar = this
    if (this.idToDesc.has(desc.value)) {
      throw new Error(`error value "${desc.value}" is already registered`)
    }

    if (this.codeToDesc.has(desc.code)) {
      throw new Error(`error code "${desc.code}" is already registered`)
    }

    this.groupToDesc.set(group, arrayOrEmpty(this.groupToDesc.get(group)).concat(desc))
    this.codeToDesc.set(desc.code._code, desc)
    this.idToDesc.set(desc.value, desc)
    this.nextCode++

    return desc.code
  }

  codeFromString (s) {
    let desc;
    if (this.idToDesc.has(s)) {
      desc = this.idToDesc.get(s)
    } else {
      desc = this.ErrorCodeUnknown.descriptor()
    }

    return desc.code
  }
}

module.exports = {
  Registrar,
}
