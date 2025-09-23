import { useState, useEffect } from 'react'
import { LoyaltyCard } from './LoyaltyCard'
import { CouponCarousel } from './CouponCarousel'

type CreateMembershipResponse = {
  status: string
  message: string
  data: {
    name: string
    email?: string
    phone?: string
    birthday?: string
    profileImage: string
    cardImage: string
    serial: string
    point: number
    tierTitle: string
    isEligibleForCoupon: boolean
    coupons: any[]
  }
}

type Props = {
  created: CreateMembershipResponse['data']
  values: {
    name: string
    phone: string
    email: string
    birthday: string
    photoFile: File | null
  }
  selectedCardUrl: string
  onBack: () => void
}

export function ResultPage({ created, values, selectedCardUrl }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Create avatar URL from photo file
  useEffect(() => {
    if (values.photoFile) {
      const url = URL.createObjectURL(values.photoFile)
      setAvatarUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [values.photoFile])

  function handleClaimClick() {
    // Use smart deeplink that automatically handles device detection and store redirection
    const DEEPLINK_URL = 'https://bogaapp.boga.id'
    
    // Open deeplink - this will automatically:
    // - Open Boga App if installed
    // - Redirect to appropriate store (Play Store for Android, App Store for iOS) if not installed
    // - Fallback to website for other devices
    window.open(DEEPLINK_URL, '_blank')
  }

  return (
    <div className="result-page">
      {/* Header */}
      {/* <div className="px-4 py-4 flex justify-between items-center">
        <button onClick={onBack} className="text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white text-lg font-bold">Your Card</h1>
        <div className="w-8 h-8"></div> 
      </div> */}

      {/* Main Content */}
      <div className="flex-1 px-4 pb-4 flex items-center justify-center">
        <div className="w-full max-w-md p-4 space-y-4 rounded-xl">
          <div>
            <div className="text-xs text-neutral-300 mb-2">Your card</div>
            <LoyaltyCard
              backgroundImageUrl={created?.cardImage || selectedCardUrl}
              colorFrom="#ef4444"
              colorTo="#b91c1c"
              tierLabel={created?.tierTitle || ''}
              name={created?.name || values.name}
              pointsLabel={created ? String(created.point) : '0 pts'}
              cardNumber={created?.serial || '6202 1000 8856 6962'}
              holderLabel={created?.name || values.name}
              avatarUrl={avatarUrl || undefined}
              hideChoose
            />
          </div>
          
          {created?.isEligibleForCoupon && created.coupons && created.coupons.length > 0 && (
            <div className="border-t border-neutral-200 pt-4">
              <div className="text-xs text-neutral-500 mb-2">Special offers</div>
              <CouponCarousel coupons={created.coupons.map(coupon => ({
                id: coupon.id,
                name: coupon.title,
                image: coupon.imageUrl,
                description: coupon.description,
                validUntil: coupon.validUntil
              }))} />
            </div>
          )}
          
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleClaimClick}
              className="py-4 px-2 bg-white text-red-600 font-bold text-lg rounded-xl shadow-lg"
            >
              Download Boga App
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full p-1 text-center text-xs text-white/70">
        2025 Boga Group. All Rights Reserved
      </footer>
    </div>
  )
}