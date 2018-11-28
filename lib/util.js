const _ = require('lodash')

const interpolate = (tmpl, ctx) => _.template(tmpl, {})(ctx)

const arrayOrEmpty = arr => _.isArray(arr) ? arr : []

const trimPrefix = (s, prefix) => {
  if (s.startsWith(prefix)) {
    return s.slice(prefix.length)
  }

  return s
}

const fromErrorCoder = v => {
  if (!v) {
    return null
  }

  if (!v.errorCode) {
    return null
  }

  let ec;
  if (_.isFunction(v.errorCode)) {
    ec = v.errorCode()
  } else {
    ec = v.errorCode
  }

  return ec
}

module.exports = {
  trimPrefix,
  fromErrorCoder,
  arrayOrEmpty,
  interpolate,
}
