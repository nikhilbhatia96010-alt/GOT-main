import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

// ─── Chapter data ────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: 'prologue',
    progress: [0, 0.12],
    title: 'The Ancient Chronicles',
    subtitle: 'A SONG OF ICE AND FIRE',
    body: 'In the beginning, there were only the words of the Maesters — secrets sealed within ancient tomes, waiting for a hand brave enough to open them.',
    sigil: '✦',
  },
  {
    id: 'winterfell',
    progress: [0.12, 0.30],
    title: 'The North Remembers',
    subtitle: 'HOUSE STARK — WINTERFELL',
    body: 'Winter is coming. Beyond the ancient walls, the cold whispers of the North carry stories older than the Wall itself.',
    sigil: '⚔',
  },
  {
    id: 'westeros',
    progress: [0.30, 0.52],
    title: 'The Seven Kingdoms',
    subtitle: 'THE REALM OF WESTEROS',
    body: 'From the Eyrie\'s clouded peaks to the red sands of Dorne — seven kingdoms, one throne, a thousand reasons to bleed.',
    sigil: '♜',
  },
  {
    id: 'kings-landing',
    progress: [0.52, 0.70],
    title: 'Where Crowns Are Won',
    subtitle: 'KING\'S LANDING — THE CAPITAL',
    body: 'The city that swallows kings whole. Gold and treachery perfume the air. Every smile here conceals a blade.',
    sigil: '👑',
  },
  {
    id: 'swords',
    progress: [0.70, 0.87],
    title: 'A Thousand Blades',
    subtitle: 'FORGED IN CONQUEST',
    body: 'One thousand swords, surrendered by enemies of Aegon the Conqueror. Melted. Reshaped. Made into something terrible and magnificent.',
    sigil: '⚒',
  },
  {
    id: 'throne',
    progress: [0.87, 1.0],
    title: 'The Iron Throne',
    subtitle: 'WHEN YOU PLAY THE GAME OF THRONES',
    body: 'You win — or you die.',
    sigil: '♔',
  },
]

