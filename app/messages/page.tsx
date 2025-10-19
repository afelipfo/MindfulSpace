import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConversationList } from "@/components/messages/conversation-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, MessageSquarePlus } from "lucide-react"

export default async function MessagesPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-blue-700 hover:text-blue-900">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to dashboard
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/therapists" className="inline-flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4" /> Start new conversation
            </Link>
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Connect with your therapist in a secure, private space</p>
        </div>

        <ConversationList userId={user.id} />
      </div>
    </div>
  )
}
