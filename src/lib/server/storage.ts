import { deleteFilesLocal, saveFilesLocal } from "./storage.local"

export async function saveFiles(files: File[]): Promise<string[]> {
    return saveFilesLocal(files) // uploadToVercel(files)
}

export async function deleteFiles(urls: string[]): Promise<void> {
    return deleteFilesLocal(urls) // deleteFromVercel(urls)
}