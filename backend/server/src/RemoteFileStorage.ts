import * as dotenv from  "dotenv"
import { R2Files } from "./types"

dotenv.config()

export const RemoteFileStorage = {
  getSandboxPaths: async (id: string) => {
    const res = await fetch(
      `${process.env.STORAGE_WORKER_URL}/api?sandboxId=${id}`,
      {
        headers: {
          Authorization: `${process.env.WORKERS_KEY}`,
        },
      }
    )
    const data: R2Files = await res.json()

    return data.objects.map((obj) => obj.key)
  },

  getFolder: async (folderId: string) => {
    const res = await fetch(
      `${process.env.STORAGE_WORKER_URL}/api?folderId=${folderId}`,
      {
        headers: {
          Authorization: `${process.env.WORKERS_KEY}`,
        },
      }
    )
    const data: R2Files = await res.json()

    return data.objects.map((obj) => obj.key)
  },

  fetchFileContent: async (fileId: string): Promise<string> => {
    try {
      const fileRes = await fetch(
        `${process.env.STORAGE_WORKER_URL}/api?fileId=${fileId}`,
        {
          headers: {
            Authorization: `${process.env.WORKERS_KEY}`,
          },
        }
      )
      return await fileRes.text()
    } catch (error) {
      console.error("ERROR fetching file:", error)
      return ""
    }
  },
}


export default RemoteFileStorage