import { Sandbox as E2BSandbox } from "e2b"
import { Socket } from "socket.io"

const CONTAINER_TIMEOUT = 120_000

import { FileManager } from "./FileManager"
import { TerminalManager } from "./TerminalManager"
import { TFile, TFolder } from "./types"
import { LockManager } from "./utils"
const lockManager = new LockManager()


// Define a type for SocketHandler functions
type SocketHandler<T = Record<string, any>> = (args: T) => any


export class Sandbox {
  // Sandbox properties:
  sandboxId: string
  type: string
  fileManager: FileManager | null
  terminalManager: TerminalManager | null
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

  // Initializes the container for the sandbox environment
  async initialize(fileWatchCallback: ((files: (TFolder | TFile)[]) => void) | undefined
  ) {
    // Acquire a lock to ensure exclusive access to the sandbox environment
    await lockManager.acquireLock(this.sandboxId, async () => {
      // Check if a container already exists and is running
      if (this.container && (await this.container.isRunning())) {
        console.log(`Found existing container ${this.sandboxId}`)
      } else {
        console.log("Creating container", this.sandboxId)
        // Create a new container with a specified template and timeout
        const templateTypes = [
          "vanillajs",
          "reactjs",
          "nextjs",
          "streamlit",
          "php",
        ]
        const template = templateTypes.includes(this.type)
          ? `gitwit-${this.type}`
          : `base`
        this.container = await E2BSandbox.create(template, {
          timeoutMs: CONTAINER_TIMEOUT,
        })
      }
    })
    // Ensure a container was successfully created
    if (!this.container) throw new Error("Failed to create container")

    // Initialize the terminal manager if it hasn't been set up yet
    if (!this.terminalManager) {
      this.terminalManager = new TerminalManager(this.container)
      console.log(`Terminal manager set up for ${this.sandboxId}`)
    }

    // Initialize the file manager if it hasn't been set up yet
    if (!this.fileManager) {
      this.fileManager = new FileManager(
        this.sandboxId,
        this.container,
        fileWatchCallback ?? null
      )
      // Initialize the file manager and emit the initial files
      await this.fileManager.initialize()
    }
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
