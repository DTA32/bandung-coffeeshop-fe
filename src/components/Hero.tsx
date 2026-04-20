export default function Hero() {
  return (
    <section
      className="
        flex h-90 md:h-120 w-full items-end md:items-center justify-center bg-cover bg-center
        bg-[url(https://pub-ca5dd2068b3441479a027dfdbebb0240.r2.dev/homepage.jpg)]
      "
    >
      <div className="flex w-full max-w-240 flex-col items-center gap-5 p-6 rounded-lg">
        <h1 className="m-0 md:text-center text-3xl md:text-5xl font-bold leading-[1.15] text-white">
          Find Your Perfect Bandung Coffee Spot
        </h1>
        <p className="m-0 md:text-center text-sm md:text-lg text-white">
          With honest reviews and real scores, BDGCafé helps you
          seek your next stop for working, relaxing, hangout, and everything in between.
        </p>
        <div className="flex w-full max-w-150 gap-2 items-center justify-between rounded-lg bg-white p-2">
          <input 
            type={"text"} 
            className="text-sm text-forest w-full h-full p-2 rounded-lg focus:outline-none focus:border-transparent" 
            placeholder={"Search cafe name or area..."}
          />
          <button className="cursor-pointer rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white border-none">
            Search
          </button>
        </div>
      </div>
    </section>
  )
}
