function isObject(o) {
  return (
    o != null &&
    typeof o === 'object' &&
    Array.isArray(o) === false &&
    Object.prototype.toString.call(o) === '[object Object]'
  );
}

const validators = (exports.validators = {
  '*'() {
    return true;
  },
  array: Array.isArray,
  function: f => typeof f === 'function',
  hash(o) {
    if (isObject(o) === false) {
      return false;
    }
    const ctor = o.constructor;
    if (typeof ctor !== 'function') {
      return false;
    }
    const proto = ctor.prototype;
    if (isObject(proto) === false) return false;

    if (proto.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }
    return true;
  },
  string: s => typeof s === 'string',
  regexp: e => e instanceof RegExp,
  date: e => e instanceof Date,
  boolean: e => e === false || e === true,
  number: e => typeof e === 'number',
  'p-number'(o) {
    return validators.number(o) && o > 0;
  },
  'n-number'(o) {
    return validators.number(o) && o < 0;
  },
  'nn-number'(o) {
    return validators.number(o) && o >= 0;
  },
  'np-number'(o) {
    return validators.number(o) && o <= 0;
  },
  int(o) {
    return o == parseInt(o);
  },
  'n-int'(o) {
    return o == parseInt(o) && o < 0;
  },
  'p-int'(o) {
    return o == parseInt(o) && o > 0;
  },
  'nn-int'(o) {
    return o == parseInt(o) && o >= 0;
  },
  'np-int'(o) {
    return o == parseInt(o) && o <= 0;
  },
});
