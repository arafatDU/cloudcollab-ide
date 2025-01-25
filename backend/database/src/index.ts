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
        const params = url.searchParams
        if (params.has("id")) {
          const id = params.get("id") as string
          const res = await db.query.sandbox.findFirst({
            where: (sandbox, { eq }) => eq(sandbox.id, id),
            with: {
              usersToSandboxes: true,
            },
          })
          return json(res ?? {})
        } else {
          const res = await db.select().from(sandbox).all()
          return json(res ?? {})
        }
      } else if (method === "DELETE") {
        const params = url.searchParams
        if (params.has("id")) {
          const id = params.get("id") as string
          await db
            .delete(usersToSandboxes)
            .where(eq(usersToSandboxes.sandboxId, id))
          await db.delete(sandbox).where(eq(sandbox.id, id))

          const deleteStorageRequest = new Request(
            `${env.STORAGE_WORKER_URL}/api/project`,
            {
              method: "DELETE",
              body: JSON.stringify({ sandboxId: id }),
              headers: {
                "Content-Type": "application/json",
                Authorization: `${env.KEY}`,
              },
            }
          )
          await env.STORAGE.fetch(deleteStorageRequest)

          return success
        } else {
          return invalidRequest
        }
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
        const initSchema = z.object({
          type: z.string(),
          name: z.string(),
          userId: z.string(),
          visibility: z.enum(["public", "private"]),
        })

        const body = await request.json()
        const { type, name, userId, visibility } = initSchema.parse(body)

        const userSandboxes = await db
          .select()
          .from(sandbox)
          .where(eq(sandbox.userId, userId))
          .all()

        if (userSandboxes.length >= 8) {
          return new Response("You reached the maximum # of sandboxes.", {
            status: 400,
          })
        }

        const sb = await db
          .insert(sandbox)
          .values({ type, name, userId, visibility, createdAt: new Date() })
          .returning()
          .get()

        const initStorageRequest = new Request(
          `${env.STORAGE_WORKER_URL}/api/init`,
          {
            method: "POST",
            body: JSON.stringify({ sandboxId: sb.id, type }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `${env.KEY}`,
            },
          }
        )

        await env.STORAGE.fetch(initStorageRequest)

        return new Response(sb.id, { status: 200 })
            
      } else {
        return methodNotAllowed
      }
    } else return notFound 
  },
};