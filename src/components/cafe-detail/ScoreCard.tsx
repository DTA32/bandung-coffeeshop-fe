interface ScoreCardProps {
  overallScore: number | null
  wfcScore: number | null
}

function fmt(n: number) {
  return n.toFixed(1)
}

export default function ScoreCard({ overallScore, wfcScore }: ScoreCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
      <h3 className="text-base font-bold text-forest m-0">Scores</h3>
      <div className="flex justify-between gap-4">
        {overallScore && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-bark">
              Overall Score
            </span>
            <span className="text-[28px] font-bold text-forest leading-none">
              {fmt(overallScore)} / 5.0
            </span>
          </div>
        )}
        {wfcScore && (
          <div
            className={`flex flex-col gap-2 ${overallScore ? 'items-end' : 'items-start'}`}
          >
            <span className="text-xs font-semibold text-bark">
              Work-from-cafe Score
            </span>
            <span className="text-[28px] font-bold text-grove leading-none">
              {fmt(wfcScore)} / 5.0
            </span>
          </div>
        )}
        {!overallScore && !wfcScore && (
          <div className="flex justify-center items-center h-16 w-full">
            <p className="text-sm leading-[1.7] m-0 text-bark">
              {' '}
              No scores yet.{' '}
            </p>
          </div>
        )}
      </div>
      {overallScore || wfcScore ? (
        <span className="text-xs text-forest-light">
          Highly personal, see disclaimer below
        </span>
      ) : null}
    </div>
  )
}
