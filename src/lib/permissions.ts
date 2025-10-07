/**
 * Juicebox V5 Permission IDs
 *
 * These permission IDs are used to control granular access to project operations.
 * Project owners can grant specific permissions to other addresses.
 *
 * @see https://docs.juicebox.money/dev/v5/api/core/JBPermissions/
 */

export const JB_PERMISSIONS = {
  /**
   * Permission to take out loans against project tokens
   */
  BORROW: 1,

  /**
   * Permission to queue new rulesets for the project
   */
  QUEUE_RULESETS: 17,

  /**
   * Permission to adjust tier settings in 721 hooks
   */
  ADJUST_TIERS: 18,

  /**
   * Permission to update project metadata (name, logo, description)
   */
  UPDATE_METADATA: 20,

  /**
   * Permission to mint project tokens
   */
  MINT: 21,

  /**
   * Permission to burn project tokens
   */
  BURN: 22,

  /**
   * Permission to claim tokens (convert credits to ERC-20)
   */
  CLAIM_TOKENS: 23,

  /**
   * Permission to set split groups (payout and reserved token distributions)
   */
  SET_SPLIT_GROUPS: 24,

  /**
   * Permission to set terminals for the project
   */
  SET_TERMINALS: 25,

  /**
   * Permission to set the project's controller
   */
  SET_CONTROLLER: 26,

  /**
   * Permission to migrate the project to a new controller
   */
  MIGRATE_CONTROLLER: 30,
} as const;

export type JBPermissionKey = keyof typeof JB_PERMISSIONS;
export type JBPermissionId = (typeof JB_PERMISSIONS)[JBPermissionKey];
