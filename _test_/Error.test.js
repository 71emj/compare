import Compare from "../index";
import SwitchCase from "../src/SwitchCase";

describe("test native SwitchCase error handling functions", () => {
	let caseSwitch;

	beforeAll(() => {
		caseSwitch = new SwitchCase();
	});

	test("if setTargets takes in null or types other than object literal, should throw error", () => {
		expect(
			caseSwitch
				.setTargets()
				.match([`name === "skills"`], "It's skills", "SIMPLE")
				.match([`name === "home"`], "It's home", "SIMPLE")
				.end((debug, result) => console.log(result))
		).toThrow(Error);
	});

	it("passing the wrong type of expression, or not passing at all will receive error", () => {
		expect(
			caseSwitch
				.setTargets({ name })
				.match(null, "something cool", "SIMPLE")
		).toThrow(Error);
	});

	test("each expression can only be single statement", () => {
		const name = "home";

		expect(
			caseSwitch
				.setTargets({ name })
				.match(
					`() => { name = document.createElement("i"); name.onblur = "something" }`,
					"something cool",
					"SIMPLE"
				)
				.match("true", "It's something else", "SIMPLE")
				.end((debug, result) => console.log(result))
		).toThrowError("Expression must be single-statement-only");
	});
});

describe("test Compare error handling functions", () => {
	let compare;

	beforeAll(() => {
		compare = new Compare();
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

		const compareer = expect(() => {
			throw new Error("1234");
		});

		compareer.toThrow(Error);
		compareer.toThrow("1234");
	});

	test("using simple expression while passing multiple more than one argument should throw Reference Error", () => {});
});
