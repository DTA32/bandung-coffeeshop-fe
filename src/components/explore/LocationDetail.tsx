import type {LocationData} from "@/lib/api/location";
import { Link } from "@tanstack/react-router";
import type {Location} from "@/lib/type";
import { exploreSplat } from "@/lib/explore";

const locationTypeMapping: Record<string, string> = {
  'area': 'Area',
  'poi': 'Point of Interest',
}

export default function LocationDetail({location, isMobile}: { location: LocationData, isMobile: boolean }) {
  const descendantName = location.descendants && location.descendants.length > 0 && location.descendants[0].type in locationTypeMapping
    ? locationTypeMapping[location.descendants[0].type]
    : 'Related locations'
  const currentLocation: Location = {
    id: location.id,
    name: location.name,
    type: location.type,
    thumbnail: null,
  }
  const refs = [...location.ancestors, currentLocation]
  return (
    <div className="flex flex-col gap-4">
      <div className={`${isMobile ? `h-50` : `h-60`} overflow-scroll flex gap-2 w-full bg-grove-light relative`}>
        {location.images.map((img, index) => {
          return (
            <figure
              key={index}
              className={`flex-shrink-0 relative w-full`}
            >
              <img
                key={index}
                src={img.url}
                alt={img.description}
                className="w-full h-full object-cover object-bottom"
              />
              {img.description && (
                <figcaption
                  className="absolute bottom-0 left-0 py-1 m-2 z-5 bg-black/50 text-white text-xs px-1 rounded select-none">
                  {img.description}
                </figcaption>
              )}
            </figure>
          )
        })}
        {isMobile && (
          <div
            className="absolute left-0 bottom-0 text-xl font-bold text-white bg-linear-to-t from-black/70 to-transparent w-full min-h-32 flex items-end px-6 py-3">
            <h1 className="">
              {location.show_welcome_text && (
                <span className="font-normal">Welcome to&nbsp;</span>
              )}
              {location.name}
            </h1>
          </div>
        )}
      </div>
      {!isMobile && (
        <h1 className="text-2xl font-bold">
          {location.show_welcome_text && (
            <span className="font-normal">Welcome to&nbsp;</span>
          )}
          {location.name}
        </h1>
      )}
      {location.description && (
        <div className={`${isMobile && `px-6 bg-white text-sm py-4`}`}>
          {isMobile && (
            <h2 className="text-base font-semibold mb-2">About</h2>
          )}
          <p className="text-gray-600 whitespace-pre-line">{location.description}</p>
        </div>
      )}
      {location.descendants && location.descendants.length > 0 && (
        <div className={`flex flex-col gap-5 p-6 bg-white ${!isMobile && `rounded-2xl`}`}>
          <h2 className="text-lg font-semibold">{descendantName}</h2>
          <div className="flex overflow-scroll md:grid md:grid-cols-3 gap-4 pb-1">
            {location.descendants.map((desc) => {
              const splats = [...refs, desc]
              return (
                <Link
                  key={desc.id}
                  className="flex flex-col h-fit min-w-40 border border-forest-lighter rounded-lg transition hover:shadow-md shrink-0"
                  to={`/explore/$`}
                  params={{_splat: exploreSplat(splats)}}
                >
                  <div className="h-20 w-full bg-grove-light rounded-t-lg">
                    {desc.thumbnail && (
                      <img
                        src={desc.thumbnail}
                        alt={desc.name}
                        className="w-full h-full object-cover object-center rounded-t-lg"
                      />
                    )}
                  </div>
                  <h3 className="text-sm font-medium p-2">{desc.name}</h3>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}