const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`

// ─── Helpers ─────────────────────────────────────────────────────────────────
// ─── Component ───────────────────────────────────────────────────────────────
const Hero = () => {
  const containerRef  = useRef(null)
  const stickyRef     = useRef(null)
  const videoRef      = useRef(null)
  const overlayRef    = useRef(null)
  const titleRef      = useRef(null)
  const subtitleRef   = useRef(null)
  const bodyRef       = useRef(null)
  const sigilRef      = useRef(null)
  const progressRef   = useRef(null)
  const vignetteRef   = useRef(null)
  const chapterLabelRef = useRef(null)
  const runeBarRef    = useRef(null)
  const chapterTweenRef = useRef(null)
  const progressFrameRef = useRef(0)
  const latestProgressRef = useRef(0)
  const hasRenderedChapterRef = useRef(false)

  const [activeChapter, setActiveChapter] = useState(0)
  const [videoReady, setVideoReady]       = useState(true)
  const activeContent = CHAPTERS[activeChapter]

  // ─── Chapter transition ───────────────────────────────────────────────────
  const prevChapter = useRef(-1)
  const transitionChapter = (idx) => {
    if (prevChapter.current === idx) return
    prevChapter.current = idx
    setActiveChapter(idx)

    if (chapterLabelRef.current) {
      gsap.fromTo(chapterLabelRef.current,
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      )
      chapterLabelRef.current.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(CHAPTERS.length).padStart(2, '0')}`
    }
  }

  useEffect(() => {
    const textNodes = [sigilRef.current, subtitleRef.current, titleRef.current, bodyRef.current].filter(Boolean)
    if (!textNodes.length) return

    if (!hasRenderedChapterRef.current) {
      hasRenderedChapterRef.current = true
      gsap.set(textNodes, { clearProps: 'opacity,transform' })
      return
    }

    chapterTweenRef.current?.kill()
    chapterTweenRef.current = gsap.fromTo(
      textNodes,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out', stagger: 0.04, overwrite: 'auto' }
    )
  }, [activeChapter])

  // ─── Setup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let readyTimer
    const fallbackTimer = window.setTimeout(() => setVideoReady(true), 1500)
    const onReady = () => {
      window.clearTimeout(readyTimer)
      window.clearTimeout(fallbackTimer)
      readyTimer = window.setTimeout(() => setVideoReady(true), 250)
      video.playbackRate = 0.75
      video.play().catch(() => {})
    }
    video.addEventListener('canplay', onReady)
    if (video.readyState >= 3) onReady()

    return () => {
      window.clearTimeout(readyTimer)
      window.clearTimeout(fallbackTimer)
      video.removeEventListener('canplay', onReady)
    }
  }, [])

  // ─── GSAP ScrollTrigger ───────────────────────────────────────────────────
  useEffect(() => {
    if (!videoReady) return

    // Scroll distance = 5× viewport so we have plenty of room to scrub
    const scrollHeight = window.innerHeight * 6

    // Pin the sticky wrapper
    const pinTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start:   'top top',
      end:     `+=${scrollHeight}`,
      pin:     stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
    })

    // Main scrub timeline — drives video time + rune bar
    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start:   'top top',
        end:     `+=${scrollHeight}`,
        scrub:   1.2,
        onUpdate: (self) => {
          latestProgressRef.current = self.progress
          if (progressFrameRef.current) return

          progressFrameRef.current = window.requestAnimationFrame(() => {
            progressFrameRef.current = 0
            const p = latestProgressRef.current

            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${p})`
            }

            const idx = CHAPTERS.findIndex(c => p >= c.progress[0] && p < c.progress[1])
            transitionChapter(idx === -1 ? CHAPTERS.length - 1 : idx)

            const vinInt = 0.52 + Math.sin(p * Math.PI) * 0.16
            if (vignetteRef.current) {
              vignetteRef.current.style.opacity = String(vinInt)
            }
          })
        },
      },
    })

    // Rune bar decorative tick animation
    if (runeBarRef.current) {
      const ticks = runeBarRef.current.querySelectorAll('.rune-tick')
      gsap.fromTo(ticks,
        { scaleY: 0, opacity: 0 },
        {
          scaleY: 1, opacity: 1, stagger: 0.06, duration: 0.6, ease: 'elastic.out(1,0.5)',
          scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
        }
      )
    }

    return () => {
      if (progressFrameRef.current) {
        window.cancelAnimationFrame(progressFrameRef.current)
        progressFrameRef.current = 0
      }
      scrubTl.kill()
      pinTrigger.kill()
      chapterTweenRef.current?.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [videoReady])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>

      {/* ── Loading overlay ── */}
      <div className={`got-loading ${videoReady ? 'hidden' : ''}`}>
        <div className="got-loading-logo">Game of Thrones</div>
        <div className="got-loading-sub">The Chronicles of Westeros</div>
        <div className="got-loading-bar-wrap">
          <div className="got-loading-bar-fill" />
        </div>
      </div>

      {/* ── Main scroll container ── */}
      <div
        ref={containerRef}
        className="got-container"
      >
        {/* ── Sticky viewport ── */}
        <div ref={stickyRef} className="got-sticky">

          {/* Video */}
          <video
            ref={videoRef}
            className="got-video"
            src={publicAsset('video/one.mp4')}
            width="1920"
            height="1080"
            autoPlay
            loop
            playsInline
            muted
            preload="auto"
          />

          {/* Layers */}
          <div ref={vignetteRef} className="got-vignette" />
          <div ref={overlayRef}  className="got-overlay" />
          <div className="got-grain" />

          {/* Corner ornaments */}
          {['tl','tr','bl','br'].map(pos => (
            <div key={pos} className={`got-corner got-corner-${pos}`}>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2 L2 20 M2 2 L20 2" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.5"/>
                <path d="M2 2 L8 8" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.4"/>
                <rect x="1" y="1" width="4" height="4" fill="none" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.6"/>
              </svg>
            </div>
          ))}

          {/* Nav */}
          <nav className="got-nav">
            <div className="got-nav-logo">Game of Thrones</div>
            <ul className="got-nav-links">
              {['The World','Characters','Houses','History'].map(l => (
                <li key={l}><a href="#0">{l}</a></li>
              ))}
            </ul>
          </nav>

          {/* Rune bar */}
          <div ref={runeBarRef} className="got-rune-bar">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="rune-tick" />
            ))}
          </div>

   
          <div className="got-content">
            <span ref={sigilRef} className="got-sigil">{activeContent.sigil}</span>
            <div className="got-divider">
              <div className="got-divider-line" />
              <div className="got-divider-diamond" />
              <div className="got-divider-line right" />
            </div>
            <span ref={subtitleRef} className="got-subtitle">{activeContent.subtitle}</span>
            <h1 ref={titleRef} className="got-title">{activeContent.title}</h1>
            <p ref={bodyRef} className="got-body">{activeContent.body}</p>
            <div className="got-cta-row">
              <button className="got-cta-btn">Begin the Journey</button>
              <button className="got-cta-ghost">Explore the Realm</button>
            </div>
          </div>

         
          <div className="got-right-panel">
            <div ref={chapterLabelRef} className="got-chapter-label">01 / 06</div>
            <div className="got-vert-line" />
            <div className="got-dots">
              {CHAPTERS.map((_, i) => (
                <div
                  key={i}
                  className={`got-dot ${i === activeChapter ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div className="got-scroll-hint">
            <span>Scroll</span>
            <div className="arrow" />
          </div>

          {/* Progress bar */}
          <div className="got-progress-bar-wrap">
            <div ref={progressRef} className="got-progress-bar-fill" />
          </div>

        </div>{/* /sticky */}
      </div>{/* /container */}
    </>
  )
}

export default Hero
