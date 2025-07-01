"use client"
import { useAuth } from "@clerk/clerk-react"
import { SendToBack } from "lucide-react"
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function FloatingNavbar() {
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()
  const [showNav, setShowNav] = useState(true)
  const [navPosition, setNavPosition] = useState(120)
  const [isNavAreaHovered, setIsNavAreaHovered] = useState(false)
  const [hideTimer, setHideTimer] = useState(null)

  const sections = useMemo(() => {
    return [
      {
        title: "Home",
        url: "/",
        isProtected: false,
      },
      {
        title: "Browse",
        url: "/courses",
        isProtected: false,
      },
      {
        title: "My Courses",
        url: "/my-course",
        isProtected: true,
      }
    ]
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const wasNavVisible = showNav
      const shouldShowNav = e.clientX < 180

      if (shouldShowNav) {
        if (hideTimer) {
          clearTimeout(hideTimer)
          setHideTimer(null)
        }
        setShowNav(true)

        if (!wasNavVisible && typeof window !== 'undefined') {
          const newPos = Math.max(120, Math.min(e.clientY - 75, window.innerHeight - 200))
          setNavPosition(newPos)
        }
      } else if (showNav && !hideTimer) {
        const timer = setTimeout(() => {
          setShowNav(false)
          setHideTimer(null)
        }, 5000)
        setHideTimer(timer)
      }

      const isInNavZone = e.clientX < 250 && e.clientY > navPosition - 30 && e.clientY < navPosition + 220
      setIsNavAreaHovered(isInNavZone)
    }

    window.addEventListener('mousemove', handleMouseMove)

    const initialTimer = setTimeout(() => setShowNav(false), 10000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(initialTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [showNav, navPosition, hideTimer])

  if (pathname.includes("sxzy")) {
    return null;
  }
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className="absolute top-6 left-6 flex items-center gap-2 pointer-events-auto cursor-pointer transition-opacity duration-500"
        style={{
          opacity: 0.8,
          filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.4))'
        }}
      >
        <SendToBack className="w-4 h-4 text-blue-400" />
        <span className="text-white text-sm font-mono tracking-wide">Friday</span>
      </div>

      <div
        className={`absolute left-8 transition-all ease-out ${showNav ? 'opacity-100 translate-x-0 scale-100 duration-700' : 'opacity-0 -translate-x-3 scale-95 duration-1000'
          }`}
        style={{
          top: navPosition,
          filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.6))'
        }}
      >
        {sections.map((section, i) => {
          const isActive = pathname === section.url
          const isDisabled = section.isProtected && !isSignedIn

          return (
            <div
              key={section.title}
              className={`flex items-center mb-6 pointer-events-auto transition-all ease-out ${showNav ? 'translate-x-0 opacity-90 duration-600' : '-translate-x-2 opacity-0 duration-800'
                }`}
              style={{
                transitionDelay: showNav ? `${i * 120}ms` : `${(sections.length - i) * 80}ms`,
              }}
            >
              <div
                className={`h-px transition-all duration-300 ${isActive ? 'w-8 bg-primary' :
                  isDisabled ? 'w-3 bg-gray-800' : 'w-4 bg-gray-600 hover:w-6 hover:bg-gray-500'
                  }`}
                style={{
                  backgroundImage: isActive ? 'none' : 'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)',
                  backgroundColor: isActive ? undefined : 'transparent'
                }}
              />

              <Link
                href={isDisabled ? "#" : section.url}
                className={`ml-3 text-sm font-mono transition-all duration-300 ${isActive ? 'text-primary' :
                  isDisabled ? 'text-gray-700 cursor-not-allowed' :
                    'text-gray-400 hover:text-white hover:translate-x-1'
                  }`}
                onClick={(e) => isDisabled && e.preventDefault()}
              >
                {section.title}
              </Link>
            </div>
          )
        })}

        <div className={`mt-12 transition-all ease-out ${showNav ? 'opacity-70 translate-x-0 duration-700 delay-300' : 'opacity-0 -translate-x-2 duration-900 delay-100'
          }`}>
          {!isLoaded ? (
            <div className="flex items-center">
              <div
                className="w-3 h-px bg-yellow-500 animate-pulse"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)',
                  backgroundColor: 'transparent'
                }}
              />
              <span className="ml-3 text-xs font-mono text-gray-600">loading...</span>
            </div>
          ) : isSignedIn ? (
            <div className="flex items-center pointer-events-auto">
              <div className="w-4 h-px bg-primary" />
              <div className="ml-3 scale-75 origin-left">
                <UserButton />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center pointer-events-auto group">
                <div
                  className="w-3 h-px bg-gray-700 group-hover:bg-gray-500 transition-colors"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)',
                    backgroundColor: 'transparent'
                  }}
                />
                <SignInButton mode="modal">
                  <button className="ml-3 text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">
                    login
                  </button>
                </SignInButton>
              </div>
              <div className="flex items-center pointer-events-auto group">
                <div
                  className="w-3 h-px bg-gray-700 group-hover:bg-primary transition-colors"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)',
                    backgroundColor: 'transparent'
                  }}
                />
                <SignUpButton mode="modal">
                  <button className="ml-3 text-xs font-mono text-primary hover:text-primary/80 transition-colors">
                    signup
                  </button>
                </SignUpButton>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute left-0 top-1/3 w-px h-1/3 transition-all ease-out ${showNav ? 'opacity-0 duration-500' : 'opacity-15 duration-1500 delay-500'
          }`}
        style={{
          background: 'repeating-linear-gradient(to bottom, rgb(75, 85, 99) 0, rgb(75, 85, 99) 2px, transparent 2px, transparent 8px)'
        }}
      />
    </div>
  )
}
