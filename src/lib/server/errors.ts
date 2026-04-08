import "server-only"

export class AppError extends Error {
    statusCode: number
    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }
}

type ElysiaValidationError = {
    type: number
    schema: {
        type: string
        title?: string
        minLength?: number
        maxLength?: number
        anyOf?: [
            { default: string; extension: string[]; format: string; maxSize: string; type: string },
            ...Record<string, any>[]
        ]
    }
    path: string
    value: any
    message: string
}

export function formatValidationError(errors: ElysiaValidationError[]) {
    const formattedErrors = errors.map(error => {
        const { type, schema, path, message } = error

        const fieldName = path.slice(1)
        const displayName = schema.title || path.at(1)?.toUpperCase() + path.slice(2)
        let msg: string = ""

        switch (type) {
            case 51: msg = ` must be no more than ${schema.maxLength} characters`; break;
            case 52: msg = ` must be at least ${schema.minLength} characters`; break;
            default: msg = "";
        }

        return { [fieldName]: msg ? displayName + msg : message }
    })

    console.log(Object.assign({}, ...formattedErrors))
    return Object.assign({}, ...formattedErrors)
}