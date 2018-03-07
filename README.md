# Compare/Case-Compare

[![npm version](https://badge.fury.io/js/case-compare.svg)](https://badge.fury.io/js/case-compare)

Compare is a zero-dependency library that evaluates complex case matching. Compare have features supporting evaluations made by passing expression in the form of string, array, and function as "case(s)" as well as end-of-evaluation callback and optional callback in individual cases.

<strong>patch note 1.3.0 - 1.3.6</strong>
* Debug now display all evaluated cases, see [debug](#debug).
* Support Boolean as expression, see [Mixing Type](#mixing-expression-type).
* Interface now a closure instead of child class to SwitchCase.
* Bug fix on Compare not throwing error when using simple expression with multiple targets.
* Bug fix on uncaught error caused by passing non-object variable wrapped in an array.

<strong>friendly note: </strong>this is still an early version of the library, it is highly recommended not to use it in a production environment. If you like the idea behind this library, please help making it better.

## Installation
Installation can be done via npm
```bash
npm install --save case-compare
```
or yarn
```bash
yarn add case-compare
```

## Why should I give up switch? (or if/else)
Before we start discussing why switch in general is a bad pattern, let's look at some example code:
```js
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
To perform a simple name-value matching switch creates a giant code block filled with repetition that pretty much does the same thing; which not only does it waste your time whenever you tried to update a part of your logic, it causes the code base to have difficulty scaling and debugging as your project grows in size.

To solve this, an alternative would be using object literal:
```js
const name = "home";
const matchingCase = {
  myhome: "not my home",
  hishome: "not his home",
  home: "just home"
};
console.log(matchingCase[name] || "nothing matched"); // "just home"
```
This is a much better pattern in two important aspects:
1. It's DRY
2. It separates the part that does the evaluation and the part that does your awesome logic apart; meaning that you only have to update on at a time making it easier to scale and debug, which is super awesome.

Unfortunately this pattern falls short when we start using it to evaluate a longer, more complex expression such as x < y + 100 / z % 5. Normally this type of evaluation would be done using cleverly designed if/else statement; however as your evaluation grows in size so is the difficulty of modifying that chunk of code is, pretty soon you'll be facing a giant pile of goo that's sitting around in your otherwise nice beautiful house that no one wants to touch.

## Example
Basic example

```js
const Compare = require("case-compare");
const compare = new Compare();

compare({ name: "home" })
  .toCase("myhome", "not my home")
  .toCase("hishome", "not his home")
  .toCase("home", "just home")
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // "just home"
```
With Compare you can simply pass whatever variable(s) you wish to evaluate in the form of an object property (or if needed an array of objects). The variable (now a property of an object) will be evaluated against every expression(s) stated in each case, and once a match is found Compare will deliver the value associated with the case back to you.

## Features
* Basic name-value matching similar to switch.
* Multiple case matching, supporting || and && operators.
* Supports a variety of expression-type including, Boolean, Number, String, and Function. see [Mixing Type](#mixing-expression-type)
* Allows infinite chaining, with exception of attaching methods to end case method, see [Ended](#compareendedcallbackdebug-result).
* Basic debug function passed as first argument in end case method (see [Ended](#compareendedcallbackdebug-result)), allowed user to see the parameters passed as matching targets.
* Individual case can take second/third argument as variable/callback/both, see [toCase](#comparetocaseexpression-value-callback).

## List of Functions

| Function | Description |
|:--- |:--- |
| [toCase](#comparetocaseexpression-value-callback) | toCase matches variables to expression specified as first argument of the function. |
| [toCaseOR](#comparetocaseorexpressions-value-callback) | toCaseOR matches variables to an array of expressions and match if any of the expressions is truthful |
| [toCaseAND](#comparetocaseandexpressions-value-callback) | toCaseAND is similar to toCaseOR, but will only match if all expressions are truthful |
| [toAllOther](#comparetoallothervalue-callback) | toAllOther is an equivalent method to default in switch |
| [Ended](#compareendedcallbackdebug-result) | Ended breaks out the evaluation chain and takes a callback to perform action on matched cases |

## APIs
Following contents are a list of methods for utilizing Compare

### Compare.toCase(expression[, value[, callback]])
toCase is similar to "case" in vanilla switch. The expression can be either a string or an array. However since the toCase is designed to match one statement in each case, only the first expression in an array is evaluated in this method (see [toCaseOR](#comparetocaseorexpressions-value-callback), [toCaseAND](#comparetocaseandexpressions-value-callback) for multiple expression evaluation).

<strong>note: </strong>since v1.2.0 toCase will dynamically adjust it's function base on the argument type, passing an array will have the method calls for evaluation on multiple expressions (toCaseOR).
```js
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
```

### Compare.toCaseOR(expressions[, value[, callback]])
toCaseOR evaluates an array of expression in each cases. If any of the cases are found true, the method will return and save the value to result to be used later in Ended.

```js
// toCaseOR only needs to find one truthful expression
compare({ home: "home" })
  .toCaseOR([ "halla", "hishome" ], "case 1 is true")
  .toCaseOR([ "home", "skills", "about" ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 2 is true"

// matching multiple variables to expression is also supported by this method
// note that by passing more than one variable to evaluate, simple expression is not supported.
// The use case of toCaseOR can be extended to arithmetic evaluations
compare({ num1: 1000, num2: 2000 })
  .toCaseOR([ "num1 + 200 > num2", "num1 * 2 < num2" ], "case 1 is true")
  .toCaseOR([ "num2 * 2 / 15 + 10 * 0 - num1 <= 0", "num1 === num2" ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 2 is true"
```

### Compare.toCaseAND(expressions[, value[, callback]])
toCaseAND is another method that evaluates multiple expression in each cases. Contrary to toCaseOR, every statement in the said case must be truthful in order to flag matched.

```js
// the toCaseAND is especially useful when matching a large amount of cases that needs to be true
compare({ num1: 1000, num2: 2000, num3: 3000, num4: 5000 })
  .toCaseAND([ "num1 < num2", "num2 + num1 >= num3", "num3 - num4 + num2 === 0" ], "case 1 is true")
  .toCaseAND([ "num1 * num2 / 1000 >= num3", "num3 + num1 >= num4" ], "case 2 is true")
  .toAllOther("nothing here")
  .Ended((debug, result) => console.log(result)); // "case 1 is true"

// the above can be broken down to an even more concise structure by passing expressions as variables
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
toAllOther is a match all method, it is optional since for most cases Compare uses [Ended](#compare-ended-callback-debug-result) method to provide "default" functionality. However, when user don't required a specific needs for return value (or logic-in-one-place) toAllOther is a way to provide information.

```js
// In most cases compare uses Ended to perform a function that process data received from individual matched cases
// However, there are situation where this may not applied since the functions required are largely differentiate from
// each matched cases. toAllOther is a good way to invoke a catch-all function (say display nothing found to user) in these scenario.
compare({ home: "some value" })
  .toCaseOR([ "halla", "hishome" ], fetchAPIFromSourceA)
  .toCaseOR([ "home", "skills", "about" ], fetchAPIFromSourceB)
  .toCase("portfolio", fetchAPIFromSourceC)
  .toAllOther("nothing matched", doSomethingAboutIt);
```
toAllOther is also a good way to explicitly setup a default value for Ended to process (not necessary, but it provides clarity to code).

### Compare.Ended(callback(debug, result))
Ended method has two important rolls: debug and process result. In a vanilla switch pattern, logic are nested in each cases so that when the case is true certain action can be taken.

However, this pattern also encourages repetition as the code may be doing similar action with slight twist base on evaluation. To reduce repetition, Ended method provides an interface to only write the logic once at the end of each evaluation chain (if different action needed to be taken in different cases, the optional callback in all three toCase methods should be use instead).

In addition an optional return can be used in the callback function, transforming the evaluation chain into an expression.

```js
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

#### debug
<strong>1.3.0+ </strong>Compare will record every cases that has been inspected and pass it back with debug. User can invoke debug() to see how each expression is matched (pass/fail).

Consider having a chain of comparison and the result is not what you expected. You now invoke debug in Ended:
```js
const num = 100;

compare({ num })
  .toCase("<= 15", false)
  .toCase(">= 50", true)
  .Ended((debug, result) => {
    debug();
    expect(result).toBe(false); // obviously, I was wrong :P
  }); // don't worry, debug to the rescue XD
```
In console you'll see something like this...
```
{ targets: { targets: { num: 100 }, args: [ 'num' ], vals: [ 100 ] },
  cases:
    [ Map { 'fail' => 'num <= " 15"' },
      Map { 'pass' => 'num >= " 50"' } ] } // duh, num should be larger than 15
```
Now you see what went wrong :)

## Advance Features

### Passing function as expression
Considering scenario where you need to evaluate JSON received from a remote API. Since the format and structure is unknown to you, in order to start matching data nested within you need to take several steps to parse it into workable format. Passing function to as evaluation strategy can be a good way to do it:

```js
// in normal situation you would do this
request("some url", (err, response, body) => {
  const step1 = /* do something with body */
  const step2 = /* do something else with step1 */
  ....
  const usableData = stepN;

  compare({ usableData })
    .toCaseOR([ "case1", "case2", "case3" ], "some value")
    .toCaseOR([ "case4", "case5" ], "other value")
    .toAllOther("default value")
    .Ended((debug, result) => console.log("what a long journey to get here")) // "what a long journey to get here"
});

// however passing function, can make this process nice again
request("some url", (err, response, body) => {
  const parse = body => /* parsing body */;
  const evaluateTheDataParsed = parsed => /* return boolean */
  const parseAndEvaluate = ({ body }) => evaluateTheDataParsed( parse(body) );

  compare({ body })
    .toCaseOR(parseAndEvaluate, "some value")
    .toCaseOR(parseAndEvaluate_2, "other value")
    .toAllOther("default value")
    .Ended((debug, result) => console.log("much better")) // much better
});
```
In the above example user can create a function that parse the data received from an API and perform an evaluation base on it's usage. This way you can modularize your code easily without wasting your time writing repetitive code whenever you need to iterate.

<strong>note: </strong> for security reason it is important to note that using a custom function to evaluate data received from unknown source is a much safer pattern, you should not rely on the native security features to guard your application.

Custom callback will receive an object containing all the variables you passed for evaluation. Using object destructuring user can easily target the variable they wish to use inside the function.
```js
const dataObj = {
  data1: "something",
  data2: "anotherthing",
  data3: "somethingelse"
};

const processData = ({ data1, data2, data3 }) => {
  return console.log({ data1, data2, data3 });
};

compare(dataObj)
  .toCase(processData, "something")
  .toAllOther("nothing")
  .Ended((debug, result) => console.log(result)) // { data1, data2, data3 }; "something"
```

### Passing callback at end of a case
Callback can be passed as second argument (or third argument if value have been given) to matching methods. Generally you would want to avoid doing this, as it creates repetition. However in situation where individual cases require specific action to be done, ex. making an Ajax call, setting unique action at specific case becomes valuable.

```js
const query = location.search().substring(1).match(/(\w+)=(\w+)/);

compare({ type: query[1], value: query[2] })
  .toCaseAND([ "type: case1", "value === something" ], "some value is good enough")
  .toCaseAND([ "type: case2", "value === somethingelse" ], "this is good too")
  .toCaseAND([ "type: case3", "value === wellvalue" ], val => { /* oh no, need to fetch data for this */
    const getVal = /* make ajax */
    return getVal;
  })
  .toAllOther("nothing matched")
  .Ended((debug, result) => console.log(result)); // if matched, getVal
```
As shown in the example above, callback perform a specific action to fetch data from a remote API when case3 is matched. Returning the value in the callback will save it as result, which can later received by Ended.

### Mixing expression type
Compare supports a variety of types when it comes to evaluating expression, Boolean, Number, String, and Function. Each of the supported type are designed to use in different scenario to minimize repetition in your code. To leverage the most out of this philosophy we can use simple expression with mix-type evaluation.

considering having to transform a statement like this:
```js
const name = [ "Bruce", "Wayne", "71emj" ][Math.floor(Math.random() * 3)];

switch(name) {
  case "Bruce":
    if (something.else !== others) {
      return false;
    }
    return true;
  case "Wayne":
    if (thisthing === thatthing) {
      return true;
    }
    return false;
  case "71emj":
    ....
  default:
    console.log("well it this is the end");
}
```
If we're only using single-type expression, we really didn't do ourselves a favor.
```js
// With single-type "string" expression
compare({ name, something, others, thisThing, thatThing })
  .toCaseAND(["name === 'Bruce'", "something.else === others"], true)
  .toCaseAND(["name === 'Wayne'", "thisThing === thatThing"], true)
  .toCaseAND(["name === '71emj'", ...], true)
  .toAllOther(false)
  .Ended(...); // even for such short snippets, it's getting a lot bigger than it should be
```
It's pretty ugly. However with mixed-type expression, we can make it pretty again.
```js
// once identified the most common match, this case the value of the variable name, we can create a simple expression to perform rest of the test.
// With this philosophy in mind, you can easily modularize your code to remove repetition,
// the process can take on as many iteration as possible until you are left with a very specific case matching, in which case you'll just have to write a custom expression to match that.
const equal = (arg1, arg2) => arg1 === arg2;
compare({ name })
  .toCaseAND(["Bruce", equal(somthing.else, others)], true)
  .toCaseAND(["Wayne", equal(thisThing, thatThing)], true)
  .toCaseAND(["71emj", ...], true)
  .toAllOther(false)
  .Ended(...); // now it's readable again
```
With mix-type we can easily choose our methods based on the complexity of the evaluation without directly impact the complexity of the chain, [see example](examples/) of how I use Compare to refactor a helper function in [lodash](#https://github.com/lodash/lodash) (great library btw).

### Security

The core functionality of Compare is to evaluate "expression string(s)", doing so requires a custom function to run the "cases". However this is prone to injection attack, such that it is highly recommended to either:
1. Never use it to evaluate unknown source
2. Use function instead of expression string with custom filter

There are however a few security measures implemented into Compare.

* Each expression is limited to a single "statement".
* Function-like expression, object are not allowed in a string expression.
* Keywords such as "window", "document", "process" etc. (list can go on) are not allowed in a string expression.
* Each expression has limited length default to 50 characters.

Custom rules regarding keywords and word length screening can be passed as a config object when importing Compare into your project.
```js
const Compare = require("case-compare");
const rules = { limit: 50, keywords: ["document", "window", "process"] }; // the value here are set in default, you can custom the rules to your preference
const compare = new Compare(rules);
const win = window;

compare({ win })
  .toCase("win === window", "correct")
  .toAllOther("wrong")
  .Ended((debug, result) => console.log(result)) // Error: individual expression must not...
```
Since the expression contains keyword "window", the screening process will deemed invalid and throw an Error. In scenario where you wish to match the literal word "window", a safe way to do is to pass a custom function to perform evaluation or as "simple expression".
```js
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
(MIT)
