import { useState } from 'react'

type CardData = {
  name: string
  phone: string
  email: string
  birthday: string
  profileImage?: string
  cardImage?: string
}

type Props = {
  cardData: CardData
  selectedCardUrl?: string
  onDownload?: () => void
}

export function CardDownloader({ cardData, selectedCardUrl, onDownload }: Props) {
  const [isDownloading, setIsDownloading] = useState(false)

  // Format birthday function
  function formatBirthday(dateString: string): string {
    const date = new Date(dateString)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  // Load image with CORS handling
  async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => {
        console.log('Failed to load image:', url)
        reject(new Error('Failed to load image'))
      }
      img.src = url
    })
  }

  // Draw rounded rectangle
  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor?: string | CanvasGradient,
    strokeColor?: string
  ) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()

    if (fillColor) {
      ctx.fillStyle = fillColor
      ctx.fill()
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor
      ctx.stroke()
    }
  }

  // Draw shadow
  function drawShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    shadowColor: string = 'rgba(0, 0, 0, 0.1)',
    blur: number = 10
  ) {
    ctx.save()
    ctx.shadowColor = shadowColor
    ctx.shadowBlur = blur
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 5
    drawRoundedRect(ctx, x, y, width, height, radius, shadowColor)
    ctx.restore()
  }

  // Main download function
  async function handleDownload() {
    try {
      setIsDownloading(true)
      console.log('=== CARD DOWNLOADER - CANVAS API NATIVE ===')

      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')

      // Set canvas size
      canvas.width = 400
      canvas.height = 250

      // Set background
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Try to load background image
      let backgroundImage: HTMLImageElement | null = null
      try {
        if (selectedCardUrl) {
          console.log('Loading background image:', selectedCardUrl)
          backgroundImage = await loadImage(selectedCardUrl)
        } else if (cardData.cardImage) {
          console.log('Loading card image:', cardData.cardImage)
          backgroundImage = await loadImage(cardData.cardImage)
        }
      } catch (error) {
        console.log('Background image failed to load, using gradient fallback')
      }

      // Draw background
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
      } else {
        // Draw gradient background as fallback
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Draw profile picture
      let profileImage: HTMLImageElement | null = null
      try {
        if (cardData.profileImage) {
          console.log('Loading profile image:', cardData.profileImage)
          profileImage = await loadImage(cardData.profileImage)
        }
      } catch (error) {
        console.log('Profile image failed to load, using default')
      }

      // Profile picture position and size
      const profileSize = 96
      const profileX = canvas.width - profileSize - 12
      const profileY = 75 - profileSize / 2

      // Draw profile picture shadow
      drawShadow(ctx, profileX, profileY, profileSize, profileSize, profileSize / 2)

      // Draw profile picture background
      ctx.fillStyle = '#dbeafe'
      drawRoundedRect(ctx, profileX, profileY, profileSize, profileSize, profileSize / 2, '#dbeafe')

      // Draw profile picture
      if (profileImage) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(profileImage, profileX, profileY, profileSize, profileSize)
        ctx.restore()
      } else {
        // Draw default profile icon
        ctx.fillStyle = '#3b82f6'
        ctx.font = '48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('👤', profileX + profileSize / 2, profileY + profileSize / 2)
      }

      // Draw profile picture border
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 4
      drawRoundedRect(ctx, profileX, profileY, profileSize, profileSize, profileSize / 2, undefined, 'white')

      // User info position
      const infoX = canvas.width - 24
      const infoY = canvas.height - 16
      let currentY = infoY

      // Draw name with checkmark
      const nameText = cardData.name || 'Member'
      ctx.font = 'bold 12px Roboto, sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      
      const nameWidth = ctx.measureText(nameText).width
      const nameHeight = 20
      const nameX = infoX - nameWidth - 20
      currentY -= nameHeight + 8

      // Draw name background with shadow
      drawShadow(ctx, nameX - 12, currentY - nameHeight / 2, nameWidth + 24, nameHeight, 20, 'rgba(0, 0, 0, 0.25)', 25)
      drawRoundedRect(ctx, nameX - 12, currentY - nameHeight / 2, nameWidth + 24, nameHeight, 20, 'white')

      // Draw name text
      ctx.fillStyle = 'black'
      ctx.fillText(nameText, nameX, currentY)

      // Draw checkmark
      const checkmarkX = nameX + nameWidth + 8
      const checkmarkSize = 16
      const checkmarkY = currentY - checkmarkSize / 2

      // Draw checkmark background
      const checkmarkGradient = ctx.createLinearGradient(checkmarkX, checkmarkY, checkmarkX + checkmarkSize, checkmarkY + checkmarkSize)
      checkmarkGradient.addColorStop(0, '#3b82f6')
      checkmarkGradient.addColorStop(1, '#2563eb')
      drawRoundedRect(ctx, checkmarkX, checkmarkY, checkmarkSize, checkmarkSize, checkmarkSize / 2, checkmarkGradient)

      // Draw checkmark icon
      ctx.fillStyle = 'white'
      ctx.font = 'bold 8px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('✓', checkmarkX + checkmarkSize / 2, checkmarkY + checkmarkSize / 2 + 3)

      // Draw birthday
      const birthdayText = cardData.birthday ? formatBirthday(cardData.birthday) : '13 SEP 1989'
      ctx.font = 'bold 10px Roboto, sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      
      const birthdayWidth = ctx.measureText(birthdayText).width
      const birthdayHeight = 16
      currentY -= birthdayHeight + 4

      // Draw birthday background with shadow
      drawShadow(ctx, infoX - birthdayWidth - 24, currentY - birthdayHeight / 2, birthdayWidth + 24, birthdayHeight, 20, 'rgba(0, 0, 0, 0.1)', 10)
      drawRoundedRect(ctx, infoX - birthdayWidth - 24, currentY - birthdayHeight / 2, birthdayWidth + 24, birthdayHeight, 20, '#60a5fa')

      // Draw birthday text
      ctx.fillStyle = 'white'
      ctx.fillText(birthdayText, infoX - 12, currentY)

      // Draw phone
      const phoneText = cardData.phone ? '0' + cardData.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '0877-9832-0931'
      ctx.font = 'bold 12px Roboto, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillStyle = '#1e40af'
      currentY -= 20
      ctx.fillText(phoneText, infoX, currentY)

      // Draw email
      const emailText = cardData.email || 'valeriebahagia@gmail.com'
      ctx.font = 'bold 12px Roboto, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillStyle = '#1e40af'
      currentY -= 16
      ctx.fillText(emailText, infoX, currentY)

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `kartu-tanda-boga-${cardData.name || 'member'}.png`
          
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          URL.revokeObjectURL(url)
          
          console.log('Download completed successfully')
          onDownload?.()
        } else {
          throw new Error('Failed to create blob from canvas')
        }
      }, 'image/png', 1.0)

    } catch (error) {
      console.error('Error downloading card:', error)
      alert(`Gagal mengunduh kartu: ${(error as Error).message}. Silakan coba lagi.`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-[150px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? 'Mengunduh...' : 'Unduh Kartu'}
    </button>
  )
}
