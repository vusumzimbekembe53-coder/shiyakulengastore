
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-[#181A20] text-white border-t border-[#00F0FF]/40">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <Link to="/" className="text-3xl font-black tracking-tight">
              SHIYA<span className="text-[#00F0FF]">KULENGA.</span>
            </Link>

            <p className="text-[#94A3B8] text-sm leading-7 mt-5 max-w-xs">
              Born in Germiston. Rooted in culture.
              Made for every version of you.
              Wear your story loud.
            </p>

            {/* SOCIAL MEDIA */}
            <div className="flex flex-wrap gap-4 mt-7">
              <a
                href="https://www.instagram.com/shiyakulenga_1401/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-gray-400 hover:text-[#00F0FF] transition"
              >
                INSTAGRAM
              </a>

              <a
                href="https://www.facebook.com/menzi.jele.12"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-gray-400 hover:text-[#00F0FF] transition"
              >
                FACEBOOK
              </a>

              <a
                href="https://www.tiktok.com/@shiyakulenga1401"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-gray-400 hover:text-[#00F0FF] transition"
              >
                TIKTOK
              </a>
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <h3 className="text-[#00F0FF] font-bold text-sm tracking-widest mb-7">
              EXPLORE
            </h3>

            <div className="flex flex-col gap-4 text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>

              <Link to="/shop" className="hover:text-white transition">
                Categories
              </Link>

              <Link to="/shop" className="hover:text-white transition">
                Latest Drops
              </Link>

              <Link to="/cart" className="hover:text-white transition">
                Shopping Bag
              </Link>
            </div>
          </div>

         {/* HELP & SUPPORT */}
<div>
  <h3 className="text-[#00F0FF] font-bold text-sm tracking-widest mb-7">
    HELP & SUPPORT
  </h3>

  <div className="flex flex-col gap-4 text-sm text-gray-400">
    <Link to="/contact" className="hover:text-white transition">
      Contact Us
    </Link>
  </div>
</div>
          {/* CONTACT */}
          <div>
            <h3 className="text-[#00F0FF] font-bold text-sm tracking-widest mb-7">
              GET IN TOUCH
            </h3>

            <div className="flex flex-col gap-4 text-sm text-gray-400">
              <p>Germiston, South Africa</p>

              <a
                href="mailto:info@shiyakulenga.co.za"
                className="hover:text-[#00F0FF] transition break-all"
              >
                info@shiyakulenga.co.za
              </a>

              <p>Nationwide delivery available.</p>
            </div>
          </div>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="border-t border-white/10 mt-16 pt-7 flex flex-col md:flex-row justify-between items-center gap-5">

          <p className="text-gray-500 text-xs text-center">
            © {new Date().getFullYear()} Shiya Kulenga. All rights reserved.
          </p>

          <span className="text-[#CCFF00] text-xs font-bold tracking-[3px]">
            STYLE FOR EVERY YOU.
          </span>

        </div>

      </div>
    </footer>
  )
}

export default Footer
