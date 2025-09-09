import { Camera, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  onChange?: (file: File | null) => void
  error?: string
  required?: boolean
}

export function PhotoUploader({ onChange, error, required }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleButtonClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const nextUrl = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return nextUrl
    })
    onChange?.(file)
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className="mt-2 flex items-center gap-3">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="h-14 w-14 rounded-lg object-cover"
        />
      ) : (
        <div className="h-14 w-14 rounded-lg bg-neutral-200 grid place-items-center text-neutral-500">
          <Camera />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700"
      >
        <Upload className="h-4 w-4" /> Upload Photo {required && <span className="text-rose-600">*</span>}
      </button>
      {error && (
        <span className="text-xs text-rose-600">{error}</span>
      )}
    </div>
  )
}


