import "server-only"
import { unlink, writeFile } from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), 'public')

export async function saveFilesLocal(files: File[]): Promise<string[]> {
    if (!files.length) return []

    const savedPaths: string[] = []

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = path.extname(file.name)
        const filePath = `/uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`
        const absolutePath = path.join(UPLOAD_DIR, filePath)

        await writeFile(absolutePath, buffer)
        savedPaths.push(filePath)
    }

    return savedPaths
}

export async function deleteFilesLocal(filePaths: string[]): Promise<void> {
    if (!filePaths.length) return;

    await Promise.allSettled(
        filePaths.map(async (filePath) => {
            try {
                await unlink(path.join(UPLOAD_DIR, filePath))
            }
            catch (error) {
                console.warn(`[deleteFiles] Failed to delete ${filePath}`, error)
            }
        })
    )
}