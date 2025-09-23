function App() {
  return (
    <div style={{
      height: '100vh',
      background: '#dc2626',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <img 
          src="/BogaGroupLogo.png" 
          alt="Boga Group Logo" 
          style={{ width: '150px', height: '150px', marginBottom: '20px' }}
        />
      </div>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>BOGA</div>
      <div style={{ fontSize: '20px', marginBottom: '30px' }}>GROUP</div>
      <div style={{ fontSize: '16px', opacity: 0.8 }}>Kartu Tanda Boga</div>
      <div style={{ 
        position: 'absolute', 
        bottom: '30px', 
        width: '50px', 
        height: '4px', 
        background: 'white', 
        borderRadius: '2px',
        animation: 'pulse 1s infinite'
      }}></div>
    </div>
  )
}

export default App