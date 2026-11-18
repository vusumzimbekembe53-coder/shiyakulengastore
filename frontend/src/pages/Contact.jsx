
import React, { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for contacting Shiya Kulenga! Our email system will be connected soon.')
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white px-6 md:px-10 py-20">

      <div className="max-w-7xl mx-auto">

        {/* HEADING */}
        <div className="mb-16">
          <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-5">
            WE WOULD LOVE TO HEAR FROM YOU
          </p>

          <h1 className="text-5xl md:text-7xl font-black">
            GET IN
            <span className="text-[#00F0FF]"> TOUCH.</span>
          </h1>

          <p className="text-gray-400 mt-6 max-w-xl leading-7">
            Have a question about an order, our products or anything
            Shiya Kulenga? Send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* CONTACT INFORMATION */}
          <div className="space-y-8">

            <div>
              <h2 className="text-xl font-black text-[#00F0FF] mb-3">
                CUSTOMER SUPPORT
              </h2>
              <p className="text-gray-400 leading-7">
                We're here to help with product enquiries, orders and
                general questions.
              </p>
            </div>

            <div>
              <h3 className="font-black mb-2">OUR LOCATION</h3>
              <p className="text-gray-400">Germiston, South Africa</p>
            </div>

            <div>
              <h3 className="font-black mb-2">FOLLOW OUR JOURNEY</h3>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#00F0FF] hover:text-white transition"
              >
                Instagram
              </a>
            </div>

            <div className="border border-white/10 bg-[#181A20] rounded-xl p-6">
              <p className="text-[#00F0FF] font-black text-lg">
                SHIYA KULENGA.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                STYLE FOR EVERY YOU.
              </p>
            </div>

          </div>

          {/* CONTACT FORM */}
          <div className="lg:col-span-2 bg-[#181A20] p-6 md:p-10 rounded-xl border border-white/10">

            <h2 className="text-2xl font-black mb-8">
              SEND US A MESSAGE
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-bold mb-2">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                    placeholder="Enter your email"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  SUBJECT
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                  placeholder="What is your enquiry about?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  YOUR MESSAGE
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF] resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              <button
                type="submit"
                className="bg-[#00F0FF] text-[#0B0C10] px-10 py-4 font-black text-xs tracking-widest hover:bg-white transition"
              >
                SEND MESSAGE →
              </button>

            </form>

          </div>

        </div>

      </div>

    </main>
  )
}

export default Contact
