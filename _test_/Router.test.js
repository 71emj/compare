import Compare from "../src/Compare";

describe("this is a subset of Compare, designed to work as router", () => {
  let router, pathname, home;
  beforeAll(() => {
    router = Compare({ type: "router" });
    pathname = "/github/71emj";
    home = "/";
  });

  test("invoking router will get an object", () => {
    expect(typeof router({ name: "home" })).toBe("object");
  });

  test("passing path name to router will replace '/' into &", () => {
    const routes = router({ pathname });
    expect(routes).toBe("_github_71emj");

    const emptyRoute = router({ home });
    expect(emptyRoute).toEqual("_");
  });

  test("comparing pathname to pathname will get path === '_xxx'", () => {
    router({ pathname })
      .toPath("/github/71emj", true)
      .Ended((debug, result) => expect(result).toBe(true));

    router({ home })
      .toPath("/", true)
      .toPath("/github/71emj", false)
      .Ended((debug, result) => {
        debug();
        expect(result).toBe(true)
      });
  });

  test("router should throw SyntaxError if it's not simple expression", () => {
    expect(() => {
      router({ pathname, home })
    }).toThrow(SyntaxError);
  });

  test("router should throw TypeError if typeof path !== 'string'", () => {
    expect(() => {
      router({ pathname: 10 })
    }).toThrow(TypeError);
  });
});
