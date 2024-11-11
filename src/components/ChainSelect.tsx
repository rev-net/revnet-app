import Image from 'next/image'
import { JBChainId } from 'juice-sdk-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import {
  chainIdToLogo,
  chainNameMap,
  chainNames,
} from '@/app/constants'

interface ChainSelectorProps {
  value: JBChainId;
  onChange: (chainId: JBChainId) => void;
  disabled?: boolean;
}

export const ChainSelector = ({ value, onChange, disabled }: ChainSelectorProps) => {
  return (
    <Select
      onValueChange={(value) => { console.log(value); onChange(Number(value) as JBChainId)}}
      disabled={disabled}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Image
            src={chainIdToLogo[value]}
            alt={`${chainNames[value]} Logo`}
              width={20}
              height={20}
            />
            <span>{chainNames[value]}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(chainNames).map(([chainId, chainName]) => (
          <SelectItem
            key={chainId}
            value={chainId}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Image
                src={chainIdToLogo[Number(chainId) as JBChainId]}
                alt={`${chainName} Logo`}
                width={20}
                height={20}
              />
              <span>{chainName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
