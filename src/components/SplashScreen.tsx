import { useEffect } from 'react'
import { Footer } from './Footer'

type Props = {
  onNext: () => void
}

export function SplashScreen({ onNext }: Props) {
  useEffect(() => {
    // Auto navigate after 3 seconds
    const timer = setTimeout(() => {
      onNext()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <div className="splash-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-red-600">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/15 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-white/20 rounded-full blur-lg"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
        {/* BOGA GROUP Logo */}
        <div className="text-center">
          <img 
            src="/BogaGroupLogo.png" 
            alt="Boga Group Logo" 
            className="w-48 h-48 mx-auto mb-4"
          />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-1 bg-white/30 rounded-full">
          <div className="w-8 h-1 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}