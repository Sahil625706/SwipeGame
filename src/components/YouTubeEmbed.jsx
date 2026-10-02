import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react'

let isApiLoading = false
let apiReadyCallbacks = []

function loadYouTubeIframeApi(callback) {
  if (typeof window === 'undefined') return

  if (window.YT && window.YT.Player) {
    callback()
    return
  }

  apiReadyCallbacks.push(callback)

  if (!isApiLoading) {
    isApiLoading = true
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'youtube-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      } else {
        document.body.appendChild(tag)
      }
    }

    const prevReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') prevReady()
      const cbs = [...apiReadyCallbacks]
      apiReadyCallbacks = []
      cbs.forEach((cb) => {
        try {
          cb()
        } catch (err) {
          console.error('YouTube API callback error:', err)
        }
      })
    }
  }
}

function extractVideoId(url) {
  if (!url) return ''
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]+)/)
  if (embedMatch) return embedMatch[1]
  const vMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (vMatch) return vMatch[1]
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortMatch) return shortMatch[1]
  return url
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

let playerInstanceCounter = 0

export default function YouTubeEmbed({
  url,
  label,
  isShorts,
  hideTitleCover,
  startTime,
  endTime,
  questionId,
  optionKey,
}) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const intervalRef = useRef(null)
  const isSeekingRef = useRef(false)
  const progressBarRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentClipSec, setCurrentClipSec] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Extract video ID, start, end, and duration
  const { videoId, parsedStart, parsedEnd, clipDuration } = useMemo(() => {
    const id = extractVideoId(url)
    let s = typeof startTime === 'number' ? startTime : null
    let e = typeof endTime === 'number' ? endTime : null

    try {
      const urlObj = new URL(url)
      if (s === null) {
        const urlStart = urlObj.searchParams.get('start')
        s = urlStart !== null ? Number(urlStart) : 0
      }
      if (e === null) {
        const urlEnd = urlObj.searchParams.get('end')
        e = urlEnd !== null ? Number(urlEnd) : 0
      }
    } catch {
      s = s ?? 0
      e = e ?? 0
    }

    const startVal = Math.max(0, s || 0)
    const endVal = Math.max(startVal, e || 0)
    const durVal = Math.max(1, endVal - startVal)

    return {
      videoId: id,
      parsedStart: startVal,
      parsedEnd: endVal,
      clipDuration: durVal,
    }
  }, [url, startTime, endTime])

  // Unique container ID guaranteed for every single player instance
  const uniquePlayerId = useMemo(() => {
    playerInstanceCounter += 1
    return `yt-player-q${questionId || '0'}-${optionKey || 'opt'}-${playerInstanceCounter}`
  }, [questionId, optionKey, videoId])

  const loopBackToStart = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    isSeekingRef.current = true
    try {
      if (typeof player.seekTo === 'function') {
        player.seekTo(parsedStart, true)
      }
      if (typeof player.playVideo === 'function') {
        player.playVideo()
      }
      setCurrentClipSec(0)
    } catch (err) {
      console.warn('Error during seekTo loop:', err)
    }
    setTimeout(() => {
      isSeekingRef.current = false
    }, 300)
  }, [parsedStart])

  useEffect(() => {
    let isCancelled = false

    const clearTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const cleanup = () => {
      clearTracking()
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy()
          }
        } catch {
          // ignore
        }
        playerRef.current = null
      }
    }

    loadYouTubeIframeApi(() => {
      if (isCancelled || !containerRef.current || !videoId) return

      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          width: '100%',
          height: '100%',
          videoId: videoId,
          playerVars: {
            start: parsedStart,
            end: parsedEnd,
            controls: 0,
            disablekb: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            enablejsapi: 1,
            playsinline: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
          events: {
            onReady: (event) => {
              if (isCancelled) return
              try {
                // Ensure real sound is enabled
                if (typeof event.target.unMute === 'function') {
                  event.target.unMute()
                }
                if (typeof event.target.setVolume === 'function') {
                  event.target.setVolume(100)
                }
              } catch {
                // ignore
              }
            },
            onStateChange: (event) => {
              if (isCancelled) return

              // 1 = PLAYING
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
                clearTracking()
                intervalRef.current = setInterval(() => {
                  const player = playerRef.current
                  if (!player || typeof player.getCurrentTime !== 'function') return
                  if (isSeekingRef.current) return

                  const currentTime = player.getCurrentTime()
                  const elapsedInClip = Math.max(0, Math.min(clipDuration, currentTime - parsedStart))
                  setCurrentClipSec(elapsedInClip)

                  // Strictly loop when reaching or passing end time
                  if (parsedEnd > 0 && currentTime >= parsedEnd - 0.2) {
                    loopBackToStart()
                  } else if (parsedStart > 0 && currentTime < parsedStart - 1.5) {
                    loopBackToStart()
                  }
                }, 80)
              } else if (event.data === window.YT.PlayerState.ENDED) {
                clearTracking()
                loopBackToStart()
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
                clearTracking()
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                  const currentTime = playerRef.current.getCurrentTime()
                  const elapsedInClip = Math.max(0, Math.min(clipDuration, currentTime - parsedStart))
                  setCurrentClipSec(elapsedInClip)
                }
              } else {
                clearTracking()
              }
            },
          },
        })
      } catch (err) {
        console.error('Failed to create YT.Player instance:', err)
      }
    })

    return () => {
      isCancelled = true
      cleanup()
    }
  }, [uniquePlayerId, videoId, parsedStart, parsedEnd, clipDuration, loopBackToStart])

  // Custom Small Play / Pause toggle
  const togglePlayPause = useCallback(
    (e) => {
      if (e) e.stopPropagation()
      const player = playerRef.current
      if (!player) return

      try {
        if (isPlaying) {
          if (typeof player.pauseVideo === 'function') {
            player.pauseVideo()
          }
          setIsPlaying(false)
        } else {
          if (typeof player.unMute === 'function') {
            player.unMute()
          }
          if (typeof player.setVolume === 'function') {
            player.setVolume(100)
          }
          // If at the end, restart from beginning
          if (currentClipSec >= clipDuration - 0.3) {
            if (typeof player.seekTo === 'function') {
              player.seekTo(parsedStart, true)
            }
            setCurrentClipSec(0)
          }
          if (typeof player.playVideo === 'function') {
            player.playVideo()
          }
          setIsPlaying(true)
        }
      } catch (err) {
        console.error('Toggle play error:', err)
      }
    },
    [isPlaying, currentClipSec, clipDuration, parsedStart]
  )

  // Custom Seek Handler: strictly bounded between 0% and 100% of the clip duration
  const applySeekFromEvent = useCallback(
    (e) => {
      if (!progressBarRef.current || !playerRef.current) return
      const rect = progressBarRef.current.getBoundingClientRect()
      const clientX =
        e.clientX !== undefined
          ? e.clientX
          : e.touches && e.touches[0]
          ? e.touches[0].clientX
          : 0
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const targetClipSec = ratio * clipDuration
      const targetAbsoluteSec = parsedStart + targetClipSec

      isSeekingRef.current = true
      setCurrentClipSec(targetClipSec)

      try {
        if (typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(targetAbsoluteSec, true)
        }
        if (!isPlaying && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo()
          setIsPlaying(true)
        }
      } catch (err) {
        console.warn('Seek error:', err)
      }

      setTimeout(() => {
        isSeekingRef.current = false
      }, 250)
    },
    [clipDuration, parsedStart, isPlaying]
  )

  const handlePointerDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    applySeekFromEvent(e)

    const handlePointerMove = (moveEvent) => {
      moveEvent.stopPropagation()
      applySeekFromEvent(moveEvent)
    }

    const handlePointerUp = (upEvent) => {
      upEvent.stopPropagation()
      setIsDragging(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const progressPercent = Math.max(0, Math.min(100, (currentClipSec / clipDuration) * 100))

  return (
    <div
      className={`relative group/player select-none overflow-hidden rounded-2xl flex items-center justify-center bg-black ${
        isShorts
          ? 'h-full aspect-[9/16] max-w-full'
          : 'w-full aspect-video max-h-full'
      }`}
    >
      {/* Background Poster: covers the iframe when paused so YouTube's native big play button,
          related video thumbnails, and end-screen cards in the bottom-right never bleed through */}
      {videoId && (
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={label}
          className={`absolute inset-0 w-full h-full object-cover z-20 pointer-events-none transition-opacity duration-200 ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />
      )}

      {/* Container div where YouTube Player iframe is mounted */}
      <div className="w-full h-full pointer-events-none flex items-center justify-center z-10 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:rounded-2xl">
        <div id={uniquePlayerId} ref={containerRef} className="w-full h-full" />
      </div>

      {/* Burned-in Title Cover for Question 8 Option B */}
      {hideTitleCover && (
        <div
          className="absolute top-[10.5%] left-0 right-0 h-[5.5%] bg-black pointer-events-none z-30"
          aria-hidden="true"
        />
      )}

      {/* Custom Bottom Control Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40 p-2 sm:p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center gap-2 sm:gap-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Custom Small Play / Pause Button at bottom-left */}
        <button
          type="button"
          onClick={togglePlayPause}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all shrink-0 cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Simple Plain White Progress Bar (thin track, solid white fill, no gradients/colors) */}
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          className="flex-1 h-4 flex items-center cursor-pointer group/bar relative"
        >
          {/* Thin background track */}
          <div className="w-full h-1 rounded-full bg-white/25 overflow-hidden relative">
            {/* Solid plain white fill */}
            <div
              className="h-full rounded-full bg-white transition-[width] duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Small clean white knob */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white transition-transform ${
              isDragging ? 'scale-125' : 'group-hover/bar:scale-125'
            }`}
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Clip Time Display (e.g. 0:04 / 0:14) */}
        <span className="text-[10px] sm:text-xs font-mono font-medium text-white/90 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
          {formatTime(currentClipSec)} / {formatTime(clipDuration)}
        </span>
      </div>
    </div>
  )
}
