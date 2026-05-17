import SearchBox from '@/components/search/SearchBox'

export default function Hero() {
  return (
    <section
      className="
        flex h-90 md:h-120 w-full items-end md:items-center justify-center bg-cover bg-center bg-bark
        bg-[url(https://pub-ca5dd2068b3441479a027dfdbebb0240.r2.dev/homepage.jpg)]
      "
    >
      <div className="flex w-full max-w-240 flex-col items-center gap-5 p-6 rounded-lg text-cream">
        <h1 className="m-0 md:text-center text-3xl md:text-5xl font-bold leading-[1.15]">
          Find Your Perfect Bandung Coffee Spot
        </h1>
        <p className="m-0 md:text-center text-sm md:text-lg">
          With honest reviews and real scores, BDGCafé helps you seek your next
          stop for working, relaxing, hangout, and everything in between.
        </p>
        <SearchBox />
      </div>
    </section>
  )
}
