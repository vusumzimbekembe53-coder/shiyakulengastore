
import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { cartCount } = useCart()
  const { isLoggedIn, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/shop' },
    { name: 'OUR STORY', path: '/our-story' },
    { name: 'CONTACT', path: '/contact' },
  ]

  const navLinkStyle = ({ isActive }) =>
    `text-xs font-bold tracking-widest transition ${
      isActive ? 'text-[#00F0FF]' : 'text-white hover:text-[#00F0FF]'
    }`

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0B0C10] border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">

        <Link to="/" className="text-2xl md:text-3xl font-black text-white">
          SHIYA<span className="text-[#00F0FF]"> KULENGA.</span>
        </Link>

        <div className="hidden xl:flex items-center gap-8">

          {isLoggedIn && isAdmin && (
  <Link
    to="/admin"
    className="text-xs font-bold tracking-widest text-[#00F0FF] hover:text-white"
  >
    ADMIN DASHBOARD
  </Link>
)}

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={navLinkStyle}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-6">

          {isLoggedIn && !isAdmin ? (
            <>
              <Link
                to="/account"
                className="text-xs font-bold tracking-widest text-white hover:text-[#00F0FF]"
              >
                ACCOUNT
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs font-bold tracking-widest text-white hover:text-[#FF5500]"
              >
                LOGOUT
              </button>
            </>
          ) : !isLoggedIn ? (
            <Link
              to="/login"
              className="text-xs font-bold tracking-widest text-white hover:text-[#00F0FF]"
            >
              LOGIN
            </Link>
          ) : null}

          {/* BAG - Customers and guests only */}
          {!isAdmin && (
            <Link to="/cart" className="relative flex items-center gap-2 text-white hover:text-[#00F0FF]">
              <span className="text-xl">🛍</span>
              <span className="text-xs font-bold tracking-widest">BAG</span>

              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 min-w-5 h-5 px-1 bg-[#FF5500] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="xl:hidden text-white text-2xl"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

        </div>
      </div>

      {menuOpen && (
        <div className="xl:hidden bg-[#181A20] border-t border-white/10 px-6 py-6 flex flex-col gap-6">

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              onClick={() => setMenuOpen(false)}
              className={navLinkStyle}
            >
              {link.name}
            </NavLink>
          ))}

          {isLoggedIn && !isAdmin ? (
            <>
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="text-xs font-bold tracking-widest text-[#00F0FF]"
              >
                ACCOUNT
              </Link>

              <button
                onClick={handleLogout}
                className="text-left text-xs font-bold tracking-widest text-white"
              >
                LOGOUT
              </button>
            </>
          ) : !isLoggedIn ? (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-xs font-bold tracking-widest text-[#00F0FF]"
            >
              LOGIN
            </Link>
          ) : null}

          {!isAdmin && (
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="text-xs font-bold tracking-widest text-white"
            >
              SHOPPING BAG ({cartCount})
            </Link>
          )}

        </div>
      )}

    </nav>
  )
}

export default Navbar
