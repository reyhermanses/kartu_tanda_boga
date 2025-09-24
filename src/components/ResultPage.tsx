import { useState, useEffect } from 'react'
import { CouponCarousel } from './CouponCarousel'
import { Footer } from './Footer'

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

export function ResultPage({ created, values }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Format birthday function (same as CardSelectionPage)
  function formatBirthday(dateString: string): string {
    const date = new Date(dateString)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

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
      <div className="flex-1 pb-4 flex items-center justify-center">
        <div className="w-full max-w-md p-4 space-y-4 rounded-xl">
          <div>
            <div className="text-xs text-neutral-300 mb-2">Your card</div>
            <div
              className="rounded-2xl relative overflow-hidden shadow-2xl w-full h-[245px] sm:h-[280px] md:h-[310px]"
              style={{
                background: created?.cardImage ? `url(${created.cardImage})` : '#f3f4f6',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* KTB BOGA GROUP Logo - Top Left */}
              <div className="absolute top-4 left-4 text-white">
                <div className="font-bold text-lg">KTB</div>
                <div className="text-sm font-semibold">BOGA GROUP</div>
              </div>

              {/* BOGA Logo - Top Right */}
              <div className="absolute top-4 right-4 text-white">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                    <span className="text-black font-bold text-xs">G</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm">BOGA</div>
                    <div className="text-xs">GROUP</div>
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-[100px]">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-200">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info Card - Centered */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white rounded-full px-3 py-1 flex items-center shadow-xl">
                    <span className="text-black font-bold text-sm mr-2">{created?.name || values.name}</span>
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-center">
                  <div className="bg-black/60 rounded-full px-3 py-1 flex items-center shadow-lg">
                    <span className="text-white font-medium text-xs" style={{ fontFamily: 'Roboto' }}>{values.birthday ? formatBirthday(values.birthday) : '13 SEP 1989'}</span>
                  </div>
                  <span className="text-white font-medium text-xs ml-1" style={{ fontFamily: 'Roboto' }}>{values.phone || '0877-9832-0931'}</span>
                </div>
                <div className="text-yellow-200 text-sm space-y-1">
                  <div>{values.email || 'valeriebahagia@gmail.com'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {created?.isEligibleForCoupon && created.coupons && created.coupons.length > 0 && (
            <div className="border-t border-neutral-200 pt-4">
              <div className="text-xs text-neutral-300 mb-2">Special offers</div>
              <CouponCarousel coupons={created.coupons.map((coupon, index) => ({
                id: index + 1,
                name: coupon.name,
                image: coupon.image,
                description: '',
                validUntil: ''
              }))} />
            </div>
          )}
          
          <div className="flex justify-center pt-4 sm:pt-6 md:pt-10 px-3 sm:px-6 pb-3 sm:pb-6">
            <button
              onClick={handleClaimClick}
              className="w-[150px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100"
            >
              Claim Voucher
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}