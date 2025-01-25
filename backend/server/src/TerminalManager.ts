import { Sandbox } from "e2b"

export class TerminalManager {
  private sandbox: Sandbox

  constructor(sandbox: Sandbox) {
    this.sandbox = sandbox
  }

  async createTerminal(id: string): Promise<void> {

    console.log("Created terminal", id)
  }

}


