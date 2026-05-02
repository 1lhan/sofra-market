import { IconNames } from "@/components/ui/Icon"

const MIME_TYPE_MAP: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    svg: "image/svg+xml",
    gif: "image/gif",
    bmp: "image/bmp",
    tif: "image/tiff",
    tiff: "image/tiff",

    txt: "text/plain",
    rtf: "application/rtf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    odt: "application/vnd.oasis.opendocument.text",
    pdf: "application/pdf",

    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ods: "application/vnd.oasis.opendocument.spreadsheet",

    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    odp: "application/vnd.oasis.opendocument.presentation",

    csv: "text/csv",

    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip"
}

export function getMimeTypeFromExtension(fileName: string): string {
    const ext = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase()
    return MIME_TYPE_MAP[ext] || "application/octet-stream"
}

export function getExtensionFromMimeType(mime: string): string | undefined {
    return Object.keys(MIME_TYPE_MAP).find(key => MIME_TYPE_MAP[key] === mime)
}

const MIME_TYPE_ICON_MAP: Record<string, IconNames> = {
    // "text/plain": "file",
    // "application/msword": "file-word",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "file-word",
    // "application/pdf": "file-pdf",
    // "application/vnd.ms-excel": "file-excel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "file-excel",
    // "text/csv": "file-csv",
}

export function getIconNameFromMimeType(mimeType: string) {
    return MIME_TYPE_ICON_MAP[mimeType] ?? "file"
}