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
  chainNames,
} from '@/app/constants'

interface ChainSelectorProps {
  value: JBChainId;
  onChange: (chainId: JBChainId) => void;
  disabled?: boolean;
}

const chainImage = (chainIdString: any) => {
  const chainId = Number(chainIdString) as JBChainId;
  return (
    <Image
      src={chainIdToLogo[chainId]}
      alt={`${chainNames[chainId]} Logo`}
      width={20}
      height={20}
    />
  )
}

export const ChainSelector = ({ value, onChange, disabled }: ChainSelectorProps) => {
  return (
    <Select
      onValueChange={(value) => { onChange(Number(value) as JBChainId)}}
      disabled={disabled}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select chain">
          <div className="flex items-center gap-2">
            {chainImage(value)}
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
              {chainImage(chainId)}
              <span>{chainName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
