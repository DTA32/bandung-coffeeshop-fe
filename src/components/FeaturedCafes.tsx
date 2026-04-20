const featuredCafes = [
  {
    id: 1,
    name: 'Filosofi Kopi BDG',
    area: 'Dago, Bandung',
    subtitle: 'Rp 25k - 45k • Quiet',
    imageUrl:
      'https://images.unsplash.com/photo-1721412790843-a97b7c23e8cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: 'Nusantara Roasters',
    area: 'Setiabudi, Bandung',
    subtitle: 'Rp 30k - 55k • WFC-Friendly',
    imageUrl:
      'https://images.unsplash.com/photo-1746605493732-1a084e5d9817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    name: 'Kopi Kita Bandung',
    area: 'Cihampelas, Bandung',
    subtitle: 'Rp 20k - 38k • Hangout',
    imageUrl:
      'https://images.unsplash.com/photo-1758607009107-ac38dd430f53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  },
]

type Cafe = {
  id: number
  name: string
  area: string
  subtitle: string
  imageUrl: string
}

function CafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <article className="min-w-80 overflow-hidden rounded-2xl border border-grove-light bg-white">
      <img
        className={`rounded-t-xl w-full h-45 object-cover`}
        src={cafe.imageUrl}
        alt={cafe.name}
      />
      <div className="flex flex-col gap-2 px-4 pt-4 pb-5">
        <span className="text-base font-bold text-forest">{cafe.name}</span>
        <span className="text-xs text-bark">{cafe.area}</span>
        <span className="text-xs text-bark">
          {cafe.subtitle}
        </span>
      </div>
    </article>
  )
}

export default function FeaturedCafes() {
  return (
    <section className="flex flex-1 flex-col gap-6 bg-cream px-6 md:px-20 py-8 w-full">
      <h2 className="m-0 text-2xl md:text-3xl font-bold text-forest">
        Featured Cafes
      </h2>
      <div className="flex overflow-scroll gap-5">
        {featuredCafes.map((cafe) => (
          <CafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>
    </section>
  )
}
