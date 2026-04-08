"use client"

import { computeYAxisTicks } from "@/lib/chart-utils"
import { camelCaseToSentenceCase } from "@/lib/string"
import { Signal, useSignal } from "@preact/signals-react"
import React from "react"
import Tooltip from "./ui/Tooltip"

type ColumnChartProps<T extends Record<string, any>> = {
    data: T[]
    xKey: keyof T
    yKeys: (keyof T)[]
    title: string
    className: string
    direction?: "row" | "column"
    renderTooltip: (data: T) => React.ReactNode
    renderLabelAxis?: (data: T) => React.ReactNode
}

const AxisLabels = <T extends Record<string, any>>({ data, xKey, renderLabelAxis }: Pick<ColumnChartProps<T>, "data" | "xKey" | "renderLabelAxis">) => {
    return (
        <div className="column-chart-axis-labels">
            {data.map((item) => {
                const label = item[xKey]
                return (
                    <div className="column-chart-axis-label" key={label}>
                        {renderLabelAxis ? renderLabelAxis(item as T) : label}
                    </div>
                )
            })}
        </div>
    )
}

const AxisTicks = ({ ticks }: { ticks: number[][] }) => {
    if (ticks.length !== 1) return null
    return (
        <div className="column-chart-axis-ticks">
            {ticks[0].map((tick) => (
                <div key={tick} className="column-chart-axis-tick">
                    <div className="column-chart-axis-tick-value">
                        {tick}
                    </div>
                </div>
            ))}
        </div>
    )
}

const TooltipWrapper = <T extends Record<string, any>>({ activeIndex, data, className, renderTooltip }: { activeIndex: Signal<number | null> } & Pick<ColumnChartProps<T>, "data" | "className" | "renderTooltip">) => {
    if (activeIndex.value === null) return null

    return (
        <Tooltip anchor={`--${className}-bar-group-${activeIndex.value}`} direction="bottom">
            {renderTooltip(data[activeIndex.value])}
        </Tooltip>
    )
}

export default function ColumnChart<T extends Record<string, any>>({ data, xKey, yKeys, title, className, direction = "column", renderTooltip, renderLabelAxis }: ColumnChartProps<T>) {
    const activeIndex = useSignal<number | null>(null)
    const axisTicks = computeYAxisTicks(data, yKeys as string[], 5)
    const isColumn = direction === "column"

    return (
        <div className={`column-chart column-chart-${direction}${axisTicks.length > 1 ? " column-chart-multi-ticks" : ""}${className ? ` ${className}` : ""}`}>
            <div className="column-chart-header">
                <h3 className="column-chart-title">{title}</h3>
                <div className="column-chart-legend">
                    {yKeys.map((yKey, yKeyIndex) =>
                        <div className="column-chart-legend-item" key={yKeyIndex}>
                            <div className={`column-chart-legend-item-color column-chart-color-${yKey as string}`} />
                            <span>{camelCaseToSentenceCase(yKey as string)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="column-chart-body">
                {isColumn ? <AxisTicks ticks={axisTicks} /> : <AxisLabels data={data} xKey={xKey as string} renderLabelAxis={renderLabelAxis} />}

                <div className="column-chart-chart">
                    <div className="column-chart-bar-groups">
                        {axisTicks.length === 1 &&
                            <div className="column-chart-grid">
                                {Array.from({ length: 5 }).map((_, index) =>
                                    <span className="column-chart-grid-item" key={index} />
                                )}
                            </div>
                        }
                        {data.map((item, index) => {
                            const anchorName = `--${className}-bar-group-${index}`

                            return (
                                <div
                                    className="column-chart-bar-group"
                                    style={{ anchorName }}
                                    onMouseEnter={() => activeIndex.value = index}
                                    onMouseLeave={() => activeIndex.value = null}
                                    key={index}
                                >
                                    {yKeys.map((yKey, yKeyIndex) =>
                                        <div
                                            className={`column-chart-bar column-chart-color-${yKey as string}`}
                                            style={{ [isColumn ? "height" : "width"]: `${(item[yKey] / axisTicks[yKeyIndex][0]) * 100}%` }}
                                            key={yKey as string}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {isColumn ? <AxisLabels data={data} xKey={xKey as string} renderLabelAxis={renderLabelAxis} /> : <AxisTicks ticks={axisTicks} />}
                </div>
            </div>
            <TooltipWrapper
                activeIndex={activeIndex}
                data={data}
                className={className}
                renderTooltip={renderTooltip}
            />
        </div>
    )
}