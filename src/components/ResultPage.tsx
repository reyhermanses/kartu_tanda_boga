import { useState, useEffect, useRef } from 'react'
import { CouponCarousel } from './CouponCarousel'
import { Footer } from './Footer'
import html2canvas from 'html2canvas'

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
  const cardRef = useRef<HTMLDivElement>(null)

  // Format birthday function (same as CardSelectionPage)
  function formatBirthday(dateString: string): string {
    const date = new Date(dateString)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  // Create avatar URL from photo file or fallback to created profile image
  useEffect(() => {
    if (values.photoFile) {
      const url = URL.createObjectURL(values.photoFile)
      setAvatarUrl(url)
      return () => URL.revokeObjectURL(url)
    } else if (created?.profileImage) {
      // Fallback to created profile image if photoFile is not available
      setAvatarUrl(created.profileImage)
    }
  }, [values.photoFile, created?.profileImage])

  function handleClaimClick() {
    // Use smart deeplink that automatically handles device detection and store redirection
    const DEEPLINK_URL = 'https://bogaapp.boga.id'
 
    // Open deeplink - this will automatically:
    // - Open Boga App if installed
    // - Redirect to appropriate store (Play Store for Android, App Store for iOS) if not installed
    // - Fallback to website for other devices
    window.open(DEEPLINK_URL, '_blank')
  }

  async function handleDownloadCard() {
    try {
      // Create a temporary card element for download with exact design
      const tempCard = document.createElement('div')
      tempCard.style.width = '400px'
      tempCard.style.height = '250px'
      tempCard.style.position = 'relative'
      tempCard.style.overflow = 'hidden'
      tempCard.style.borderRadius = '16px'
      tempCard.style.backgroundColor = '#f3f4f6' // Fallback background
      tempCard.style.fontFamily = 'Roboto, sans-serif'
      tempCard.style.display = 'block'
      tempCard.style.visibility = 'visible'
      
      // Set background image if available
      if (created?.cardImage) {
        // Create a background image element to handle CORS
        const bgImg = document.createElement('img')
        bgImg.src = created.cardImage
        bgImg.style.position = 'absolute'
        bgImg.style.top = '0'
        bgImg.style.left = '0'
        bgImg.style.width = '100%'
        bgImg.style.height = '100%'
        bgImg.style.objectFit = 'cover'
        bgImg.style.zIndex = '1'
        bgImg.style.borderRadius = '16px'
        bgImg.crossOrigin = 'anonymous'
        tempCard.appendChild(bgImg)
      }

      // Add profile picture
      const profileDiv = document.createElement('div')
      profileDiv.style.position = 'absolute'
      profileDiv.style.right = '12px'
      profileDiv.style.top = '75px'
      profileDiv.style.transform = 'translateY(-50%)'
      profileDiv.style.width = '96px'
      profileDiv.style.height = '96px'
      profileDiv.style.borderRadius = '50%'
      profileDiv.style.overflow = 'hidden'
      profileDiv.style.border = '4px solid white'
      profileDiv.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      profileDiv.style.backgroundColor = '#dbeafe'
      profileDiv.style.zIndex = '3'

      if (avatarUrl) {
        const img = document.createElement('img')
        img.src = avatarUrl
        img.style.width = '100%'
        img.style.height = '100%'
        img.style.objectFit = 'cover'
        img.crossOrigin = 'anonymous'
        profileDiv.appendChild(img)
      } else {
        // Add default avatar icon
        const defaultSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        defaultSvg.setAttribute('width', '48')
        defaultSvg.setAttribute('height', '48')
        defaultSvg.setAttribute('fill', '#3b82f6')
        defaultSvg.setAttribute('viewBox', '0 0 20 20')
        defaultSvg.style.margin = '24px'
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('fill-rule', 'evenodd')
        path.setAttribute('d', 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z')
        defaultSvg.appendChild(path)
        profileDiv.appendChild(defaultSvg)
      }

      // Add user info container
      const userInfoDiv = document.createElement('div')
      userInfoDiv.style.position = 'absolute'
      userInfoDiv.style.bottom = '16px'
      userInfoDiv.style.right = '24px'
      userInfoDiv.style.textAlign = 'right'
      userInfoDiv.style.display = 'flex'
      userInfoDiv.style.flexDirection = 'column'
      userInfoDiv.style.alignItems = 'flex-end'
      userInfoDiv.style.gap = '4px'
      userInfoDiv.style.zIndex = '2'

      // Name with checkmark
      const nameDiv = document.createElement('div')
      nameDiv.style.display = 'flex'
      nameDiv.style.alignItems = 'center'
      nameDiv.style.justifyContent = 'flex-end'
      nameDiv.style.marginBottom = '8px'
      nameDiv.style.backgroundColor = 'white'
      nameDiv.style.borderRadius = '20px'
      nameDiv.style.padding = '4px 12px'
      nameDiv.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'

      const nameSpan = document.createElement('span')
      nameSpan.textContent = created?.name || values.name
      nameSpan.style.color = 'black'
      nameSpan.style.fontWeight = '800'
      nameSpan.style.fontSize = '12px'
      nameSpan.style.marginRight = '8px'

      const checkmarkDiv = document.createElement('div')
      checkmarkDiv.style.width = '16px'
      checkmarkDiv.style.height = '16px'
      checkmarkDiv.style.borderRadius = '50%'
      checkmarkDiv.style.background = 'linear-gradient(to right, #3b82f6, #2563eb)'
      checkmarkDiv.style.display = 'flex'
      checkmarkDiv.style.alignItems = 'center'
      checkmarkDiv.style.justifyContent = 'center'

      const checkmarkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      checkmarkSvg.setAttribute('width', '8')
      checkmarkSvg.setAttribute('height', '8')
      checkmarkSvg.setAttribute('fill', 'white')
      checkmarkSvg.setAttribute('viewBox', '0 0 20 20')
      const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      checkPath.setAttribute('fill-rule', 'evenodd')
      checkPath.setAttribute('d', 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z')
      checkmarkSvg.appendChild(checkPath)
      checkmarkDiv.appendChild(checkmarkSvg)

      nameDiv.appendChild(nameSpan)
      nameDiv.appendChild(checkmarkDiv)

      // Birthday
      const birthdayDiv = document.createElement('div')
      birthdayDiv.style.backgroundColor = '#60a5fa'
      birthdayDiv.style.borderRadius = '20px'
      birthdayDiv.style.padding = '4px 12px'
      birthdayDiv.style.display = 'inline-block'
      birthdayDiv.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'

      const birthdaySpan = document.createElement('span')
      birthdaySpan.textContent = values.birthday ? formatBirthday(values.birthday) : '13 SEP 1989'
      birthdaySpan.style.color = 'white'
      birthdaySpan.style.fontWeight = '800'
      birthdaySpan.style.fontSize = '10px'
      birthdaySpan.style.fontFamily = 'Roboto, sans-serif'
      birthdayDiv.appendChild(birthdaySpan)

      // Phone
      const phoneDiv = document.createElement('div')
      phoneDiv.style.color = '#1e40af'
      phoneDiv.style.fontWeight = '800'
      phoneDiv.style.fontSize = '12px'
      phoneDiv.style.fontFamily = 'Roboto, sans-serif'
      phoneDiv.textContent = values.phone ? '0' + values.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '0877-9832-0931'

      // Email
      const emailDiv = document.createElement('div')
      emailDiv.style.color = '#1e40af'
      emailDiv.style.fontWeight = '800'
      emailDiv.style.fontSize = '12px'
      emailDiv.textContent = values.email || 'valeriebahagia@gmail.com'

      userInfoDiv.appendChild(nameDiv)
      userInfoDiv.appendChild(birthdayDiv)
      userInfoDiv.appendChild(phoneDiv)
      userInfoDiv.appendChild(emailDiv)

      // Add elements to tempCard in correct order (background first, then content)
      tempCard.appendChild(profileDiv)
      tempCard.appendChild(userInfoDiv)

      // Add to DOM temporarily
      tempCard.style.position = 'absolute'
      tempCard.style.top = '-9999px'
      tempCard.style.left = '-9999px'
      tempCard.style.zIndex = '9999'
      tempCard.style.visibility = 'visible'
      tempCard.style.opacity = '1'
      document.body.appendChild(tempCard)

      // Wait for background image to load
      if (created?.cardImage) {
        const bgImg = tempCard.querySelector('img')
        if (bgImg) {
          await new Promise((resolve) => {
            if (bgImg.complete) {
              resolve(true)
            } else {
              bgImg.onload = () => resolve(true)
              bgImg.onerror = () => {
                console.log('Background image failed to load, using fallback')
                resolve(true)
              }
              setTimeout(() => resolve(true), 5000) // Fallback timeout
            }
          })
        }
      }

      // Wait for avatar image to load
      if (avatarUrl) {
        const avatarImg = profileDiv.querySelector('img')
        if (avatarImg) {
          await new Promise((resolve) => {
            if (avatarImg.complete) {
              resolve(true)
            } else {
              avatarImg.onload = () => resolve(true)
              avatarImg.onerror = () => {
                console.log('Avatar image failed to load, using fallback')
                resolve(true)
              }
              setTimeout(() => resolve(true), 5000) // Fallback timeout
            }
          })
        }
      }

      // Additional wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Capture the temporary card
      const canvas = await html2canvas(tempCard, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: false,
        allowTaint: true,
        logging: false,
        width: 400,
        height: 250,
        foreignObjectRendering: false
      })

      // Clean up
      document.body.removeChild(tempCard)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/png', 1.0)
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `kartu-tanda-boga-${values.name || 'member'}.png`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading card:', error)
      alert('Gagal mengunduh kartu. Silakan coba lagi.')
    }
  }

  return (
    <div className="relative">
      {/* Background Image - Bottom Full Height */}
      <div
        className="absolute bottom-0 left-0 right-0 top-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
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
      <div className="flex-1 pb-4 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md p-4 space-y-4 rounded-xl">
          <div>
            <div className="text-xs text-neutral-300 mb-2">Tampilan Kartu</div>
            <div
              ref={cardRef}
              className="rounded-2xl relative overflow-hidden shadow-2xl w-full h-[250px] 
              max-[375px]:h-[200px] 
              max-[440px]:h-[200px] 
              max-[414px]:h-[220px] 
              max-[390px]:h-[205px] 
              max-[430px]:h-[230px]
              "
              style={{
                background: created?.cardImage ? `url(${created.cardImage})` : '#f3f4f6',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* KTB BOGA GROUP Logo - Top Left */}
              {/* <div className="absolute top-4 left-4 text-white">
                <div className="font-bold text-lg">KTB</div>
                <div className="text-sm font-semibold">BOGA GROUP</div>
              </div> */}

              {/* BOGA Logo - Top Right */}
              {/* <div className="absolute top-4 right-4 text-white">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                    <span className="text-black font-bold text-xs">G</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm">BOGA</div>
                    <div className="text-xs">GROUP</div>
                  </div>
                </div>
              </div> */}

              {/* Profile Picture */}
              <div className="absolute right-0 max-[375px]:right-0 max-[390px]:right-0 -translate-y-1/2 top-[75px]
              max-[375px]:top-[80px]
              max-[390px]:top-[80px]
              max-[414px]:top-[90px]
              max-[430px]:top-[100px]
              ">
                <div className="w-24 h-24 
                max-[375px]:w-[100px] max-[375px]:h-[100px]
                max-[390px]:w-[80px] max-[390px]:h-[80px]
                max-[414px]:w-[90px] max-[414px]:h-[90px]
                max-[430px]:w-[90px] max-[430px]:h-[90px]
                max-[375px]:scale-75 
                max-[390px]:scale-70 
                max-[414px]:scale-90 
                max-[430px]:scale-90
                rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-200">
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

              {/* User Info Card - Right Position with Centered Content */}
              <div className="absolute bottom-[-1px] right-1 text-center scale-75 max-[375px]:scale-75 max-[390px]:scale-70 max-[414px]:scale-90 max-[430px]:scale-90">
                <div className="flex items-center justify-end mb-2">
                  <div className="bg-white rounded-full px-2 py-1 sm:px-3 sm:py-1 flex items-center shadow-xl">
                    <span className="text-black font-extrabold text-xs sm:text-sm mr-1 sm:mr-2">{created?.name || values.name}</span>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <div className="bg-blue-400 rounded-full px-2 py-1 sm:px-3 sm:py-1 flex items-center shadow-lg w-fit">
                    <span className="text-white font-extrabold text-[10px] sm:text-xs" style={{ fontFamily: 'Roboto' }}>{values.birthday ? formatBirthday(values.birthday) : '13 SEP 1989'}</span>
                  </div>
                  <div className="text-blue-800 font-extrabold text-[14px] sm:text-xs" style={{ fontFamily: 'Roboto' }}>
                    {values.phone ? '0' + values.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '0877-9832-0931'}
                  </div>
                  <div className="text-blue-800 font-extrabold text-[12px]">
                    {values.email || 'valeriebahagia@gmail.com'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {created?.isEligibleForCoupon && created.coupons && created.coupons.length > 0 && (
            <div className="border-t border-neutral-200 pt-4">
              <div className="text-xs text-neutral-300 mb-2">Penawaran Khusus</div>
              <CouponCarousel coupons={created.coupons.map((coupon, index) => ({
                id: index + 1,
                name: coupon.name,
                image: coupon.image,
                description: '',
                validUntil: ''
              }))} />
            </div>
          )}

          <div className="flex flex-row justify-center gap-4 pt-4 sm:pt-6 md:pt-10 px-3 sm:px-6 pb-3 sm:pb-6">
             <button
               onClick={handleDownloadCard}
               className="w-[150px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100"
             >
               Unduh Kartu
             </button>
            <button
              onClick={handleClaimClick}
              className="w-[200px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100"
            >
              Ambil Promonya Sekarang!
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}