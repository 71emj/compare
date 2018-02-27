# SwitchCase
SwithcCase is a zero-dependency library that evaluates complex case matching. SwitchCase have features supporting evaluations made by passing expression in the form of string(s), array, and function as "case(s)" as well as end-of-evaluation callback and individual match callbacks(optional). 

<strong>Note on naming in the following doc:</strong> the naming of the library is still tbd. The original library is named as SwitchCase, I later added a wrapper, Match, as an interface to minimalize footprint. Since this is still an early version of the library, I decided to keep the naming option open until it is ready to ship.

<strong>Important Note: </strong>security feature will be implement in the next interation, where expression can only be a "single-statment" ie. one-semi-column-only. Multi-statement expressions are suggested to be split into separate expression or be constructed into a custom function

## Features
* Basic name-value matching similar to switch.
* Multiple case matching, supporting || and && operators.
* Allows infinite chaining, with exception of attaching methods to end case method (see onEnd()).
* Basic debug function passed as first argument in end case method (see onEnd()), allowed user to see the parameters passed as matching targes.
* Individual match can take second/third argument as variable/callback/both(in order of value, cb) (see onMatch()).

## Installation
installation via npm or cdn is not currently supported as it is still in development.
For developers interested in the project can download it via git clone.

## Examples
Basic example

``` javascript
const Match = require("./index");
const match = new Match();

match({ name: "home" })
  .onMatch("myhome", "not my home")
  .onMatch("hishome", "not his home")
  .onMatch("home", "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => console.log(result)); // "just home"
``` 

The example above show case a pattern similar to javascript "switch", with the exception that SwitchCase allows user to pass variable as second argument of each cases and write the logic at the end of all evaluations.

