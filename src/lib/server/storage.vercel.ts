import { del, put } from "@vercel/blob"

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

export async function uploadToVercel(files: File[]): Promise<string[]> {
    if (!files.length) return []

    return Promise.all(
        files.map(async (file) => {
            const ext = file.name.match(/\.[^.]+$/)?.[0] || ''
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`

            const blob = await put(fileName, file, {
                access: 'public',
                addRandomSuffix: true,
                token: blobToken
            })

            return blob.url
        })
    )
}

export async function deleteFromVercel(fileNames: string[]) {
    if (!fileNames.length) return;

    await Promise.allSettled(
        fileNames.map(async (fileName) => {
            const pathname = new URL(fileName).pathname.substring(1)
            await del(pathname, { token: blobToken })
        })
    )
}