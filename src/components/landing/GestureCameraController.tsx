import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, Hand, Info, RefreshCw, X, MousePointer2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

import { useHeroInteractionStore } from '@/stores/heroInteractionStore'

type GestureStatus = 'idle' | 'requesting' | 'loading-model' | 'tracking' | 'no-hand' | 'error' | 'unavailable'

const SCROLL_THRESHOLD = 0.04
const PINCH_THRESHOLD = 0.05
const SCROLL_THROTTLE_MS = 50
const ROTATION_SMOOTHING = 0.15

function getDistance(p1: [number, number], p2: [number, number]): number {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
}

function isFist(landmarks: { x: number; y: number; z: number }[]): boolean {
  const fingertipIndices = [4, 8, 12, 16, 20]
  const middleMcp = landmarks[9].y
  let closedCount = 0
  for (const idx of fingertipIndices) {
    if (landmarks[idx].y > middleMcp + 0.05) {
      closedCount++
    }
  }
  return closedCount >= 4
}

function isOpenPalm(landmarks: { x: number; y: number; z: number }[]): boolean {
  const fingertipIndices = [4, 8, 12, 16, 20]
  const wrist = landmarks[0]
  let openCount = 0
  for (const idx of fingertipIndices) {
    const dist = getDistance(
      [landmarks[idx].x, landmarks[idx].y],
      [wrist.x, wrist.y]
    )
    if (dist > 0.25) openCount++
  }
  return openCount >= 4
}

