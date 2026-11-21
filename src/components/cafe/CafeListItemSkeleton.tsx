// CafeListItemSkeleton is a placeholder CafeListItem row shown while a list loads.
export default function CafeListItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex gap-4 rounded-xl bg-surface h-20 md:h-25"
    >
      <div className="w-20 h-20 md:w-35 md:h-auto shrink-0 rounded-l-lg animate-pulse bg-grove-light" />
      <div className="flex flex-1 flex-col justify-center gap-2 pr-4">
        <span className="block h-4 w-2/3 animate-pulse rounded-full bg-grove-light" />
        <span className="block h-3 w-1/3 animate-pulse rounded-full bg-grove-light" />
        <span className="block h-3 w-1/2 animate-pulse rounded-full bg-grove-light" />
      </div>
    </div>
  )
}
