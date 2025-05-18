"use client"
import { useAuth } from "@clerk/clerk-react"
import { SendToBack } from "lucide-react"
import { motion } from "motion/react"
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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
  }, []);

  return (
    <motion.div className="w-full p-4 flex justify-center absolute"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="xl:w-[1200px] w-full sm:px-8 px-4 p-5 navbar rounded-2xl transition-all duration-300 ease-in-out relative flex-col">
        <div className="flex items-center justify-between">
          <Link className="flex items-center cursor-pointer gap-3 font-bold hover:transform-[scale(1.01)] transition-all sm:text-xl text-sm " href={"/"}>
            <SendToBack className="text-primary text-sm sm:text-2xl" />
            Friday
          </Link>
          <section className="hidden sm:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {sections.map((section) => {
              const isActive = pathname === section.url
              return (
                <Link
                  key={section.title}
                  href={section.isProtected && !isSignedIn ? "#" : section.url}
                  className={`${isActive ? "text-white" : "text-gray-400"} 
                           ${section.isProtected && !isSignedIn ? "text-gray-600 cursor-default" : "hover:text-white cursor-pointer"} 
                           transition-colors`}
                  onClick={(e) => {
                    if (section.isProtected && !isSignedIn) {
                      e.preventDefault()
                    }
                  }}
                >
                  {section.title}
                </Link>
              )
            })}
          </section>
          <section className="flex items-center gap-3">
            {!isLoaded ? (
              <div className="animate-spin border-r-primary border-2 h-6 w-6 rounded-full border-transparent"></div>
            ) : isSignedIn ? (
              <UserButton />
            ) : (
              <div className="flex gap-6 text-gray-400 items-center">
                <SignInButton mode="modal">
                  <button className="cursor-pointer hidden sm:block">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-primary rounded-sm cursor-pointer hidden sm:block">Sign up</button>
                </SignUpButton>
              </div>
            )}
            <div
              className={`relative visible sm:hidden transition-all w-[24px] h-[16px] cursor-pointer duration-300 ${isMenuOpen ? "rotate-180" : "rotate-0"}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className={`w-full h-[1px] opacity-90 absolute left-1/2 -translate-x-1/2 bg-white transition-all duration-300 ${isMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-0 rotate-0"}`}></div>
              <div className={`w-full h-[1px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-90"}`}></div>
              <div className={`w-full h-[1px] opacity-90 absolute left-1/2 -translate-x-1/2 bg-white transition-all duration-300 ${isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "bottom-0 rotate-0"}`}></div>
            </div>
          </section>
        </div>

        <div
          className={`sm:hidden flex-col overflow-hidden transition-all duration-300 ease-in-out  text-sm ${isMenuOpen
            ? "max-h-64 opacity-100 mt-4 visible"
            : "max-h-0 opacity-0 mt-0 invisible pointer-events-none"
            }`}
        >
          <div className="flex flex-col p-4 space-y-4">
            {sections.map((section) => {
              const isActive = pathname === section.url
              return (
                <Link
                  key={section.title}
                  href={section.isProtected && !isSignedIn ? "#" : section.url}
                  className={`${isActive ? "text-white" : "text-gray-400"} 
                            ${section.isProtected && !isSignedIn ? "text-gray-600 cursor-default" : "hover:text-white cursor-pointer"} 
                            transition-colors`}
                  onClick={(e) => {
                    if (section.isProtected && !isSignedIn) {
                      e.preventDefault()
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  {section.title}
                </Link>
              )
            })}
            {!isSignedIn &&
              <>
                <div className="w-full h-[1px] opacity-90 bg-gray-600"></div>
                <div className="flex-col flex gap-y-4 text-gray-400 items-start ">
                  <SignInButton mode="modal">
                    <button className="cursor-pointer ">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-primary rounded-sm cursor-pointer ">Sign up</button>
                  </SignUpButton>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </motion.div>
  )
}
