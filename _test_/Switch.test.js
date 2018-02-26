import SwitchCase from "../src/Switch";

describe("test native methods of SwitchCase", () => {
  let caseSwitch;

  beforeAll(() => {
    caseSwitch = new SwitchCase();
  });

  test("static, single input/value should return bool", () => {
    caseSwitch
      .setMatchingTargets({ name: "skills" })
      .findMatch([`name === "skills"`], "It's skills", null, "SIMPLE")
      .findMatch([`name === "home"`], "It's home", null, "SIMPLE")
			.onEnd((debug, vals) => expect(vals).toBe("It's skills"));
  });

  test("setting string instead of array as condition in simple match should be valid", () => {
    caseSwitch
      .setMatchingTargets({ name: "skills" })
      .findMatch(`name === "skills"`, "It's skills", null, "SIMPLE")
			.onEnd((debug, vals) => expect(vals).toBe("It's skills"));
  });

  test("if setMatchingTargets takes in null or types other than object literal, should throw error", () => {
    caseSwitch
      .setMatchingTargets()
      .findMatch([`name === "skills"`], "It's skills", null, "SIMPLE")
      .findMatch([`name === "home"`], "It's home", null, "SIMPLE")
			.onEnd((debug, vals) => expect(vals).toBe(null));
  });

  test("if input name is the same as the literal condition name, if value matched should return true", () => {
    caseSwitch
      .setMatchingTargets({ home: "home" })
      .findMatch([`home === "skills"`], "It's skills", null, "SIMPLE")
      .findMatch([`home === "home"`], "It's home", null, "SIMPLE")
			.onEnd((debug, vals) => expect(vals).toBe("It's home"));
  });

  test("expression w/ multiple variables and conditions can still be evaluated", () => {
    const params = {
      winScrollY: 100,
      winHeight: 300
    }

    caseSwitch
      .setMatchingTargets(params)
      .findMatch([`winScrollY < winHeight - 200`], "case 1 is true", null, "SIMPLE")
      .otherwise("I lied it's false")
      .onEnd((debug, vals) => expect(vals).toBe("I lied it's false"));

    params.winHeight = 200;
    caseSwitch
      .setMatchingTargets(params)
      .findMatch([`winScrollY < winHeight - 200`, `winScrollY > winHeight - 200`], "case 1 is true", null, "OR")
      .otherwise("I lied it's false")
      .onEnd((debug, vals) => expect(vals).toBe("case 1 is true"));

  });

  test("if variable name, wrapped in quotes should return falsy", () => {
    const params = {
      winScrollY: 100,
      winHeight: 300
    }

		caseSwitch
      .setMatchingTargets({ name: "skills" })
      .findMatch(`'name' === "skills"`, true, null, "SIMPLE")
      .onEnd((debug, results) => expect(results).toBeFalsy());

    caseSwitch
      .setMatchingTargets(params)
      .findMatch(`winScrollY < 'winHeight' - 200`, true, null, "SIMPLE")
      .onEnd((debug, results) => expect(results).toBeFalsy());
  });

  test("returning value in onEnd, will turned the whole chain into an expression", () => {
  	const name = "home";
  	const resultOfMatch = 
  	caseSwitch
      .setMatchingTargets({ name })
      .findMatch(`name === "skills"`, "It's skills", null, "SIMPLE")
      .findMatch(`name === "about"`, "It's about", null, "SIMPLE")
      .findMatch(`name === "home"`, "It's home", null, "SIMPLE")
      .onEnd((debug, result) => result);

   	expect(resultOfMatch).toBe("It's home");
  });

  test("findMatch also accepts function as first argument", () => {
    const name = "home";
    const exp = name => name === "home";

    caseSwitch
      .setMatchingTargets({ name })
      .findMatch(exp, "It's home", null, "SIMPLE")
      .otherwise("It's something else")
      .onEnd((debug, result) => expect(result).toBe("It's home"));
  });
});