const Compare = require("case-compare");

function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  // initiate comapre and helpers
  const compare = new Compare();
  const equalfunc = equalFunc(new Uint8Array(object), new Uint8Array(other));
  const equal = (arg1, arg2) => arg1 == arg2;

  // setTag is the function passed when tag === setTag
  const setTag = mapToArray => {
    const isPartial = bitmask & COMPARE_PARTIAL_FLAG;
    const convert = mapToArray || setToArray;
    if (object.size != other.size && !isPartial) {
      return false;
    }
    // Assume cyclic values are equal.
    let stacked = stack.get(object);
    if (stacked) {
      return stacked == other;
    }
    bitmask |= COMPARE_UNORDERED_FLAG;

    // Recursively compare objects (susceptible to call stack limits).
    stack.set(object, other);
    const result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
    stack['delete'](object);
    return result;
  }

  // this is all the cases that can be easily matched with Compare
  const cases = caseName => ({
    "1": [ dataViewTag, equal(object.byteLength, other.byteLength),
      equal(object.byteOffset, other.byteOffset)
    ],
    "2": [ arrayBufferTag, equal(object.byteLength, other.byteLength) ],
    "3": [ boolTag, dateTag, numberTag ],
    "4": [ errorTag, equal(object.name, other.name), equal(object.message, other.message)],
    "5": [ regexpTag, stringTag ],
    "6": [ setTag, mapTag ],
    "7": [ symbolTag ]
  }[caseName]);

  return (
    // now if there is no bug in this chain of evaluaion
    // we no longer have to worry about it in the future, changes can be made in the code above
    compare({ tag })
      .toCaseAND(cases("1"), () => {
        object = object.buffer;
        other = other.buffer;
        return equalfunc;
      })
      .toCaseAND(cases("2"), equalfunc)
      .toCaseOR(cases("3"), eq(+object, +other))
      .toCaseAND(cases("4"), true)
      .toCaseOR(cases("5"), equal(object, other + ''))
      .toCaseOR(cases("6"), equal(tag, mapTag) && mapToArray, setTag)
      .toCase(cases("7"), symbolValueOf && equal(symbolValueOf.call(object), symbolValueOf.call(other)))
      .toAllOther(false)
      .Ended((debug, result) => result)
  );
}
