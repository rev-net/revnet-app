import {
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
  Address,
  UseContractWriteConfig,
  usePrepareContractWrite,
  UsePrepareContractWriteConfig,
} from 'wagmi'
import {
  ReadContractResult,
  WriteContractMode,
  PrepareWriteContractResult,
} from 'wagmi/actions'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BasicRevnetDeployer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export const basicRevnetDeployerABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: '_controller',
        internalType: 'contract IJBController3_1',
        type: 'address',
      },
    ],
  },
  { type: 'error', inputs: [], name: 'BAD_BOOST_SEQUENCE' },
  { type: 'error', inputs: [], name: 'RECONFIGURATION_ALREADY_SCHEDULED' },
  { type: 'error', inputs: [], name: 'RECONFIGURATION_NOT_POSSIBLE' },
  { type: 'error', inputs: [], name: 'UNAUTHORIZED' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'boostOperatorPermissionIndexes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_revnetId', internalType: 'uint256', type: 'uint256' }],
    name: 'boostsOf',
    outputs: [
      {
        name: '',
        internalType: 'struct Boost[]',
        type: 'tuple[]',
        components: [
          { name: 'rate', internalType: 'uint128', type: 'uint128' },
          { name: 'startsAtOrAfter', internalType: 'uint128', type: 'uint128' },
        ],
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'controller',
    outputs: [
      { name: '', internalType: 'contract IJBController3_1', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_revnetId', internalType: 'uint256', type: 'uint256' }],
    name: 'currentBoostNumberOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_boostOperator', internalType: 'address', type: 'address' },
      {
        name: '_revnetMetadata',
        internalType: 'struct JBProjectMetadata',
        type: 'tuple',
        components: [
          { name: 'content', internalType: 'string', type: 'string' },
          { name: 'domain', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: '_name', internalType: 'string', type: 'string' },
      { name: '_symbol', internalType: 'string', type: 'string' },
      {
        name: '_revnetData',
        internalType: 'struct RevnetParams',
        type: 'tuple',
        components: [
          {
            name: 'initialIssuanceRate',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'premintTokenAmount',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'priceCeilingIncreaseFrequency',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'priceCeilingIncreasePercentage',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'priceFloorTaxIntensity',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'boosts',
            internalType: 'struct Boost[]',
            type: 'tuple[]',
            components: [
              { name: 'rate', internalType: 'uint128', type: 'uint128' },
              {
                name: 'startsAtOrAfter',
                internalType: 'uint128',
                type: 'uint128',
              },
            ],
          },
        ],
      },
      {
        name: '_terminals',
        internalType: 'contract IJBPaymentTerminal[]',
        type: 'address[]',
      },
      {
        name: '_buybackHookSetupData',
        internalType: 'struct BuybackHookSetupData',
        type: 'tuple',
        components: [
          {
            name: 'hook',
            internalType: 'contract IJBGenericBuybackDelegate',
            type: 'address',
          },
          {
            name: 'pools',
            internalType: 'struct BuybackPool[]',
            type: 'tuple[]',
            components: [
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'fee', internalType: 'uint24', type: 'uint24' },
              { name: 'twapWindow', internalType: 'uint32', type: 'uint32' },
              {
                name: 'twapSlippageTolerance',
                internalType: 'uint32',
                type: 'uint32',
              },
            ],
          },
        ],
      },
    ],
    name: 'deployRevnetFor',
    outputs: [{ name: 'revnetId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_operator', internalType: 'address', type: 'address' },
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_revnetId', internalType: 'uint256', type: 'uint256' },
      { name: '_newBoostOperator', internalType: 'address', type: 'address' },
    ],
    name: 'replaceBoostOperatorOf',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_revnetId', internalType: 'uint256', type: 'uint256' }],
    name: 'scheduleNextBoostOf',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export const basicRevnetDeployerAddress = {
  5: '0x04b70D5B629464C555fca5aAC0dA70302d351D62',
} as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export const basicRevnetDeployerConfig = {
  address: basicRevnetDeployerAddress,
  abi: basicRevnetDeployerABI,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link basicRevnetDeployerABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof basicRevnetDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    ...config,
  } as UseContractReadConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"boostOperatorPermissionIndexes"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerBoostOperatorPermissionIndexes<
  TFunctionName extends 'boostOperatorPermissionIndexes',
  TSelectData = ReadContractResult<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof basicRevnetDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'boostOperatorPermissionIndexes',
    ...config,
  } as UseContractReadConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"boostsOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerBoostsOf<
  TFunctionName extends 'boostsOf',
  TSelectData = ReadContractResult<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof basicRevnetDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'boostsOf',
    ...config,
  } as UseContractReadConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"controller"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerController<
  TFunctionName extends 'controller',
  TSelectData = ReadContractResult<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof basicRevnetDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'controller',
    ...config,
  } as UseContractReadConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"currentBoostNumberOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerCurrentBoostNumberOf<
  TFunctionName extends 'currentBoostNumberOf',
  TSelectData = ReadContractResult<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof basicRevnetDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'currentBoostNumberOf',
    ...config,
  } as UseContractReadConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"onERC721Received"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerOnErc721Received<
  TFunctionName extends 'onERC721Received',
  TSelectData = ReadContractResult<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof basicRevnetDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'onERC721Received',
    ...config,
  } as UseContractReadConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"supportsInterface"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerSupportsInterface<
  TFunctionName extends 'supportsInterface',
  TSelectData = ReadContractResult<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof basicRevnetDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'supportsInterface',
    ...config,
  } as UseContractReadConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof basicRevnetDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof basicRevnetDeployerABI,
          string
        >['request']['abi'],
        TFunctionName,
        TMode
      > & { address?: Address; chainId?: TChainId }
    : UseContractWriteConfig<
        typeof basicRevnetDeployerABI,
        TFunctionName,
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
      } = {} as any,
) {
  return useContractWrite<typeof basicRevnetDeployerABI, TFunctionName, TMode>({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"deployRevnetFor"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerDeployRevnetFor<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof basicRevnetDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof basicRevnetDeployerABI,
          'deployRevnetFor'
        >['request']['abi'],
        'deployRevnetFor',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'deployRevnetFor'
      }
    : UseContractWriteConfig<
        typeof basicRevnetDeployerABI,
        'deployRevnetFor',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'deployRevnetFor'
      } = {} as any,
) {
  return useContractWrite<
    typeof basicRevnetDeployerABI,
    'deployRevnetFor',
    TMode
  >({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'deployRevnetFor',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"replaceBoostOperatorOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerReplaceBoostOperatorOf<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof basicRevnetDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof basicRevnetDeployerABI,
          'replaceBoostOperatorOf'
        >['request']['abi'],
        'replaceBoostOperatorOf',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'replaceBoostOperatorOf'
      }
    : UseContractWriteConfig<
        typeof basicRevnetDeployerABI,
        'replaceBoostOperatorOf',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'replaceBoostOperatorOf'
      } = {} as any,
) {
  return useContractWrite<
    typeof basicRevnetDeployerABI,
    'replaceBoostOperatorOf',
    TMode
  >({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'replaceBoostOperatorOf',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"scheduleNextBoostOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function useBasicRevnetDeployerScheduleNextBoostOf<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof basicRevnetDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof basicRevnetDeployerABI,
          'scheduleNextBoostOf'
        >['request']['abi'],
        'scheduleNextBoostOf',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'scheduleNextBoostOf'
      }
    : UseContractWriteConfig<
        typeof basicRevnetDeployerABI,
        'scheduleNextBoostOf',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'scheduleNextBoostOf'
      } = {} as any,
) {
  return useContractWrite<
    typeof basicRevnetDeployerABI,
    'scheduleNextBoostOf',
    TMode
  >({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'scheduleNextBoostOf',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function usePrepareBasicRevnetDeployerWrite<
  TFunctionName extends string,
>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof basicRevnetDeployerABI, TFunctionName>,
    'abi' | 'address'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof basicRevnetDeployerABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"deployRevnetFor"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function usePrepareBasicRevnetDeployerDeployRevnetFor(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof basicRevnetDeployerABI,
      'deployRevnetFor'
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'deployRevnetFor',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof basicRevnetDeployerABI,
    'deployRevnetFor'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"replaceBoostOperatorOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function usePrepareBasicRevnetDeployerReplaceBoostOperatorOf(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof basicRevnetDeployerABI,
      'replaceBoostOperatorOf'
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'replaceBoostOperatorOf',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof basicRevnetDeployerABI,
    'replaceBoostOperatorOf'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link basicRevnetDeployerABI}__ and `functionName` set to `"scheduleNextBoostOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x04b70D5B629464C555fca5aAC0dA70302d351D62)
 */
export function usePrepareBasicRevnetDeployerScheduleNextBoostOf(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof basicRevnetDeployerABI,
      'scheduleNextBoostOf'
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof basicRevnetDeployerAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: basicRevnetDeployerABI,
    address: basicRevnetDeployerAddress[5],
    functionName: 'scheduleNextBoostOf',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof basicRevnetDeployerABI,
    'scheduleNextBoostOf'
  >)
}