vanilla switch in equivalent evaluation:
``` javascript
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


## APIs
Following contents are a list of methods for utilizing SwitchCase

#### onMatch(expression, value[, callback])
onMatch is similar to "case" in vanilla switch. The expression can be either a string or an array. However since the onMatch is designed to match one statment in each case, only the first expression in an array is evaluated in this method (see onMatchOR(), onMatchAND for multiple expression evaluation).

``` javascript
// this is valid
match({ name: "home" })
  .onMatch("home", "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => console.log(result)); // "just home"

// so is this
match({ name: "home" })
  .onMatch([ "home" ], "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => console.log(result)); // "just home"

// this will also work, but only the first expression in the array is evaluated
match({ name: "home" })
  .onMatch([ "home", "name === 'home'" ], "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => console.log(result)); // "just home"

// this will fail
match({ name: "home" })
  .onMatch([ "myhome", "home" ], "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => console.log(result)); // "nothing matched"
```

#### onMatchOR(expressions, value[, callback])
onMatchOR evaluates an array of expression in each cases. If any of the cases are found true, the method will return and save the value to result to be used later in onEnd.

``` javascript
// onMatchOR only needs to find one truthful expression
match({ home: "home" })
  .onMatchOR([ "halla", "hishome" ], "case 1 is true")
  .onMatchOR([ "home", "skills", "about" ], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 2 is true"

// matching multiple variables to expression is also supported by this method
// note that by passing more than one variable to evaluate, simple name-value is not supported
match({ home: "home", name: "71emj" })
  .onMatchOR([ "home === 'halla'", "name === 'hishome'" ], "case 1 is true")
  .onMatchOR([ "home === 'skills'", "name === '71emj'" ], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 2 is true"

// the use case of onMatchOR can be extended to mathematical evaluations
match({ num1: 1000, num2: 2000 })
  .onMatchOR([ "num1 + 200 > num2", "num1 * 2 < num2" ], "case 1 is true")
  .onMatchOR([ "num2 * 2 / 15 + 10 * 0 - num1 <= 0", "num1 === num2" ], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 2 is true"
```

#### onMatchAND(expressions, value[, callback])
onMatchAND is another method that evaluates multiple expression in each cases. Contrary to onMatchOR, every statment in the said case must be truthful in order to flag matched.

``` javascript
// the onMatchAND is especially useful when matching a large amount of cases that needs to be true
match({ num1: 1000, num2: 2000, num3: 3000, num4: 5000 })
  .onMatchAND([ "num1 < num2", "num2 + num1 >= num3", "num3 - num4 + num2 === 0" ], "case 1 is true")
  .onMatchAND([ "num1 * num2 / 1000 >= num3", "num3 + num1 >= num4" ], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 1 is true"

// the above can be break down to an even more concise structure by passing expressions as variables
// this pattern will effectively separate the evaluation process from definition (unlike switch or nested if/else)
const expressions = {
  "one": "num1 < num2",
  "two": "num2 + num1 >= num3",
  "three": "num3 - num4 + num2 === 0",
  "four": "num1 * num2 / 1000 >= num3",
  "five": "num3 + num1 >= num4"
};

match({ num1: 1000, num2: 2000, num3: 3000, num4: 5000 })
  .onMatchAND([ expression.one, expression.two, expression.three ], "case 1 is true")
  .onMatchAND([ expression.four, expression.five ], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 1 is true"
```

#### otherwise(value[, callback])
otherwise is equivalent to default in vanilla switch. Like default in vanilla switch, it's optional but highly suggested as best practice.

``` javascript
match({ home: null })
  .onMatchOR([ "halla", "hishome" ], "not true")
  .onMatchOR([ "home", "skills", "about" ], "true")
  .otherwise("nothing here")
  .onEnd((debug, result) =>	console.log("nothing here"));
```

#### onEnd(callback(debug, result))
onEnd method has two important rolls: debug and process result. In a vanilla switch pattern, logic are nested in each cases so that when the case is true certain action can be taken. However, this pattern also encourages repetition as the code may be doing similar action with slight twist base on evaluation. To reduce repetition, onEnd method provides an interface to only write the logic once at the end of each evaluation chain (if different action needed to be taken in different cases, the optional callback in all three onMatch* methods should be use instead).<br/>
<br/>
In addition an optional return can be used in the callback function, tranforming the evaluation chain into an expression.

``` javascript
// basic
match({ name: "home" })
  .onMatch("myhome", "not my home")
  .onMatch("hishome", "not his home")
  .onMatch("home", "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => console.log(result)); // "just home"

// better
const matchedResult = match({ name: "home" })
  .onMatch("home", "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => result);

console.log(matchedResult); // "just home"

// even better, functional style XD
const evaluation = target => match({ target })
  .onMatch("home", "just home")
  .otherwise("nothing matched")
  .onEnd((debug, result) => result);

console.log(evaluation("home")); // "just home"

// coupled with Array.prototype.filter
const array = [ /* lots of different things */ ];
const filtering = elem => match({ elem })
  .onMatchOR([ "case1", "case2", "case3" ], true)
  .onEnd((debug, result) => result);

const newArray = array.filter(filtering);
```

## Advance Features

### Passing a function as evaluation expression

Considering scenario where you need to evaluate JSON received from a remote API. Since the format and structure is unkown to you, in order to start matching data nested within you need to take several steps to parse it into workable format.

``` javascript

// in normal situation you would do this
request("some url", (err, response, body) => {
  const step1 = /* do something with body */
  const step2 = /* do somethingelse with step1 */
  ....
  const usableData = stepN;
  match({ usableData })
    .onMatchOR([ "case1", "case2", "case3" ], "some value")
    .onMatchOR([ "case4", "case5" ], "other value")
    .otherwise("default value")
    .onEnd((debug, reult) => console.log("what a long journey to get here")) // "what a long journey to get here"
});

// however passing function, can make this process nice again
request("some url", (err, response, body) => {
  const parse = body => /* parsing body */;
  const evaluateTheDataParsed = parsed => /* return boolean */
  const parseAndEvaluate = target => evaluateTheDataParsed( parse(target) );
  match({ body })
    .onMatchOR(parseAndEvaluate, "some value")
    .onMatchOR(parseAndEvaluate_2, "other value")
    .otherwise("default value")
    .onEnd((debug, reult) => console.log("what a long journey to get here")) // much better
});
```

If you wish to use SwitchCase on unknown source this is a preferable pattern, as it gives you more room for security measure.

### Passing callback at each case

Callback can be passed as second argument (replacing value) to all of the matching methods including otherwise. Normally this is not neccessary, as it creates repitition that we all want to avoid...badly. But in scenarios where individual cases require specific action to be done, ex. making Ajax call, setting unique action at specific case becomes valuable. 

``` javascript
const query = location.search().substring(1).match(/(\w+)=(\w+)/);

match({ type: query[1], value: query[2] })
  .onMatchAND([ "type: case1", "value === something" ], "some value is good enough")
  .onMatchAND([ "type: case2", "value === somethingelse" ], "this is good too")
  .onMatchAND([ "type: case3", "value === wellvalue" ], val => { /* oh no, need to fetch data for this */
    const getVal = /* make ajax */
    return getVal;
  })
  .otherwise("nothing matched")
  .onEnd((debug, result) => console.log(result)); // we'll receive matched value as usual
```

As shown in the example above, callback perform a specific action to fetch data unknown to the author and pass it back which can then be used in the same code block. <br/>
<br/>
note the argument, val, passed in the callback is in fact the value stated as second argument if provided.
``` javascript 
.onMatch("case", "hello world", val => {
  console.log(val);
}) // "hello world"
```

### Security

The core functionality of SwitchCase is to evaluate "expression" string(s), doing so requires a custom function to run the "cases". However this is prone to injection attack, such that it is highly recommended to either:
1. Never use it to evaluate unknown source 
2. Use function instead of expression string with custom filter

There are however a few security measure implemented into SwitchCase (currently under development).

* Each expression is limited to a single "statement" (so one semi-column-only)
* An open-close parenthesis in any part of the string are not allowed
* Keywords such as "window", "document", "process" etc. (list can go on) are not allowed
* Each expression has limited length of "tbd" (the idea is, if it's too long better split it up, also prevent endless chaining)
* ...open to more suggestion
