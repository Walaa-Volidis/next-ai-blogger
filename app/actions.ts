'use server'

import Groq from 'groq-sdk'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function createCompletion(prompt: string) {
  if (!prompt) {
    return { error: 'Prompt is required' }
  }

  const { userId } = await auth()
  if (!userId) {
    return { error: 'User is not logged in' }
  }

  const messages: any = [
    {
      role: 'user',
      content: `Write a blog post around 200 words about the following topic: "${prompt}" in markdown format.`
    }
  ]

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages
  })

  const content = completion?.choices?.[0]?.message?.content
  if (!content) {
    return { error: 'Unable to generate the blog content.' }
  }

  const imageurl = 'https://placehold.co/1792x1024/png?text=Blog+Post'

  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .insert([{ title: prompt, content, imageurl, userid: userId }])
    .select()

  if (blogError) {
    return {
      error: `Unable to insert the blog into the database: ${blogError.message}`
    }
  }

  const blogId = blog?.[0]?.id

  revalidatePath('/')
  redirect(`/blog/${blogId}`)
}
