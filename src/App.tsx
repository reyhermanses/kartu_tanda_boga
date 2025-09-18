import { useState } from 'react'
import { Header } from './components/Header'
import { FormSection } from './components/FormSection'
import { CardPicker } from './components/CardPicker'
import { CardList } from './components/CardList'
import { LoyaltyCard } from './components/LoyaltyCard'
import { CouponCarousel } from './components/CouponCarousel'
import { AlertModal } from './components/AlertModal'
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
  const [compressedAvatarUrl, setCompressedAvatarUrl] = useState<string | null>(null)
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null)
  const [selectedCardUrl, setSelectedCardUrl] = useState<string | null>(null)
  const [created, setCreated] = useState<CreateMembershipResponse['data'] | null>(null)
  const [cardError, setCardError] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateValues(next: Partial<FormValues>) {
    setValues((prev) => ({ ...prev, ...next }))
  }

  // Smart image compression function
  async function compressImage(file: File, maxSizeKB: number = 1024): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px)
        const maxDimension = 1200
        let { width, height } = img
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Try different quality levels
        let quality = 0.9
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        
        // If still too large, reduce quality
        while (dataUrl.length > maxSizeKB * 1024 * 1.33 && quality > 0.1) { // 1.33 for base64 overhead
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        
        resolve(dataUrl)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
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
    if (!v.photoFile) {
      nextErrors.photoFile = 'Photo is required'
    }
    return nextErrors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate request')
      return
    }
    
    // Reset any previous errors
    setErrors({})
    setCardError(null)
    setAlertMessage('')
    setShowAlert(false)
    
    setIsSubmitting(true)
    
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setAlertMessage('Please fill in all required fields correctly.')
      setShowAlert(true)
      setIsSubmitting(false)
      return
    }

    if (selectedCardIdx === null) {
      setCardError('Please choose a card design')
      setAlertMessage('Please choose a card design to continue.')
      setShowAlert(true)
      setIsSubmitting(false)
      return
    }
    
    console.log('Starting submission with:', {
      selectedCardUrl,
      selectedCardIdx,
      hasPhotoFile: !!values.photoFile,
      isSubmitting
    })

    // Build base64 for profileImage with smart compression
    let profileBase64: string | null = null
    if (values.photoFile) {
      try {
        console.log('Original file size:', values.photoFile.size, 'bytes')
        
        // Use smart compression to avoid "entity too large" error
        profileBase64 = await compressImage(values.photoFile as File, 1024) // Max 1MB
        
        console.log('Compressed base64 length:', profileBase64.length)
        console.log('Compressed base64 preview:', profileBase64.substring(0, 100))
        
        // Store compressed image for display
        setCompressedAvatarUrl(profileBase64)
        
        const url = URL.createObjectURL(values.photoFile)
        if (avatarUrl) URL.revokeObjectURL(avatarUrl)
        setAvatarUrl(url)
      } catch (error) {
        console.error('Error processing image:', error)
        setAlertMessage('Error processing image. Please try again.')
        setShowAlert(true)
        setIsSubmitting(false)
        return
      }
    }

    try {
      const requestPayload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        birthday: values.birthday,
        profileImage: profileBase64,
        cardImage: selectedCardUrl
      }
      
      console.log('Request payload:', {
        ...requestPayload,
        profileImage: profileBase64 ? `${profileBase64.substring(0, 50)}...` : null
      })
      
      const res = await fetch('https://alpha-api.mybogaloyalty.id/membership-card/create', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'X-BOGAMBC-Key': 'ajCJotQ8Ug1USZS3KuoXbqaazY59CAvI',
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error Response:', {
          status: res.status,
          statusText: res.statusText,
          body: errorText
        })
        throw new Error(`Create failed: ${res.status}`)
      }
      const data: CreateMembershipResponse = await res.json()
      
      if (data.status === 'Failed') {
        setAlertMessage(data.message || 'Failed to register Boga App')
        setShowAlert(true)
        setCreated(null)
        setIsSubmitting(false)
        return // Jangan lanjut ke setSubmitted(true)
      } else {
        console.log('API Response profileImage:', data.data.profileImage?.substring(0, 100))
        setCreated(data.data)
        setSubmitted(true)
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Submit error:', err)
      
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.name === 'TimeoutError') {
          setAlertMessage('Request timeout. Please try again.')
        } else if (err.name === 'AbortError') {
          setAlertMessage('Request was cancelled. Please try again.')
        } else {
          setAlertMessage('Network error. Please check your connection and try again.')
        }
      } else {
        setAlertMessage('An unexpected error occurred. Please try again.')
      }
      
      setShowAlert(true)
      setCreated(null)
      setIsSubmitting(false)
      return // Jangan lanjut ke setSubmitted(true)
    }
  }

  function handleClaimClick() {
    // Use smart deeplink that automatically handles device detection and store redirection
    const DEEPLINK_URL = 'https://bogaapp.boga.id'
    
    // Open deeplink - this will automatically:
    // - Open Boga App if installed
    // - Redirect to appropriate store (Play Store for Android, App Store for iOS) if not installed
    // - Fallback to website for other devices
    window.open(DEEPLINK_URL, '_blank')
  }

  function closeAlert() {
    setShowAlert(false)
    setAlertMessage('')
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
                <FormSection 
                  values={values} 
                  errors={errors} 
                  onChange={updateValues}
                  onPhotoError={(message: string) => {
                    setAlertMessage(message)
                    setShowAlert(true)
                  }}
                />
                <CardPicker selected={selectedTier} onChange={setSelectedTier} />
                <div className="mt-3">
                  {/* <p className="text-sm text-neutral-600 mb-2">Available card designs</p> */}
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
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`mt-6 w-full rounded-full py-3 text-white font-semibold active:scale-[0.99] ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting ? 'Creating Card...' : 'Submit'}
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
                    tierLabel={created?.tierTitle || ''}
                    name={created?.name || values.name}
                    pointsLabel={created ? String(created.point) : '0 pts'}
                    cardNumber={created?.serial || '6202 1000 8856 6962'}
                    holderLabel={created?.name || values.name}
                    avatarUrl={(() => {
                      // Use compressed image that user uploaded, not from API response
                      const finalAvatarUrl = compressedAvatarUrl || avatarUrl || undefined
                      
                      console.log('Final avatarUrl for LoyaltyCard:', finalAvatarUrl?.substring(0, 100))
                      console.log('compressedAvatarUrl:', compressedAvatarUrl?.substring(0, 100))
                      console.log('avatarUrl:', avatarUrl)
                      console.log('created.profileImage (ignored):', created?.profileImage?.substring(0, 100))
                      
                      return finalAvatarUrl
                    })()}
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
      
      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={closeAlert}
        title="Registration Failed"
        message={alertMessage}
      />
    </div>
  )
}
export default App
