import { FilesystemEvent, Sandbox, WatchHandle } from "e2b"
import JSZip from "jszip"
import path from "path"

export const MAX_BODY_SIZE = 5 * 1024 * 1024
import { TFile, TFileData, TFolder } from "./types"


// Convert list of paths to the hierchical file structure used by the editor
function generateFileStructure(paths: string[]): (TFolder | TFile)[] {
  const root: TFolder = { id: "/", type: "folder", name: "/", children: [] }

  paths.forEach((path) => {
    const parts = path.split("/")
    let current: TFolder = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1 && part.length
      const existing = current.children.find((child) => child.name === part)

      if (existing) {
        if (!isFile) {
          current = existing as TFolder
        }
      } else {
        if (isFile) {
          const file: TFile = {
            id: `/${parts.join("/")}`,
            type: "file",
            name: part,
          }
          current.children.push(file)
        } else {
          const folder: TFolder = {
            id: `/${parts.slice(0, i + 1).join("/")}`,
            type: "folder",
            name: part,
            children: [],
          }
          current.children.push(folder)
          current = folder
        }
      }
    }
  })

  return root.children
}


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

    // Fetch file data from storage worker's R2 storage [Future]

    return fileData
  }
  
  // Convert local file path to remote path
  private getRemoteFileId(localId: string): string {
    return `projects/${this.sandboxId}${localId}`
  }

  // Convert remote file path to local file path
  private getLocalFileId(remoteId: string): string | undefined {
    const allParts = remoteId.split("/")
    if (allParts[1] !== this.sandboxId) return undefined
    return allParts.slice(2).join("/")
  }

  // Convert remote file paths to local file paths
  private getLocalFileIds(remoteIds: string[]): string[] {
    return remoteIds
      .map(this.getLocalFileId.bind(this))
      .filter((id) => id !== undefined)
  }

  // Download files from remote storage
  private async updateFileData(): Promise<TFileData[]> {
    const remotePaths = ["This will be fetch from Storage Worker ",]  // Fetch from storage [Future]
    const localPaths = this.getLocalFileIds(remotePaths)
    this.fileData = await this.generateFileData(localPaths)
    return this.fileData
  }

  // Update file structure
  private async updateFileStructure(): Promise<(TFolder | TFile)[]> {
    const remotePaths = ["This will be fetch from Storage Worker ",]  // Fetch from storage [Future]
    const localPaths = this.getLocalFileIds(remotePaths)
    this.files = generateFileStructure(localPaths)
    return this.files
  }

  private async loadLocalFiles() {
    // Reload file list from the container to include template files
    const result = await this.sandbox.commands.run(
      `find "${this.dirName}" -type f`
    ) // List all files recursively

    const localPaths = result.stdout.split("\n").filter((path) => path) // Split the output into an array and filter out empty strings
    const relativePaths = localPaths.map((filePath) =>
      path.posix.relative(this.dirName, filePath)
    ) // Convert absolute paths to relative paths
    this.files = generateFileStructure(relativePaths)
  }

  // Initialize the FileManager
  async initialize() {

    // Download files from remote file storage
    await this.updateFileStructure()
    await this.updateFileData()

    // Copy all files from the project to the container
    const promises = this.fileData.map(async (file) => {
      try {
        const filePath = path.posix.join(this.dirName, file.id)
        const parentDirectory = path.dirname(filePath)
        if (!this.sandbox.files.exists(parentDirectory)) {
          await this.sandbox.files.makeDir(parentDirectory)
        }
        await this.sandbox.files.write(filePath, file.data)
      } catch (e: any) {
        console.log("Failed to create file: " + e)
      }
    })
    await Promise.all(promises)

    await this.loadLocalFiles()

    // Make the logged in user the owner of all project files
    this.fixPermissions()

    await this.watchDirectory(this.dirName)
    await this.watchSubdirectories(this.dirName)
    
  }

  // Check if the given path is a directory
  private async isDirectory(directoryPath: string): Promise<boolean> {
    try {
      const result = await this.sandbox.commands.run(
        `[ -d "${directoryPath}" ] && echo "true" || echo "false"`
      )
      return result.stdout.trim() === "true"
    } catch (e: any) {
      console.log("Failed to check if directory: " + e)
      return false
    }
  }

  // Change the owner of the project directory to user
  private async fixPermissions() {
    try {
      await this.sandbox.commands.run(`sudo chown -R user "${this.dirName}"`)
    } catch (e: any) {
      console.log("Failed to fix permissions: " + e)
    }
  }

  // Watch a directory for changes
  async watchDirectory(directory: string): Promise<WatchHandle | undefined> {
    try {
      const handle = await this.sandbox.files.watchDir(
        directory,
        async (event: FilesystemEvent) => {
          try {
            function removeDirName(path: string, dirName: string) {
              return path.startsWith(dirName)
                ? path.slice(dirName.length)
                : path
            }

            // This is the absolute file path in the container
            const containerFilePath = path.posix.join(directory, event.name)
            // This is the file path relative to the project directory
            const sandboxFilePath = removeDirName(
              containerFilePath,
              this.dirName
            )
            // This is the directory being watched relative to the project directory
            const sandboxDirectory = removeDirName(directory, this.dirName)

            // Helper function to find a folder by id
            function findFolderById(
              files: (TFolder | TFile)[],
              folderId: string
            ) {
              return files.find(
                (file: TFolder | TFile) =>
                  file.type === "folder" && file.id === folderId
              )
            }

            // Handle file/directory creation event
            if (event.type === "create") {
              await this.loadLocalFiles()
              console.log(`Create ${sandboxFilePath}`)
            }

            // Handle file/directory removal or rename event
            else if (event.type === "remove" || event.type == "rename") {
              await this.loadLocalFiles()
              console.log(`Removed: ${sandboxFilePath}`)
            }

            // Handle file write event
            else if (event.type === "write") {
              const folder = findFolderById(
                this.files,
                sandboxDirectory
              ) as TFolder
              const fileToWrite = this.fileData.find(
                (file) => file.id === sandboxFilePath
              )

              if (fileToWrite) {
                fileToWrite.data = await this.sandbox.files.read(
                  containerFilePath
                )
                console.log(`Write to ${sandboxFilePath}`)
              } else {
                // If the file is part of a folder structure, locate it and update its data
                const fileInFolder = folder?.children.find(
                  (file) => file.id === sandboxFilePath
                )
                if (fileInFolder) {
                  const fileData = await this.sandbox.files.read(
                    containerFilePath
                  )
                  const fileContents =
                    typeof fileData === "string" ? fileData : ""
                  this.fileData.push({
                    id: sandboxFilePath,
                    data: fileContents,
                  })
                  console.log(`Write to ${sandboxFilePath}`)
                }
              }
            }

            // Tell the client to reload the file list
            if (event.type !== "chmod") {
              this.refreshFileList?.(this.files)
            }
          } catch (error) {
            console.error(
              `Error handling ${event.type} event for ${event.name}:`,
              error
            )
          }
        },
        { timeoutMs: 0 }
      )
      this.fileWatchers.push(handle)
      return handle
    } catch (error) {
      console.error(`Error watching filesystem:`, error)
    }
  }

  // Watch subdirectories recursively
  async watchSubdirectories(directory: string) {
    const dirContent = await this.sandbox.files.list(directory)
    await Promise.all(
      dirContent.map(async (item) => {
        if (item.type === "dir") {
          console.log("Watching " + item.path)
          await this.watchDirectory(item.path)
        }
      })
    )
  }

  // Get file content
  async getFile(fileId: string): Promise<string | undefined> {
    const filePath = path.posix.join(this.dirName, fileId)
    const fileContent = await this.sandbox.files.read(filePath)
    return fileContent
  }

  // Get folder content
  async getFolder(folderId: string): Promise<string[]> {
    const remotePaths = ["This will be fetch from Storage Worker ",]  // Fetch from storage [Future]
    return this.getLocalFileIds(remotePaths)
  }

  // Save file content
  async saveFile(fileId: string, body: string): Promise<void> {
    if (!fileId) return // handles saving when no file is open

    if (Buffer.byteLength(body, "utf-8") > MAX_BODY_SIZE) {
      throw new Error("File size too large. Please reduce the file size.")
    }
    // Save to storage worker [Future]

    let file = this.fileData.find((f) => f.id === fileId)
    if (file) {
      file.data = body
    } else {
      // If the file wasn't in our cache, add it
      file = {
        id: fileId,
        data: body,
      }
      this.fileData.push(file)
    }

    await this.sandbox.files.write(path.posix.join(this.dirName, fileId), body)
    this.fixPermissions()
  }



  // Close all file watchers
  async closeWatchers() {
    await Promise.all(
      this.fileWatchers.map(async (handle: WatchHandle) => {
        await handle.stop()
      })
    )
  }

}