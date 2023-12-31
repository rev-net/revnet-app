import { FixedInt, FixedPortion } from "fpnum";

export const MAX_RESERVED_RATE = 10_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_DECAY_RATE = 1_000_000_000n;
export const SPLITS_TOTAL_PERCENT = 1_000_000_000n;
export const MAX_FEE = 1_000_000_000n;
export const MAX_FEE_DISCOUNT = 1_000_000_000n;
export const JB_TOKEN_DECIMALS = 18;

export const NATIVE_TOKEN = "0x000000000000000000000000000000000000EEEe";

/**
 * Reserved rate for a ruleset.
 *
 * Has a decimal precision of 4 and a maximum value of 10,000.
 *
 * @extends FixedPortion
 */
export class ReservedRate extends FixedPortion<4> {
  constructor(value: bigint) {
    super(value, 4, MAX_RESERVED_RATE);
  }
}

/**
 * Redemption rate for a ruleset.
 *
 * Has a decimal precision of 4 and a maximum value of 10,000.

 * @extends FixedPortion
 */
export class RedemptionRate extends FixedPortion<4> {
  constructor(value: bigint) {
    super(value, 4, MAX_REDEMPTION_RATE);
  }
}

/**
 * Decay rate for a ruleset.
 *
 * Has a decimal precision of 9 and a maximum value of 1,000,000,000.

 * @extends FixedPortion
 */
export class DecayRate extends FixedPortion<9> {
  constructor(value: bigint) {
    super(value, 9, MAX_DECAY_RATE);
  }
}

export class SplitPortion extends FixedPortion<9> {
  constructor(value: bigint) {
    super(value, 9, SPLITS_TOTAL_PERCENT);
  }
}

/**
 * Ether value.
 *
 * Has a decimal precision of 18.
 *
 * @extends FixedInt
 */
export class Ether extends FixedInt<18> {
  constructor(value: bigint) {
    super(value, 18);
  }
}

/**
 * ruleset weight.
 *
 * Has a decimal precision of 18.
 *
 * @extends FixedInt
 */
export class RulesetWeight extends FixedInt<18> {
  constructor(value: bigint) {
    super(value, 18);
  }
}

export interface TokenAmountType {
  symbol: string;
  amount: FixedInt<number>;
}
