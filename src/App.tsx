import { useState } from 'react'
import { SplashScreen } from './components/SplashScreen'
import { FormSection } from './components/FormSection'
import { PhotoUploadPage } from './components/PhotoUploadPage'
import { CardSelectionPage } from './components/CardSelectionPage'
import { ResultPage } from './components/ResultPage'
import { AlertModal } from './components/AlertModal'

import type { FormValues } from './types'

export interface CreateMembershipResponse {
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

function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [values, setValues] = useState<FormValues>({
    name: '',
    birthday: '',
    phone: '',
    email: '',
    gender: '',
    photoFile: null
  })
  const [errors] = useState({})
  const [created, setCreated] = useState<CreateMembershipResponse['data'] | null>(null)
  const [selectedCardUrl, setSelectedCardUrl] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateValues = (newValues: Partial<FormValues>) => {
    setValues(prev => ({ ...prev, ...newValues }))
  }

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleSubmit = async (selectedCardUrl: string) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Validate form
      if (!values.name || !values.birthday || !values.phone || !values.email || !values.gender) {
        setAlertMessage('Please fill in all required fields')
        setShowAlert(true)
        setIsSubmitting(false)
        return
      }

      if (!values.photoFile) {
        setAlertMessage('Please upload a photo')
        setShowAlert(true)
        setIsSubmitting(false)
        return
      }

      // Compress image
      const compressedImage = await compressImage(values.photoFile)
      
      // Prepare request payload
      const requestPayload = {
        name: values.name,
        birthday: values.birthday,
        phone: values.phone,
        email: values.email,
        gender: values.gender,
        profileImage: compressedImage,
        cardDesign: selectedCardUrl
      }

      // Send request
      const response = await fetch('https://alpha-api.mybogaloyalty.id/membership-card/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      })

      const result: CreateMembershipResponse = await response.json()

      if (result.status === 'Success') {
        setCreated(result.data)
        setCurrentPage(5) // Result page
      } else {
        setAlertMessage(result.message || 'Failed to create membership card')
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Error:', error)
      if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          setAlertMessage('Network error. Please check your connection.')
        } else if (error.name === 'AbortError') {
          setAlertMessage('Request timeout. Please try again.')
        } else {
          setAlertMessage('An error occurred. Please try again.')
        }
      } else {
        setAlertMessage('An unexpected error occurred.')
      }
      setShowAlert(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    setCurrentPage(prev => prev + 1)
  }


  const handleFormNext = () => {
    if (values.name && values.birthday && values.phone && values.email && values.gender) {
      setCurrentPage(4) // Card selection page
    } else {
      setAlertMessage('Please fill in all required fields')
      setShowAlert(true)
    }
  }

  const handlePhotoBack = () => {
    setCurrentPage(2) // Form section
  }

  const handleCardSelectionNext = (selectedCard: any) => {
    setSelectedCardUrl(selectedCard.image)
    handleSubmit(selectedCard.image)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return <SplashScreen onNext={handleNext} />
      case 2:
        return (
          <FormSection
            values={values}
            errors={errors}
            onChange={updateValues}
            onNext={handleFormNext}
            onProfileUpload={() => setCurrentPage(3)}
            onPhotoError={(error: string) => {
              setAlertMessage(error)
              setShowAlert(true)
            }}
          />
        )
      case 3:
        return (
          <PhotoUploadPage
            values={values}
            errors={errors}
            onChange={updateValues}
            onBack={handlePhotoBack}
            onPhotoError={(error: string) => {
              setAlertMessage(error)
              setShowAlert(true)
            }}
          />
        )
      case 4:
        return (
          <CardSelectionPage
            values={values}
            onNext={handleCardSelectionNext}
            onBack={() => setCurrentPage(2)}
          />
        )
      case 5:
        return created ? (
          <ResultPage
            created={created}
            values={values}
            selectedCardUrl={selectedCardUrl}
            onBack={() => setCurrentPage(1)}
          />
        ) : null
      default:
        return <SplashScreen onNext={handleNext} />
    }
  }

  return (
    <>
      {renderCurrentPage()}
      <AlertModal
        isOpen={showAlert}
        title="Error"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </>
  )
}

export default App