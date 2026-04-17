import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lbtjxrxgbyjaiyywutsk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const users = [
  { email: 'demo.owner@familyfund.fr',   password: 'Demo2026!', first_name: 'Demo',    last_name: 'Owner'   },
  { email: 'demo.sarah@familyfund.fr',   password: 'Demo2026!', first_name: 'Sarah',   last_name: 'Any'     },
  { email: 'demo.monique@familyfund.fr', password: 'Demo2026!', first_name: 'Monique', last_name: 'Any'     },
]

for (const u of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { first_name: u.first_name, last_name: u.last_name },
  })
  if (error) {
    console.error(`✗ ${u.email}:`, error.message)
  } else {
    console.log(`✓ ${u.email} — id: ${data.user.id}`)
  }
}
