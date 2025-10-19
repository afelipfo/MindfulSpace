import { TherapistCard, type TherapistSummary } from "@/components/therapists/therapist-card"

export function TherapistGrid({ therapists }: { therapists: TherapistSummary[] }) {
  if (therapists.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-blue-100 bg-white">
        <p className="text-muted-foreground">No therapists found matching your criteria</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {therapists.map((therapist) => (
        <TherapistCard key={therapist.id} therapist={therapist} />
      ))}
    </div>
  )
}
