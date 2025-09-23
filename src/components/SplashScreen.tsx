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
    <div style={{
      height: '100vh',
      background: '#dc2626',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      position: 'relative'
    }}>
      {/* BOGA GROUP Logo */}
      <div style={{ textAlign: 'center' }}>
        <img 
          src="/BogaGroupLogo.png" 
          alt="Boga Group Logo" 
          style={{ width: '192px', height: '192px', marginBottom: '16px' }}
        />
        <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>BOGA</div>
        <div style={{ fontSize: '24px' }}>GROUP</div>
      </div>

      {/* Loading indicator */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <div style={{
          width: '32px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px'
        }}>
          <div style={{
            width: '32px',
            height: '4px',
            background: 'white',
            borderRadius: '2px',
            animation: 'pulse 1s infinite'
          }}></div>
        </div>
      </div>
    </div>
  )
}
