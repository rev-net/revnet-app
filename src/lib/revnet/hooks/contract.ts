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
// REVBasicDeployer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export const revBasicDeployerABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: 'controller',
        internalType: 'contract IJBController',
        type: 'address',
      },
    ],
  },
  { type: 'error', inputs: [], name: 'REVBasicDeployer_Unauthorized' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'CONTROLLER',
    outputs: [
      { name: '', internalType: 'contract IJBController', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'metadata', internalType: 'string', type: 'string' },
      {
        name: 'configuration',
        internalType: 'struct REVConfig',
        type: 'tuple',
        components: [
          { name: 'baseCurrency', internalType: 'uint256', type: 'uint256' },
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
            name: 'boostConfigs',
            internalType: 'struct REVBoostConfig[]',
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
      { name: 'boostOperator', internalType: 'address', type: 'address' },
      {
        name: 'terminalConfigurations',
        internalType: 'struct JBTerminalConfig[]',
        type: 'tuple[]',
        components: [
          {
            name: 'terminal',
            internalType: 'contract IJBTerminal',
            type: 'address',
          },
          {
            name: 'tokensToAccept',
            internalType: 'address[]',
            type: 'address[]',
          },
        ],
      },
      {
        name: 'buybackHookConfiguration',
        internalType: 'struct REVBuybackHookConfig',
        type: 'tuple',
        components: [
          {
            name: 'hook',
            internalType: 'contract IJBBuybackHook',
            type: 'address',
          },
          {
            name: 'poolConfigs',
            internalType: 'struct REVBuybackPoolConfig[]',
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
    name: 'deployRevnetWith',
    outputs: [{ name: 'revnetId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'revnetId', internalType: 'uint256', type: 'uint256' },
      { name: 'newBoostOperator', internalType: 'address', type: 'address' },
    ],
    name: 'replaceBoostOperatorOf',
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export const revBasicDeployerAddress = {
  11155111: '0x0227b76E082c635887ec58BaCaabAcC86934fe1c',
} as const

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export const revBasicDeployerConfig = {
  address: revBasicDeployerAddress,
  abi: revBasicDeployerABI,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function useRevBasicDeployerRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address'
  > & { chainId?: keyof typeof revBasicDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"CONTROLLER"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function useRevBasicDeployerController<
  TFunctionName extends 'CONTROLLER',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof revBasicDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    functionName: 'CONTROLLER',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"onERC721Received"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function useRevBasicDeployerOnErc721Received<
  TFunctionName extends 'onERC721Received',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof revBasicDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    functionName: 'onERC721Received',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"supportsInterface"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function useRevBasicDeployerSupportsInterface<
  TFunctionName extends 'supportsInterface',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof revBasicDeployerAddress } = {} as any,
) {
  return useContractRead({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    functionName: 'supportsInterface',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function useRevBasicDeployerWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof revBasicDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof revBasicDeployerABI,
          string
        >['request']['abi'],
        TFunctionName,
        TMode
      > & { address?: Address; chainId?: TChainId }
    : UseContractWriteConfig<
        typeof revBasicDeployerABI,
        TFunctionName,
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
      } = {} as any,
) {
  return useContractWrite<typeof revBasicDeployerABI, TFunctionName, TMode>({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deployRevnetWith"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function useRevBasicDeployerDeployRevnetWith<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof revBasicDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof revBasicDeployerABI,
          'deployRevnetWith'
        >['request']['abi'],
        'deployRevnetWith',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'deployRevnetWith'
      }
    : UseContractWriteConfig<
        typeof revBasicDeployerABI,
        'deployRevnetWith',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'deployRevnetWith'
      } = {} as any,
) {
  return useContractWrite<
    typeof revBasicDeployerABI,
    'deployRevnetWith',
    TMode
  >({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    functionName: 'deployRevnetWith',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"replaceBoostOperatorOf"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function useRevBasicDeployerReplaceBoostOperatorOf<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof revBasicDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof revBasicDeployerABI,
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
        typeof revBasicDeployerABI,
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
    typeof revBasicDeployerABI,
    'replaceBoostOperatorOf',
    TMode
  >({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    functionName: 'replaceBoostOperatorOf',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function usePrepareRevBasicDeployerWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof revBasicDeployerABI, TFunctionName>,
    'abi' | 'address'
  > & { chainId?: keyof typeof revBasicDeployerAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    ...config,
  } as UsePrepareContractWriteConfig<typeof revBasicDeployerABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deployRevnetWith"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function usePrepareRevBasicDeployerDeployRevnetWith(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof revBasicDeployerABI,
      'deployRevnetWith'
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof revBasicDeployerAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    functionName: 'deployRevnetWith',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof revBasicDeployerABI,
    'deployRevnetWith'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"replaceBoostOperatorOf"`.
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0227b76E082c635887ec58BaCaabAcC86934fe1c)
 */
export function usePrepareRevBasicDeployerReplaceBoostOperatorOf(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof revBasicDeployerABI,
      'replaceBoostOperatorOf'
    >,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof revBasicDeployerAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: revBasicDeployerABI,
    address: revBasicDeployerAddress[11155111],
    functionName: 'replaceBoostOperatorOf',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof revBasicDeployerABI,
    'replaceBoostOperatorOf'
  >)
}
