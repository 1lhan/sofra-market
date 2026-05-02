import { formatNumber /*, formatPercentShare*/ } from "@/lib/number"
import { useSignal } from "@preact/signals-react"
import { useEffect, useRef } from "react"

type SemiDonutChartProps<T extends Record<string, any>> = {
    data: T[]
    valueKey: keyof T
    labelKey: keyof T
    title: string
    summaryLabel: string
    className?: string
}

const STROKE = 12
const GAP = 1 // degrees

const toRad = (deg: number) => (deg * Math.PI) / 180
const calcGap = (radius: number) => (STROKE / 2 / radius) * (180 / Math.PI) * 2 + GAP

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const s = {
        x: cx + r * Math.cos(toRad(startDeg)),
        y: cy + r * Math.sin(toRad(startDeg))
    }

    const e = {
        x: cx + r * Math.cos(toRad(endDeg)),
        y: cy + r * Math.sin(toRad(endDeg))
    }

    const largeArc = endDeg - startDeg > 180 ? 1 : 0

    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

export default function SemiDonutChart<T extends Record<string, any>>({ data, valueKey, labelKey, title, summaryLabel, className }: SemiDonutChartProps<T>) {
    const svgRef = useRef<SVGSVGElement>(null)
    const paths = useSignal<{ item: T, path: string }[]>([])
    const trackPath = useSignal("")
    const summaryValue = useSignal(0)

    function calculateArcs() {
        if (!svgRef.current) return

        const w = svgRef.current.clientWidth
        const h = svgRef.current.clientHeight

        if (w === 0 || h === 0) return

        const cx = w / 2
        const cy = h - STROKE / 2
        const r = Math.min(cx, cy) - STROKE / 2
        const gap = calcGap(r)
        const minSpan = gap + 0.5
        const total = data.reduce((sum, item) => sum + +item[valueKey], 0)

        const spans = data.map(item => ({
            item,
            span: Math.max((+item[valueKey] / total) * 180, minSpan)
        }))

        const scale = Math.min(1, 180 / spans.reduce((s, x) => s + x.span, 0))

        let cursor = 180

        trackPath.value = arcPath(cx, cy, r, 180, 360)
        summaryValue.value = total
        paths.value = spans.map(({ item, span }) => {
            const scaled = span * scale
            const start = cursor + gap / 2
            const end = cursor + scaled - gap / 2
            cursor += scaled
            return { item, path: arcPath(cx, cy, r, start, end) }
        })
    }

    useEffect(() => {
        calculateArcs()
        const observer = new ResizeObserver(calculateArcs)
        observer.observe(svgRef.current!)
        return () => observer.disconnect()
    }, [data])

    return (
        <div className={`semi-donut-chart${className ? ` ${className}` : ""}`}>
            <h3 className="semi-donut-chart-title">{title}</h3>
            <div className="semi-donut-chart-visual">
                <svg className="semi-donut-chart-svg" ref={svgRef}>
                    <path className="semi-donut-chart-track" strokeWidth={STROKE} d={trackPath.value} />
                    {paths.value.map(({ path }, index) => (
                        <path className={`semi-donut-chart-color-${index + 1}`} strokeWidth={STROKE} d={path} key={index} />
                    ))}
                </svg>
                <div className="semi-donut-chart-summary" style={{ bottom: `${STROKE / 2}px` }}>
                    <span>{summaryLabel}</span>
                    <span className="semi-donut-chart-summary-value">{formatNumber(summaryValue.value)}</span>
                </div>
            </div>
            <ul className="semi-donut-chart-legend">
                {data.map((item, index) =>
                    <li className="semi-donut-chart-legend-item" key={index}>
                        <i className={`semi-donut-chart-legend-item-dot semi-donut-chart-color-${index + 1}`} />
                        <span className="semi-donut-chart-legend-item-label">{item[labelKey]}</span>
                        <span className="semi-donut-chart-legend-item-value">{`${formatNumber(item[valueKey])} • ${/*formatPercentShare(+item[valueKey], summaryValue.value)*/null}`}</span>
                    </li>
                )}
            </ul>
        </div>
    )
}