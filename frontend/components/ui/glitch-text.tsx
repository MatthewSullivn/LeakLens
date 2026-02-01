'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const HACKER_CHARSET = '01[]{}|/\\<>@#$%&*~`;:'
const HEX_CHARSET = '0123456789ABCDEFabcdef'

function randomChar(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)]
}

function scrambleString(text: string, charset: string): string {
  return text
    .split('')
    .map((ch) => (ch === ' ' ? ' ' : randomChar(charset)))
    .join('')
}

interface GlitchTextProps {
  text: string
  className?: string
  /** Delay between revealing each character (ms) */
  revealDelayMs?: number
  /** How often to scramble unrevealed chars (ms) - lower = more glitchy */
  scrambleIntervalMs?: number
}

export function GlitchText({
  text,
  className,
  revealDelayMs = 80,
  scrambleIntervalMs = 35,
}: GlitchTextProps) {
  const [mounted, setMounted] = useState(false)
  const [display, setDisplay] = useState(text)
  const [revealed, setRevealed] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  const scrambleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const revealRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    // Initial scramble
    setDisplay(scrambleString(text, HACKER_CHARSET + HEX_CHARSET))
    setRevealed(0)
    setHasCompleted(false)

    let revealedCount = 0
    const total = text.length
    const revealedRef = { current: 0 }

    // Scramble loop - keep flipping unrevealed chars
    scrambleRef.current = setInterval(() => {
      const r = revealedRef.current
      if (r >= total) return
      setDisplay((prev) =>
        text
          .split('')
          .map((ch, i) => {
            if (i < r) return ch
            if (ch === ' ') return ' '
            return randomChar(HACKER_CHARSET + HEX_CHARSET)
          })
          .join('')
      )
    }, scrambleIntervalMs)

    // Reveal loop - reveal one char at a time
    const revealNext = () => {
      if (revealedCount >= total) {
        revealedRef.current = total
        setDisplay(text)
        setRevealed(total)
        setHasCompleted(true)
        if (scrambleRef.current) {
          clearInterval(scrambleRef.current)
          scrambleRef.current = null
        }
        return
      }
      revealedRef.current = revealedCount + 1
      revealedCount += 1
      setRevealed(revealedCount)
      revealRef.current = setTimeout(revealNext, revealDelayMs)
    }

    revealRef.current = setTimeout(revealNext, revealDelayMs)

    return () => {
      if (scrambleRef.current) clearInterval(scrambleRef.current)
      if (revealRef.current) clearTimeout(revealRef.current)
    }
  }, [mounted, text, revealDelayMs, scrambleIntervalMs])

  if (!mounted) {
    return <span className={cn(className)} aria-label={text}>{text}</span>
  }

  return (
    <span
      className={cn(
        'inline-block font-mono tracking-tight',
        !hasCompleted && 'animate-[glitch-flicker_0.06s_steps(1,end)_infinite]',
        className
      )}
      aria-label={text}
    >
      {display.split('').map((char, i) => (
        <span
          key={i}
          className={cn(
            i < revealed ? 'text-foreground' : 'text-[var(--color-cyan-600)]/90',
            !hasCompleted && i >= revealed && 'opacity-80'
          )}
        >
          {char}
        </span>
      ))}
    </span>
  )
}
