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
  useContractEvent,
  UseContractEventConfig,
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
      { name: 'trustedForwarder', internalType: 'address', type: 'address' },
    ],
  },
  { type: 'error', inputs: [], name: 'REVBasicDeployer_ExitDelayInEffect' },
  { type: 'error', inputs: [], name: 'REVBasicDeployer_Unauthorized' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'revnetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
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
              { name: 'ticker', internalType: 'string', type: 'string' },
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
          { name: 'premintChainId', internalType: 'uint256', type: 'uint256' },
          {
            name: 'initialSplitOperator',
            internalType: 'address',
            type: 'address',
          },
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
              { name: 'splitRate', internalType: 'uint16', type: 'uint16' },
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
        indexed: false,
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
        indexed: false,
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
        indexed: false,
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
        indexed: false,
      },
      {
        name: 'rulesetConfigurations',
        internalType: 'struct JBRulesetConfig[]',
        type: 'tuple[]',
        components: [
          {
            name: 'mustStartAtOrAfter',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          { name: 'weight', internalType: 'uint256', type: 'uint256' },
          { name: 'decayRate', internalType: 'uint256', type: 'uint256' },
          {
            name: 'approvalHook',
            internalType: 'contract IJBRulesetApprovalHook',
            type: 'address',
          },
          {
            name: 'metadata',
            internalType: 'struct JBRulesetMetadata',
            type: 'tuple',
            components: [
              {
                name: 'reservedRate',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'redemptionRate',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'baseCurrency',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'pausePay', internalType: 'bool', type: 'bool' },
              {
                name: 'pauseCreditTransfers',
                internalType: 'bool',
                type: 'bool',
              },
              { name: 'allowOwnerMinting', internalType: 'bool', type: 'bool' },
              {
                name: 'allowTerminalMigration',
                internalType: 'bool',
                type: 'bool',
              },
              { name: 'allowSetTerminals', internalType: 'bool', type: 'bool' },
              {
                name: 'allowControllerMigration',
                internalType: 'bool',
                type: 'bool',
              },
              {
                name: 'allowSetController',
                internalType: 'bool',
                type: 'bool',
              },
              { name: 'holdFees', internalType: 'bool', type: 'bool' },
              {
                name: 'useTotalSurplusForRedemptions',
                internalType: 'bool',
                type: 'bool',
              },
              { name: 'useDataHookForPay', internalType: 'bool', type: 'bool' },
              {
                name: 'useDataHookForRedeem',
                internalType: 'bool',
                type: 'bool',
              },
              { name: 'dataHook', internalType: 'address', type: 'address' },
              { name: 'metadata', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'splitGroups',
            internalType: 'struct JBSplitGroup[]',
            type: 'tuple[]',
            components: [
              { name: 'groupId', internalType: 'uint256', type: 'uint256' },
              {
                name: 'splits',
                internalType: 'struct JBSplit[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'preferAddToBalance',
                    internalType: 'bool',
                    type: 'bool',
                  },
                  { name: 'percent', internalType: 'uint256', type: 'uint256' },
                  {
                    name: 'projectId',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'beneficiary',
                    internalType: 'address payable',
                    type: 'address',
                  },
                  {
                    name: 'lockedUntil',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'hook',
                    internalType: 'contract IJBSplitHook',
                    type: 'address',
                  },
                ],
              },
            ],
          },
          {
            name: 'fundAccessLimitGroups',
            internalType: 'struct JBFundAccessLimitGroup[]',
            type: 'tuple[]',
            components: [
              { name: 'terminal', internalType: 'address', type: 'address' },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'payoutLimits',
                internalType: 'struct JBCurrencyAmount[]',
                type: 'tuple[]',
                components: [
                  { name: 'amount', internalType: 'uint256', type: 'uint256' },
                  {
                    name: 'currency',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'surplusAllowances',
                internalType: 'struct JBCurrencyAmount[]',
                type: 'tuple[]',
                components: [
                  { name: 'amount', internalType: 'uint256', type: 'uint256' },
                  {
                    name: 'currency',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
            ],
          },
        ],
        indexed: false,
      },
      {
        name: 'encodedConfiguration',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
      {
        name: 'isInProgress',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DeployRevnet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'revnetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'encodedConfiguration',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
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
        indexed: false,
      },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DeploySuckers',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'revnetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newSplitOperator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ReplaceSplitOperator',
  },
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
    inputs: [{ name: 'forwarder', internalType: 'address', type: 'address' }],
    name: 'isTrustedForwarder',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'revnetId', internalType: 'uint256', type: 'uint256' },
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
              { name: 'ticker', internalType: 'string', type: 'string' },
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
          { name: 'premintChainId', internalType: 'uint256', type: 'uint256' },
          {
            name: 'initialSplitOperator',
            internalType: 'address',
            type: 'address',
          },
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
              { name: 'splitRate', internalType: 'uint16', type: 'uint16' },
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
    name: 'launchRevnetFor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
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
      { name: 'newSplitOperator', internalType: 'address', type: 'address' },
    ],
    name: 'replaceSplitOperatorOf',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'trustedForwarder',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
] as const

/**
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const revBasicDeployerAddress = {
  11155111: '0x586431a0CF041d868034E7446Cb6cbDe43566088',
  11155420: '0x586431a0CF041d868034E7446Cb6cbDe43566088',
} as const

/**
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"isTrustedForwarder"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerIsTrustedForwarder<
  TFunctionName extends 'isTrustedForwarder',
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
    functionName: 'isTrustedForwarder',
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"trustedForwarder"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerTrustedForwarder<
  TFunctionName extends 'trustedForwarder',
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
    functionName: 'trustedForwarder',
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
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deploySuckersFor"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"launchRevnetFor"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerLaunchRevnetFor<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof revBasicDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof revBasicDeployerABI,
          'launchRevnetFor'
        >['request']['abi'],
        'launchRevnetFor',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'launchRevnetFor'
      }
    : UseContractWriteConfig<
        typeof revBasicDeployerABI,
        'launchRevnetFor',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'launchRevnetFor'
      } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractWrite<typeof revBasicDeployerABI, 'launchRevnetFor', TMode>(
    {
      abi: revBasicDeployerABI,
      address:
        revBasicDeployerAddress[
          chainId as keyof typeof revBasicDeployerAddress
        ],
      functionName: 'launchRevnetFor',
      ...config,
    } as any,
  )
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"replaceSplitOperatorOf"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerReplaceSplitOperatorOf<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof revBasicDeployerAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof revBasicDeployerABI,
          'replaceSplitOperatorOf'
        >['request']['abi'],
        'replaceSplitOperatorOf',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'replaceSplitOperatorOf'
      }
    : UseContractWriteConfig<
        typeof revBasicDeployerABI,
        'replaceSplitOperatorOf',
        TMode
      > & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'replaceSplitOperatorOf'
      } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractWrite<
    typeof revBasicDeployerABI,
    'replaceSplitOperatorOf',
    TMode
  >({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    functionName: 'replaceSplitOperatorOf',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"deploySuckersFor"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
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
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"launchRevnetFor"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function usePrepareRevBasicDeployerLaunchRevnetFor(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof revBasicDeployerABI,
      'launchRevnetFor'
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
    functionName: 'launchRevnetFor',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof revBasicDeployerABI,
    'launchRevnetFor'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link revBasicDeployerABI}__ and `functionName` set to `"replaceSplitOperatorOf"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function usePrepareRevBasicDeployerReplaceSplitOperatorOf(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof revBasicDeployerABI,
      'replaceSplitOperatorOf'
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
    functionName: 'replaceSplitOperatorOf',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof revBasicDeployerABI,
    'replaceSplitOperatorOf'
  >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link revBasicDeployerABI}__.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof revBasicDeployerABI, TEventName>,
    'abi' | 'address'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractEvent({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    ...config,
  } as UseContractEventConfig<typeof revBasicDeployerABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link revBasicDeployerABI}__ and `eventName` set to `"DeployRevnet"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerDeployRevnetEvent(
  config: Omit<
    UseContractEventConfig<typeof revBasicDeployerABI, 'DeployRevnet'>,
    'abi' | 'address' | 'eventName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractEvent({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    eventName: 'DeployRevnet',
    ...config,
  } as UseContractEventConfig<typeof revBasicDeployerABI, 'DeployRevnet'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link revBasicDeployerABI}__ and `eventName` set to `"DeploySuckers"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerDeploySuckersEvent(
  config: Omit<
    UseContractEventConfig<typeof revBasicDeployerABI, 'DeploySuckers'>,
    'abi' | 'address' | 'eventName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractEvent({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    eventName: 'DeploySuckers',
    ...config,
  } as UseContractEventConfig<typeof revBasicDeployerABI, 'DeploySuckers'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link revBasicDeployerABI}__ and `eventName` set to `"ReplaceSplitOperator"`.
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Optimism Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export function useRevBasicDeployerReplaceSplitOperatorEvent(
  config: Omit<
    UseContractEventConfig<typeof revBasicDeployerABI, 'ReplaceSplitOperator'>,
    'abi' | 'address' | 'eventName'
  > & {
    chainId?: keyof typeof revBasicDeployerAddress
    address?: Address
  } = {} as any,
) {
  const { chain } = useNetwork()
  const defaultChainId = useChainId()
  const chainId = config.chainId ?? chain?.id ?? defaultChainId
  return useContractEvent({
    abi: revBasicDeployerABI,
    address:
      revBasicDeployerAddress[chainId as keyof typeof revBasicDeployerAddress],
    eventName: 'ReplaceSplitOperator',
    ...config,
  } as UseContractEventConfig<
    typeof revBasicDeployerABI,
    'ReplaceSplitOperator'
  >)
}
