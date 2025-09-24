import { useState } from 'react'
import { SplashScreen } from './components/SplashScreen'
import { FormSection } from './components/FormSection'
import { PhotoUploadPage } from './components/PhotoUploadPage'
import { CardSelectionPage } from './components/CardSelectionPage'
import { ResultPage } from './components/ResultPage'
import { AlertModal } from './components/AlertModal'

import type { FormValues, FormErrors } from './types'

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
  const [errors, setErrors] = useState<FormErrors>({})
  const [created, setCreated] = useState<CreateMembershipResponse['data'] | null>(null)
  const [selectedCardUrl, setSelectedCardUrl] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateValues = (newValues: Partial<FormValues>) => {
    setValues(prev => ({ ...prev, ...newValues }))
    // Clear errors when user starts typing
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!values.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi'
    }
    
    if (!values.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi'
    } else if (!/^[0-9+\-\s()]+$/.test(values.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid'
    }
    
    if (!values.email.trim()) {
      newErrors.email = 'Email harus diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Format email tidak valid'
    }
    
    if (!values.birthday) {
      newErrors.birthday = 'Tanggal lahir harus diisi'
    } else {
      const birthDate = new Date(values.birthday)
      const today = new Date()
      if (birthDate >= today) {
        newErrors.birthday = 'Tanggal lahir harus di masa lalu'
      }
    }
    
    if (!values.gender) {
      newErrors.gender = 'Jenis kelamin harus dipilih'
    }
    
    if (!values.photoFile) {
      newErrors.photoFile = 'Foto profil harus diupload'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.5): Promise<string> => {
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
      if (!validateForm()) {
        setAlertMessage('Mohon lengkapi semua field yang wajib diisi')
        setShowAlert(true)
        setIsSubmitting(false)
        return
      }

      // Compress image with smart compression to avoid "entity too large" error
      const compressedImage = await compressImage(values.photoFile, 800) // Max 800px with 0.5 quality
      
      // Remove data:image/jpeg;base64, prefix to match old app format
      const base64String = compressedImage.replace(/^data:image\/[a-z]+;base64,/, '')
      
      // Prepare request payload
      const requestPayload = {
        name: values.name,
        birthday: values.birthday,
        phone: values.phone,
        email: values.email,
        gender: values.gender,
        profileImage: base64String,
        cardImage: selectedCardUrl
      }
      
      console.log('Request payload:', {
        ...requestPayload,
        profileImage: base64String ? `${base64String.substring(0, 50)}...` : null,
        cardImage: selectedCardUrl
      })
      
      console.log('CardImage value:', selectedCardUrl)
      console.log('CardImage type:', typeof selectedCardUrl)
      console.log('CardImage length:', selectedCardUrl ? selectedCardUrl.length : 'null/undefined')

      // Send request
      const response = await fetch('https://alpha-api.mybogaloyalty.id/membership-card/create', {
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
    if (validateForm()) {
      setCurrentPage(4) // Card selection page
    } else {
      setAlertMessage('Mohon lengkapi semua field yang wajib diisi')
      setShowAlert(true)
    }
  }

  const handlePhotoBack = () => {
    setCurrentPage(2) // Form section
  }

  const handleCardSelectionNext = (selectedCard: any) => {
    console.log('Selected card:', selectedCard)
    console.log('Card image URL:', selectedCard.imageUrl)
    setSelectedCardUrl(selectedCard.imageUrl)
    handleSubmit(selectedCard.imageUrl)
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