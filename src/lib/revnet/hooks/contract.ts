import {
  Address,
  useNetwork,
  useChainId,
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
      {
        name: 'suckerRegistry',
        internalType: 'contract IBPSuckerRegistry',
        type: 'address',
      },
    ],
  },
  { type: 'error', inputs: [], name: 'REVBasicDeployer_ExitDelayInEffect' },
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'EXIT_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'SUCKER_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IBPSuckerRegistry', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        name: 'context',
        internalType: 'struct JBBeforePayRecordedContext',
        type: 'tuple',
        components: [
          { name: 'terminal', internalType: 'address', type: 'address' },
          { name: 'payer', internalType: 'address', type: 'address' },
          {
            name: 'amount',
            internalType: 'struct JBTokenAmount',
            type: 'tuple',
            components: [
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'value', internalType: 'uint256', type: 'uint256' },
              { name: 'decimals', internalType: 'uint256', type: 'uint256' },
              { name: 'currency', internalType: 'uint256', type: 'uint256' },
            ],
          },
          { name: 'projectId', internalType: 'uint256', type: 'uint256' },
          { name: 'rulesetId', internalType: 'uint256', type: 'uint256' },
          { name: 'beneficiary', internalType: 'address', type: 'address' },
          { name: 'weight', internalType: 'uint256', type: 'uint256' },
          { name: 'reservedRate', internalType: 'uint256', type: 'uint256' },
          { name: 'metadata', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'beforePayRecordedWith',
    outputs: [
      { name: 'weight', internalType: 'uint256', type: 'uint256' },
      {
        name: 'hookSpecifications',
        internalType: 'struct JBPayHookSpecification[]',
        type: 'tuple[]',
        components: [
          {
            name: 'hook',
            internalType: 'contract IJBPayHook',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'metadata', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        name: 'context',
        internalType: 'struct JBBeforeRedeemRecordedContext',
        type: 'tuple',
        components: [
          { name: 'terminal', internalType: 'address', type: 'address' },
          { name: 'holder', internalType: 'address', type: 'address' },
          { name: 'projectId', internalType: 'uint256', type: 'uint256' },
          { name: 'rulesetId', internalType: 'uint256', type: 'uint256' },
          { name: 'redeemCount', internalType: 'uint256', type: 'uint256' },
          { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
          {
            name: 'surplus',
            internalType: 'struct JBTokenAmount',
            type: 'tuple',
            components: [
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'value', internalType: 'uint256', type: 'uint256' },
              { name: 'decimals', internalType: 'uint256', type: 'uint256' },
              { name: 'currency', internalType: 'uint256', type: 'uint256' },
            ],
          },
          { name: 'useTotalSurplus', internalType: 'bool', type: 'bool' },
          { name: 'redemptionRate', internalType: 'uint256', type: 'uint256' },
          { name: 'metadata', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'beforeRedeemRecordedWith',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      {
        name: 'specifications',
        internalType: 'struct JBRedeemHookSpecification[]',
        type: 'tuple[]',
        components: [
          {
            name: 'hook',
            internalType: 'contract IJBRedeemHook',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'metadata', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'revnetId', internalType: 'uint256', type: 'uint256' }],
    name: 'buybackHookOf',
    outputs: [
      {
        name: 'buybackHook',
        internalType: 'contract IJBRulesetDataHook',
        type: 'address',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        name: 'configuration',
        internalType: 'struct REVConfig',
        type: 'tuple',
        components: [
          {
            name: 'description',
            internalType: 'struct REVDescription',
            type: 'tuple',
            components: [
              { name: 'name', internalType: 'string', type: 'string' },
              { name: 'symbol', internalType: 'string', type: 'string' },
              { name: 'uri', internalType: 'string', type: 'string' },
              { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
            ],
          },
          { name: 'baseCurrency', internalType: 'uint32', type: 'uint32' },
          {
            name: 'premintTokenAmount',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'initialOperator', internalType: 'address', type: 'address' },
          {
            name: 'stageConfigurations',
            internalType: 'struct REVStageConfig[]',
            type: 'tuple[]',
            components: [
              {
                name: 'startsAtOrAfter',
                internalType: 'uint40',
                type: 'uint40',
              },
              {
                name: 'operatorSplitRate',
                internalType: 'uint16',
                type: 'uint16',
              },
              {
                name: 'initialIssuanceRate',
                internalType: 'uint112',
                type: 'uint112',
              },
              {
                name: 'priceCeilingIncreaseFrequency',
                internalType: 'uint40',
                type: 'uint40',
              },
              {
                name: 'priceCeilingIncreasePercentage',
                internalType: 'uint32',
                type: 'uint32',
              },
              {
                name: 'priceFloorTaxIntensity',
                internalType: 'uint16',
                type: 'uint16',
              },
            ],
          },
        ],
      },
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
            name: 'poolConfigurations',
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
      {
        name: 'suckerDeploymentConfiguration',
        internalType: 'struct REVSuckerDeploymentConfig',
        type: 'tuple',
        components: [
          {
            name: 'deployerConfigurations',
            internalType: 'struct BPSuckerDeployerConfig[]',
            type: 'tuple[]',
            components: [
              {
                name: 'deployer',
                internalType: 'contract IBPSuckerDeployer',
                type: 'address',
              },
              {
                name: 'mappings',
                internalType: 'struct BPTokenMapping[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'localToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  { name: 'minGas', internalType: 'uint32', type: 'uint32' },
                  {
                    name: 'remoteToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'minBridgeAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
            ],
          },
          { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'deployRevnetWith',
    outputs: [{ name: 'revnetId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'revnetId', internalType: 'uint256', type: 'uint256' },
      { name: 'encodedConfiguration', internalType: 'bytes', type: 'bytes' },
      {
        name: 'suckerDeploymentConfiguration',
        internalType: 'struct REVSuckerDeploymentConfig',
        type: 'tuple',
        components: [
          {
            name: 'deployerConfigurations',
            internalType: 'struct BPSuckerDeployerConfig[]',
            type: 'tuple[]',
            components: [
              {
                name: 'deployer',
                internalType: 'contract IBPSuckerDeployer',
                type: 'address',
              },
              {
                name: 'mappings',
                internalType: 'struct BPTokenMapping[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'localToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  { name: 'minGas', internalType: 'uint32', type: 'uint32' },
                  {
                    name: 'remoteToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'minBridgeAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
            ],
          },
          { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'deploySuckersFor',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'revnetId', internalType: 'uint256', type: 'uint256' }],
    name: 'exitDelayOf',
    outputs: [{ name: 'exitDelay', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'revnetId', internalType: 'uint256', type: 'uint256' },
      { name: 'addr', internalType: 'address', type: 'address' },
    ],
    name: 'hasMintPermissionFor',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'revnetId', internalType: 'uint256', type: 'uint256' }],
    name: 'payHookSpecificationsOf',
    outputs: [
      {
        name: '',
        internalType: 'struct JBPayHookSpecification[]',
        type: 'tuple[]',
        components: [
          {
            name: 'hook',
            internalType: 'contract IJBPayHook',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'metadata', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'revnetId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOperator', internalType: 'address', type: 'address' },
    ],
    name: 'replaceOperatorOf',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

/**
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export const revBasicDeployerAddress = {
  11155111: '0x1685250188491Fd677cC5A7A40B3d8252cB1C917',
  11155420: '0x1685250188491Fd677cC5A7A40B3d8252cB1C917',
} as const

/**
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'CONTROLLER',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"EXIT_DELAY"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerExitDelay<
  TFunctionName extends 'EXIT_DELAY',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'EXIT_DELAY',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"SUCKER_REGISTRY"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerSuckerRegistry<
  TFunctionName extends 'SUCKER_REGISTRY',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'SUCKER_REGISTRY',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"beforePayRecordedWith"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerBeforePayRecordedWith<
  TFunctionName extends 'beforePayRecordedWith',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'beforePayRecordedWith',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"beforeRedeemRecordedWith"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerBeforeRedeemRecordedWith<
  TFunctionName extends 'beforeRedeemRecordedWith',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'beforeRedeemRecordedWith',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"buybackHookOf"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerBuybackHookOf<
  TFunctionName extends 'buybackHookOf',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'buybackHookOf',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"exitDelayOf"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerExitDelayOf<
  TFunctionName extends 'exitDelayOf',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'exitDelayOf',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"hasMintPermissionFor"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerHasMintPermissionFor<
  TFunctionName extends 'hasMintPermissionFor',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'hasMintPermissionFor',
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'onERC721Received',
    ...config,
  } as UseContractReadConfig<
    typeof revBasicDeployerABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"payHookSpecificationsOf"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerPayHookSpecificationsOf<
  TFunctionName extends 'payHookSpecificationsOf',
  TSelectData = ReadContractResult<typeof revBasicDeployerABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof revBasicDeployerABI,
      TFunctionName,
      TSelectData
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'payHookSpecificationsOf',
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractRead({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractWrite<typeof revBasicDeployerABI, TFunctionName, TMode>({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deployRevnetWith"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
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
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractWrite<
    typeof revBasicDeployerABI,
    'deployRevnetWith',
    TMode
  >({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'deployRevnetWith',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deploySuckersFor"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerDeploySuckersFor<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof revBasicDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof revBasicDeployerABI,
          'deploySuckersFor'
        >['request']['abi'],
        'deploySuckersFor',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'deploySuckersFor'
      }
    : UseContractWriteConfig<
        typeof revBasicDeployerABI,
        'deploySuckersFor',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'deploySuckersFor'
      } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractWrite<
    typeof revBasicDeployerABI,
    'deploySuckersFor',
    TMode
  >({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'deploySuckersFor',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"replaceOperatorOf"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function useRevBasicDeployerReplaceOperatorOf<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof revBasicDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof revBasicDeployerABI,
          'replaceOperatorOf'
        >['request']['abi'],
        'replaceOperatorOf',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'replaceOperatorOf'
      }
    : UseContractWriteConfig<
        typeof revBasicDeployerABI,
        'replaceOperatorOf',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'replaceOperatorOf'
      } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractWrite<
    typeof revBasicDeployerABI,
    'replaceOperatorOf',
    TMode
  >({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'replaceOperatorOf',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function usePrepareRevBasicDeployerWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof revBasicDeployerABI, TFunctionName>,
    'abi' | 'address'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return usePrepareContractWrite({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    ...config,
  } as UsePrepareContractWriteConfig<typeof revBasicDeployerABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deployRevnetWith"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function usePrepareRevBasicDeployerDeployRevnetWith(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof revBasicDeployerABI,
      'deployRevnetWith'
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return usePrepareContractWrite({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'deployRevnetWith',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof revBasicDeployerABI,
    'deployRevnetWith'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deploySuckersFor"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function usePrepareRevBasicDeployerDeploySuckersFor(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof revBasicDeployerABI,
      'deploySuckersFor'
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return usePrepareContractWrite({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'deploySuckersFor',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof revBasicDeployerABI,
    'deploySuckersFor'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"replaceOperatorOf"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x1685250188491Fd677cC5A7A40B3d8252cB1C917)
 */
export function usePrepareRevBasicDeployerReplaceOperatorOf(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof revBasicDeployerABI,
      'replaceOperatorOf'
    >,
    'abi' | 'address' | 'functionName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return usePrepareContractWrite({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'replaceOperatorOf',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof revBasicDeployerABI,
    'replaceOperatorOf'
  >)
}
