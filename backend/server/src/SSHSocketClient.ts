import { Client } from "ssh2"

// Interface defining the configuration for SSH connection
export interface SSHConfig {
  host: string
  port?: number
  username: string
  privateKey: Buffer
}

// Class to handle SSH connections and communicate with a Unix socket
export class SSHSocketClient {
  private conn: Client
  private config: SSHConfig
  private socketPath: string
  private isConnected: boolean = false

  // Constructor initializes the SSH client and sets up configuration
  constructor(config: SSHConfig, socketPath: string) {
    this.conn = new Client()
    this.config = { ...config, port: 22 } // Default port to 22 if not provided
    this.socketPath = socketPath

    this.setupTerminationHandlers()
  }

  // Set up handlers for graceful termination
  private setupTerminationHandlers() {
    process.on("SIGINT", this.closeConnection.bind(this))
    process.on("SIGTERM", this.closeConnection.bind(this))
  }

  // Method to close the SSH connection
  private closeConnection() {
    console.log("Closing SSH connection...")
    this.conn.end()
    this.isConnected = false
    process.exit(0)
  }

}
