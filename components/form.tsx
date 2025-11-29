'use client'

import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFormStatus } from 'react-dom'
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function Form() {
  const { userId } = useAuth()

  async function action(formData: FormData) {
    const prompt = formData.get('prompt')
    if (!prompt) {
      toast.error('Prompt is required.')
      return
    }

    if (!userId) {
      toast.error('Please sign in to continue.')
      return
    }

    try {
      const response = await fetch('/api/trigger-blog-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.toString(),
          userId: userId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start blog generation')
      }
      toast.success('Blog generation started! It will appear shortly.')
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('Blog generation error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate blog'
      )
    }
  }

  return (
    <section className='mx-auto max-w-lg'>
      <Card className='border-0 shadow-none'>
        <CardHeader className='text-center'>
          <CardTitle>Next AI Blogger</CardTitle>
          <CardDescription>Generate a blog post about anything</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className='mt-3'>
            <Input
              name='prompt'
              placeholder='What should I write about?'
              className='rounded-lg'
            />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <>
      <SignedIn>
        <Button
          size='sm'
          type='submit'
          className={cn('mt-3 w-full rounded-lg', pending && 'animate-pulse')}
        >
          {pending ? 'Working on it...' : 'Submit'}
        </Button>
      </SignedIn>

      <SignedOut>
        <SignInButton mode='modal'>
          <Button
            size='sm'
            type='button'
            variant='secondary'
            className='mt-3 w-full rounded-lg'
          >
            Sign in to start
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