export function GestureCameraController() {
  const { t } = useTranslation()
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState<GestureStatus>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const lastScrollTimeRef = useRef(0)
  const lastHandYRef = useRef<number | null>(null)
  const lastPinchDistRef = useRef<number | null>(null)
  const lastRotationRef = useRef({ x: 0, y: 0 })

  const setZoom = useHeroInteractionStore((s) => s.setZoom)
  const setMinimized = useHeroInteractionStore((s) => s.setMinimized)
  const setRotation = useHeroInteractionStore((s) => s.setRotation)
  const setGestureEnabled = useHeroInteractionStore((s) => s.setGestureEnabled)
  const resetHeroInteraction = useHeroInteractionStore((s) => s.resetHeroInteraction)
  const zoom = useHeroInteractionStore((s) => s.zoom)

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = 0
    }
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setEnabled(false)
    setStatus('idle')
    setGestureEnabled(false)
    resetHeroInteraction()
  }, [resetHeroInteraction, setGestureEnabled])

  const initHandLandmarker = useCallback(async () => {
    try {
      setStatus('loading-model')
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm')
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.5,
      })
      handLandmarkerRef.current = landmarker
      setStatus('tracking')
      return true
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err)
      setStatus('unavailable')
      return false
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setStatus('requesting')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const landmarkerReady = await initHandLandmarker()
      if (!landmarkerReady) return

      setEnabled(true)
      setGestureEnabled(true)

      let currentZoom = zoom
      let currentMinimized = false

      const processFrame = (timestamp: number) => {
        if (!streamRef.current || !videoRef.current || !handLandmarkerRef.current) {
          animFrameRef.current = requestAnimationFrame(processFrame)
          return
        }
        if (videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(processFrame)
          return
        }

        const result = handLandmarkerRef.current.detectForVideo(videoRef.current, timestamp)

        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0]
          setStatus('tracking')

          const now = Date.now()
          const timeSinceScroll = now - lastScrollTimeRef.current

          const palmCenter = landmarks[9]

          const handX = palmCenter.x - 0.5
          const handY = palmCenter.y - 0.5

          lastRotationRef.current = {
            x: lastRotationRef.current.x + (-handY * 15 - lastRotationRef.current.x) * ROTATION_SMOOTHING,
            y: lastRotationRef.current.y + (handX * 20 - lastRotationRef.current.y) * ROTATION_SMOOTHING,
          }
          setRotation(lastRotationRef.current.x, lastRotationRef.current.y)

          if (lastHandYRef.current !== null && timeSinceScroll > SCROLL_THROTTLE_MS) {
            const deltaY = palmCenter.y - lastHandYRef.current
            if (Math.abs(deltaY) > SCROLL_THRESHOLD) {
              window.scrollBy({ top: deltaY * 500, behavior: 'smooth' })
              lastScrollTimeRef.current = now
            }
          }
          lastHandYRef.current = palmCenter.y

          const thumbTip = landmarks[4]
          const indexTip = landmarks[8]
          const pinchDist = getDistance([thumbTip.x, thumbTip.y], [indexTip.x, indexTip.y])

          if (lastPinchDistRef.current !== null) {
            const pinchDelta = pinchDist - lastPinchDistRef.current
            if (Math.abs(pinchDelta) > PINCH_THRESHOLD) {
              currentZoom = Math.max(0.75, Math.min(1.35, currentZoom + pinchDelta * 0.5))
              setZoom(currentZoom)
            }
          }
          lastPinchDistRef.current = pinchDist

          if (isFist(landmarks)) {
            if (!currentMinimized) {
              currentMinimized = true
              setMinimized(true)
            }
          } else if (isOpenPalm(landmarks)) {
            if (currentMinimized) {
              currentMinimized = false
              setMinimized(false)
            }
          }
        } else {
          setStatus('no-hand')
          lastHandYRef.current = null
          lastPinchDistRef.current = null
        }

        animFrameRef.current = requestAnimationFrame(processFrame)
      }

      animFrameRef.current = requestAnimationFrame(processFrame)
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setStatus('error')
        } else {
          setStatus('unavailable')
        }
      } else {
        setStatus('unavailable')
      }
    }
  }, [zoom, initHandLandmarker, setGestureEnabled, setMinimized, setRotation, setZoom])

  const toggleCamera = useCallback(() => {
    if (enabled) {
      stopCamera()
    } else {
      void startCamera()
    }
  }, [enabled, startCamera, stopCamera])

  const resetScene = useCallback(() => {
    resetHeroInteraction()
    lastHandYRef.current = null
    lastPinchDistRef.current = null
    lastRotationRef.current = { x: 0, y: 0 }
  }, [resetHeroInteraction])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const statusLabels: Record<GestureStatus, string> = {
    idle: '',
    requesting: t('landing.cameraRequesting', 'Requesting camera...'),
    'loading-model': t('landing.loadingModel', 'Loading model...'),
    tracking: t('landing.cameraTracking', 'Tracking hand...'),
    'no-hand': t('landing.cameraNoHand', 'No hand detected'),
    error: t('landing.cameraDenied', 'Camera permission denied'),
    unavailable: t('landing.cameraUnavailable', 'Camera unavailable'),
  }

  return (
    <>
      <motion.button
        className="fixed bottom-6 end-6 z-50 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-card/90 shadow-glow backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-glow-lg"
        onClick={toggleCamera}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={enabled ? t('landing.disableGesture', 'Disable gesture control') : t('landing.enableGesture', 'Enable gesture control')}
        title={enabled ? t('landing.disableGesture', 'Disable gesture control') : t('landing.enableGesture', 'Enable gesture control')}
      >
        {enabled ? (
          <CameraOff className="size-5 text-destructive" />
        ) : (
          <div className="relative">
            <Hand className="size-5 text-primary" />
            <span className="absolute -end-1 -top-1 size-2 animate-pulse rounded-full bg-emerald-400" />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 end-6 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-glow backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Camera className="size-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold">{t('landing.gestureControl', 'Gesture Control')}</span>
                  <span className="ms-1.5 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    {t('landing.gestureExperimental', 'Experimental')}
                  </span>
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
                autoPlay
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <AnimatePresence mode="wait">
                  {status === 'tracking' && (
                    <motion.div
                      key="tracking"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="relative">
                        <Hand className="size-10 text-emerald-400" />
                        <div className="absolute inset-0 animate-ping opacity-30">
                          <Hand className="size-10 text-emerald-400" />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-300">{t('landing.cameraTracking', 'Tracking hand...')}</span>
                    </motion.div>
                  )}
                  {(status === 'no-hand' || status === 'loading-model' || status === 'requesting') && (
                    <motion.div
                      key="searching"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <MousePointer2 className="size-10 animate-pulse text-slate-400" />
                      <span className="text-xs text-slate-400">
                        {status === 'loading-model' ? t('landing.loadingModel', 'Loading model...') : t('landing.cameraNoHand', 'No hand detected')}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between text-[10px] text-white/60">
                  <span className="flex items-center gap-1">
                    <Hand className="size-3" /> {t('landing.handScroll', 'Hand Scroll')}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 11V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5" />
                      <path d="M15 11h6" />
                    </svg>
                    {t('landing.pinchZoom', 'Pinch Zoom')}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="size-3" />
                  <span>{t('landing.cameraPrivacyNote', 'Camera runs locally in your browser. No video is stored or uploaded.')}</span>
                </div>
              </div>
              <button
                onClick={resetScene}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent/50 px-4 py-2 text-xs font-medium transition-colors hover:bg-accent"
              >
                <RefreshCw className="size-3.5" />
                {t('landing.resetScene', 'Reset Scene')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(status === 'error' || status === 'unavailable') && !enabled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 end-6 z-50 max-w-xs rounded-2xl border border-destructive/30 bg-card px-4 py-3 shadow-lg"
          >
            <div className="flex items-center gap-3">
              {status === 'error' ? (
                <CameraOff className="size-5 text-destructive" />
              ) : (
                <Hand className="size-5 text-muted-foreground" />
              )}
              <span className="text-sm text-destructive">{statusLabels[status]}</span>
            </div>
            {status === 'unavailable' && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Gesture control is unavailable on this browser. You can still interact with the 3D scene using mouse or touch.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}