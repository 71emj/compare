import InterfaceClosure from "../src/Interface";

describe("transform Interface object to closure", () => {
  let controller;

  beforeAll(() => {
    controller = InterfaceClosure();
  });

  test("simple test with three matching methods, default, and Ended", () => {
    controller
      .setTargets({ name: "home" })
      .toCase("name === 'home'", true)
      .Ended((debug, result) => expect(result).toBe(true));

    controller
      .setTargets({ name: "home" })
      .toCaseOR(["name !== 'home'", ({ name }) => name.match(/.{4,}/)], true)
      .Ended((debug, result) => expect(result).toBe(true));

    controller
      .setTargets({ name: "home" })
      .toCaseAND(["name !== 'home'", ({ name }) => name.match(/.{4,}/)], true)
      .Ended((debug, result) => expect(result).toBe(null));

    controller
      .setTargets({ name: "home" })
      .toCaseAND(["name !== 'home'", ({ name }) => name.match(/.{4,}/)], true)
      .toAllOther(false)
      .Ended((debug, result) => {
        debug();
        expect(result).toBe(false);
      });
  });
});
