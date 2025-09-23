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

  // Smart image compression
  function compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px)
        let { width, height } = img
        const maxSize = 1200
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Adjust quality based on file size
        let quality = 0.8
        const fileSizeKB = file.size / 1024
        if (fileSizeKB > 500) quality = 0.6
        if (fileSizeKB > 1000) quality = 0.4
        
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle form submission
  async function handleSubmit(selectedCard: { imageUrl: string }) {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSelectedCardUrl(selectedCard.imageUrl)
    
    try {
      // Validate required fields
      if (!values.name || !values.email || !values.phone || !values.birthday || !values.gender) {
        setAlertMessage('Mohon lengkapi semua field yang wajib diisi')
        setShowAlert(true)
        setIsSubmitting(false)
        return
      }

      // Compress photo if exists
      let profileBase64 = null
      if (values.photoFile) {
        try {
          profileBase64 = await compressImage(values.photoFile)
        } catch (error) {
          console.error('Error compressing image:', error)
          setAlertMessage('Gagal memproses foto. Silakan coba lagi.')
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

      const response = await fetch('https://alpha-api.mybogaloyalty.id/membership-card/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: CreateMembershipResponse = await response.json()
      console.log('API Response:', result)

      if (result.status === 'Failed') {
        setAlertMessage(result.message || 'Gagal membuat kartu. Silakan coba lagi.')
        setShowAlert(true)
        setIsSubmitting(false)
        return
      }

      // Success
      setCreated(result.data)
      setCurrentPage(5) // Go to result page
      
    } catch (error) {
      console.error('Submit error:', error)
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setAlertMessage('Koneksi internet bermasalah. Silakan cek koneksi dan coba lagi.')
        } else if (error.message.includes('timeout')) {
          setAlertMessage('Request timeout. Silakan coba lagi.')
        } else {
          setAlertMessage('Terjadi kesalahan. Silakan coba lagi.')
        }
      } else {
        setAlertMessage('Terjadi kesalahan. Silakan coba lagi.')
      }
      setShowAlert(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigation functions
  function handleNext() {
    setCurrentPage(prev => prev + 1)
  }

  function handleBack() {
    setCurrentPage(prev => prev - 1)
  }

  function handleFormNext() {
    // Validate form
    const newErrors: FormErrors = {}
    if (!values.name) newErrors.name = 'Nama harus diisi'
    if (!values.email) newErrors.email = 'Email harus diisi'
    if (!values.phone) newErrors.phone = 'Nomor telepon harus diisi'
    if (!values.birthday) newErrors.birthday = 'Tanggal lahir harus diisi'
    if (!values.gender) newErrors.gender = 'Jenis kelamin harus dipilih'

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setCurrentPage(4) // Go directly to Card Selection
    }
  }

  function handlePhotoBack() {
    setCurrentPage(2) // Go back to Form
  }

  // Render current page
  function renderCurrentPage() {
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
            onPhotoError={(message) => {
              setAlertMessage(message)
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
            onPhotoError={(message) => {
              setAlertMessage(message)
              setShowAlert(true)
            }}
          />
        )
      case 4:
        return (
          <CardSelectionPage
            values={values}
            onNext={(selectedCard) => handleSubmit(selectedCard)}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <ResultPage
            created={created!}
            values={values}
            selectedCardUrl={selectedCardUrl || ''}
            onBack={() => setCurrentPage(1)}
          />
        )
      default:
        return <SplashScreen onNext={handleNext} />
    }
  }

  return (
    <>
      {renderCurrentPage()}
      <AlertModal
        isOpen={showAlert}
        title="Pemberitahuan"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </>
  )
}

export default App