"use client"

import { getIconNameFromMimeType, getMimeTypeFromExtension } from "@/lib/files"
import { ReadonlySignal, Signal } from "@preact/signals-react"
import Image from "next/image"
import Button from "../ui/Button"
import Icon from "../ui/Icon"

type FileUploadConfig = {
    mimeTypes: string[]
    maxFiles: number
    maxSize: number
}

export type FileUploadProps = {
    id: string
    name: string
    files: Signal<File[]> | ReadonlySignal<File[]>
    initialFiles?: Signal<string[]> | ReadonlySignal<string[]>
    config: FileUploadConfig[]
    onChange: (files?: File[], initialFiles?: string[]) => void
    className?: string
    labelProps?: Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "className" | "id" | "onChange">
}

type FilePreviewItemProps = {
    files: FileUploadProps["files"]
    initialFiles: FileUploadProps["initialFiles"]
    handleRemoveFile: (fileIndex: number) => void
    handleRemoveInitialFile: (fileName: string) => void
}

const FileUploadPreviewItem = ({ files, initialFiles, handleRemoveFile, handleRemoveInitialFile }: FilePreviewItemProps) => {
    const items = [...files.value, ...(initialFiles?.value ?? [])]

    if (!items.length) return null

    return (
        items.map((item, index) => {
            const isFile = item instanceof File
            const mimeType = isFile ? item.type : getMimeTypeFromExtension(item)

            return (
                <div className="file-upload-preview-item" key={index}>
                    {mimeType.includes("image")
                        ? (
                            <div className="file-upload-preview-item-image-wrapper">
                                <Image
                                    className="file-upload-preview-item-image"
                                    src={isFile ? URL.createObjectURL(item) : item}
                                    alt=""
                                    sizes="32px"
                                    fill
                                />
                            </div>
                        )
                        : <Icon name={getIconNameFromMimeType(mimeType)} />
                    }
                    {isFile &&
                        <div className="file-upload-preview-item-info">
                            <span>{item.name}</span>
                            <span className="text-muted">{(item.size / (1024 * 1024)).toFixed(3) + ' MB'}</span>
                        </div>
                    }
                    <Button color="muted" variant="ghost" onClick={() => isFile ? handleRemoveFile(index) : handleRemoveInitialFile(item)}>
                        <Icon name="xmark" />
                    </Button>
                </div>
            )
        })
    )
}

export const FileUpload = ({ id, name, files, initialFiles, config, onChange, className, labelProps }: FileUploadProps) => {
    const acceptedMimeTypes = config.flatMap(c => c.mimeTypes).join(",")
    const allowMultiple = config.reduce((sum, c) => sum + c.maxFiles, 0) > 1

    const validateAndProcessFiles = (inputFiles: FileList | null) => {
        if (!inputFiles?.length) return;

        const allFiles = [...(initialFiles?.value ?? []), ...Array.from(inputFiles)]
        const configWithItems = config.map(c => ({ ...c, items: [] as (File | string)[] }))
        const errors: string[] = []

        for (const file of allFiles) {
            const fileName = typeof file === "string" ? file : file.name
            const mimeType = typeof file === "string" ? getMimeTypeFromExtension(fileName) : file.type
            const fileSize = typeof file === "string" ? null : file.size

            const matchingConfig = configWithItems.find(c => c.mimeTypes.includes(mimeType))

            if (!matchingConfig) {
                const supportedMimeTypes = config
                    .flatMap((cfg) => cfg.mimeTypes.map(mt => mt.split("/")[1].replace("+xml", "").toUpperCase()))
                    .join(", ")

                errors.push(`"${fileName}" is not supported. Allowed formats: ${supportedMimeTypes}`)
                continue
            }

            if (matchingConfig.items.length >= matchingConfig.maxFiles) {
                errors.push(`You can only upload ${matchingConfig.maxFiles} file${matchingConfig.maxFiles > 1 ? "s" : ""}. "${fileName}" was not added.`)
                continue
            }

            if (fileSize && fileSize > matchingConfig.maxSize * 1024 * 1024) {
                const fileSizeMB = (fileSize / 1024 / 1024).toFixed(3)
                errors.push(`"${fileName}" is too large (${fileSizeMB} MB). Maximum size is ${matchingConfig.maxSize} MB.`)
                continue
            }

            matchingConfig.items.push(file)
        }

        const allProcessedFiles = configWithItems.flatMap(c => c.items)
        const newFiles = allProcessedFiles.filter(f => f instanceof File)
        const newInitialFiles = allProcessedFiles.filter(f => typeof f === "string")

        onChange(newFiles, newInitialFiles)
    }

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        validateAndProcessFiles(e.dataTransfer.files)
    }

    const handleRemoveFile = (fileIndex: number) => {
        const updatedFiles = files.value.filter((_, i) => i !== fileIndex)
        onChange(updatedFiles)
    }

    const handleRemoveInitialFile = (fileName: string) => {
        const updatedInitialFiles = initialFiles?.value.filter(f => f !== fileName)
        onChange(undefined, updatedInitialFiles)
    }

    return (
        <div className="file-upload">
            <input
                id={id}
                name={name}
                type="file"
                multiple={allowMultiple}
                accept={acceptedMimeTypes}
                className="file-upload-input"
                onChange={(e) => { validateAndProcessFiles(e.currentTarget.files); e.target.value = "" }}
                aria-label={`Upload file${allowMultiple ? "s" : ""}`}
            />
            <label
                className={`file-upload-dropzone${className ? `${className}` : ""}`}
                htmlFor={id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                {...labelProps}
            >
                <Icon name="file-arrow-up" size="xl" />
                <span className="file-upload-prompt">
                    {`Drag and drop file${allowMultiple ? "s" : ""} here or `}
                    <strong>browse</strong>
                </span>
                {config.map(({ mimeTypes, maxFiles, maxSize }, configIndex) => {
                    const extensions = mimeTypes.map(ext => ext.split("/")[1].replace("+xml", "")).join(", ").toUpperCase()

                    return (
                        <span className="file-upload-info" key={configIndex}>
                            {`${extensions} • up to ${maxSize}MB • ${maxFiles} file${maxFiles > 1 ? "s" : ""}`}
                        </span>
                    )
                })}
            </label>
            <div className="file-upload-previews">
                <FileUploadPreviewItem
                    files={files}
                    initialFiles={initialFiles}
                    handleRemoveFile={handleRemoveFile}
                    handleRemoveInitialFile={handleRemoveInitialFile}
                />
            </div>
        </div>
    )
}