import { FilesystemEvent, Sandbox, WatchHandle } from "e2b"

import { TFile, TFileData, TFolder } from "./types"


// FileManager class to handle file operations in a sandbox
export class FileManager {
  private sandboxId: string
  private sandbox: Sandbox
  public files: (TFolder | TFile)[]
  public fileData: TFileData[]
  private fileWatchers: WatchHandle[] = []
  private dirName = "/home/user/project"
  private refreshFileList: ((files: (TFolder | TFile)[]) => void) | null

  // Constructor to initialize the FileManager
  constructor(
    sandboxId: string,
    sandbox: Sandbox,
    refreshFileList: ((files: (TFolder | TFile)[]) => void) | null
  ) {
    this.sandboxId = sandboxId
    this.sandbox = sandbox
    this.files = []
    this.fileData = []
    this.refreshFileList = refreshFileList
  }

  // Fetch file data from list of paths
  private async generateFileData(paths: string[]): Promise<TFileData[]> {
    const fileData: TFileData[] = []

    // Fetch file data from storage worker's R2 storage

    return fileData
  }

  // Initialize the FileManager
  async initialize() {

    // Copy all files from the project to the container
    
  }

}