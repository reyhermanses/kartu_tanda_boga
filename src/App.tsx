import { useState } from 'react'
import { Header } from './components/Header'
import { FormSection } from './components/FormSection'
import { CardPicker } from './components/CardPicker'
import { CardList } from './components/CardList'
import { LoyaltyCard } from './components/LoyaltyCard'
import { CouponCarousel } from './components/CouponCarousel'
import type { CardTier, FormErrors, FormValues, CreateMembershipResponse } from './types'

function App() {
  const [selectedTier, setSelectedTier] = useState<CardTier>('basic')
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    photoFile: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null)
  const [selectedCardUrl, setSelectedCardUrl] = useState<string | null>(null)
  const [created, setCreated] = useState<CreateMembershipResponse['data'] | null>(null)
  const [cardError, setCardError] = useState<string | null>(null)

  function updateValues(next: Partial<FormValues>) {
    setValues((prev) => ({ ...prev, ...next }))
  }

  function validate(v: FormValues): FormErrors {
    const nextErrors: FormErrors = {}
    if (!v.name.trim()) nextErrors.name = 'Name is required'
    if (!v.phone.trim()) {
      nextErrors.phone = 'Phone number is required'
    } else if (!/^\+?\d{8,15}$/.test(v.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number'
    }
    if (!v.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (!v.birthday) nextErrors.birthday = 'Birthday is required'
    if (!v.photoFile) nextErrors.photoFile = 'Photo is required'
    return nextErrors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (selectedCardIdx === null) {
      setCardError('Please choose a card design')
      return
    }

    // Build base64 for profileImage
    let profileBase64: string | null = null
    if (values.photoFile) {
      profileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const res = typeof reader.result === 'string' ? reader.result : ''
          // Strip data URL prefix if present
          const commaIdx = res.indexOf(',')
          resolve(commaIdx >= 0 ? res.substring(commaIdx + 1) : res)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(values.photoFile as File)
      })
      const url = URL.createObjectURL(values.photoFile)
      if (avatarUrl) URL.revokeObjectURL(avatarUrl)
      setAvatarUrl(url)
    }

    try {
      const res = await fetch('https://alpha-api.mybogaloyalty.id/membership-card/create', {
        method: 'POST',
        headers: {
          'X-BOGAMBC-Key': 'ajCJotQ8Ug1USZS3KuoXbqaazY59CAvI',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          birthday: values.birthday,
          profileImage: profileBase64,
          cardImage: selectedCardUrl
        }),
      })
      if (!res.ok) throw new Error(`Create failed: ${res.status}`)
      const data: CreateMembershipResponse = await res.json()
      setCreated(data.data)
    } catch (err) {
      console.error(err)
      setCreated(null)
    }

    setSubmitted(true)
  }

  function handleClaimClick() {
    const ua = navigator.userAgent || navigator.vendor
    const isAndroid = /Android/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua)

    const PLAYSTORE_URL = (import.meta as any).env?.VITE_PLAYSTORE_URL || 'https://play.google.com/store/search?q=Boga%20Group'
    const APPSTORE_URL = (import.meta as any).env?.VITE_APPSTORE_URL || 'https://apps.apple.com/'
    const FALLBACK_URL = (import.meta as any).env?.VITE_BOGA_LANDING_URL || 'https://www.bogagroup.com/'

    const target = isAndroid ? PLAYSTORE_URL : isIOS ? APPSTORE_URL : FALLBACK_URL
    window.open(target, '_blank')
  }

  // function navigateHome() {
  //   window.location.href = '/'
  // }

  const primaryButtonClass =
    "w-[200px] rounded-md border border-neutral-300 bg-red-600 py-3 text-white font-semibold active:scale-[0.99] block mx-auto"

  function renderPostSubmitActions() {
    if (created?.isEligibleForCoupon && created.coupons && created.coupons.length > 0) {
      return (
        <button
          type="button"
          onClick={handleClaimClick}
          className={primaryButtonClass}
        >
          Claim Now
        </button>
      )
    }
    return (
      <>
        <div className="-mx-0 overflow-hidden p-6">
          <div className="text-sm text-neutral-500 text-center">Your card has been updated!</div>
        </div>
        <button
          type="button"
          onClick={handleClaimClick}
          className={primaryButtonClass}
        >
          Open Boga App
        </button>
      </>
    )
  }

  return (
    <div>
      <div className="w-full bg-white  md:min-h-0 md:my-4 md:max-w-[450px] md:w-[550px]">
        <Header />
        <main className={`px-4 ${!submitted ? 'pb-24' : 'pb-4'}`}>
          {!submitted ? (
            <>
              <form onSubmit={handleSubmit} noValidate>
                <FormSection values={values} errors={errors} onChange={updateValues} />
                <CardPicker selected={selectedTier} onChange={setSelectedTier} />
                <div className="mt-8">
                  <p className="text-sm text-neutral-600 mb-2">Available card designs</p>
                  <CardList
                    selectedIndex={selectedCardIdx ?? undefined}
                    onSelect={(idx, url) => {
                      setSelectedCardIdx(idx)
                      setSelectedCardUrl(url)
                      if (cardError) setCardError(null)
                    }}
                  />
                  {cardError && <p className="mt-2 text-sm text-red-600">{cardError}</p>}
                </div>
                <button type="submit" className="mt-6 w-full rounded-full bg-rose-600 py-3 text-white font-semibold active:scale-[0.99]">
                  Submit
                </button>
              </form>
            </>
          ) : (
            <div className="-mx-4">
              <div className="bg-white/90 p-4 space-y-4">
                <div>
                  <div className="text-xs text-neutral-500 mb-2">Your card</div>
                  <LoyaltyCard
                    backgroundImageUrl={(created?.cardImage || selectedCardUrl) ?? undefined}
                    colorFrom="#ef4444"
                    colorTo="#b91c1c"
                    tierLabel={created?.tierTitle || 'BOGA'}
                    name={created?.name || values.name}
                    pointsLabel={created ? String(created.point) : '0 pts'}
                    cardNumber={created?.serial || '6202 1000 8856 6962'}
                    holderLabel={created?.name || values.name}
                    avatarUrl={created?.profileImage || avatarUrl || undefined}
                    hideChoose
                  />
                </div>
                {created?.isEligibleForCoupon && created.coupons && created.coupons.length > 0 && (
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="text-xs text-neutral-500 mb-2">Special offers</div>
                    <CouponCarousel coupons={created.coupons} />
                  </div>
                )}
                <div className="pt-2">
                  {renderPostSubmitActions()}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <footer className={`w-full p-1 text-center text-xs text-neutral-500 ${!submitted ? 'fixed bottom-0 bg-white md:relative md:bg-transparent md:mt-4' : 'relative bg-transparent mt-4'}`}>
        2025 Boga Group. All Rights Reserved
      </footer>
    </div>
  )
}
export default App
