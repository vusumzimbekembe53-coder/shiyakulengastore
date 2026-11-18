
import React from 'react'
import { Link } from 'react-router-dom'
import pro1Img from '../assets/pro1.jpg'

const About = () => {
  return (
    <main className="bg-[#0B0C10] text-white">

      {/* HERO SECTION */}
      <section className="px-6 md:px-10 py-24">
        <div className="max-w-7xl mx-auto text-center">

          <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-6">
            MORE THAN JUST CLOTHING
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-tight">
            THIS IS
            <span className="block text-[#00F0FF]">
              SHIYA KULENGA.
            </span>
          </h1>

          <p className="text-gray-300 text-base md:text-xl leading-8 max-w-3xl mx-auto mt-8">
            A streetwear brand born in Germiston, inspired by culture,
            individuality and the freedom to express yourself.
          </p>

        </div>
      </section>

      {/* BRAND STORY */}
      <section className="px-6 md:px-10 py-20 bg-[#181A20]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div>
            <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-5">
              WHERE IT ALL BEGINS
            </p>

            <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
              ROOTED IN
              <span className="text-[#00F0FF]"> CULTURE.</span>
            </h2>

            <p className="text-gray-300 leading-8 mb-6">
              Shiya Kulenga was born in the heart of Germiston, with roots
              deeply connected to KwaZulu-Natal culture.
            </p>

            <p className="text-gray-300 leading-8 mb-6">
              We believe clothing is more than something you wear.
              It is a way to express your personality, your background,
              your mood and your identity.
            </p>

            <p className="text-gray-300 leading-8">
              Our goal is to bring together local inspiration, bold
              streetwear and everyday comfort while keeping style
              accessible.
            </p>
          </div>

          <div className="relative">
            <img
              src={pro1Img}
              alt="Shiya Kulenga streetwear"
              className="w-full h-[400px] md:h-[550px] object-cover rounded-2xl"
            />

            <div className="absolute bottom-5 left-5 bg-[#00F0FF] text-[#0B0C10] p-5 rounded-lg">
              <p className="text-2xl font-black">SK.</p>
              <p className="text-xs font-black tracking-widest">
                BORN IN GERMISTON
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* OUR PHILOSOPHY */}
      <section className="px-6 md:px-10 py-24">
        <div className="max-w-5xl mx-auto text-center">

          <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-5">
            OUR PHILOSOPHY
          </p>

          <h2 className="text-4xl md:text-7xl font-black leading-tight">
            STYLE FOR
            <span className="block text-[#00F0FF]">
              EVERY YOU.
            </span>
          </h2>

          <p className="text-gray-300 leading-8 text-base md:text-lg mt-8">
            We understand that everyone has different sides to their
            personality. Some days are bold, some are relaxed, some are
            expressive and others are simple.
          </p>

          <p className="text-gray-300 leading-8 text-base md:text-lg mt-5">
            Shiya Kulenga celebrates every version of you. We want you
            to feel comfortable expressing yourself without feeling
            limited by trends or expectations.
          </p>

        </div>
      </section>

      {/* WHAT WE STAND FOR */}
      <section className="px-6 md:px-10 py-24 bg-[#181A20]">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-4">
              THE SHIYA STANDARD
            </p>

            <h2 className="text-4xl md:text-6xl font-black">
              WHAT WE
              <span className="text-[#00F0FF]"> STAND FOR.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {[
              {
                number: '01',
                title: 'INDIVIDUALITY',
                description: 'Be yourself. Express your style without limits.'
              },
              {
                number: '02',
                title: 'LOCAL CULTURE',
                description: 'Inspired by our roots and the streets we come from.'
              },
              {
                number: '03',
                title: 'ACCESSIBLE STYLE',
                description: 'Streetwear that makes bold expression more accessible.'
              }
            ].map((item) => (
              <div
                key={item.number}
                className="bg-[#0B0C10] border border-white/10 rounded-xl p-8 hover:border-[#00F0FF] transition"
              >
                <p className="text-[#00F0FF] font-black text-sm mb-8">
                  {item.number}
                </p>

                <h3 className="text-2xl font-black mb-4">
                  {item.title}
                </h3>

                <p className="text-gray-400 leading-7">
                  {item.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="px-6 md:px-10 py-24 bg-[#00F0FF] text-[#0B0C10]">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            WEAR YOUR
            <span className="block">STORY LOUD.</span>
          </h2>

          <p className="mt-6 leading-7">
            Your style. Your identity. Your story.
            Discover the Shiya Kulenga collection.
          </p>

          <Link
            to="/shop"
            className="inline-block mt-9 bg-[#0B0C10] text-white px-10 py-4 text-xs font-black tracking-widest hover:bg-[#181A20] transition"
          >
            EXPLORE THE COLLECTION
          </Link>

        </div>
      </section>

    </main>
  )
}

export default About
