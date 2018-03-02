import Compare from "../index";
import SwitchCase from "../src/SwitchCase";

describe("test native SwitchCase error handling functions", () => {
  let caseSwitch;

  beforeAll(() => {
    caseSwitch = new SwitchCase();
  });

  test("if setTargets takes in null or types other than object literal, should throw error", () => {
    expect(() => {
    	caseSwitch.setTargets().match("home", "wrong", "SIMPLE")
    }).toThrow(TypeError);

    expect(() => {
    	caseSwitch.setTargets(10).match("home", "wrong", "SIMPLE")
    }).toThrow(TypeError);
  });

  it("passing the wrong type of expression, or not passing at all will receive error", () => {
    expect(() => {
			caseSwitch.setTargets({ name }).match(null, "something cool", "SIMPLE")
    }).toThrow(Error);
  });

  test("each expression can only be single statement", () => {
    const name = "home";

    expect(() => {
    	caseSwitch.setTargets({ name }).match(
        `() => { name = document.createElement("i"); name.onblur = "something" }`,
        "something cool",
        "SIMPLE"
      )
    }).toThrowError("Expression must be single-statement-only");
  });
});

describe("test Compare error handling functions", () => {
  let compare;

  beforeAll(() => {
    compare = new Compare();
  });

  test("throw error from test function", () => {
    expect(
      () => { throw new Error("test") } 
    ).toThrow(Error);
  });

  test("forgot to pass variable or variable in wrong format should throw error", () => {
    const name = "home";

    expect(() => {
      compare().toCase("myhome", "not true").Ended((debug, result) => debug())
    }).toThrowError("Argument cannot be empty");

    expect(() => {
      compare(name).toCase("myhome", "not true").Ended((debug, result) => debug())
    }).toThrow("Variable must be an object, or an array of objects");
  });

  test("using simple expression while passing multiple more than one argument should throw Reference Error", () => {
    expect(() => {
      compare({ name: "hello", city: "Charlotte" }).toCase(["Charlotte", "hello"], "invalid")
    }).toThrowError(ReferenceError);
  });
});


