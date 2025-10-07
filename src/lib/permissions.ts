/**
 * Juicebox V5 Permission IDs used in Revnet
 *
 * These permission IDs are used to control granular access to project operations.
 * Project owners can grant specific permissions to other addresses.
 *
 * @see https://github.com/Bananapus/nana-core/blob/main/src/libraries/JBPermissionIds.sol
 */

export const JB_PERMISSIONS = {
  ROOT: 1, // All permissions across every contract
  SET_PROJECT_URI: 6,
  SET_SPLIT_GROUPS: 17,
  ADD_PRICE_FEED: 18,
  ADJUST_721_TIERS: 20,
  SET_721_METADATA: 21,
  MINT_721: 22,
  SET_721_DISCOUNT_PERCENT: 23,
  SET_BUYBACK_TWAP: 24,
  SET_BUYBACK_POOL: 25,
  SUCKER_SAFETY: 30,
} as const;

export type JBPermissionKey = keyof typeof JB_PERMISSIONS;
export type JBPermissionId = (typeof JB_PERMISSIONS)[JBPermissionKey];
