"use client"

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@tinymce/tinymce-react").then(mod => mod.Editor), { ssr: false })

export type TinyMceEditorProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export const TinyMceEditor = ({ value, onChange, placeholder, className }: TinyMceEditorProps) => {
    return (
        <div className={`tinymce-editor-wrapper${className ? ` ${className}` : ""}`}>
            <Editor
                init={{
                    placeholder,
                    plugins: ["advlist", "lists", "link", "image", "charmap", "preview", "fullscreen", "quickbars"],
                    toolbar: [`
                        undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor |
                        alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image |
                        removeformat | fullscreen preview | keyFactGrid gridList
                    `],
                    menubar: false,
                    paste_as_text: true,
                    content_style: `body { font-size: 0.875rem; } `
                }}
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                initialValue={value}
                onEditorChange={(value) => onChange(value)}
            />
        </div>
    )
}