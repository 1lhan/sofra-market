import { IntegerOptions, NumberOptions } from "@sinclair/typebox";
import { t } from "elysia";

export const NullableInteger = (options?: IntegerOptions) => t.Transform(
    t.Union([
        t.Integer(options),
        t.Literal("")
    ])
)
    .Decode(v => v === "" ? null : Math.round(+v))
    .Encode(v => v === null ? "" : +v)

export const NullableDecimal = (options?: NumberOptions) => t.Transform(
    t.Union([
        t.Numeric(options),
        t.Literal("")
    ])
)
    .Decode(v => v === "" ? null : +v)
    .Encode(v => v === null ? "" : +v)

export const NullableDateTimeLocal = t.Transform(
    t.Union([
        t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$' }),
        t.Literal("")
    ])
)
    .Decode(v => v === '' ? null : new Date(v))
    .Encode(v => v === null ? "" : v.toISOString().slice(0, 16))