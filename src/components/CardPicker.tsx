import type { CardTier } from '../types'
// import { LoyaltyCard } from './LoyaltyCard'

type Props = {
  selected: CardTier
  onChange: (t: CardTier) => void
}

export function CardPicker(_: Props) {
  return (
    <div className="mt-3 space-y-4 -mx-4">
      {/* Static LoyaltyCard samples temporarily disabled */}
    </div>
  )
}


