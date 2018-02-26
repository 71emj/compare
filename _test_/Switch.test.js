import SwitchCase from "../src/Switch";
import Match from "../src/Match";

describe("test native methods of SwitchCase", () => {
  let caseSwitch;

  beforeAll(() => {
    caseSwitch = new SwitchCase();
  });

  test("static, single input/value should return bool", () => {
    caseSwitch
      .setMatchingTargets({ name: "skills" })
      .onMatch([`name === "skills"`], "It's skills")
      .onMatch([`name === "home"`], "It's home")
			.onEnd((debug, vals) => expect(vals).toBe("It's skills"));
  });

  test("setting string instead of array as condition in simple match should be valid", () => {
    caseSwitch
      .setMatchingTargets({ name: "skills" })
      .onMatch(`name === "skills"`, "It's skills")
			.onEnd((debug, vals) => expect(vals).toBe("It's skills"));
  });

  test("if setMatchingTargets takes in null or types other than object literal, should throw error", () => {
    caseSwitch
      .setMatchingTargets()
      .onMatch([`name === "skills"`], "It's skills")
      .onMatch([`name === "home"`], "It's home")
			.onEnd((debug, vals) => expect(vals).toBe(null));
  });

  test("if input name is the same as the literal condition name, if value matched should return true", () => {
    caseSwitch
      .setMatchingTargets({ home: "home" })
      .onMatch([`home === "skills"`], "It's skills")
      .onMatch([`home === "home"`], "It's home")
			.onEnd((debug, vals) => expect(vals).toBe("It's home"));
  });

  test("expression w/ multiple variables and conditions can still be evaluated", () => {
    const params = {
      winScrollY: 100,
      winHeight: 300
    }

    caseSwitch
      .setMatchingTargets(params)
      .onMatch([`winScrollY < winHeight - 200`], "case 1 is true")
      .otherwise("I lied it's false")
      .onEnd((debug, vals) => expect(vals).toBe("I lied it's false"));

    params.winHeight = 200;
    caseSwitch
      .setMatchingTargets(params)
      .onMatchOR([`winScrollY < winHeight - 200`, `winScrollY > winHeight - 200`], "case 1 is true")
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
      .onMatch(`'name' === "skills"`, true)
      .onEnd((debug, results) => expect(results).toBeFalsy());

    caseSwitch
      .setMatchingTargets(params)
      .onMatch(`winScrollY < 'winHeight' - 200`, true)
      .onEnd((debug, results) => expect(results).toBeFalsy());
  });

  test("returning value in onEnd, will turned the whole chain into an expression", () => {
  	const name = "home";
  	const resultOfMatch = 
  	caseSwitch
      .setMatchingTargets({ name })
      .onMatch(`name === "skills"`, "It's skills")
      .onMatch(`name === "about"`, "It's about")
      .onMatch(`name === "home"`, "It's home")
      .onEnd((debug, result) => {
      	console.log(result);
      	return result;
      });

   	expect(resultOfMatch).toBe("It's home");
  })
});

describe("test Match, a wrapper of SwitchCase", () => {

	test("the Match wrapper will return an instance of SwitchCase", () => {
		const match = Match();
		expect(typeof match).toBe("function");
	});	

	test("Match can pass in arguments after instanciation", () => {
		const match = Match();
		
		match({ name: "home" })
			.onMatch("name === 'home'", "It's true!!")
			.otherwise("It's false")
			.onEnd((debug, result) => expect(result).toBe("It's true!!"));
	});

})