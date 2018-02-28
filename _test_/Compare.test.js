import Compare from "../index";

describe("test Compare, a wrapper of SwitchCase", () => {
	let compare;

	beforeAll(() => {
		compare = new Compare();
	});

	test("the new Compare will return an interface wrapper of SwitchCase", () => {
		expect(typeof compare).toBe("function");
	});

	test("Compare can pass in arguments after instanciation", () => {
		compare({ name: "home" })
			.toCase("name === 'home'", "It's true!!")
			.toAllOther("It's false")
			.Ended((debug, result) => expect(result).toBe("It's true!!"));
	});

	test("The Compare wrapper should porvide interface methods to use SwitchCase", () => {
		compare({ name: "home" })
			.toCase("name === 'home'", "It's true")
			.Ended((debug, result) => expect(result).toBe("It's true"));
	});

	test("single name-value pair expression, should automatically interpreted as variable === home with single target", () => {
		const exp = name => typeof name === "string";

		compare({ home: "home" })
			.toCase("myhome", "not true")
			.toCase(exp, "also not true")
			.toCase([ "skill", "home" ], "true") // this won't match
			.toAllOther("nothing here")
			.Ended((debug, result) => expect(result).toBe("also not true"));

		compare({ name: null })
			.toCase("myhome", "not true")
			.toCase("home", "true")
			.toAllOther("nothing here")
			.Ended((debug, result) => {
				debug();
				expect(result).toBe("nothing here");
			});
	});

	test("single name-value pair expression, should also be able to compare OR case", () => {
		compare({ home: "home" })
			.toCaseOR(["halla", "hishome"], "not true")
			.toCaseOR(["home", "skills", "about"], "true")
			.toAllOther("nothing here")
			.Ended((debug, result) =>	expect(result).toBe("true"));
	});

	test("forgot to pass variable or variable in wrong format should throw error", () => {
		const name = "home";
		
		expect(
			compare()
				.toCase("myhome", "not true")
				.Ended((debug, result) => debug())
		).toThrowError("argument cannot be empty");

		expect(
			compare(name)
				.toCase("myhome", "not true")
				.Ended((debug, result) => debug())
		).toThrow("Variable must be an object, or an array of objects");

		const compareer = expect(()=>{
  		throw new Error('1234');
		});
		
		compareer.toThrow(Error);
		compareer.toThrow('1234');
	});

	test("mix expression types: simple, verbose, array, function, in a single chain is supported", () => {
		const exp = num => +num;
		const params = {
			home: "Taiwan",
			city: "Charlotte"
		};

		compare(params)
			.toCase(exp, "it's number")
			.toCaseOR([exp, "city === 'Kaohsiung'"], "still not compare")
			.toCaseAND(["home === 'Taiwan'", "city === 'New York'"], "you'd think but no")
			.toCase((...args) => { return console.log(args) }, "just checking")
			.toCaseAND(["home === 'Taiwan'", "city === 'Charlotte'"], "compareing AND")
			.toCaseOR("home === 'Taiwan'", "well this is as much as I can think of")
			.toAllOther("no compare found")
			.Ended((debug, result) => expect(result).toBe("compareing AND"));
	});

	test("function as expression argument will only take the first property of the target object", () => {
		const exp = num => +num;
		const params = {
			home: "Taiwan",
			city: "Charlotte",
			number: 10
		};
		
		compare(params)
			.toCase(exp, "it's number")
			.toCaseOR([exp, "city === 'Kaohsiung'"], "still not compare")
			.toAllOther("no compare found")
			.Ended((debug, result) => expect(result).toBe("no compare found"));

		// to be able to check all the variables, user must create a loop themselves
		// such function will need to leverage arguments or rest syntax
		const expression = (...args) => {
			for (let i = 0; i < args.length; i++) {
				if (+args[i]) return true;
			}
			return false;
		}

		compare(params)
			.toCase(expression, "it's number")
			.toCaseOR([exp, "city === 'Kaohsiung'"], "still not compare")
			.toAllOther("no compare found")
			.Ended((debug, result) => expect(result).toBe("it's number"));
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
		// thus will automatically compare any async function that comes first
		compare({ num: 10, city: "Tokyo" })
			.toCaseOR([exp2, "city === 'Kaohsiung'"], "still not compare")
			.toCase(exp, "it's number")
			.toCase("num === 10", "check if this is true")
			.toAllOther("no compare found")
			.Ended((debug, result) => expect(result).toBe("still not compare"));
	});

	test("use SwitchCase along with Array methods", () => {
		const array = [ "red", "blue", "yellow", 1, 2, "violet" ];
		const filtering = elem => compare({ elem })
  		.toCaseAND(["!+elem", "elem.length >= 4", elem => elem.match(/o/)], true)
  		.Ended((debug, result) => result);

		const newArray = array.filter(filtering);
		expect(newArray).toEqual(["yellow", "violet"]);
	});

	test("simple expression should support arithmatic evaluation shorhand", () => {
    const num1 = 100;
    const num2 = 200;
		
		compare({ num1 })
			.toCase("<= 15", false)
			.toCase(">= 50", true)
			.toAllOther("wierd should match")
			.Ended((debug, result) => expect(result).toBe(true));

		compare({ num1 })
			.toCase("< 15", false)
			.toCase(">= 50", true)
			.toAllOther("wierd should match")
			.Ended((debug, result) => expect(result).toBe(true));
  });
});

// a good security check is limiting expression to be 
// single expression, i.e. no more than one semi-column
// and add basic regexp check to further filter out dangerous code
// for example no "document", "process", "window" etc.


// naming --> compare, equal, toCase 