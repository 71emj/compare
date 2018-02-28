# Compare/Case-Compare

[![npm version](https://badge.fury.io/js/case-compare.svg)](https://badge.fury.io/js/case-compare)

Compare is a zero-dependency library that evaluates complex case matching. Compare have features supporting evaluations made by passing expression in the form of string(s), array, and function as "case(s)" as well as end-of-evaluation callback and individual case callbacks(optional). 

<strong>note on naming: </strong>naming is pretty much settled at this point, minor changes might applied to method names but should stay consistent to current naming pattern. 

## Features
* Basic name-value matching similar to switch.
* Multiple case matching, supporting || and && operators.
* Allows infinite chaining, with exception of attaching methods to end case method see [Ended()](#compareendedcallbackdebug-result).
* Basic debug function passed as first argument in end case method (see [Ended()](#compareendedcallbackdebug-result)), allowed user to see the parameters passed as matching targes.
* Individual case can take second/third argument as variable/callback/both see [toCase()](#comparetocaseorexpressions-value-callback).

## Installation
Installation via npm
``` bash
npm install --save case-compare
```

## Examples
Basic example

``` js
const Compare = require("case-compare");
const compare = new Compare();

compare({ name: "home" })
  .toCase("myhome", "not my home")
  .toCase("hishome", "not his home")
  .toCase("home", "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // "just home"
``` 

The example above show case a pattern similar to javascript "switch", with the exception that Compare allows user to pass variable as second argument of each cases and write the logic at the end of all evaluations.

vanilla switch in equivalent evaluation:
``` js
const name = "home";

switch(name) {
  case "myhome":
    console.log("not my home");
    break;
  case "hishome":
    console.log("not his home");
    break;
  case "home":
    console.log("just home");
    break;
  default: 
    console.log("nothing matched");
}; // "just home"
```
it is unnecessary verbose and prone to mistakes such as forgetting "break" at the end of each cases.

## List of Functions

| Function | Description |
|:--- |:--- | 
| [toCase()](#comparetocaseorexpressions-value-callback) | toCase matches variables to expression specified as first argument of the function. |
| [toCaseOR()](#comparetocaseorexpressions-value-callback) | toCaseOR matches variables to an array of expressions and match if any of the expressions is truthful |
| [toCaseAND()](#comparetocaseandexpressions-value-callback) | toCaseAND is similar to toCaseOR, but will only match if all expressions are truthful |
| [toAllOther](#comparetoallothervalue-callback) | toAllOther is an equivalent method to default in switch |
| [Ended()](#compareendedcallbackdebug-result) | Ended breaks out the evaulation chain and takes a callback to perform action on matched cases |

## APIs
Following contents are a list of methods for utilizing Compare

### Compare.toCase(expression[, value[, callback]])
toCase is similar to "case" in vanilla switch. The expression can be either a string or an array. However since the toCase is designed to match one statment in each case, only the first expression in an array is evaluated in this method (see [toCaseOR()](#comparetocaseorexpressions-value-callback), [toCaseAND()](#comparetocaseandexpressions-value-callback) for multiple expression evaluation).

``` js
// this is valid
compare({ name: "home" })
  .toCase("home", "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // "just home"

// so is this
compare({ name: "home" })
  .toCase([ "home" ], "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // "just home"

// this will also work, but only the first expression in the array is evaluated
compare({ name: "home" })
  .toCase([ "home", "name === 'home'" ], "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // "just home"

// this will fail
compare({ name: "home" })
  .toCase([ "myhome", "home" ], "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // "nothing matched"
```

### Compare.toCaseOR(expressions[, value[, callback]])
toCaseOR evaluates an array of expression in each cases. If any of the cases are found true, the method will return and save the value to result to be used later in Ended.

``` js
// toCaseOR only needs to find one truthful expression
compare({ home: "home" })
  .toCaseOR([ "halla", "hishome" ], "case 1 is true")
  .toCaseOR([ "home", "skills", "about" ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 2 is true"

// matching multiple variables to expression is also supported by this method
// note that by passing more than one variable to evaluate, simple name-value is not supported
compare({ home: "home", name: "71emj" })
  .toCaseOR([ "home === 'halla'", "name === 'hishome'" ], "case 1 is true")
  .toCaseOR([ "home === 'skills'", "name === '71emj'" ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 2 is true"

// the use case of toCaseOR can be extended to mathematical evaluations
compare({ num1: 1000, num2: 2000 })
  .toCaseOR([ "num1 + 200 > num2", "num1 * 2 < num2" ], "case 1 is true")
  .toCaseOR([ "num2 * 2 / 15 + 10 * 0 - num1 <= 0", "num1 === num2" ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 2 is true"
```

### Compare.toCaseAND(expressions[, value[, callback]])
toCaseAND is another method that evaluates multiple expression in each cases. Contrary to toCaseOR, every statment in the said case must be truthful in order to flag matched.

``` js
// the toCaseAND is especially useful when matching a large amount of cases that needs to be true
compare({ num1: 1000, num2: 2000, num3: 3000, num4: 5000 })
  .toCaseAND([ "num1 < num2", "num2 + num1 >= num3", "num3 - num4 + num2 === 0" ], "case 1 is true")
  .toCaseAND([ "num1 * num2 / 1000 >= num3", "num3 + num1 >= num4" ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 1 is true"

// the above can be break down to an even more concise structure by passing expressions as variables
// this pattern will effectively separate the evaluation process from definition (unlike switch or nested if/else)
const expressions = {
  "one": "num1 < num2",
  "two": "num2 + num1 >= num3",
  "three": "num3 - num4 + num2 === 0",
  "four": "num1 * num2 / 1000 >= num3",
  "five": "num3 + num1 >= num4"
};

compare({ num1: 1000, num2: 2000, num3: 3000, num4: 5000 })
  .toCaseAND([ expression.one, expression.two, expression.three ], "case 1 is true")
  .toCaseAND([ expression.four, expression.five ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 1 is true"
```

### Compare.toAllOther(value[, callback])
toAllOther is equivalent to default in vanilla switch. Like default in vanilla switch, it's optional but highly suggested as best practice.

``` js
compare({ home: null })
  .toCaseOR([ "halla", "hishome" ], "not true")
  .toCaseOR([ "home", "skills", "about" ], "true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log("nothing here"));
```

### Compare.Ended(callback(debug, result))
Ended method has two important rolls: debug and process result. In a vanilla switch pattern, logic are nested in each cases so that when the case is true certain action can be taken. However, this pattern also encourages repetition as the code may be doing similar action with slight twist base on evaluation. To reduce repetition, Ended method provides an interface to only write the logic once at the end of each evaluation chain (if different action needed to be taken in different cases, the optional callback in all three toCase* methods should be use instead).<br/>
<br/>
In addition an optional return can be used in the callback function, tranforming the evaluation chain into an expression.

``` js
// basic
compare({ name: "home" })
  .toCase("myhome", "not my home")
  .toCase("hishome", "not his home")
  .toCase("home", "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // "just home"

// better
const matchedResult = compare({ name: "home" })
  .toCase("home", "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => result);

console.log(matchedResult); // "just home"

// even better, functional style XD
const evaluation = target => compare({ target })
  .toCase("home", "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => result);

console.log(evaluation("home")); // "just home"

// coupled with Array.prototype.filter
const array = [ /* lots of different things */ ];
const filtering = elem => compare({ elem })
  .toCaseOR([ "case1", "case2", "case3" ], true)
  .Ended((debug, result) => result);

const newArray = array.filter(filtering);
```

## Advance Features

### Passing a function as expression

Considering scenario where you need to evaluate JSON received from a remote API. Since the format and structure is unkown to you, in order to start matching data nested within you need to take several steps to parse it into workable format.

``` js

// in normal situation you would do this
request("some url", (err, response, body) => {
  const step1 = /* do something with body */
  const step2 = /* do somethingelse with step1 */
  ....
  const usableData = stepN;
  compare({ usableData })
    .toCaseOR([ "case1", "case2", "case3" ], "some value")
    .toCaseOR([ "case4", "case5" ], "other value")
    .toAllOther("default value")
    .Ended((debug, reult) => console.log("what a long journey to get here")) // "what a long journey to get here"
});

// however passing function, can make this process nice again
request("some url", (err, response, body) => {
  const parse = body => /* parsing body */;
  const evaluateTheDataParsed = parsed => /* return boolean */
  const parseAndEvaluate = target => evaluateTheDataParsed( parse(target) );
  compare({ body })
    .toCaseOR(parseAndEvaluate, "some value")
    .toCaseOR(parseAndEvaluate_2, "other value")
    .toAllOther("default value")
    .Ended((debug, reult) => console.log("much better")) // much better
});
```

If you wish to use Compare on unknown source this is a preferable pattern, as it gives you more room for security measure.

<strong>note: </strong>when using the function-as-evaluation pattern, in order to access all/specific variable(s) the function will have to use either:
1. arguments object
2. rest syntax

``` js
const dataObj = {
  data1: "something",
  data2: "anotherthing",
  data3: "somethingelse"
};

const processData = (...data) => {
  const [ data1, data2, data3 ] = data;
  return console.log({ data1, data2, data3 });
};

compare(dataObj)
  .toCase(processData, "something")
  .toAllOther("nothing")
  .Ended((debug, result) => console.log(result)) // { data1, data2, data3 }; "something"
```

The order of the variable is in the same as the order you passed into Compare.

### Passing callback at end of a case

Callback can be passed as second argument (replacing value) to all of the matching methods including toAllOther. Normally this is not neccessary, as it creates repitition that we all want to avoid...badly. But in scenarios where individual cases require specific action to be done, ex. making Ajax call, setting unique action at specific case becomes valuable. 

``` js
const query = location.search().substring(1).match(/(\w+)=(\w+)/);

compare({ type: query[1], value: query[2] })
  .toCaseAND([ "type: case1", "value === something" ], "some value is good enough")
  .toCaseAND([ "type: case2", "value === somethingelse" ], "this is good too")
  .toCaseAND([ "type: case3", "value === wellvalue" ], val => { /* oh no, need to fetch data for this */
    const getVal = /* make ajax */
    return getVal;
  })
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // we'll receive matched value as usual
```

As shown in the example above, callback perform a specific action to fetch data unknown to the author and pass it back which can then be used in the same code block. <br/>
<br/>
note the argument, val, passed in the callback is in fact the value stated as second argument if provided.
``` js 
.toCase("case", "hello world", val => {
  console.log(val);
}) // "hello world"
```

### Security

The core functionality of Compare is to evaluate "expression string(s)", doing so requires a custom function to run the "cases". However this is prone to injection attack, such that it is highly recommended to either:
1. Never use it to evaluate unknown source 
2. Use function instead of expression string with custom filter

There are however a few security measures implemented into Compare.

* Each expression is limited to a single "statement" (so one-semi-column-only)
* An open-close parenthesis in any part of the string are not allowed
* Keywords such as "window", "document", "process" etc. (list can go on) are not allowed
* Each expression has limited length default to 50 characters (the idea is, if it's too long better split it up, also prevent endless chaining)
* ...open to more suggestion

Custom rules regarding keywords and word length screening can be passed as config object when importing Compare into your project.
``` js
const Compare = require("case-compare");
const rules = { limit: 50, keywords: ["document", "window", "process"] }; // the value here are set in default, you can custom the rules to your preference
const compare = new Compare(rules);
const win = window;

compare({ win })
  .toCase("win === window", "correct")
  .toAllOther("wrong")
  .Ended((debug, result) => console.log(result)) // Error: individual expression must not...
```
Since the expression contains keyword "window", the screening process will deemed invalid and throw an Error. In scenario where you want to match the literal word "window", a safe way to do it without compromising security is to pass a function or a "simple expression".
``` js
const rules = { keywords: ["document", "process"] };
const compare = new Compare(rules);
const win = "window";

// when passing simple expression Compare will interpreted as literal string and escape it with quotes
// making it safe to evaluate the expressions like this. 
compare({ win })
  .toCase("window", "correct")
  .toAllOther("wrong")
  .Ended((debug, result) => console.log(result)); // correct
```

## License
MIT
