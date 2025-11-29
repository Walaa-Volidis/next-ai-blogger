import { Client } from '@upstash/workflow'
import { z } from 'zod'
import type { WorkflowResult } from '@/types/workflow'
import { SERVER_SETTINGS } from '@/app/settings'

const workflowClient = new Client({
  token: SERVER_SETTINGS.qstashToken
})

const BlogGenerationInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt too long'),
  userId: z.string().min(1, 'User ID is required')
})

export async function triggerBlogGeneration(
  prompt: string,
  userId: string
): Promise<WorkflowResult> {
  const validationResult = BlogGenerationInputSchema.safeParse({
    prompt,
    userId
  })

  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ')
    return { success: false, error: `Validation failed: ${errorMessage}` }
  }

  const { prompt: validPrompt, userId: validUserId } = validationResult.data

  try {
    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_SETTINGS.baseUrl}/api/blog-generation`,
      body: { prompt: validPrompt, userId: validUserId },
      retries: 3,
      keepTriggerConfig: true
    })

    return { success: true, workflowRunId }
  } catch (error) {
    console.error('Failed to trigger blog generation workflow:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}