import { useState } from 'react'
import { FormSection } from './components/FormSection'
import { AlertModal } from './components/AlertModal'
import { SplashScreen } from './components/SplashScreen'
import { PhotoUploadPage } from './components/PhotoUploadPage'
import { CardSelectionPage } from './components/CardSelectionPage'
import { ResultPage } from './components/ResultPage'
import type { FormErrors, FormValues, CreateMembershipResponse } from './types'

function App() {
  const [currentPage, setCurrentPage] = useState(1) // 1: Splash, 2: Form, 3: Photo, 4: Card Selection, 5: Result
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    gender: '',
    photoFile: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [created, setCreated] = useState<CreateMembershipResponse['data'] | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCardUrl, setSelectedCardUrl] = useState<string | null>(null)

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

  async function handleSubmit(selectedCard: any) {
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate request')
      return
    }
    
    setIsSubmitting(true)
    setSelectedCardUrl(selectedCard.imageUrl)
    
    try {
      // Build base64 for profileImage with smart compression
      let profileBase64: string | null = null
      if (values.photoFile) {
        try {
          console.log('Original file size:', values.photoFile.size, 'bytes')
          
          // Use smart compression to avoid "entity too large" error
          profileBase64 = await compressImage(values.photoFile as File, 1024) // Max 1MB
          
          console.log('Compressed base64 length:', profileBase64.length)
          console.log('Compressed base64 preview:', profileBase64.substring(0, 100))
        } catch (error) {
          console.error('Error processing image:', error)
          setAlertMessage('Error processing image. Please try again.')
          setShowAlert(true)
          setIsSubmitting(false)
          return
        }
      }

      const requestPayload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        birthday: values.birthday,
        gender: values.gender,
        profileImage: profileBase64,
        cardImage: selectedCard.imageUrl
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
        return
      } else {
        console.log('API Response profileImage:', data.data.profileImage?.substring(0, 100))
        setCreated(data.data)
        setCurrentPage(5) // Go to result page
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Submit error:', err)
      
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
    }
  }

  function closeAlert() {
    setShowAlert(false)
    setAlertMessage('')
  }

  // Navigation functions
  const handleNext = () => {
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleFormNext = () => {
    // Validate form before proceeding
    const nextErrors: FormErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Name is required'
    if (!values.phone.trim()) {
      nextErrors.phone = 'Phone number is required'
    } else if (!/^\+?\d{8,15}$/.test(values.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number'
    }
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (!values.birthday) nextErrors.birthday = 'Birthday is required'
    if (!values.gender) nextErrors.gender = 'Gender is required'

    setErrors(nextErrors)
    
    if (Object.keys(nextErrors).length === 0) {
      setCurrentPage(4) // Go directly to card selection
    } else {
      setAlertMessage('Please fill in all required fields correctly.')
      setShowAlert(true)
    }
  }


  const handlePhotoBack = () => {
    setCurrentPage(2) // Go back to form
  }

  const handleCardSelectionNext = async (selectedCard: any) => {
    // Store selected card info
    console.log('Selected card:', selectedCard)
    await handleSubmit(selectedCard)
  }

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return <SplashScreen onNext={handleNext} />
      
      case 2:
        return (
          <div className="min-h-screen bg-red-600 flex flex-col">
            {/* Header */}
            <div className="bg-red-600 px-4 py-4 flex justify-center items-center relative z-10">
              <h1 className="text-white text-lg font-bold">Kartu Tanda Boga</h1>
            </div>

            <div className="w-full bg-transparent md:min-h-0 md:my-4 md:max-w-[450px] md:w-[550px] mx-auto relative z-10">
              <main className="px-4 pb-24">
              <FormSection 
                values={values} 
                errors={errors} 
                onChange={updateValues}
                onNext={handleFormNext}
                onProfileUpload={() => setCurrentPage(3)}
                onPhotoError={(message: string) => {
                  setAlertMessage(message)
                  setShowAlert(true)
                }}
              />
              </main>
            </div>
          </div>
        )
      
      case 3:
        return (
          <PhotoUploadPage
            values={values}
            errors={errors}
            onChange={updateValues}
            onBack={handlePhotoBack}
            onPhotoError={(message: string) => {
              setAlertMessage(message)
              setShowAlert(true)
            }}
          />
        )
      
      case 4:
        return (
          <CardSelectionPage
            values={values}
            onNext={handleCardSelectionNext}
            onBack={handleBack}
          />
        )
      
      case 5:
        return created ? (
          <ResultPage
            created={created}
            values={values}
            selectedCardUrl={selectedCardUrl || ''}
            onBack={handleBack}
          />
        ) : null
      
      default:
        return <SplashScreen onNext={handleNext} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex-1 pb-8">
        {renderCurrentPage()}
      </div>
      
      {/* Fixed Bottom Footer */}
      <footer className="w-full p-1 text-center text-xs text-white/70 bg-transparent fixed bottom-0 left-0 right-0 z-10">
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