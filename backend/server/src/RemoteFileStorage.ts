import * as dotenv from  "dotenv"


dotenv.config()

export const RemoteFileStorage = {
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