import CallbackHandler from './CallbackHandler'

export default function CallbackPage() {
  return (
    <CallbackHandler
      supabaseUrl={process.env.SUPABASE_URL!}
      supabaseAnonKey={process.env.SUPABASE_ANON_KEY!}
    />
  )
}
