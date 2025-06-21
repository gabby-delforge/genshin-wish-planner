import {
  calculateExpectedStarglitterWithPity,
  DEFAULT_WEIGHTS,
  STARGLITTER_AMOUNTS,
} from "../starglitter-utils";

describe("Starglitter Utils", () => {
  let characterWishes = 0;
  let weaponWishes = 0;
  let characterPity = 0;
  let weaponPity = 0;
  beforeEach(() => {
    characterWishes = 0;
    weaponWishes = 0;
    characterPity = 0;
    weaponPity = 0;
  });

  it("correctly calculates starglitter for a 1-pull", () => {
    characterWishes = 1;
    const { totalStarglitter } = calculateExpectedStarglitterWithPity(
      characterWishes,
      weaponWishes,
      characterPity,
      weaponPity
    );
    // We should get around 1/10th of a 4-star character
    const expectedStarglitter =
      0.5 *
        DEFAULT_WEIGHTS["4StarCharacter"] *
        STARGLITTER_AMOUNTS["4StarCharacter"] +
      0.5 *
        DEFAULT_WEIGHTS["4StarC6Character"] *
        STARGLITTER_AMOUNTS["4StarC6Character"];

    expect(totalStarglitter).toBeCloseTo(expectedStarglitter);
  });

  it("correctly calculates starglitter for a 10-pull", () => {
    characterWishes = 10;
    const { totalStarglitter } = calculateExpectedStarglitterWithPity(
      characterWishes,
      weaponWishes,
      characterPity,
      weaponPity
    );
    // We should get at least one 4-star character, which gives 5 starglitter
    expect(totalStarglitter).toEqual(5);
  });

  it("correctly calculates starglitter for a 75-pull", () => {
    characterWishes = 75;
    const { totalStarglitter } = calculateExpectedStarglitterWithPity(
      characterWishes,
      weaponWishes,
      characterPity,
      weaponPity
    );
    // We should get:
    // 7.5 4-star characters == 7.5 * 5
    // 1 5-star character == 5
    expect(totalStarglitter).toEqual(7.5 * 5 + 5);
  });
});
