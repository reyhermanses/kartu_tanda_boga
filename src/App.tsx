import { useState, useEffect } from 'react'
// import { SplashScreen } from './components/SplashScreen'
import { FormSection } from './components/FormSection'
import { PhotoUploadPage } from './components/PhotoUploadPage'
import { CardSelectionPage } from './components/CardSelectionPage'
import { ResultPage } from './components/ResultPage'
import { AlertModal } from './components/AlertModal'

import type { FormValues, FormErrors } from './types'
import { clearSession } from './utils/sessionStorage'

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
  const [currentPage, setCurrentPage] = useState(2) // Start directly at form page
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

  // Email validation with API - only called on submit
  const validateEmailWithAPI = async (email: string, phone: string): Promise<boolean> => {
    if (!email || !phone) return false

    // Basic email format validation first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Format email tidak valid'
      }))
      return false
    }

    try {
      const response = await fetch('https://alpha-api.mybogaloyalty.id/membership-card/check-email', {
        method: 'POST',
        headers: {
          'X-BOGAMBC-Key': 'ajCJotQ8Ug1USZS3KuoXbqaazY59CAvI',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(), // Normalize email
          phone: `0${phone}` // Add 0 prefix to phone
        })
      })

      const result = await response.text()
      const isEmailAvailable = result === 'true'

      if (!isEmailAvailable) {
        setErrors(prev => ({
          ...prev,
          email: 'Email sudah digunakan'
        }))
        return false
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.email
          return newErrors
        })
        return true
      }
    } catch (error) {
      console.error('Email validation error:', error)
      // Don't show error for network issues, let user continue
      return true
    }
  }

  // Load session data on app mount - only once
  useEffect(() => {
    let isLoaded = false
    
    const loadSession = () => {
      if (isLoaded) return
      isLoaded = true
      
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        console.log('Raw session data from storage:', saved)
        
        if (saved) {
          const sessionData = JSON.parse(saved)
          console.log('Parsed session data:', sessionData)
          
          if (sessionData.currentPage) {
            console.log('Setting currentPage to:', sessionData.currentPage)
            setCurrentPage(sessionData.currentPage)
          }
          if (sessionData.values) {
            console.log('Setting values:', sessionData.values)
            
            // Convert base64 photoFile back to File if it exists
            if (sessionData.values.photoFile && typeof sessionData.values.photoFile === 'string') {
              const arr = sessionData.values.photoFile.split(',')
              const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
              const bstr = atob(arr[1])
              let n = bstr.length
              const u8arr = new Uint8Array(n)
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
              }
              const file = new File([u8arr], 'photo.jpg', { type: mime })
              sessionData.values.photoFile = file
            }
            
            setValues(sessionData.values)
          }
          if (sessionData.selectedCardUrl) {
            console.log('Setting selectedCardUrl:', sessionData.selectedCardUrl)
            setSelectedCardUrl(sessionData.selectedCardUrl)
          }
          if (sessionData.created) {
            console.log('Setting created:', sessionData.created)
            setCreated(sessionData.created)
          }
        } else {
          console.log('No session data found, starting fresh')
        }
      } catch (error) {
        console.error('Failed to load session:', error)
      }
    }
    
    // Load immediately
    loadSession()
  }, [])

  // Save session data with debouncing
  useEffect(() => {
    const saveCurrentPage = () => {
      console.log('Saving currentPage:', currentPage)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        sessionData.currentPage = currentPage
        sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
        console.log('CurrentPage saved:', currentPage)
      } catch (error) {
        console.error('Failed to save currentPage:', error)
      }
    }
    
    const timer = setTimeout(saveCurrentPage, 100)
    return () => clearTimeout(timer)
  }, [currentPage])

  useEffect(() => {
    const saveValues = () => {
      console.log('Saving values:', values)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        
        // Convert photoFile to base64 if it exists
        if (values.photoFile && values.photoFile instanceof File) {
          const reader = new FileReader()
          reader.onload = () => {
            const valuesWithBase64 = {
              ...values,
              photoFile: reader.result as string
            }
            sessionData.values = valuesWithBase64
            sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
            console.log('Values saved with base64 photo')
          }
          reader.readAsDataURL(values.photoFile)
        } else {
          sessionData.values = values
          sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
          console.log('Values saved successfully')
        }
      } catch (error) {
        console.error('Failed to save values:', error)
      }
    }
    
    const timer = setTimeout(saveValues, 100)
    return () => clearTimeout(timer)
  }, [values])

  useEffect(() => {
    const saveSelectedCardUrl = () => {
      console.log('Saving selectedCardUrl:', selectedCardUrl)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        sessionData.selectedCardUrl = selectedCardUrl
        sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
        console.log('SelectedCardUrl saved:', selectedCardUrl)
      } catch (error) {
        console.error('Failed to save selectedCardUrl:', error)
      }
    }
    
    const timer = setTimeout(saveSelectedCardUrl, 100)
    return () => clearTimeout(timer)
  }, [selectedCardUrl])

  useEffect(() => {
    const saveCreated = () => {
      console.log('Saving created:', created)
      try {
        const saved = sessionStorage.getItem('ktb_form_session')
        const sessionData = saved ? JSON.parse(saved) : {}
        sessionData.created = created
        sessionStorage.setItem('ktb_form_session', JSON.stringify(sessionData))
        console.log('Created saved:', created)
      } catch (error) {
        console.error('Failed to save created:', error)
      }
    }
    
    const timer = setTimeout(saveCreated, 100)
    return () => clearTimeout(timer)
  }, [created])

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {}
    
    if (!values.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi'
    }
    
    if (!values.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi'
    } else if (!/^[0-9]+$/.test(values.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid'
    } else if (values.phone.length < 10 || values.phone.length > 13) {
      newErrors.phone = 'Nomor telepon harus 10-13 digit'
    } else if (!values.phone.startsWith('8')) {
      newErrors.phone = 'Nomor telepon harus dimulai dengan 8'
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
      } else {
        // Calculate age
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const dayDiff = today.getDate() - birthDate.getDate()
        
        // Adjust age if birthday hasn't occurred this year
        const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age
        
        if (actualAge < 13) {
          newErrors.birthday = 'Umur minimal 13 tahun'
        }
      }
    }
    
    // Gender validation removed temporarily
    // if (!values.gender) {
    //   newErrors.gender = 'Jenis kelamin harus dipilih'
    // }
    
    // Photo validation moved to PhotoUploadPage
    // if (!values.photoFile) {
    //   newErrors.photoFile = 'Foto profil harus diupload'
    // }
    
    // Set basic validation errors first
    setErrors(newErrors)
    
    // If there are basic validation errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return false
    }
    
    // Now validate email with API
    const isEmailValid = await validateEmailWithAPI(values.email, values.phone)
    
    // Return final validation result
    return isEmailValid
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
      if (!(await validateForm())) {
        setAlertMessage('Mohon lengkapi semua field yang wajib diisi')
        setShowAlert(true)
        setIsSubmitting(false)
        return
      }

      // Compress image with smart compression to avoid "entity too large" error
      const compressedImage = await compressImage(values.photoFile!, 800) // Max 800px with 0.5 quality
      
      // Remove data:image/jpeg;base64, prefix to match old app format
      const base64String = compressedImage.replace(/^data:image\/[a-z]+;base64,/, '')
      
      // Prepare request payload
      const requestPayload = {
        name: values.name,
        birthday: values.birthday,
        // phone: `+62${values.phone}`,
        phone: `0${values.phone}`,
        email: values.email,
        // gender: values.gender, // Temporarily removed
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
        console.log('Success! Clearing session...')
        // Clear session after successful submit
        clearSession()
        console.log('Session cleared successfully')
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

  // const handleNext = () => {
  //   setCurrentPage(prev => prev + 1)
  // }


  const handleFormNext = async () => {
    if (await validateForm()) {
      setCurrentPage(3) // Photo upload page
    } else {
      setAlertMessage('Mohon lengkapi semua field yang wajib diisi')
      setShowAlert(true)
    }
  }

  const handlePhotoBack = () => {
    setCurrentPage(2) // Form section
  }

  const handlePhotoNext = () => {
    setCurrentPage(4) // Card selection page
  }

  const handleCardSelectionNext = (selectedCard: any) => {
    console.log('Selected card:', selectedCard)
    console.log('Card image URL:', selectedCard.imageUrl)
    setSelectedCardUrl(selectedCard.imageUrl)
    handleSubmit(selectedCard.imageUrl)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      // case 1:
      //   return <SplashScreen onNext={handleNext} />
      case 1:
      case 2:
        return (
          <FormSection
            values={values}
            errors={errors}
            onChange={updateValues}
            onNext={handleFormNext}
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
            onNext={handlePhotoNext}
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
        // return <SplashScreen onNext={handleNext} />
        return (
          <FormSection
            values={values}
            errors={errors}
            onChange={updateValues}
            onNext={handleFormNext}
            onPhotoError={(error: string) => {
              setAlertMessage(error)
              setShowAlert(true)
            }}
          />
        )
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