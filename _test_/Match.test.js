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

		match({ name: "home" })
			.onMatch("myhome", "not true")
			.onMatch(exp, "also not true")
			.onMatch("home", "true")
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
		).toThrowError("Variable must be an object, or an array of objects");
	});
});
