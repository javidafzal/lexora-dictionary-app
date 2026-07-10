"use client"

import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import type { WordEntry } from "@/data/words"

declare global {
  interface Window {
    gsap: any
    ScrollTrigger: any
  }
}

interface LexiconSpectrumProps {
  color?:
    | "original"
    | "blue-pink"
    | "blue-orange"
    | "sunset"
    | "purple"
    | "monochrome"
    | "pink-purple"
    | "blue-black"
    | "beige-black"
  blur?: boolean
  /** The sequence of words whose origin stories are revealed one by one as the user scrolls. */
  words: WordEntry[]
}

export function CosmicSpectrum({ color = "sunset", blur = false, words }: LexiconSpectrumProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeWord = words[activeIndex] ?? words[0]
  // One full viewport height for the entrance reveal, then one more per word
  // so there's enough scroll room to step through the whole sequence.
  const sectionVh = 100 + Math.max(1, words.length) * 100

  const colorThemes = {
    original: ["#340B05", "#0358F7", "#5092C7", "#E1ECFE", "#FFD400", "#FA3D1D", "#FD02F5", "#FFC0FD"],
    "blue-pink": ["#1E3A8A", "#3B82F6", "#A855F7", "#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8", "#FDF2F8"],
    "blue-orange": ["#1E40AF", "#3B82F6", "#60A5FA", "#FFFFFF", "#FED7AA", "#FB923C", "#EA580C", "#9A3412"],
    sunset: ["#FEF3C7", "#FCD34D", "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F", "#451A03"],
    purple: ["#F3E8FF", "#E9D5FF", "#D8B4FE", "#C084FC", "#A855F7", "#9333EA", "#7C3AED", "#6B21B6"],
    monochrome: ["#1A1A1A", "#404040", "#666666", "#999999", "#CCCCCC", "#E5E5E5", "#F5F5F5", "#FFFFFF"],
    "pink-purple": ["#FDF2F8", "#FCE7F3", "#F9A8D4", "#F472B6", "#EC4899", "#BE185D", "#831843", "#500724"],
    "blue-black": ["#000000", "#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1"],
    "beige-black": ["#FEF3C7", "#F59E0B", "#D97706", "#92400E", "#451A03", "#1C1917", "#0C0A09", "#000000"],
  }

  const darkThemes = ["blue-black", "beige-black", "monochrome"]
  const isDarkTheme = darkThemes.includes(color)

  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = src
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const initializeAnimations = async () => {
      try {
        await Promise.all([
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"),
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"),
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/TextPlugin.min.js"),
        ])

        setTimeout(() => {
          if (window.gsap && window.ScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger)
            setupAnimations()
          }
        }, 100)
      } catch (error) {
        console.error("Failed to load GSAP:", error)
      }
    }

    initializeAnimations()
  }, [])

  const setupAnimations = () => {
    const gsap = window.gsap
    const ScrollTrigger = window.ScrollTrigger

    if (!gsap || !ScrollTrigger) return

    const heroTl = gsap.timeline({ delay: 0.5 })

    const titleChars = document.querySelectorAll(".hero-title .char")
    if (titleChars.length > 0) {
      gsap.set(titleChars, { opacity: 0, filter: "blur(8px)", x: -20 })
      heroTl.to(
        titleChars,
        { opacity: 1, filter: "blur(0px)", x: 0, duration: 0.8, stagger: 0.03, ease: "power2.out" },
        0
      )
    }

    const scrollHintChars = document.querySelectorAll(".scroll-hint .char")
    if (scrollHintChars.length > 0) {
      gsap.set(scrollHintChars, { opacity: 0, filter: "blur(3px)" })
      gsap.to(scrollHintChars, {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        stagger: { each: 0.08, repeat: -1, yoyo: true },
        ease: "sine.inOut",
        delay: 1,
      })
    }

    // Entrance reveal: the section's top travels from the bottom of the
    // viewport to the top of the viewport — exactly one viewport-height of
    // scroll — regardless of how tall the whole section is.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".animation-section",
        start: "top bottom",
        end: "top top",
        scrub: 1,
      },
    })

    const mainTitle = document.querySelector(".main-title")

    gsap.set([mainTitle], { opacity: 0, y: 30, filter: "blur(8px)" })

    tl.to(".svg-container", { opacity: 1, duration: 0.01 }, 0)
      .to(".main-title", { opacity: 1, duration: 0.01 }, 0)
      .to(".svg-container", { transform: "scaleY(0.05) translateY(-30px)", duration: 0.3, ease: "power2.out" }, 0)
      .to(".svg-container", { transform: "scaleY(1) translateY(0px)", duration: 1.2, ease: "power2.out" }, 0.3)
      .to(".nav-bottom-center", { opacity: 0, duration: 0.6, ease: "power2.out" }, 0.2)
      .to([mainTitle], { duration: 0.8, y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.08, ease: "power2.out" }, 0.9)

    // Word cycling: spans the rest of the section (after the entrance),
    // stepping the active word forward as the user scrolls through it.
    ScrollTrigger.create({
      trigger: ".animation-section",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self: any) => {
        const total = words.length
        if (total <= 1) return
        const idx = Math.min(total - 1, Math.floor(self.progress * total))
        setActiveIndex((prev) => (prev === idx ? prev : idx))
      },
    })

    const handleResize = () => ScrollTrigger.refresh()
    window.addEventListener("resize", handleResize)
  }

  const splitText = (text: string, className = "") => {
    return text.split("").map((char, index) => (
      <span key={index} className={`char ${className}`}>
        {char === " " ? "\u00A0" : char}
      </span>
    ))
  }

  const currentColors = colorThemes[color]

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-black">
      <div
        className="gradient-overlay fixed top-20 left-0 w-screen h-screen pointer-events-none z-[5] opacity-0 transition-opacity duration-600"
        style={{ filter: "blur(60px)" }}
      />

      {/* Section heading */}
      <section className="h-screen w-full p-8 flex flex-col justify-center relative">
        <h1 className="hero-title text-center text-5xl md:text-7xl font-serif font-light tracking-tight transition-colors duration-300 text-white">
          {splitText("The Living Lexicon")}
        </h1>
      </section>

      <div className="nav-bottom-center scroll-hint fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-auto text-xs uppercase tracking-wide transition-colors duration-300 text-white/70">
        {splitText("Scroll to trace a word")}
      </div>
      <div className="h-[50vh]" />

      {/* Animation Section */}
      <div className="animation-section relative" style={{ height: `${sectionVh}vh` }}>
        <div className="fixed bottom-0 left-0 right-0 h-screen pointer-events-none z-10">
          <div
            className="svg-container absolute bottom-0 left-0 right-0 h-screen opacity-0 z-[15]"
            style={{
              transformOrigin: "bottom",
              transform: "scaleY(0.05) translateY(100vh)",
              willChange: "transform, opacity, filter",
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 1567 584" preserveAspectRatio="none" fill="none">
              <g clipPath="url(#clip)" filter={blur ? "url(#blur)" : undefined}>
                <path d="M1219 584H1393V184H1219V584Z" fill="url(#grad0)" />
                <path d="M1045 584H1219V104H1045V584Z" fill="url(#grad1)" />
                <path d="M348 584H174L174 184H348L348 584Z" fill="url(#grad2)" />
                <path d="M522 584H348L348 104H522L522 584Z" fill="url(#grad3)" />
                <path d="M697 584H522L522 54H697L697 584Z" fill="url(#grad4)" />
                <path d="M870 584H1045V54H870V584Z" fill="url(#grad5)" />
                <path d="M870 584H697L697 0H870L870 584Z" fill="url(#grad6)" />
                <path d="M174 585H0.000183105L-3.75875e-06 295H174L174 585Z" fill="url(#grad7)" />
                <path d="M1393 584H1567V294H1393V584Z" fill="url(#grad8)" />
              </g>
              <defs>
                <filter
                  id="blur"
                  x="-30"
                  y="-30"
                  width="1627"
                  height="644"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur" />
                </filter>
                {Array.from({ length: 9 }, (_, i) => (
                  <linearGradient key={i} id={`grad${i}`} x1="50%" y1="100%" x2="50%" y2="0%" gradientUnits="userSpaceOnUse">
                    <stop stopColor={currentColors[0]} />
                    <stop offset="0.182709" stopColor={currentColors[1]} />
                    <stop offset="0.283673" stopColor={currentColors[2]} />
                    <stop offset="0.413484" stopColor={currentColors[3]} />
                    <stop offset="0.586565" stopColor={currentColors[4]} />
                    <stop offset="0.682722" stopColor={currentColors[5]} />
                    <stop offset="0.802892" stopColor={currentColors[6]} />
                    <stop offset="1" stopColor={currentColors[7]} stopOpacity="0" />
                  </linearGradient>
                ))}
                <clipPath id="clip">
                  <rect width="1567" height="584" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          <div
            className="main-title absolute bottom-1/2 left-1/2 transform translate-x-[-50%] translate-y-1/2 text-center z-20 opacity-0 transition-colors duration-300 px-4"
            style={{ color: isDarkTheme ? "#ffffff" : "#f4efe4" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWord.id}
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
                  {activeWord.originLanguage} · {activeWord.pronunciation}
                </p>
                <h2 className="font-serif text-4xl md:text-6xl mb-4">{activeWord.word}</h2>
                <p className="text-sm md:text-base max-w-md mx-auto leading-relaxed opacity-80">{activeWord.origin}</p>
                <Link
                  to={`/origins?word=${activeWord.id}`}
                  className="pointer-events-auto inline-block mt-6 text-xs uppercase tracking-wide border-b border-current pb-1 opacity-80 hover:opacity-100 transition-opacity"
                >
                  Trace its full origin →
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
