import { Sandbox as E2BSandbox } from "e2b"
import { Socket } from "socket.io"

const CONTAINER_TIMEOUT = 120_000



// Define a type for SocketHandler functions
type SocketHandler<T = Record<string, any>> = (args: T) => any


export class Sandbox {
  // Sandbox properties:
  sandboxId: string
  type: string
  fileManager:  null
  terminalManager:  null
  container: E2BSandbox | null
  // Server context: [Future]

  constructor(
    sandboxId: string,
    type: string,
    // Server context: [Future]
  ) {
    // Sandbox properties:
    this.sandboxId = sandboxId
    this.type = type
    this.fileManager = null
    this.terminalManager = null
    this.container = null
    // Server context: [Future]
  }

  async initialize() {
    console.log("Initializing sandbox", this.sandboxId);
    // Create the sandbox container 
  }

  // Called when the client disconnects from the Sandbox
  async disconnect() {
    console.log("Disconnecting sandbox", this.sandboxId);
    // Disconnect the sandbox container
  }

  handlers(connection: { userId: string; isOwner: boolean; socket: Socket }) {
    // Handle heartbeat from a socket connection
    const handleHeartbeat: SocketHandler = (_: any) => {
      // Only keep the sandbox alive if the owner is still connected
      if (connection.isOwner) {
        this.container?.setTimeout(CONTAINER_TIMEOUT)
      }
    }

    // Handle getting a file
    const handleGetFile: SocketHandler = ({ fileId }: any) => {
      console.log("Getting file", fileId);
    }

    // Handle getting a folder
    const handleGetFolder: SocketHandler = ({ folderId }: any) => {
      console.log("Getting folder", folderId);
    }

    

    return {
      heartbeat: handleHeartbeat,
      getFile: handleGetFile,
      getFolder: handleGetFolder,
      // Add more handlers here
    }
  }
}
