import "server-only"
import { deleteFiles, saveFiles } from "./storage"

const IMG_SRC_REGEX = /<img\s+[^>]*src="([^"]+)"[^>]*>/g

function extractImageUrls(content: string): string[] {
    return Array.from(content.matchAll(IMG_SRC_REGEX))
        .map(match => match[1])
        .filter(Boolean)
}

function replaceTempIds(content: string, imageUrls: string[]): string {
    return imageUrls.reduce((html, url, i) =>
        html.replace(new RegExp(`data-temp-id="temp-${i}"`, "g"), `src="${url}"`),
        content
    )
}

export async function prepareEditorContentForCreate(content: string, images: File[] | undefined) {
    if (!images?.length) return { processedContent: content, contentImageUrls: [] }

    const imageUrls = await saveFiles(images)

    return { processedContent: replaceTempIds(content, imageUrls), contentImageUrls: imageUrls }
}

export async function prepareEditorContentForUpdate(oldContent: string, newContent: string, images: File[] | undefined) {
    const imageUrls = await saveFiles(images ?? [])
    const processedContent = replaceTempIds(newContent, imageUrls)

    const oldUrls = extractImageUrls(oldContent)
    const newUrls = extractImageUrls(processedContent)
    const imageUrlsToDelete = oldUrls.filter(url => !newUrls.includes(url))

    return { processedContent, contentImageUrls: imageUrls, contentImageUrlsToDelete: imageUrlsToDelete }
}

export async function deleteEditorContentImages(content: string) {
    await deleteFiles(extractImageUrls(content))
}