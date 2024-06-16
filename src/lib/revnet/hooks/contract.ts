import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REVBasicDeployer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const revBasicDeployerAbi = [
  {
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CONTROLLER',
    outputs: [
      { name: '', internalType: 'contract IJBController', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'EXIT_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SUCKER_REGISTRY',
    outputs: [
      { name: '', internalType: 'contract IBPSuckerRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'revnetId', internalType: 'uint256', type: 'uint256' }],
    name: 'exitDelayOf',
    outputs: [{ name: 'exitDelay', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'revnetId', internalType: 'uint256', type: 'uint256' },
      { name: 'addr', internalType: 'address', type: 'address' },
    ],
    name: 'hasMintPermissionFor',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'forwarder', internalType: 'address', type: 'address' }],
    name: 'isTrustedForwarder',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'revnetId', internalType: 'uint256', type: 'uint256' },
      { name: 'newSplitOperator', internalType: 'address', type: 'address' },
    ],
    name: 'replaceSplitOperatorOf',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'trustedForwarder',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
  { type: 'error', inputs: [], name: 'REVBasicDeployer_ExitDelayInEffect' },
  { type: 'error', inputs: [], name: 'REVBasicDeployer_Unauthorized' },
] as const

/**
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const revBasicDeployerAddress = {
  11155111: '0x586431a0CF041d868034E7446Cb6cbDe43566088',
  11155420: '0x586431a0CF041d868034E7446Cb6cbDe43566088',
} as const

/**
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const revBasicDeployerConfig = {
  address: revBasicDeployerAddress,
  abi: revBasicDeployerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployer = /*#__PURE__*/ createUseReadContract({
  abi: revBasicDeployerAbi,
  address: revBasicDeployerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"CONTROLLER"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerController =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'CONTROLLER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"EXIT_DELAY"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerExitDelay =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'EXIT_DELAY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"SUCKER_REGISTRY"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerSuckerRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'SUCKER_REGISTRY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"beforePayRecordedWith"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerBeforePayRecordedWith =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'beforePayRecordedWith',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"beforeRedeemRecordedWith"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerBeforeRedeemRecordedWith =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'beforeRedeemRecordedWith',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"buybackHookOf"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerBuybackHookOf =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'buybackHookOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"exitDelayOf"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerExitDelayOf =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'exitDelayOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"hasMintPermissionFor"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerHasMintPermissionFor =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'hasMintPermissionFor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"isTrustedForwarder"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerIsTrustedForwarder =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'isTrustedForwarder',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"onERC721Received"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerOnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"payHookSpecificationsOf"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerPayHookSpecificationsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'payHookSpecificationsOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"trustedForwarder"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useReadRevBasicDeployerTrustedForwarder =
  /*#__PURE__*/ createUseReadContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'trustedForwarder',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link revBasicDeployerAbi}__
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWriteRevBasicDeployer = /*#__PURE__*/ createUseWriteContract({
  abi: revBasicDeployerAbi,
  address: revBasicDeployerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"deploySuckersFor"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWriteRevBasicDeployerDeploySuckersFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'deploySuckersFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"launchRevnetFor"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWriteRevBasicDeployerLaunchRevnetFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'launchRevnetFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"replaceSplitOperatorOf"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWriteRevBasicDeployerReplaceSplitOperatorOf =
  /*#__PURE__*/ createUseWriteContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'replaceSplitOperatorOf',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link revBasicDeployerAbi}__
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useSimulateRevBasicDeployer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"deploySuckersFor"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useSimulateRevBasicDeployerDeploySuckersFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'deploySuckersFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"launchRevnetFor"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useSimulateRevBasicDeployerLaunchRevnetFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'launchRevnetFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `functionName` set to `"replaceSplitOperatorOf"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useSimulateRevBasicDeployerReplaceSplitOperatorOf =
  /*#__PURE__*/ createUseSimulateContract({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    functionName: 'replaceSplitOperatorOf',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link revBasicDeployerAbi}__
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWatchRevBasicDeployerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `eventName` set to `"DeployRevnet"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWatchRevBasicDeployerDeployRevnetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    eventName: 'DeployRevnet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `eventName` set to `"DeploySuckers"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWatchRevBasicDeployerDeploySuckersEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    eventName: 'DeploySuckers',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link revBasicDeployerAbi}__ and `eventName` set to `"ReplaceSplitOperator"`
 *
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x586431a0CF041d868034E7446Cb6cbDe43566088)
 */
export const useWatchRevBasicDeployerReplaceSplitOperatorEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: revBasicDeployerAbi,
    address: revBasicDeployerAddress,
    eventName: 'ReplaceSplitOperator',
  })
