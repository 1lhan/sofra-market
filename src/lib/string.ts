/**
 * Converts a string to kebab-case
 * @example
 * toKebabCase("PascalCase")    // "pascal-case"
 * toKebabCase("camelCase")     // "camel-case"
 * toKebabCase("snake_case")    // "snake-case"
 * toKebabCase("UPPER_CASE")    // "upper-case"
 */
export function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase()
}

export function formatInitialFileName(name: string) {
    return "initial" + name.charAt(0).toUpperCase() + name.slice(1)
}

export function formatEnumLabel(str: string): string {
    return str
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
}

export function camelCaseToSentenceCase(str: string): string {
    return str
        .split(/(?=[A-Z])/)
        .map((word, i) => i === 0
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase()
        )
        .join(" ")
}