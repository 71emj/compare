# SwitchCase
SwithcCase is a zero-dependency library that evaluates complex case matching; with features supporting evaluations made by passing expression string(s), value string(s), function(s) as "case(s)" as well as end-of-the-evaluation callback and individual match callbacks(optional). 

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

```const Match = require("./index");
   const match = new Match();

   match({ name: "home" })
   	.onMatch("myhome", "not my home")
   	.onMatch("hishome", "not his home")
		.onMatch("home", "just home")
		.otherwise("nothing matched")
		.onEnd((debug, result) => console.log(result)); // "just home"``` 

The example above show case a pattern similar to javascript "switch", with the exception that SwitchCase allows user to pass variable as second argument of each cases and write the logic at the end of all evaluations.

vanilla switch in equivalent evaluation:
```const name = "home";

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
	 }; // "just home"```
it is unnecessary verbose and prone to mistakes such as forgetting "break" at the end of each cases.


## APIs
followings are a list of methods for utilizing SwitchCase

### .onMatch(expression, value, callback)
