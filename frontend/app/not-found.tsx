'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type Vec = { x: number; y: number }

const CANVAS_W = 900
const CANVAS_H = 460

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function dist(a: Vec, b: Vec) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const keysRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
  })

  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  }, [])

  const resetGame = () => {
    setGameOver(false)
    setScore(0)
    scoreRef.current = 0

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    gameStateRef.current = {
      dragon: {
        pos: { x: CANVAS_W * 0.25, y: CANVAS_H * 0.5 },
        vel: { x: 0, y: 0 },
        radius: 14,
      },
      gem: {
        pos: { x: rand(CANVAS_W * 0.35, CANVAS_W * 0.9), y: rand(90, CANVAS_H - 90) },
        radius: 10,
      },
      hazards: [] as Array<{ pos: Vec; vel: Vec; radius: number }>,
      lastTs: 0,
      difficulty: 1,
      spawnTimer: 0,
    }

    // Initial paint
    drawFrame()
  }

  const gameStateRef = useRef<{
    dragon: { pos: Vec; vel: Vec; radius: number }
    gem: { pos: Vec; radius: number }
    hazards: Array<{ pos: Vec; vel: Vec; radius: number }>
    lastTs: number
    difficulty: number
    spawnTimer: number
  } | null>(null)

  const drawFrame = () => {
    const canvas = canvasRef.current
    const state = gameStateRef.current
    if (!canvas || !state) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    g.addColorStop(0, '#070A1A')
    g.addColorStop(1, '#0B1538')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    for (let i = 0; i < 90; i++) {
      const x = (i * 97) % CANVAS_W
      const y = ((i * 53) % CANVAS_H) * 0.92
      ctx.globalAlpha = 0.15 + (i % 5) * 0.06
      ctx.fillRect(x, y, 2, 2)
    }
    ctx.globalAlpha = 1

    // Ground
    ctx.fillStyle = 'rgba(34, 197, 94, 0.12)'
    ctx.fillRect(0, CANVAS_H - 70, CANVAS_W, 70)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)'
    ctx.beginPath()
    for (let x = 0; x <= CANVAS_W; x += 24) {
      const y = CANVAS_H - 70 + Math.sin(x / 30) * 6
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Gem
    ctx.beginPath()
    ctx.fillStyle = '#F97316'
    ctx.arc(state.gem.pos.x, state.gem.pos.y, state.gem.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(249,115,22,0.65)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Hazards
    for (const h of state.hazards) {
      ctx.beginPath()
      ctx.fillStyle = 'rgba(239,68,68,0.95)'
      ctx.arc(h.pos.x, h.pos.y, h.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(239,68,68,0.55)'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Dragon
    const { pos, radius } = state.dragon
    ctx.save()
    // Rotate slightly towards movement
    const angle = Math.atan2(state.dragon.vel.y, state.dragon.vel.x)
    ctx.translate(pos.x, pos.y)
    ctx.rotate(isFinite(angle) ? angle * 0.25 : 0)
    ctx.beginPath()
    ctx.fillStyle = '#22c55e'
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(34,197,94,0.7)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Eye
    ctx.beginPath()
    ctx.fillStyle = '#111827'
    ctx.arc(radius * 0.35, -radius * 0.15, 3.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // HUD
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '700 18px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
    ctx.fillText(`Score: ${scoreRef.current}`, 18, 34)
  }

  const step = (ts: number) => {
    const state = gameStateRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return

    const dt = state.lastTs ? Math.min(0.033, (ts - state.lastTs) / 1000) : 0
    state.lastTs = ts

    const accel = 520 // px/s^2
    const maxSpeed = 240 // px/s

    const keys = keysRef.current
    const dirX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
    const dirY = (keys.down ? 1 : 0) - (keys.up ? 1 : 0)

    state.dragon.vel.x += dirX * accel * dt
    state.dragon.vel.y += dirY * accel * dt

    // Dampening
    state.dragon.vel.x *= Math.pow(0.86, dt * 60)
    state.dragon.vel.y *= Math.pow(0.86, dt * 60)

    // Clamp speed
    const speed = Math.sqrt(state.dragon.vel.x * state.dragon.vel.x + state.dragon.vel.y * state.dragon.vel.y)
    if (speed > maxSpeed) {
      const s = maxSpeed / speed
      state.dragon.vel.x *= s
      state.dragon.vel.y *= s
    }

    state.dragon.pos.x = clamp(state.dragon.pos.x + state.dragon.vel.x * dt, 30, CANVAS_W - 30)
    state.dragon.pos.y = clamp(state.dragon.pos.y + state.dragon.vel.y * dt, 70, CANVAS_H - 80)

    // Spawn hazards periodically (falls from top)
    state.spawnTimer += dt
    const spawnEvery = Math.max(0.9, 1.35 - state.difficulty * 0.08)
    if (state.spawnTimer >= spawnEvery) {
      state.spawnTimer = 0
      state.difficulty = Math.min(10, 1 + scoreRef.current / 6)

      const x = rand(60, CANVAS_W - 60)
      const y = -30
      const speedY = rand(160, 240) + state.difficulty * 10
      state.hazards.push({
        pos: { x, y },
        vel: { x: rand(-22, 22), y: speedY },
        radius: rand(10, 14),
      })
    }

    // Move hazards, remove offscreen
    state.hazards = state.hazards
      .map((h) => ({
        ...h,
        pos: { x: h.pos.x + h.vel.x * dt, y: h.pos.y + h.vel.y * dt },
      }))
      .filter((h) => h.pos.y < CANVAS_H + 40)

    // Collect gem
    if (dist(state.dragon.pos, state.gem.pos) <= state.dragon.radius + state.gem.radius) {
      setScore((s) => {
        const next = s + 1
        scoreRef.current = next
        return next
      })
      state.gem.pos = { x: rand(CANVAS_W * 0.35, CANVAS_W * 0.9), y: rand(90, CANVAS_H - 90) }
    }

    // Collide with hazards
    for (const h of state.hazards) {
      if (dist(state.dragon.pos, h.pos) <= state.dragon.radius + h.radius) {
        setGameOver(true)
        setStarted(false)
        return
      }
    }

    drawFrame()
    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.up = true
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.down = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.up = false
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.down = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    if (!started) {
      if (!gameOver) resetGame()
      return
    }

    drawFrame()
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, reduceMotion, gameOver])

  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 'min(980px, 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#F97316', letterSpacing: '0.04em' }}>404 - Page Not Found</div>
          <h1 style={{ fontSize: 26, marginTop: 6, marginBottom: 8, fontWeight: 900, color: '#111827' }}>Meet the Dragon Guard</h1>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
            This page doesn't exist yet, but your dragon still can collect gems and dodge fire.
          </p>
        </div>

        {reduceMotion ? (
          <div style={{ textAlign: 'center', padding: 18, background: '#f3f4f6', borderRadius: 14 }}>
            <p style={{ marginBottom: 12, color: '#374151' }}>Enable motion to play the mini game.</p>
            <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Go Home</Link>
          </div>
        ) : (
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />

            {!started && !gameOver && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                }}
              >
                <div style={{ maxWidth: 520, textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Start the Dragon Run</div>
                  <div style={{ fontSize: 13, opacity: 0.95, lineHeight: 1.6, marginBottom: 16 }}>
                    Controls: `Arrow keys` or `WASD`. Collect the orange gem. Avoid red fireballs.
                  </div>
                  <button
                    onClick={() => {
                      resetGame()
                      setStarted(true)
                    }}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    Play
                  </button>
                </div>
              </div>
            )}

            {gameOver && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                }}
              >
                <div style={{ maxWidth: 520, textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Dragon Down!</div>
                  <div style={{ fontSize: 14, opacity: 0.95, lineHeight: 1.6, marginBottom: 16 }}>
                    Score: <strong>{score}</strong>. The dragon will try again.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        resetGame()
                        setStarted(true)
                      }}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      Restart
                    </button>
                    <Link
                      href="/"
                      style={{
                        padding: '12px 20px',
                        background: 'white',
                        color: '#111827',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontWeight: 900,
                        fontSize: 14,
                        display: 'inline-block',
                      }}
                    >
                      Go Home
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom helper */}
            <div style={{ position: 'absolute', left: 14, bottom: 12, color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 700 }}>
              Tip: gems worth points, fireballs end the run.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

