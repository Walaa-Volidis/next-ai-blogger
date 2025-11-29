import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { triggerBlogGeneration } from '@/lib/workflow'

const TriggerSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt too long'),
  userId: z.string().min(1, 'User ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = TriggerSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      return NextResponse.json(
        { error: `Validation failed: ${errorMessage}` },
        { status: 400 }
      )
    }

    const { prompt, userId } = validationResult.data

    const result = await triggerBlogGeneration(prompt, userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to start blog generation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Blog generation started successfully!',
      workflowRunId: result.workflowRunId
    })
  } catch (error) {
    console.error('Trigger workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
