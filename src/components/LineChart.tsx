"use client"

import { computeYAxisTicks } from "@/lib/chart-utils"
import { camelCaseToSentenceCase } from "@/lib/string"
import { Signal, useSignal } from "@preact/signals-react"
import { useEffect, useRef } from "react"

type LineChartProps<T extends Record<string, any>> = {
    data: T[]
    yKeys: (keyof T)[]
    yLabels?: Partial<Record<keyof T, string>>
    title?: string
    className?: string
    useSharedAxis?: boolean
    renderTooltip: (data: T) => React.ReactNode
    renderLabelAxis: (data: T) => React.ReactNode
}

type HoveredType<T extends Record<string, any>> = { index: number, data: T } | null

const VERTICAL_PADDING = 1
const GRID_LINES_COUNT = 5

const LineChartHoverOverlay = <T extends Record<string, any>>(
    { svgRef, hovered, axisTicks, yKeys, useSharedAxis, dataCount }: { svgRef: React.RefObject<SVGSVGElement | null>, hovered: Signal<HoveredType<T>>, axisTicks: number[][], dataCount: number } & Pick<LineChartProps<T>, "yKeys" | "useSharedAxis">
) => {
    if (!hovered.value || !svgRef.current) return null

    const svgWidth = svgRef.current.width.baseVal.value
    const svgHeight = svgRef.current.height.baseVal.value - (VERTICAL_PADDING * 2)
    const x = (svgWidth / dataCount) * hovered.value.index

    return (
        <>
            <line
                className="line-chart-hover-line"
                x1={x}
                y1={VERTICAL_PADDING}
                x2={x}
                y2={svgHeight}
            />
            {yKeys.map((yKey, yKeyIndex) => {
                const tickIndex = useSharedAxis ? 0 : yKeyIndex
                const axisMin = axisTicks[tickIndex][axisTicks[tickIndex].length - 1]
                const axisMax = axisTicks[tickIndex][0]
                const value = hovered.value!.data[yKey]

                const y = (svgHeight * (1 - ((value - axisMin) / (axisMax - axisMin)))) + VERTICAL_PADDING

                return (
                    <circle
                        className={`line-chart-circle line-chart-color-${yKey as string}`}
                        cx={x}
                        cy={y}
                        key={yKeyIndex}
                    />
                )
            })}
        </>
    )
}

const LineChartTooltip = <T extends Record<string, any>>(
    { hovered, renderTooltip, svgRef, dataCount }: { hovered: Signal<HoveredType<T>>, svgRef: React.RefObject<SVGSVGElement | null>, dataCount: number } & Pick<LineChartProps<T>, "renderTooltip">
) => {
    if (!hovered.value || !svgRef.current) return null

    const x = (svgRef.current.width.baseVal.value / dataCount) * hovered.value.index

    return (
        <div className="line-chart-tooltip" style={{ left: `${x}px` }}>
            {renderTooltip(hovered.value.data)}
        </div>
    )
}

export default function LineChart<T extends Record<string, any>>({ data, yKeys, yLabels, title, className, useSharedAxis, renderTooltip, renderLabelAxis }: LineChartProps<T>) {
    const svgRef = useRef<SVGSVGElement>(null)
    const paths = useSignal<string[]>([])
    const hovered = useSignal<HoveredType<T>>(null)
    const axisTicks = computeYAxisTicks(data, yKeys as string[], 5, useSharedAxis)
    const dataCount = data.length - 1

    function calculateCoordinates() {
        if (!svgRef.current) return

        const svgWidth = svgRef.current.width.baseVal.value
        const svgHeight = svgRef.current.height.baseVal.value - (VERTICAL_PADDING * 2)
        const xScale = svgWidth / dataCount

        paths.value = yKeys.map((yKey, yKeyIndex) => {
            const tickIndex = useSharedAxis ? 0 : yKeyIndex
            const axisMin = axisTicks[tickIndex][axisTicks[tickIndex].length - 1]
            const axisMax = axisTicks[tickIndex][0]
            const axisRange = axisMax - axisMin
            let path = ""

            data.forEach((item, index) => {
                const x = index * xScale
                const y = (svgHeight * (1 - ((item[yKey] - axisMin) / axisRange))) + VERTICAL_PADDING
                path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
            })

            return path
        })
    }

    const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return

        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const svgWidth = svgRef.current.width.baseVal.value
        const dataPointWidth = svgWidth / dataCount
        const index = Math.round(x / dataPointWidth)

        if (index >= 0 && index < data.length) {
            hovered.value = { index, data: data[index] }
        }
    }

    useEffect(() => {
        calculateCoordinates()
        window.addEventListener('resize', calculateCoordinates)
        return () => window.removeEventListener('resize', calculateCoordinates)
    }, [data])

    return (
        <div className={`line-chart${className ? ` ${className}` : ""}`}>

            <div className="line-chart-header">
                {title && <h3 className="line-chart-title">{title}</h3>}
                <div className="line-chart-legend">
                    {yKeys.map((yKey) =>
                        <div className="line-chart-legend-item" key={yKey as string}>
                            <div className={`line-chart-legend-item-color line-chart-color-${yKey as string}`} />
                            <span>{yLabels?.[yKey] ?? camelCaseToSentenceCase(yKey as string)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="line-chart-body">

                {axisTicks.length === 1 &&
                    <div className="line-chart-axis-ticks">
                        {axisTicks[0].map((item, index) =>
                            <div className="line-chart-axis-tick" key={index}>
                                <div className="line-chart-axis-tick-value">{+item.toFixed(3)}</div>
                            </div>
                        )}
                    </div>
                }

                <div className="line-chart-chart">
                    <div className="line-chart-svg-container">
                        <svg className="line-chart-svg" ref={svgRef} onMouseMove={handleSvgMouseMove} onMouseLeave={() => hovered.value = null}>

                            {Array.from({ length: GRID_LINES_COUNT }).map((_, index) => {
                                if (!svgRef.current) return null

                                const svgWidth = svgRef.current.width.baseVal.value
                                const svgHeight = svgRef.current.height.baseVal.value - (VERTICAL_PADDING * 2)
                                const y = ((svgHeight / (GRID_LINES_COUNT - 1)) * index) + VERTICAL_PADDING

                                return (
                                    <line className="line-chart-grid-line" x1="0" y1={y} x2={svgWidth} y2={y} key={index} />
                                )
                            })}

                            <LineChartHoverOverlay
                                svgRef={svgRef}
                                hovered={hovered}
                                axisTicks={axisTicks}
                                yKeys={yKeys}
                                useSharedAxis={useSharedAxis}
                                dataCount={dataCount}
                            />

                            {paths.value.map((item, index) =>
                                <path className={`line-chart-path line-chart-color-${yKeys[index] as string}`} d={item} key={index} />
                            )}

                        </svg>

                        <LineChartTooltip
                            hovered={hovered}
                            renderTooltip={renderTooltip}
                            svgRef={svgRef}
                            dataCount={dataCount}
                        />
                    </div>


                    <div className="line-chart-axis-labels">
                        {svgRef.current != null && data.map((item, index) => {
                            if (!(index === 0 || index === data.length - 1)) return null

                            const svgWidth = svgRef.current!.width.baseVal.value
                            const x = (svgWidth / dataCount) * index

                            return (
                                <div className="line-chart-axis-label" style={{ left: `${x}px` }} key={index}>
                                    {renderLabelAxis(item)}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

        </div>
    )
}