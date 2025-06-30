/**
 * Tests for the state reconciliation system
 */

import { reconcileState, safeReconcileState } from '../state-reconciliation';
import { createDefaultPersistedState, createGenshinStateValidators } from '../default-state-factory';

describe('State Reconciliation', () => {
  describe('reconcileState', () => {
    it('should add missing properties', () => {
      const loaded = { characterPity: 50 };
      const defaultState = {
        characterPity: 0,
        weaponPity: 0,
        version: 4
      };

      const result = reconcileState(loaded, defaultState);

      expect(result.reconciledState).toEqual({
        characterPity: 50,
        weaponPity: 0,
        version: 4
      });
      expect(result.changes).toHaveLength(2);
      expect(result.changes[0].type).toBe('added');
      expect(result.changes[0].path).toBe('weaponPity');
    });

    it('should remove extra properties by default', () => {
      const loaded = { 
        characterPity: 50,
        weaponPity: 10,
        extraProperty: 'should be removed',
        version: 4
      };
      const defaultState = {
        characterPity: 0,
        weaponPity: 0,
        version: 4
      };

      const result = reconcileState(loaded, defaultState);

      expect(result.reconciledState).toEqual({
        characterPity: 50,
        weaponPity: 10,
        version: 4
      });
      expect(result.changes.some(c => c.type === 'removed')).toBe(true);
    });

    it('should handle nested objects', () => {
      const loaded = {
        ownedWishResources: {
          primogem: 1600
          // missing starglitter, limitedWishes, etc.
        }
      } as Record<string, unknown>;
      const defaultState = {
        ownedWishResources: {
          primogem: 0,
          starglitter: 0,
          limitedWishes: 0
        }
      };

      const result = reconcileState(loaded, defaultState);

      expect(result.reconciledState.ownedWishResources).toEqual({
        primogem: 1600,
        starglitter: 0,
        limitedWishes: 0
      });
    });

    it('should validate with custom validators', () => {
      const loaded = { characterPity: -10 }; // Invalid negative pity
      const defaultState = { characterPity: 0 };
      const validators = createGenshinStateValidators();

      const result = reconcileState(loaded, defaultState, {
        customValidators: validators
      });

      expect(result.reconciledState.characterPity).toBe(0);
      expect(result.changes.some(c => c.type === 'invalid_value_reset')).toBe(true);
    });

    it('should correct type mismatches', () => {
      const loaded = { characterPity: "50" } as Record<string, unknown>; // String instead of number
      const defaultState = { characterPity: 0 };

      const result = reconcileState(loaded, defaultState);

      expect(result.reconciledState.characterPity).toBe(0);
      expect(result.changes.some(c => c.type === 'type_corrected')).toBe(true);
    });
  });

  describe('integration with GenshinState defaults', () => {
    it('should work with real GenshinState default structure', () => {
      const incompleteState = {
        characterPity: 75,
        ownedWishResources: {
          primogem: 5000
          // Missing other resource types
        }
        // Missing many other properties
      };

      const defaultState = createDefaultPersistedState();
      const result = safeReconcileState(
        incompleteState,
        defaultState as Record<string, unknown>
      );

      // Should preserve user values
      expect(result.characterPity).toBe(75);
      expect((result.ownedWishResources as Record<string, unknown>).primogem).toBe(5000);
      
      // Should add missing values
      expect((result.ownedWishResources as Record<string, unknown>).starglitter).toBe(0);
      expect(result.weaponPity).toBe(0);
      expect(result.version).toBeDefined();
    });
  });
});