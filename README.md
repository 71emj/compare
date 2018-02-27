# SwitchCase
SwithcCase is a zero-dependency library that evaluates complex case matching. SwitchCase have features supporting evaluations made by passing statement in the form of string(s), array, and function as "case(s)" as well as end-of-the-evaluation callback and individual match callbacks(optional). 

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

#### onMatch(statement, value[, callback])
onMatch is similar to "case" in vanilla switch. The statement can be either a string or an array. However since the onMatch is designed to match one statment in each case, only the first statement in an array is evaluated in this method (see onMatchOR(), onMatchAND for multiple statement evaluation).

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

// this will also work, but only the first statement in the array is evaluated
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

#### onMatchOR(statements, value[, callback])
onMatchOR evaluates an array of statement in each cases. If any of the cases are found true, the method will return and save the value to result to be used later in onEnd.

``` javascript
// onMatchOR only needs to find one truthful statement
match({ home: "home" })
  .onMatchOR(["halla", "hishome"], "case 1 is true")
  .onMatchOR(["home", "skills", "about"], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 2 is true"

// matching multiple variables to statement is also supported by this method
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

#### onMatchAND(statements, value[, callback])
onMatchAND is another method that evaluates multiple statement in each cases. Contrary to onMatchOR, every statment in the said case must be truthful in order to flag matched.

``` javascript
// the onMatchAND is especially useful when matching a large amount of cases that needs to be true
match({ num1: 1000, num2: 2000, num3: 3000, num4: 5000 })
  .onMatchAND(["num1 < num2", "num2 + num1 >= num3", "num3 - num4 + num2 === 0"], "case 1 is true")
  .onMatchAND(["num1 * num2 / 1000 >= num3", "num3 + num1 >= num4"], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 1 is true"

// the above can be break down to an even more concise structure by passing statements as variables
// this pattern will effectively separate the evaluation process from definition (unlike switch or nested if/else)
const statements = {
	"one": "num1 < num2",
	"two": "num2 + num1 >= num3",
	"three": "num3 - num4 + num2 === 0",
	"four": "num1 * num2 / 1000 >= num3",
	"five": "num3 + num1 >= num4"
};

match({ num1: 1000, num2: 2000, num3: 3000, num4: 5000 })
  .onMatchAND([statement.one, statement.two, statement.three], "case 1 is true")
  .onMatchAND([statement.four, statement.five], "case 2 is true")
  .otherwise("nothing here")
  .onEnd((debug, result) => console.log(result)); // "case 1 is true"
```

#### otherwise(value[, callback])
otherwise is equivalent to default in vanilla switch. Like default in vanilla switch, it's optional but highly suggested as best practice.

``` javascript
match({ home: null })
  .onMatchOR(["halla", "hishome"], "not true")
  .onMatchOR(["home", "skills", "about"], "true")
  .otherwise("nothing here")
  .onEnd((debug, result) =>	console.log("nothing here"));
```

#### onEnd(callback(debug, result))
onEnd method has two important rolls: debug and process result. In a vanilla switch pattern, logic are nested in each cases so that when the case is true certain action can be taken. However, this pattern also encourages repetition as the code may be doing similar action with slight twist base on evaluation. To reduce repetition, onEnd method provides an interface to only write the logic once at the end of each evaluation chain (if different action needed to be taken in different cases, the optional callback in all three onMatch* methods should be use instead), in addition to receiving matched case result in callback, optional return can tranform the evaluation chain into an statement.

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
  .onMatchOR([ "case1", "case2", "case3"], true)
  .onEnd((debug, result) => result);

const newArray = array.filter(filtering);
```

## Advanced Usage
