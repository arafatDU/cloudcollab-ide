// DB Types

export type User = {
  id: string
  name: string
  email: string
  generations: number
  sandbox: Sandbox[]
  usersToSandboxes: UsersToSandboxes[]
}

export type Sandbox = {
  id: string
  name: string
  type: "reactjs" | "vanillajs" | "nextjs" | "streamlit"
  visibility: "public" | "private"
  createdAt: Date
  userId: string
  usersToSandboxes: UsersToSandboxes[]
}

export type UsersToSandboxes = {
  userId: string
  sandboxId: string
  sharedOn: Date
}