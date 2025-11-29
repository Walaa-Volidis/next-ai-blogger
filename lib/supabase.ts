import { createClient } from '@supabase/supabase-js'
import { SERVER_SETTINGS } from '@/app/settings'

export const supabase = createClient(
  SERVER_SETTINGS.supabaseUrl,
  SERVER_SETTINGS.supabaseServiceRoleKey
)

export async function getBlogById(id: number) {
  const { data, error } = await supabase
    .from('blogs')
    .select()
    .eq('id', id)
    .single()

  return data
}

export async function getAllBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select()
    .order('created_at', { ascending: false })

  return data
}
