import { useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const expireRef = useRef(onExpire)

  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (secondsLeft <= 0) {
      expireRef.current?.()
      return undefined
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { secondsLeft, formatted }
}
