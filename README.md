# SwitchCase
SwithcCase is a zero-dependency library that evaluates complex case matching; with features supporting evaluations made by passing expression string(s), value string(s), function(s) as "case(s)" as well as end-of-the-evaluation callback and individual match callbacks(optional). 

<strong>Note on naming in the following doc:</strong> the naming of the library is still tbd. The original library is named as SwitchCase, I later added a wrapper, Match, as an interface to minimalize footprint. Since this is still an early version of the library, I decided to keep the naming option open until it is ready to ship.

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
basic example

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
followings are a list of methods for utilizing SwitchCase

#### .onMatch(expression, value[, callback])
onMatch is similar to "case" in vanilla switch. The expression argument can be either a string of expression or an array of expressions. However since the onMatch is designed to only match one case, only the first expression in the array will be evaluate in this method (see onMatchOR(), onMatchAND for multiple expression).

``` javascript
const Match = require("./index");
const match = new Match();

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

#### .onMatchOR(expressions, value[, callback])
onMatchOR evaluates an array of expressions in each cases. If any of the cases are found true, the method will return and save the value to result to be used later in onEnd.

``` javascript
const Match = require("./index");
const match = new Match();

// onMatchOR only needs to find one truthful statement
match({ home: "home" })
  .onMatchOR(["halla", "hishome"], "case 1 is true")
  .onMatchOR(["home", "skills", "about"], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 2 is true"

// matching multiple variables to expression is also supported by this method
// note that by passing more than one variable to evaluate, simple name-value is not supported
match({ home: "home", name: "71emj" })
  .onMatchOR(["home === 'halla'", "name === 'hishome'"], "case 1 is true")
  .onMatchOR(["home === 'skills'", "name === '71emj'"], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 2 is true"

// the use case of onMatchOR can be extended to mathematical evaluations
match({ num1: 1000, num2: 2000 })
  .onMatchOR(["num1 + 200 > num2", "num1 * 2 < num2"], "case 1 is true")
  .onMatchOR(["num2 * 2 / 15 + 10 * 0 - num1 <= 0", "num1 === num2"], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 2 is true"
```
