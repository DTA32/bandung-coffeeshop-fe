import type {LocationData} from "@/lib/api/location";
import {exploreSplat} from "@/lib/explore";
import {Link} from "@tanstack/react-router";
import type {Location} from "@/lib/type";

export default function DistrictList({districts}: { districts: LocationData[] }) {
  return (
    <section className="flex flex-1 flex-col gap-6 bg-cream px-6 md:px-20 w-full h-fit">
      <h2 className="text-2xl font-bold text-forest">Explore by district</h2>
      <div className="flex gap-4 overflow-scroll w-full pb-1 h-full items-stretch">
        {districts.map((district) => {
            const districtLocation: Location = {
              id: district.id,
              name: district.name,
              type: district.type,
              thumbnail: null,
            }
            return (
              <Link
                key={district.id}
                className="flex flex-col gap-1 w-full max-w-72 border border-forest-lighter rounded-lg transition hover:shadow-md shrink-0 bg-white"
                to={`/explore/$`}
                params={{_splat: exploreSplat([districtLocation])}}
              >
                <div className="h-24 w-full bg-grove-light rounded-t-lg">
                  {district.images && district.images.length > 0 && (
                    <img
                      src={district.images[0].url}
                      alt={district.images[0].url}
                      className="w-full h-full object-cover object-center rounded-t-lg"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-2">
                  <h3 className="font-medium">{district.name}</h3>
                  <div className="flex gap-y-1 flex-wrap">
                    {district.descendants && district.descendants.length > 0 && district.descendants.map((desc) => (
                      <span key={desc.id} className="text-xs text-bark after:content-['•'] after:mx-1 last:after:content-none">
                        {desc.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          }
        )}
      </div>
    </section>
  )
}