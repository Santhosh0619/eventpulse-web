import { Card } from '@/components/ui/Card'

/** A labelled metric tile for dashboards. */
export function MetricCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <Card className="text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </Card>
  )
}
