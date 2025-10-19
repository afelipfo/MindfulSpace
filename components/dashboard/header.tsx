"use client"

import { Button } from "@/components/ui/button"
import { Heart, LogOut, Menu, Settings, User } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader({ userName }: { userName: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-blue-900">MindfulSpace</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/dashboard" className="text-sm font-medium text-blue-900 hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/therapists" className="text-sm font-medium text-blue-900 hover:text-blue-600">
            Find Therapists
          </Link>
          <Link href="/messages" className="text-sm font-medium text-blue-900 hover:text-blue-600">
            Messages
          </Link>
          <Link href="/appointments" className="text-sm font-medium text-blue-900 hover:text-blue-600">
            Appointments
          </Link>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-blue-900">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-blue-900">{userName}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
