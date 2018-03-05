const Compare = require("case-compare");

function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  // initiate comapre and helpers
  const compare = new Compare();
  const equalfunc = equalFunc(new Uint8Array(object), new Uint8Array(other));
  const equal = (arg1, arg2) => arg1 == arg2;

  // a very specific action is performed in the original script,
  // by separating it from the chain, it became a lot easier to read and maintain
  const specificAction = (convert = setToArray) => {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
    if (object.size != other.size && !isPartial) {
      return false;
    }
    // Assume cyclic values are equal.
    var stacked = stack.get(object);
    if (stacked) {
      return stacked == other;
    }
    bitmask |= COMPARE_UNORDERED_FLAG;

    // Recursively compare objects (susceptible to call stack limits).
    stack.set(object, other);
    var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
    stack['delete'](object);
    return result;
  }

  const claims = caseName => {
    "1": [ dataViewTag, equal(object.byteLength, other.byteLength),
      equal(object.byteOffset, other.byteOffset)
    ],
    "2": [ arrayBufferTag, equal(object.byteLength, other.byteLength) ],
    "3": [ boolTag, dateTag, numberTag ],
    "4": [ errorTag, equal(object.name, other.name), equal(object.message, other.message)],
    "5": [ regexpTag, stringTag ],
    "6": [ setTag, mapTag ],
    "7": [ symbolTag ]
  }[caseName];

  return (
    compare({ tag })
      .toCaseAND(claims("1"), equalfunc, testResult => {
        object = object.buffer;
        other = other.buffer;
        return testResult;
      })
      .toCaseAND(claims("2"), equalfunc)
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      .toCaseOR(claims("3"), eq(+object, +other))
      .toCaseAND(claims("4"), true)
      // Coerce regexes to strings and treat strings, primitives and objects, as equal.
      // See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring for more details.
      .toCaseOR(claims("5"), equal(object, other + ''))
      .toCaseOR(claims("6"), equal(tag, mapTag) && mapToArray, specificAction)
      .toCase(claims("7"), symbolValueOf && equal(symbolValueOf.call(object), symbolValueOf.call(other)))
      .toAllOther(false)
      .Ended((debug, result) => result)
  );
}
