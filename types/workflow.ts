export interface BlogGenerationPayload {
  prompt: string
  userId: string
}

export interface BlogGenerationResult {
  success: boolean
  blogId?: string
  message: string
  error?: string
}

export interface WorkflowResult {
  success: boolean
  workflowRunId?: string
  error?: string
}

export interface Blog {
  id: string
  title: string
  content: string
  imageurl: string
  userid: string
  created_at: string
}
