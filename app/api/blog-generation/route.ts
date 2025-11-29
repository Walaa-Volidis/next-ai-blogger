import { serve } from '@upstash/workflow/nextjs'
import Groq from 'groq-sdk'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { SERVER_SETTINGS } from '@/app/settings'

const groq = new Groq({ apiKey: SERVER_SETTINGS.groqApiKey })

const ZBlogGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt too long'),
  userId: z.string().min(1, 'User ID is required')
})

export const { POST } = serve(async context => {
  const validationResult = ZBlogGenerationSchema.safeParse(
    context.requestPayload
  )

  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ')
    throw new Error(`Validation failed: ${errorMessage}`)
  }

  const { prompt, userId } = validationResult.data

  const content = await context.run('generate-content', async () => {
    console.log(`Generating blog content for: ${prompt}`)

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `Write a blog post around 200 words about the following topic: "${prompt}" in markdown format.`
      }
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages
    })

    const generatedContent = completion?.choices?.[0]?.message?.content
    if (!generatedContent) {
      throw new Error('Unable to generate the blog content.')
    }

    return generatedContent
  })

  const blog = await context.run('save-to-database', async () => {
    console.log('Saving blog to database')

    const { data: blogData, error: blogError } = await supabase
      .from('blogs')
      .insert([
        {
          title: prompt,
          content,
          imageurl: `https://placehold.co/1792x1024/0ea5e9/ffffff/png?text=${encodeURIComponent(prompt.slice(0, 50))}`,
          userid: userId
        }
      ])
      .select()

    if (blogError) {
      throw new Error(
        `Unable to insert the blog into the database: ${blogError.message}`
      )
    }

    return blogData[0]
  })

  await context.run('post-processing', async () => {
    console.log(`Blog created successfully with ID: ${blog.id}`)
    return { processed: true }
  })

  return {
    success: true,
    blogId: blog.id,
    message: 'Blog generated successfully!'
  }
})
