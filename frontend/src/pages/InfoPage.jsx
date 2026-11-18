
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const pageContent = {
  '/shipping': {
    label: 'DELIVERY',
    title: 'SHIPPING INFORMATION.',
    intro: 'Getting your Shiya Kulenga pieces to you, wherever you are in South Africa.',
    sections: [
      {
        heading: 'Nationwide Delivery',
        text: 'We offer delivery across South Africa. Please make sure your delivery address and contact details are correct when placing your order.'
      },
      {
        heading: 'Delivery Fee',
        text: 'Our current standard delivery fee is R100 per order.'
      },
      {
        heading: 'Processing and Delivery Times',
        text: 'Orders are prepared for dispatch after they have been received and processed. Delivery timeframes may vary depending on your location and courier operations. We will communicate relevant order updates using the contact details supplied at checkout.'
      },
      {
        heading: 'Tracking and Support',
        text: 'If you need an update about your order, contact us with your order number at info@shiyakulenga.co.za.'
      }
    ]
  },

  '/returns': {
    label: 'CUSTOMER CARE',
    title: 'RETURNS & EXCHANGES.',
    intro: 'We want you to feel confident about every Shiya Kulenga purchase.',
    sections: [
      {
        heading: 'Contact Us First',
        text: 'If you received an incorrect, damaged or defective item, contact us at info@shiyakulenga.co.za. Include your order number, a description of the issue and clear photographs where relevant.'
      },
      {
        heading: 'Exchanges',
        text: 'If you would like to request an exchange, contact us before sending an item back. Exchanges are subject to product availability and confirmation by our team.'
      },
      {
        heading: 'Item Condition',
        text: 'Please keep the item, packaging and any tags in their original condition while your request is being reviewed. Do not send an item back before receiving instructions from our team.'
      },
      {
        heading: 'Your Consumer Rights',
        text: 'Nothing in this policy limits any rights you may have under applicable South African consumer protection laws. Requests involving defective, unsafe or incorrectly supplied goods will be handled in accordance with those laws.'
      }
    ]
  },

  '/privacy': {
    label: 'YOUR INFORMATION',
    title: 'PRIVACY POLICY.',
    intro: 'We respect your privacy and are committed to handling your personal information responsibly.',
    sections: [
      {
        heading: 'Information We Collect',
        text: 'When you use our website, create an account or place an order, we may collect information such as your name, email address, telephone number, delivery address and order details.'
      },
      {
        heading: 'How We Use Your Information',
        text: 'We use your information to manage customer accounts, process orders, arrange deliveries, communicate with you and provide customer support.'
      },
      {
        heading: 'Sharing Information',
        text: 'Information may be shared with service providers where necessary to operate our store, process transactions or deliver orders. We expect information to be handled responsibly.'
      },
      {
        heading: 'Keeping Information Secure',
        text: 'We take reasonable steps to protect personal information against unauthorised access, loss, misuse or disclosure.'
      },
      {
        heading: 'Your Privacy Rights',
        text: 'You may contact us to ask about the personal information we hold about you or to request that inaccurate information be corrected, subject to applicable law.'
      },
      {
        heading: 'Contact',
        text: 'For privacy-related questions, contact info@shiyakulenga.co.za.'
      }
    ]
  }
}

const InfoPage = () => {
  const location = useLocation()
  const page = pageContent[location.pathname]

  if (!page) {
    return (
      <main className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">PAGE NOT FOUND.</h1>
          <Link to="/shop" className="text-[#00F0FF] hover:underline">
            Return to Shop
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white">
      <section className="max-w-5xl mx-auto px-6 md:px-10 py-20">

        <p className="text-[#00F0FF] text-xs font-bold tracking-[4px] mb-5">
          {page.label}
        </p>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
          {page.title}
        </h1>

        <p className="text-[#94A3B8] text-base md:text-lg leading-8 max-w-3xl mb-14">
          {page.intro}
        </p>

        <div className="space-y-10">
          {page.sections.map((section, index) => (
            <div key={index} className="border-t border-white/10 pt-7">
              <h2 className="text-lg md:text-xl font-bold text-[#00F0FF] mb-4">
                {section.heading}
              </h2>

              <p className="text-[#94A3B8] leading-8">
                {section.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 flex flex-wrap gap-6">
          <Link to="/shop" className="text-[#00F0FF] font-bold hover:underline">
            SHOP NOW
          </Link>

          <Link to="/contact" className="text-[#94A3B8] font-bold hover:text-white">
            CONTACT US
          </Link>
        </div>

      </section>
    </main>
  )
}

export default InfoPage
