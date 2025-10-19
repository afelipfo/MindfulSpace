/**
 * Script to fix therapist user_id associations for demo
 *
 * This script requires SUPABASE_SERVICE_ROLE_KEY to create users programmatically.
 *
 * Steps to run:
 * 1. Get your service role key from Supabase Dashboard > Project Settings > API
 * 2. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY
 * 3. Run: npx tsx scripts/fix-therapist-accounts.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  console.error('You can find it in Supabase Dashboard > Project Settings > API > service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const therapists = [
  { email: 'sarah.mitchell@example.com', password: 'Demo123!@#' },
  { email: 'james.chen@example.com', password: 'Demo123!@#' },
  { email: 'maria.rodriguez@example.com', password: 'Demo123!@#' },
  { email: 'michael.thompson@example.com', password: 'Demo123!@#' },
  { email: 'emily.park@example.com', password: 'Demo123!@#' },
  { email: 'alex.johnson@example.com', password: 'Demo123!@#' },
]

async function fixTherapistAccounts() {
  console.log('🔧 Starting therapist account fix...\n')

  for (const therapist of therapists) {
    try {
      // Check if therapist exists and needs user_id
      const { data: therapistData, error: therapistFetchError } = await supabase
        .from('therapists')
        .select('id, full_name, user_id')
        .eq('email', therapist.email)
        .single()

      if (therapistFetchError) {
        console.log(`⚠️  Therapist not found: ${therapist.email}`)
        continue
      }

      if (therapistData.user_id) {
        console.log(`✓ ${therapistData.full_name} already has user_id`)
        continue
      }

      // Check if user account already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === therapist.email)

      let userId: string

      if (existingUser) {
        userId = existingUser.id
        console.log(`✓ Found existing user account for ${therapist.email}`)
      } else {
        // Create user account
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: therapist.email,
          password: therapist.password,
          email_confirm: true, // Auto-confirm email for demo
        })

        if (createError) {
          console.error(`❌ Failed to create user for ${therapist.email}:`, createError.message)
          continue
        }

        if (!newUser.user) {
          console.error(`❌ No user returned for ${therapist.email}`)
          continue
        }

        userId = newUser.user.id
        console.log(`✓ Created user account for ${therapist.email}`)
      }

      // Update therapist record with user_id
      const { error: updateError } = await supabase
        .from('therapists')
        .update({ user_id: userId })
        .eq('id', therapistData.id)

      if (updateError) {
        console.error(`❌ Failed to update therapist ${therapistData.full_name}:`, updateError.message)
        continue
      }

      console.log(`✅ Linked ${therapistData.full_name} to user account\n`)

    } catch (error) {
      console.error(`❌ Error processing ${therapist.email}:`, error)
    }
  }

  console.log('🎉 Therapist account fix complete!')
  console.log('\n📝 Demo credentials (if new accounts were created):')
  console.log('   Email: [therapist email from list above]')
  console.log('   Password: Demo123!@#')
}

fixTherapistAccounts()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
