"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface Therapist {
  id: string
  name: string
  email: string
  user_id: string | null
  has_user: boolean
}

export default function FixTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fixing, setFixing] = useState(false)
  const [fixResult, setFixResult] = useState<string | null>(null)

  const loadTherapists = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/debug/therapists")
      if (!response.ok) throw new Error("Failed to fetch therapists")
      const data = await response.json()
      setTherapists(data.therapists || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load therapists")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTherapists()
  }, [])

  const missingCount = therapists.filter(t => !t.has_user).length

  const autoFix = async () => {
    try {
      setFixing(true)
      setError(null)
      setFixResult(null)

      const response = await fetch("/api/admin/fix-therapists", {
        method: "POST"
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.instructions) {
          setError(data.error + "\n\n" + data.instructions.join("\n"))
        } else {
          setError(data.error || "Failed to fix therapists")
        }
        return
      }

      setFixResult(data.message)
      await loadTherapists() // Reload to show updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fix therapists")
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Fix Therapist Accounts</h1>
          <p className="text-muted-foreground mt-2">
            This page shows which therapists need user accounts to receive messages.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {missingCount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {missingCount} therapist{missingCount !== 1 ? 's' : ''} missing user_id. Click "Auto-Fix All Therapists" below or follow manual instructions.
            </AlertDescription>
          </Alert>
        )}

        {fixResult && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{fixResult}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Therapist Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : therapists.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No therapists found</p>
            ) : (
              <div className="space-y-2">
                {therapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      therapist.has_user
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{therapist.name}</p>
                      <p className="text-sm text-muted-foreground">{therapist.email}</p>
                      {therapist.user_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          User ID: {therapist.user_id}
                        </p>
                      )}
                    </div>
                    {therapist.has_user ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Fix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Option 1: Auto-Fix (Fastest - Recommended)</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>
                  Go to{" "}
                  <a
                    href="https://jxvstevpjxrdraedrnjj.supabase.co/project/jxvstevpjxrdraedrnjj/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Supabase Dashboard → Project Settings → API
                  </a>
                </li>
                <li>Under "Project API keys", find the <strong>service_role</strong> key</li>
                <li>Click to reveal and copy it</li>
                <li>
                  Add to <code className="bg-white px-1 rounded">.env.local</code>:
                  <pre className="bg-white p-2 rounded mt-2 text-xs overflow-x-auto">
{`SUPABASE_SERVICE_ROLE_KEY=your_key_here`}
                  </pre>
                </li>
                <li>Restart your dev server (stop and run <code className="bg-white px-1 rounded">npm run dev</code> again)</li>
                <li>Return to this page and click "Auto-Fix All Therapists"</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Option 2: Manual Fix</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>
                  Go to{" "}
                  <a
                    href="https://jxvstevpjxrdraedrnjj.supabase.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Supabase Dashboard
                  </a>
                </li>
                <li>Navigate to: Authentication → Users</li>
                <li>Click "Add user" → "Create new user"</li>
                <li>
                  Create a user:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Email: therapist-demo@example.com</li>
                    <li>Password: Demo123!@#</li>
                    <li>✓ Auto Confirm User</li>
                  </ul>
                </li>
                <li>Copy the User ID (UUID)</li>
                <li>Go to: Database → SQL Editor</li>
                <li>
                  Run this query (replace YOUR_USER_ID):
                  <pre className="bg-white p-2 rounded mt-2 text-xs overflow-x-auto">
{`UPDATE public.therapists
SET user_id = 'YOUR_USER_ID'
WHERE user_id IS NULL;`}
                  </pre>
                </li>
                <li>Refresh this page to verify</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Option 3: Individual Accounts</h3>
              <p className="text-blue-800">
                Create a separate user account for each therapist email shown above, then update each
                therapist record individually using the same SQL pattern.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {missingCount > 0 && (
            <Button
              onClick={autoFix}
              disabled={fixing || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {fixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                "Auto-Fix All Therapists"
              )}
            </Button>
          )}
          <Button onClick={loadTherapists} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
