import Match from "../src/Match";

describe("test Match, a wrapper of SwitchCase", () => {
	let match;

	beforeAll(() => {
		match = new Match();
	});

	test("the new Match will return an interface wrapper of SwitchCase", () => {
		expect(typeof match).toBe("function");
	});

	test("Match can pass in arguments after instanciation", () => {
		match({ name: "home" })
			.onMatch("name === 'home'", "It's true!!")
			.otherwise("It's false")
			.onEnd((debug, result) => expect(result).toBe("It's true!!"));
	});

	test("The Match wrapper should porvide interface methods to use SwitchCase", () => {
		match({ name: "home" })
			.onMatch("name === 'home'", "It's true")
			.onEnd((debug, result) => expect(result).toBe("It's true"));
	});

	test("single name-value pair expression, should automatically interpreted as variable === home with single target", () => {
		const exp = name => typeof name === "string";

		match({ home: "home" })
			.onMatch("myhome", "not true")
			.onMatch(exp, "also not true")
			.onMatch([ "skill", "home" ], "true") // this won't match
			.otherwise("nothing here")
			.onEnd((debug, result) => expect(result).toBe("also not true"));

		match({ name: null })
			.onMatch("myhome", "not true")
			.onMatch("home", "true")
			.otherwise("nothing here")
			.onEnd((debug, result) => {
				debug();
				expect(result).toBe("nothing here");
			});
	});

	test("single name-value pair expression, should also be able to match OR case", () => {
		match({ home: "home" })
			.onMatchOR(["halla", "hishome"], "not true")
			.onMatchOR(["home", "skills", "about"], "true")
			.otherwise("nothing here")
			.onEnd((debug, result) =>	expect(result).toBe("true"));
	});

	test("forgot to pass variable or variable in wrong format should throw error", () => {
		const name = "home";
		
		expect(
			match()
				.onMatch("myhome", "not true")
				.onEnd((debug, result) => debug())
		).toThrowError("argument cannot be empty");

		expect(
			match(name)
				.onMatch("myhome", "not true")
				.onEnd((debug, result) => debug())
		).toThrow("Variable must be an object, or an array of objects");

		const matcher = expect(()=>{
  		throw new Error('1234');
		});
		
		matcher.toThrow(Error);
		matcher.toThrow('1234');
	});

	test("mix expression types: simple, verbose, array, function, in a single chain is supported", () => {
		const exp = num => +num;
		const params = {
			home: "Taiwan",
			city: "Charlotte"
		};

		match(params)
			.onMatch(exp, "it's number")
			.onMatchOR([exp, "city === 'Kaohsiung'"], "still not match")
			.onMatchAND(["home === 'Taiwan'", "city === 'New York'"], "you'd think but no")
			.onMatch((...args) => { return console.log(args) }, "just checking")
			.onMatchAND(["home === 'Taiwan'", "city === 'Charlotte'"], "matching AND")
			.onMatchOR("home === 'Taiwan'", "well this is as much as I can think of")
			.otherwise("no match found")
			.onEnd((debug, result) => expect(result).toBe("matching AND"));
	});

	test("function as expression argument will only take the first property of the target object", () => {
		const exp = num => +num;
		const params = {
			home: "Taiwan",
			city: "Charlotte",
			number: 10
		};
		
		match(params)
			.onMatch(exp, "it's number")
			.onMatchOR([exp, "city === 'Kaohsiung'"], "still not match")
			.otherwise("no match found")
			.onEnd((debug, result) => expect(result).toBe("no match found"));

		// to be able to check all the variables, user must create a loop themselves
		// such function will need to leverage arguments or rest syntax
		const expression = (...args) => {
			for (let i = 0; i < args.length; i++) {
				if (+args[i]) return true;
			}
			return false;
		}

		match(params)
			.onMatch(expression, "it's number")
			.onMatchOR([exp, "city === 'Kaohsiung'"], "still not match")
			.otherwise("no match found")
			.onEnd((debug, result) => expect(result).toBe("it's number"));
	});

	test("async/promise cannot be evaluate as normal function", () => {
		const exp = num => {
			return new Promise(resolve => {
				setTimeout(() => {
					console.log("this should be accepted");
					resolve(+num);
				}, 1000);
			})
		}

		const exp2 = num => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log("this should be rejected");
					reject(false)
				}, 1000);
			})
		}

		// since both functions return Promise object
		// the evaluation mthod will see it as true (before the promise is resolved)
		// thus will automatically match any async function that comes first
		match({ num: 10, city: "Tokyo" })
			.onMatchOR([exp2, "city === 'Kaohsiung'"], "still not match")
			.onMatch(exp, "it's number")
			.onMatch("num === 10", "check if this is true")
			.otherwise("no match found")
			.onEnd((debug, result) => expect(result).toBe("still not match"));
	});

	test("use SwitchCase along with Array methods", () => {
		const array = [ "red", "blue", "yellow", 1, 2, "violet" ];
		const filtering = elem => match({ elem })
  		.onMatchAND(["!+elem", "elem.length >= 4", e => e.match(/o/)], true)
  		.onEnd((debug, result) => result);

		const newArray = array.filter(filtering);
		expect(newArray).toEqual(["yellow", "violet"]);
	});
});

// a good security check is limiting expression to be 
// single expression, i.e. no more than one semi-column
// and add basic regexp check to further filter out dangerous code
// for example no "document", "process", "window" etc.