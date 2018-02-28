import SwitchCase from "../src/SwitchCase";

describe("test native methods of SwitchCase", () => {
  let caseSwitch;

  beforeAll(() => {
    caseSwitch = new SwitchCase();
  });

  test("static, single input/value should return bool", () => {
    caseSwitch
      .setTargets({ name: "skills" })
      .match([`name === "skills"`], "It's skills", "SIMPLE")
      .match([`name === "home"`], "It's home", "SIMPLE")
			.end((debug, vals) => expect(vals).toBe("It's skills"));
  });

  test("setting string instead of array as condition in simple match should be valid", () => {
    caseSwitch
      .setTargets({ name: "skills" })
      .match(`name === "skills"`, "It's skills", "SIMPLE")
			.end((debug, vals) => expect(vals).toBe("It's skills"));
  });

  test("if setTargets takes in null or types other than object literal, should throw error", () => {
    caseSwitch
      .setTargets()
      .match([`name === "skills"`], "It's skills", "SIMPLE")
      .match([`name === "home"`], "It's home", "SIMPLE")
			.end((debug, vals) => expect(vals).toBe(null));
  });

  test("if input name is the same as the literal condition name, if value matched should return true", () => {
    caseSwitch
      .setTargets({ home: "home" })
      .match([`home === "skills"`], "It's skills", "SIMPLE")
      .match([`home === "home"`], "It's home", "SIMPLE")
			.end((debug, vals) => expect(vals).toBe("It's home"));
  });

  test("expression w/ multiple variables and conditions can still be evaluated", () => {
    const params = {
      winScrollY: 100,
      winHeight: 300
    }

    caseSwitch
      .setTargets(params)
      .match([`winScrollY < winHeight - 200`], "case 1 is true", "SIMPLE")
      .match("true", "I lied it's false", "SIMPLE")
      .end((debug, vals) => expect(vals).toBe("I lied it's false"));

    params.winHeight = 200;
    caseSwitch
      .setTargets(params)
      .match([`winScrollY < winHeight - 200`, `winScrollY > winHeight - 200`], "case 1 is true", "OR")
      .match("true", "I lied it's false", "SIMPLE")
      .end((debug, vals) => expect(vals).toBe("case 1 is true"));
  });

  test("if variable name, wrapped in quotes should return falsy", () => {
    const params = {
      winScrollY: 100,
      winHeight: 300
    }

		caseSwitch
      .setTargets({ name: "skills" })
      .match(`'name' === "skills"`, true, "SIMPLE")
      .end((debug, results) => expect(results).toBeFalsy());

    caseSwitch
      .setTargets(params)
      .match(`winScrollY < 'winHeight' - 200`, true, "SIMPLE")
      .end((debug, results) => expect(results).toBeFalsy());
  });

  test("returning value in end, will turned the whole chain into an expression", () => {
  	const name = "home";
  	const resultOfMatch = 
  	caseSwitch
      .setTargets({ name })
      .match(`name === "skills"`, "It's skills", "SIMPLE")
      .match(`name === "about"`, "It's about", "SIMPLE")
      .match(`name === "home"`, "It's home", "SIMPLE")
      .end((debug, result) => result);

   	expect(resultOfMatch).toBe("It's home");
  });

  test("match also accepts function as first argument", () => {
    const name = "home";
    const exp = name => name === "home";

    caseSwitch
      .setTargets({ name })
      .match(exp, "It's home", "SIMPLE")
      .match("true", "It's something else", "SIMPLE")
      .end((debug, result) => expect(result).toBe("It's home"));
  });

  test("returning value in a match case callback is the same as passing value as second argument", () => {
    const name = "home";
    const exp = name => name === "home";

    caseSwitch
      .setTargets({ name })
      .match(exp, "It's home", result => {
        return "It's my home";
      }, "SIMPLE")
      .match("true", "It's something else", "SIMPLE")
      .end((debug, result) => expect(result).toBe("It's my home"));
  });

  test("each expression can only be single statement", () => {
    const name = "home";

    expect(
      caseSwitch
        .setTargets({ name })
        .match(`() => { name = document.createElement("i"); name.onblur = "something" }`, "something cool", "SIMPLE")
        .match("true", "It's something else", "SIMPLE")
        .end((debug, result) => console.log(result))
    ).toThrowError("Expression must be single-statement-only");
  });

});