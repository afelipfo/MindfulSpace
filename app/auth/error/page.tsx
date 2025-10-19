import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="w-full max-w-md">
        <Card className="border-red-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error_description ? (
              <p className="text-sm text-muted-foreground text-center">{params.error_description}</p>
            ) : params?.error ? (
              <p className="text-sm text-muted-foreground text-center">Error code: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                An unexpected error occurred during authentication.
              </p>
            )}
            <div className="flex justify-center pt-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/login">Return to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
