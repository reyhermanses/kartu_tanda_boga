import { useEffect } from 'react'

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
      {/* Simple Background */}
      <div className="absolute inset-0 bg-red-600"></div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
        {/* BOGA GROUP Logo */}
        <div className="text-center">
          <img 
            src="/BogaGroupLogo.png" 
            alt="Boga Group Logo" 
            className="w-48 h-48 mx-auto mb-4"
          />
          {/* <div className="text-4xl font-bold text-white">BOGA</div>
          <div className="text-2xl text-white">GROUP</div> */}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-1 bg-white/30 rounded-full">
          <div className="w-8 h-1 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
