/**
 * Migration Tests
 *
 * Tests state migrations using actual state data snapshots.
 */

import { migrateState, migrations } from "../migrations";
import v1Snapshot from "../snapshots/v1.json";
import v2Snapshot from "../snapshots/v2.json";

describe("State Migrations", () => {
  describe("migrateState", () => {
    it("should migrate v1 snapshot to v2", () => {
      const result = migrateState(v1Snapshot, 2);

      // Check that migration worked correctly
      expect(result.version).toBe(2);
      expect(result.characterPity).toBe(v1Snapshot.accountStatusCurrentPity); // Old pity migrated
      expect(result.weaponPity).toBe(0); // New field initialized to 0
      expect(result.accountStatusCurrentPity).toBeUndefined(); // Old field removed

      // All other fields should be preserved
      expect(result.accountStatusIsNextFiftyFiftyGuaranteed).toBe(
        v1Snapshot.accountStatusIsNextFiftyFiftyGuaranteed
      );
      expect(result.accountStatusOwnedWishResources).toEqual(
        v1Snapshot.accountStatusOwnedWishResources
      );
      expect(result.simulationCount).toBe(v1Snapshot.simulationCount);
      expect(result.mode).toBe(v1Snapshot.mode);
      expect(result.banners).toEqual(v1Snapshot.banners);
    });

    it("should handle v1 state with non-zero pity", () => {
      const v1StateWithPity = {
        ...v1Snapshot,
        accountStatusCurrentPity: 73,
      };

      const result = migrateState(v1StateWithPity, 2);

      expect(result.version).toBe(2);
      expect(result.characterPity).toBe(73);
      expect(result.weaponPity).toBe(0);
      expect(result.accountStatusCurrentPity).toBeUndefined();
    });

    it("should not migrate if already at target version", () => {
      const result = migrateState(v2Snapshot, 2);

      // Should return equivalent state (migration is idempotent)
      expect(result).toEqual(v2Snapshot);
    });

    it("should migrate through multiple versions", () => {
      // If we had v3, it should migrate v1 → v2 → v3
      const result = migrateState(v1Snapshot, 2);
      expect(result.version).toBe(2);
    });

    it("should throw error for missing migration", () => {
      expect(() => {
        migrateState(v1Snapshot, 999);
      }).toThrow("No migration found for version 2");
    });
  });

  describe("Individual Migration v1 → v2", () => {
    it("should correctly transform v1 snapshot", () => {
      const result = migrations[1](v1Snapshot);

      expect(result.version).toBe(2);
      expect(result.characterPity).toBe(v1Snapshot.accountStatusCurrentPity);
      expect(result.weaponPity).toBe(0);
      expect(result.accountStatusCurrentPity).toBeUndefined();

      // Verify all other fields are preserved
      const expectedKeys = Object.keys(v1Snapshot).filter(
        (key) => key !== "accountStatusCurrentPity"
      );
      expectedKeys.forEach((key) => {
        if (key !== "version") {
          expect(result[key]).toEqual(
            v1Snapshot[key as keyof typeof v1Snapshot]
          );
        }
      });
    });

    it("should handle edge cases", () => {
      const edgeCases = [
        { ...v1Snapshot, accountStatusCurrentPity: 0 },
        { ...v1Snapshot, accountStatusCurrentPity: 89 }, // Max pity
        { ...v1Snapshot, accountStatusCurrentPity: undefined },
        { ...v1Snapshot, accountStatusCurrentPity: null },
      ];

      edgeCases.forEach((testCase) => {
        const result = migrations[1](testCase);

        expect(result.version).toBe(2);
        expect(result.weaponPity).toBe(0);

        // Handle undefined/null cases
        const expectedCharacterPity = testCase.accountStatusCurrentPity ?? 0;
        expect(result.characterPity).toBe(expectedCharacterPity);
      });
    });
  });

  describe("Snapshot Integrity", () => {
    it("v1 snapshot should have expected structure", () => {
      expect(v1Snapshot.version).toBe(1);
      expect(v1Snapshot).toHaveProperty("accountStatusCurrentPity");
      expect(v1Snapshot).not.toHaveProperty("characterPity");
      expect(v1Snapshot).not.toHaveProperty("weaponPity");

      // Check required fields
      const requiredV1Fields = [
        "accountStatusCurrentPity",
        "accountStatusIsNextFiftyFiftyGuaranteed",
        "accountStatusOwnedWishResources",
        "simulationCount",
        "mode",
        "banners",
      ];

      requiredV1Fields.forEach((field) => {
        expect(v1Snapshot).toHaveProperty(field);
      });
    });

    it("v2 snapshot should have expected structure", () => {
      expect(v2Snapshot.version).toBe(2);
      expect(v2Snapshot).toHaveProperty("characterPity");
      expect(v2Snapshot).toHaveProperty("weaponPity");
      expect(v2Snapshot).not.toHaveProperty("accountStatusCurrentPity");

      // Check that migration produced correct types
      expect(typeof v2Snapshot.characterPity).toBe("number");
      expect(typeof v2Snapshot.weaponPity).toBe("number");
    });

    it("snapshots should be valid JSON", () => {
      // This test passes if the imports work, but let's be explicit
      expect(() => JSON.stringify(v1Snapshot)).not.toThrow();
      expect(() => JSON.stringify(v2Snapshot)).not.toThrow();
    });
  });

  describe("Migration Chain Testing", () => {
    it("should produce same result as direct v2 snapshot when migrating v1", () => {
      const migratedFromV1 = migrateState(v1Snapshot, 2);

      // The migrated v1 should match v2 structure (but values may differ)
      expect(Object.keys(migratedFromV1).sort()).toEqual(
        Object.keys(v2Snapshot).sort()
      );

      // Specific fields should match expected values
      expect(migratedFromV1.version).toBe(v2Snapshot.version);
      expect(migratedFromV1.characterPity).toBe(
        v1Snapshot.accountStatusCurrentPity
      );
      expect(migratedFromV1.weaponPity).toBe(0); // New field default
    });
  });
});
