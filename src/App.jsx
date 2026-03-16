import { useState, useRef, useEffect } from 'react'
import './App.css'

const INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

const BEEP_COUNT = 5
const BEEP_INTERVAL_MS = 400

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // ignore if AudioContext not supported
  }
}

function playBeepRepeat() {
  for (let i = 0; i < BEEP_COUNT; i++) {
    setTimeout(() => playBeep(), i * BEEP_INTERVAL_MS)
  }
}

function showReminder() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Check visa slots', {
      body: 'Time to check the visa portal.',
    })
  }
  playBeepRepeat()
}

export default function App() {
  const [running, setRunning] = useState(false)
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [secondsUntilNext, setSecondsUntilNext] = useState(null)
  const intervalRef = useRef(null)
  const countdownRef = useRef(null)
  const nextReminderAtRef = useRef(null)

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      return 'unsupported'
    }
    const p = await Notification.requestPermission()
    setPermission(p)
    return p
  }

  const start = async () => {
    const p = await requestPermission()
    if (p === 'denied') {
      return
    }
    setRunning(true)
    nextReminderAtRef.current = Date.now() + INTERVAL_MS
    setSecondsUntilNext(Math.ceil(INTERVAL_MS / 1000))

    const tick = () => {
      showReminder()
      nextReminderAtRef.current = Date.now() + INTERVAL_MS
    }

    intervalRef.current = window.setInterval(tick, INTERVAL_MS)

    countdownRef.current = window.setInterval(() => {
      const at = nextReminderAtRef.current
      if (!at) return
      const left = Math.max(0, Math.ceil((at - Date.now()) / 1000))
      setSecondsUntilNext(left)
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setRunning(false)
    setSecondsUntilNext(null)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (countdownRef.current) window.clearInterval(countdownRef.current)
    }
  }, [])

  const formatCountdown = (s) => {
    if (s == null) return ''
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="app">
      <h1>Visa Slot Reminder</h1>
      <p className="tagline">
        Remind me every 10 minutes to check visa slots. Keep this tab open; reminders work even if you’re on another tab.
      </p>

      {permission === 'denied' && (
        <p className="permission-warning">
          Notifications are blocked. Enable them in your browser to get desktop reminders.
        </p>
      )}

      <div className="controls">
        {!running ? (
          <button type="button" className="btn btn-start" onClick={start} disabled={permission === 'denied'}>
            Start
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-stop" onClick={stop}>
              Stop
            </button>
            <p className="status">
              Reminders active. Next reminder in <strong>{formatCountdown(secondsUntilNext)}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
