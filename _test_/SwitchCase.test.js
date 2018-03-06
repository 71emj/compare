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

  test("if input name is the same as the literal condition name, if value matched should return true", () => {
    caseSwitch
      .setTargets({ home: "home" })
      .match([`home === "skills"`], "It's skills", "SIMPLE")
      .match([`home === "home"`], "It's home", "SIMPLE")
      .end((debug, vals) => expect(vals).toBe("It's home"));
  });

  test("_setExpression should take in a string, array, and function and return a Map", () => {
    expect(
      caseSwitch._setClaim([
        "hello",
        "world",
        "expression",
        "doesn't",
        "matter"
      ])
    ).toBeInstanceOf(Map);
  });

  test("expression w/ multiple variables and conditions can still be evaluated", () => {
    const params = {
      winScrollY: 100,
      winHeight: 300
    };

    caseSwitch
      .setTargets(params)
      .match([`winScrollY < winHeight - 200`], "case 1 is true", "SIMPLE")
      .match(true, "I lied it's false", "SIMPLE")
      .end((debug, vals) => expect(vals).toBe("I lied it's false"));

    params.winHeight = 200;
    caseSwitch
      .setTargets(params)
      .match(
        [`winScrollY < winHeight - 200`, `winScrollY > winHeight - 200`],
        "case 1 is true",
        "OR"
      )
      .match(true, "I lied it's false", "SIMPLE")
      .end((debug, vals) => expect(vals).toBe("case 1 is true"));
  });

  test("if variable name, wrapped in quotes should return falsy", () => {
    const params = {
      winScrollY: 100,
      winHeight: 300
    };

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
    const resultOfMatch = caseSwitch
      .setTargets({ name })
      .match(`name === "skills"`, "It's skills", "SIMPLE")
      .match(`name === "about"`, "It's about", "SIMPLE")
      .match(`name === "home"`, "It's home", "SIMPLE")
      .end((debug, result) => result);

    expect(resultOfMatch).toBe("It's home");
  });

  test("match also accepts function as first argument", () => {
    const name = "home";
    const exp = ({ name }) => name === "home";

    caseSwitch
      .setTargets({ name })
      .match(exp, "It's home", "SIMPLE")
      .match(true, "It's something else", "SIMPLE")
      .end((debug, result) => expect(result).toBe("It's home"));
  });

  test("returning value in a match case callback is the same as passing value as second argument", () => {
    const name = "home";
    const exp = ({ name }) => name === "home";

    caseSwitch
      .setTargets({ name })
      .match(exp, "It's home", result => "It's my home", "SIMPLE")
      .match(true, "It's something else", "SIMPLE")
      .end((debug, result) => {
        debug();
        expect(result).toBe("It's my home");
      });
  });

  test("_evaluatOne and _evaluateMany can be simply one expression, _evaluate", () => {
    const expressions = [
      "name === 'hello'",
      "name === 'world'",
      "name === 'expression'"
    ];
    expect(
      caseSwitch
        .setTargets({ name: "hello" })
        ._evaluate(caseSwitch._setClaim(expressions), "SIMPLE")
    ).toBe(true);

    expect(
      caseSwitch
        .setTargets({ name: "expression" })
        ._evaluate(caseSwitch._setClaim(expressions), "OR")
    ).toBe(true);

    expect(
      caseSwitch
        .setTargets({ name: "expression" })
        ._evaluate(caseSwitch._setClaim(expressions), "AND")
    ).toBe(false);
  });

  test("value can be an expression", () => {
    const name = "home";
    caseSwitch
      .setTargets({ name })
      .match(`name === "skills"`, "It's skills", "SIMPLE")
      .match(`name === "about"`, "It's about", "SIMPLE")
      .match(`name === "home"`, true && "It's home", "SIMPLE")
      .end((debug, result) => {
        debug();
        expect(result).toBe("It's home");
      });

    const testExp = array => array.filter(elem => name === elem);
    caseSwitch
      .setTargets({ name })
      .match("name === 'home'", true && "It's home", result => result, "SIMPLE")
      .end((debug, result) => {
        debug();
        expect(result).toBe("It's home");
      });
  })
});
