import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageThread } from "@/components/messages/message-thread"
import { AppointmentSection } from "@/components/messages/appointment-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function ConversationPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch therapist info
  const { data: therapist } = await supabase.from("therapists").select("*").eq("id", params.id).single()

  if (!therapist) {
    redirect("/messages")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-blue-700 hover:text-blue-900"
        >
          <Link href="/messages" className="inline-flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to messages
          </Link>
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message Thread */}
          <div className="lg:col-span-2">
            <MessageThread
              userId={user.id}
              therapistId={therapist.id}
              therapistName={therapist.full_name}
              therapistAvatar={therapist.avatar_url}
            />
          </div>

          {/* Appointments Sidebar */}
          <div className="lg:col-span-1">
            <AppointmentSection userId={user.id} therapistId={therapist.id} therapistName={therapist.full_name} />
          </div>
        </div>
      </div>
    </div>
  )
}
