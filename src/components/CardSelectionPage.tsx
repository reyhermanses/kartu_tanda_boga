import { useState, useEffect } from 'react'
import type { FormValues } from '../types'

type CardDesign = {
  id: number
  name: string
  imageUrl: string
  tier: string
}

type Props = {
  values: FormValues
  onNext: (selectedCard: CardDesign) => void
  onBack: () => void
}

export function CardSelectionPage({ values, onNext }: Props) {
  const [currentCardIndex, setCurrentCardIndex] = useState(1) // Start with second card (index 1)
  const [cards, setCards] = useState<CardDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Load cards from backend
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://alpha-api.mybogaloyalty.id/membership-card', {
          method: 'GET',
          headers: {
            'X-BOGAMBC-Key': 'ajCJotQ8Ug1USZS3KuoXbqaazY59CAvI',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = await response.json()
        console.log('Cards API response:', data)

        // Transform API response to our card format
        const transformedCards = Array.isArray(data) ? data.map((card: any, index: number) => ({
          id: index + 1,
          name: card.title || getCardNameFromUrl(card.image),
          imageUrl: card.image,
          tier: 'basic'
        })) : []

        setCards(transformedCards)
      } catch (err) {
        console.error('Error loading cards:', err)
        setError('Failed to load cards. Please try again.')
        // Fallback to default cards if API fails
        setCards([
          { id: 1, name: 'JAPANESE', imageUrl: '', tier: 'basic' },
          { id: 2, name: 'COLORFULL', imageUrl: '', tier: 'basic' },
          { id: 3, name: 'NATURAL', imageUrl: '', tier: 'basic' },
          { id: 4, name: 'MODERN', imageUrl: '', tier: 'basic' },
          { id: 5, name: 'CLASSIC', imageUrl: '', tier: 'basic' }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [])

  // Helper function to get card name from URL
  const getCardNameFromUrl = (url: string): string => {
    if (url.includes('japanese') || url.includes('japan')) return 'JAPANESE'
    if (url.includes('colorful') || url.includes('color')) return 'COLORFULL'
    if (url.includes('natural') || url.includes('nature')) return 'NATURAL'
    return 'CARD'
  }

  // Helper function to format birthday to DD MONTH YYYY
  const formatBirthday = (birthday: string): string => {
    const date = new Date(birthday)
    const day = date.getDate().toString().padStart(2, '0')
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const nextCard = () => {
    console.log('=== NEXT CARD CLICKED ===')
    console.log('Current index before:', currentCardIndex)
    console.log('Cards length:', cards.length)

    if (cards.length > 0) {
      setCurrentCardIndex((prev) => {
        const next = prev + 1
        // For 4 cards: 0->1->2->3, then stop at 3
        const maxIndex = cards.length - 1
        const newIndex = next > maxIndex ? maxIndex : next
        console.log('Next card:', newIndex, 'Total cards:', cards.length)
        console.log('Will show cards:', newIndex <= 1 ? '0,1,2' : '1,2,3')
        return newIndex
      })
    }
  }

  const prevCard = () => {
    console.log('=== PREV CARD CLICKED ===')
    console.log('Current index before:', currentCardIndex)
    console.log('Cards length:', cards.length)

    if (cards.length > 0) {
      setCurrentCardIndex((prev) => {
        const prevIndex = prev - 1
        // For 4 cards: 3->2->1->0, then stop at 0
        const newIndex = prevIndex < 0 ? 0 : prevIndex
        console.log('Prev card:', newIndex, 'Total cards:', cards.length)
        console.log('Will show cards:', newIndex <= 1 ? '0,1,2' : '1,2,3')
        return newIndex
      })
    }
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('=== TOUCH START ===')
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
    console.log('Touch start Y:', e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
    console.log('Touch move Y:', e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    console.log('=== TOUCH END ===')
    console.log('Touch start:', touchStart)
    console.log('Touch end:', touchEnd)

    if (!touchStart || !touchEnd) {
      console.log('Missing touch data, ignoring')
      return
    }

    const distance = touchStart - touchEnd
    const isUpSwipe = distance > 50
    const isDownSwipe = distance < -50

    console.log('Swipe detected:', {
      distance,
      isUpSwipe,
      isDownSwipe,
      touchStart,
      touchEnd
    })

    if (isUpSwipe) {
      console.log('Swipe up - going to next card')
      nextCard() // Swipe up = next card
    } else if (isDownSwipe) {
      console.log('Swipe down - going to previous card')
      prevCard() // Swipe down = previous card
    } else {
      console.log('Swipe distance too small, ignoring')
    }
  }

  const handleSubmit = () => {
    if (cards.length > 0) {
      // Submit the current card based on currentCardIndex
      let selectedCardIndex = currentCardIndex
      let selectedCard = cards[selectedCardIndex]
      console.log('Submitting card:', selectedCardIndex, selectedCard?.name)
      console.log('Selected card object:', selectedCard)
      console.log('Selected card image URL:', selectedCard?.imageUrl)
      onNext(selectedCard)
    }
  }

  const currentCard = cards[currentCardIndex]

  console.log('Current card index:', currentCardIndex)
  console.log('Total cards:', cards.length)
  console.log('Current card:', currentCard)

  // Debug useEffect to track currentCardIndex changes
  useEffect(() => {
    console.log('=== CURRENT CARD INDEX CHANGED ===')
    console.log('New index:', currentCardIndex)
    console.log('Cards length:', cards.length)
  }, [currentCardIndex, cards.length])

  if (loading) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading cards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-red-600 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <p className="text-white text-lg">No cards available</p>
      </div>
    )
  }

  return (
    <div className="card-selection-page">
      {/* Header */}
      <div className="px-4 py-4 flex justify-center items-center">
        <h1 className="text-white text-2xl font-bold">CHOOSE YOUR CARD</h1>
      </div>

      {/* Card Preview Container - Show 3 Cards at a time */}
      <div className="px-2 sm:px-4 mb-2 sm:mb-4">
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 3 Visible Cards Container */}
          <div className="space-y-4">
            {(() => {
              console.log('=== VERTICAL CAROUSEL DEBUG ===')
              console.log('Total cards from backend:', cards.length)
              console.log('Current index:', currentCardIndex)
              console.log('Cards data:', cards.map(c => ({ name: c.name, id: c.id })))

              // Show 3 cards around the current index
              let visibleCards: CardDesign[] = []

              if (cards.length >= 3) {
                // Create visible cards with empty placeholders
                visibleCards = []

                if (currentCardIndex === 0) {
                  // Index 0: show [empty, 0, 1]
                  visibleCards = [
                    { id: -1, name: 'EMPTY', imageUrl: '', tier: 'empty' },
                    cards[0],
                    cards[1]
                  ]
                } else if (currentCardIndex === 1) {
                  // Index 1: show [0, 1, 2]
                  visibleCards = [cards[0], cards[1], cards[2]]
                } else if (currentCardIndex === 2) {
                  // Index 2: show [1, 2, 3]
                  visibleCards = [cards[1], cards[2], cards[3]]
                } else if (currentCardIndex === 3) {
                  // Index 3: show [2, 3, empty]
                  visibleCards = [
                    cards[2],
                    cards[3],
                    { id: -2, name: 'EMPTY', imageUrl: '', tier: 'empty' }
                  ]
                }

                console.log(`Showing cards for index ${currentCardIndex}`)
                console.log('Visible cards:', visibleCards.map(c => c.name))
                console.log('Current card index:', currentCardIndex)

                // Sliding window logic for 4 cards:
                // Index 0: show [empty,0,1] → Card 0 (index 1) expanded
                // Index 1: show [0,1,2] → Card 1 (index 1) expanded  
                // Index 2: show [1,2,3] → Card 2 (index 1) expanded
                // Index 3: show [2,3,empty] → Card 3 (index 1) expanded
              } else if (cards.length > 0) {
                // For 1-2 cards, duplicate to make 3
                visibleCards = [...cards]
                while (visibleCards.length < 3) {
                  visibleCards.push(cards[0]) // Duplicate first card
                }
                console.log(`Duplicated cards to make 3: ${visibleCards.length}`)
              } else {
                // Fallback if no cards
                visibleCards = [
                  { id: 1, name: 'CARD 1', imageUrl: '', tier: 'basic' },
                  { id: 2, name: 'CARD 2', imageUrl: '', tier: 'basic' },
                  { id: 3, name: 'CARD 3', imageUrl: '', tier: 'basic' }
                ]
                console.log('Using fallback cards:', visibleCards.length)
              }

              console.log('Final visible cards count:', visibleCards.length)

              return visibleCards.map((card, visibleIndex) => {
                // Calculate which card is selected - ALWAYS select middle card (index 1)
                let isSelected = false
                if (cards.length >= 3) {
                  // For 3+ cards, ALWAYS select the middle card (index 1) of visible cards
                  isSelected = visibleIndex === 1
                } else {
                  // For less than 3 cards, the current card is selected
                  isSelected = visibleIndex === currentCardIndex
                }
                console.log(`Card ${visibleIndex}: ${card.name}, isSelected: ${isSelected}, currentCardIndex: ${currentCardIndex}`)

                return (
                  card.tier !== 'empty' ? <div
                    key={card.id}
                    className={`rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-300 ${isSelected ? 'w-full h-[260px] sm:h-[280px] md:h-[310px]' : 'w-full h-32 sm:h-36 md:h-44'
                      }`}
                    style={{
                      background: card.tier === 'empty' ? 'transparent' : (card.imageUrl ? `url(${card.imageUrl})` : '#f3f4f6'),
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* KTB BOGA GROUP Logo - Top Left */}
                    {card.tier !== 'empty' && (
                      <div className="absolute top-4 left-4 text-white">
                        <div className="font-bold text-lg">KTB</div>
                        <div className="text-sm font-semibold">BOGA GROUP</div>
                      </div>
                    )}

                    {/* BOGA Logo - Top Right */}
                    {card.tier !== 'empty' && (
                      <div className="absolute top-4 right-4 text-white">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                            <span className="text-black font-bold text-xs">G</span>
                          </div>
                          <div>
                            <div className="font-bold text-sm">BOGA</div>
                            <div className="text-xs">GROUP</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profile Picture */}
                    {card.tier !== 'empty' && (
                      <div className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isSelected ? 'top-[100px]' : 'top-[60px]'}`}>
                        <div className={`rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-200 ${isSelected ? 'w-24 h-24' : 'w-20 h-20'}`}>
                          {values.photoFile ? (
                            <img
                              src={URL.createObjectURL(values.photoFile)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                              <svg className={`text-blue-600 ${isSelected ? 'w-12 h-12' : 'w-10 h-10'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User Info Card - Centered */}
                    {card.tier !== 'empty' && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                        <div className={`flex items-center justify-center mb-2 ${isSelected ? 'mb-2' : 'mb-1'}`}>
                          <div className={`bg-white rounded-full flex items-center shadow-xl ${isSelected ? 'px-3 py-1' : 'px-2 py-1'}`}>
                            <span className={`text-black font-bold mr-2 ${isSelected ? 'text-sm' : 'text-xs'}`}>{values.name || 'Valerie'}</span>
                            <div className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center ${isSelected ? 'w-5 h-5' : 'w-4 h-4'}`}>
                              <svg className={`text-white ${isSelected ? 'w-3 h-3' : 'w-2 h-2'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-center">
                          <div className={`bg-black/60 rounded-full flex items-center shadow-lg ${isSelected ? 'px-3 py-1' : 'px-2 py-1'}`}>
                            <span className={`text-white font-medium ${isSelected ? 'text-xs' : 'text-[10px]'}`} style={{ fontFamily: 'Roboto' }}>{values.birthday ? formatBirthday(values.birthday) : '13 SEP 1989'}</span>
                          </div>
                          <span className={`text-white font-medium ml-1 ${isSelected ? 'text-xs' : 'text-[10px]'}`} style={{ fontFamily: 'Roboto' }}>{values.phone || '0877-9832-0931'}</span>
                        </div>
                        <div className="text-yellow-200 text-sm space-y-1">
                          <div>{values.email || 'valeriebahagia@gmail.com'}</div>
                        </div>
                      </div>
                    )}
                  </div> : <div className='flex text-white text-center h-32 justify-center items-center'>There no cards left</div>
                )
              })
            })()}
          </div>

          {/* Navigation Arrows - Horizontal */}
          <button
            onClick={() => {
              console.log('=== PREV BUTTON CLICKED ===')
              console.log('Current index:', currentCardIndex)
              console.log('Disabled:', currentCardIndex <= 0)
              prevCard()
            }}
            className="absolute top-16 sm:top-16 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all"
            disabled={currentCardIndex <= 0}
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <button
            onClick={() => {
              console.log('=== NEXT BUTTON CLICKED ===')
              console.log('Current index:', currentCardIndex)
              console.log('Disabled:', currentCardIndex >= cards.length - 1)
              nextCard()
            }}
            className="absolute bottom-16 sm:bottom-16 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all"
            disabled={currentCardIndex >= cards.length - 1}
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="submit-button p-3 w-[150px] text-red-600 text-lg rounded-[20px] font-black"
          style={{ 
            fontFamily: 'Roboto', 
            fontWeight: 900
          }}
        >
          SUBMIT
        </button>
      </div>
    </div>
  )
}
