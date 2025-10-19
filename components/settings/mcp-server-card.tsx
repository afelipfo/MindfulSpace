"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Code, Copy, CheckCircle, Server } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function McpServerCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const mcpConfig = {
    mcpServers: {
      "mental-wellness-platform": {
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-fetch",
        ],
        env: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jxvstevpjxrdraedrnjj.supabase.co",
          API_BASE_URL: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000"
        }
      }
    }
  }

  const configString = JSON.stringify(mcpConfig, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <>
      <Card className="border-blue-100 shadow-md">
        <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Server className="h-5 w-5 text-blue-700" />
            MCP Server
          </CardTitle>
          <CardDescription>
            Model Context Protocol integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            Connect AI assistants like Claude Code to your MindfulSpace data through the Model Context Protocol.
          </p>
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Code className="mr-2 h-4 w-4" />
            View Configuration
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              MCP Server Configuration
            </DialogTitle>
            <DialogDescription>
              Add this configuration to your Claude Desktop or other MCP-compatible AI assistant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Server className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                This MCP server allows AI assistants to interact with your MindfulSpace platform APIs
                to help you manage appointments, mood logs, wellness goals, and more.
              </AlertDescription>
            </Alert>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Configuration JSON</h3>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {configString}
              </pre>
            </div>

            <div className="space-y-3 text-sm">
              <h3 className="font-semibold text-gray-900">Setup Instructions</h3>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">For Claude Desktop:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Open Claude Desktop settings</li>
                  <li>Navigate to the "Developer" tab</li>
                  <li>Find the MCP Servers configuration file location</li>
                  <li>Add the above JSON configuration to the file</li>
                  <li>Restart Claude Desktop</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">Configuration File Locations:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>
                    <strong>macOS:</strong>{" "}
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      ~/Library/Application Support/Claude/claude_desktop_config.json
                    </code>
                  </li>
                  <li>
                    <strong>Windows:</strong>{" "}
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      %APPDATA%\Claude\claude_desktop_config.json
                    </code>
                  </li>
                  <li>
                    <strong>Linux:</strong>{" "}
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      ~/.config/Claude/claude_desktop_config.json
                    </code>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">Available API Endpoints:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li><code className="text-xs">/api/appointments</code> - Manage therapy appointments</li>
                  <li><code className="text-xs">/api/mood-logs</code> - Track and analyze mood data</li>
                  <li><code className="text-xs">/api/wellness-goals</code> - Set and monitor wellness goals</li>
                  <li><code className="text-xs">/api/messages</code> - Communicate with therapists</li>
                  <li><code className="text-xs">/api/diagnostics</code> - View diagnostics summaries</li>
                  <li><code className="text-xs">/api/therapists</code> - Browse available therapists</li>
                </ul>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-sm text-amber-900">
                  <strong>Note:</strong> Make sure your dev server is running before using the MCP server.
                  The server will connect to your local instance at the configured API_BASE_URL.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
