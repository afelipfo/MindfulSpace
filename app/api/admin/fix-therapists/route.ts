import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
      return NextResponse.json({
        error: "SUPABASE_SERVICE_ROLE_KEY not configured. Please add it to .env.local",
        instructions: [
          "1. Go to Supabase Dashboard > Project Settings > API",
          "2. Copy the 'service_role' key (NOT the anon key)",
          "3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here",
          "4. Restart the dev server"
        ]
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get all therapists without user_id
    const { data: therapists, error: fetchError } = await supabase
      .from('therapists')
      .select('id, full_name, email, user_id')
      .is('user_id', null)

    if (fetchError) throw fetchError

    if (!therapists || therapists.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All therapists already have user accounts!",
        fixed: 0
      })
    }

    const results = []
    const password = 'Demo123!@#'

    for (const therapist of therapists) {
      try {
        // Create user account
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: therapist.email,
          password: password,
          email_confirm: true, // Auto-confirm for demo
        })

        if (createError) {
          results.push({
            therapist: therapist.full_name,
            status: 'failed',
            error: createError.message
          })
          continue
        }

        if (!newUser.user) {
          results.push({
            therapist: therapist.full_name,
            status: 'failed',
            error: 'No user returned'
          })
          continue
        }

        // Update therapist with user_id
        const { error: updateError } = await supabase
          .from('therapists')
          .update({ user_id: newUser.user.id })
          .eq('id', therapist.id)

        if (updateError) {
          results.push({
            therapist: therapist.full_name,
            status: 'failed',
            error: updateError.message
          })
          continue
        }

        results.push({
          therapist: therapist.full_name,
          email: therapist.email,
          status: 'success',
          user_id: newUser.user.id
        })

      } catch (err) {
        results.push({
          therapist: therapist.full_name,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length

    return NextResponse.json({
      success: true,
      message: `Fixed ${successCount} out of ${therapists.length} therapists`,
      password: password,
      results
    })

  } catch (error) {
    console.error("Error fixing therapists:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to fix therapists"
    }, { status: 500 })
  }
}
