"use client"

import { useState, useEffect } from "react"
import { FaHome, FaShoppingCart, FaHistory, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa"
import Link from "next/link"
import { useRouter } from "next/navigation" // <-- import this
import { removeToken } from "@/app/lib/auth" // <-- import your removeToken function

export default function Sidebar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showHamburger, setShowHamburger] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowHamburger(window.scrollY <= 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    removeToken() // clear JWT
    router.push("/login") // redirect to login page
  }

  return (
    <>
      {showHamburger && (
        <button
          className="md:hidden fixed top-4 left-4 z-60 p-2 bg-yellow-400 text-white rounded shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaBars />
        </button>
      )}

      <div
        className={`
          fixed top-0 left-0 w-64 bg-gray-800 text-white p-6 flex flex-col
          h-screen
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          z-50
        `}
      >
        <div className="text-center text-xl font-bold border-b border-gray-700 pb-4 mb-4">
          ShopSecure
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded hover:bg-yellow-400 hover:text-black cursor-pointer transition-colors duration-200">
            <FaHome /> Dashboard
          </Link> 
          <Link href="/pending" className="flex items-center gap-3 p-2 rounded hover:bg-yellow-400 hover:text-black cursor-pointer transition-colors duration-200">
            <FaShoppingCart /> Orders
          </Link>
          <Link href="/history" className="flex items-center gap-3 p-2 rounded hover:bg-yellow-400 hover:text-black cursor-pointer transition-colors duration-200">
            <FaHistory /> Order History
          </Link>
                <button
          onClick={() => alert("Profile page coming soon!")}
          className="flex items-center gap-3 p-2 rounded hover:bg-yellow-400 hover:text-black cursor-pointer transition-colors duration-200 w-full text-left"
        >
          <FaUser /> Profile (Coming Soon)
        </button>


          {/* Replace Link with button for logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded hover:bg-yellow-400 hover:text-black cursor-pointer transition-colors duration-200 w-full text-left"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>

        <div className="text-sm border-t border-gray-700 pt-4 mt-4">
          © 2025 NovaTechnology
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/30 md:hidden z-40" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
