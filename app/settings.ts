import { z } from 'zod'

export const ZServerSettings = z.object({
  groqApiKey: z.string().min(1, 'GROQ_API_KEY is required'),
  supabaseUrl: z.string().url('SUPABASE_URL must be a valid URL'),
  supabaseServiceRoleKey: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  clerkSecretKey: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  qstashUrl: z.string().url('QSTASH_URL must be a valid URL'),
  qstashToken: z.string().min(1, 'QSTASH_TOKEN is required'),
  qstashCurrentSigningKey: z
    .string()
    .min(1, 'QSTASH_CURRENT_SIGNING_KEY is required'),
  qstashNextSigningKey: z
    .string()
    .min(1, 'QSTASH_NEXT_SIGNING_KEY is required'),
  baseUrl: z.string().url('BASE_URL must be a valid URL'),
})

export const SERVER_SETTINGS = ZServerSettings.parse({
  groqApiKey: process.env['GROQ_API_KEY'],
  supabaseUrl: process.env['SUPABASE_URL'],
  supabaseServiceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'],
  clerkSecretKey: process.env['CLERK_SECRET_KEY'],
  qstashUrl: process.env['QSTASH_URL'],
  qstashToken: process.env['QSTASH_TOKEN'],
  qstashCurrentSigningKey: process.env['QSTASH_CURRENT_SIGNING_KEY'],
  qstashNextSigningKey: process.env['QSTASH_NEXT_SIGNING_KEY'],
  baseUrl: process.env['BASE_URL'],
})

export type ServerSettings = z.infer<typeof ZServerSettings>
