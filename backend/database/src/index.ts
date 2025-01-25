// import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1"
import { json } from "itty-router-extras"
import { z } from "zod"

import { and, eq, sql } from "drizzle-orm"
import * as schema from "./schema"
import {
  Sandbox,
  sandbox,
  sandboxLikes,
  user,
  usersToSandboxes,
} from "./schema"

export interface Env {
  DB: D1Database
  STORAGE: any
  KEY: string
  STORAGE_WORKER_URL: string
}

// npm run generate
// npx wrangler d1 execute d1-sandbox --local --file=./drizzle/<FILE>
interface SandboxWithLiked extends Sandbox {
  liked: boolean
}

interface UserResponse extends Omit<schema.User, "sandbox"> {
  sandbox: SandboxWithLiked[]
}


export default {
  async fetch(request : Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const success = new Response("Success", { status: 200 })
    const invalidRequest = new Response("Invalid Request", { status: 400 })
    const notFound = new Response("Not Found", { status: 404 })
    const methodNotAllowed = new Response("Method Not Allowed", { status: 405 })

    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    if (request.headers.get("Authorization") !== env.KEY) {
      return new Response("Unauthorized", { status: 401 })
    }

    const db = drizzle(env.DB, { schema })

    if (path === "/api/sandbox") {
      if (method === "GET") {

        // Get all sandboxes
        return success

      } else if (method === "DELETE") {
        
        // Delete a sandbox
        return success


      } else if (method === "POST") {
        const postSchema = z.object({
          id: z.string(),
          name: z.string().optional(),
          visibility: z.enum(["public", "private"]).optional(),
        })

        const body = await request.json()
        const { id, name, visibility } = postSchema.parse(body)
        const sb = await db
          .update(sandbox)
          .set({ name, visibility })
          .where(eq(sandbox.id, id))
          .returning()
          .get()

        return success
      } else if (method === "PUT") {
        
        // Update a sandbox
        return success

        
      } else {
        return methodNotAllowed
      }
    } else return notFound 
  },
};