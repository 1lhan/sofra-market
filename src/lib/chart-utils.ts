export function computeYAxisTicks(data: Record<string, any>[], yKeys: string[], tickCount: number, useSharedAxis?: boolean) {
    if (useSharedAxis) {
        const flatSorted = yKeys.map(yKey => {
            const sorted = [...data].sort((a, b) => b[yKey] - a[yKey])
            const min = sorted[sorted.length - 1][yKey]
            const max = sorted[0][yKey]
            return [min, max]
        })
            .flatMap(item => item)
            .sort((a, b) => b - a)

        const min = flatSorted[flatSorted.length - 1]
        const max = flatSorted[0]

        const ticks = []

        if (min > 1) {
            const magnitude = Math.pow(10, String(Math.floor(min)).length - 1)
            const rounded = Math.floor(min / magnitude) * magnitude
            ticks.push(rounded)
        }
        else {
            ticks.push(Math.floor(min * 10) / 10)
        }

        if (max > 1) {
            const magnitude = Math.pow(10, String(Math.floor(max)).length - 1)
            const rounded = Math.ceil(max / magnitude) * magnitude
            ticks.push(rounded)
        }
        else {
            ticks.push(Math.ceil(max * 10) / 10)
        }

        if (tickCount > 2) {
            const minTick = ticks[0]
            const maxTick = ticks[1]
            const intervalCount = tickCount - 2
            const stepSize = (maxTick - minTick) / (intervalCount + 1)

            for (let i = 1; i <= intervalCount; i++) {
                ticks.splice(i, 0, minTick + (stepSize * i))
            }
        }

        return [ticks.reverse()]
    }

    return yKeys.map((yKey) => {
        const sorted = [...data].sort((a, b) => b[yKey] - a[yKey])
        const min = sorted[sorted.length - 1][yKey]
        const max = sorted[0][yKey]

        const ticks = []

        if (min > 1) {
            const magnitude = Math.pow(10, String(Math.floor(min)).length - 1)
            const rounded = Math.floor(min / magnitude) * magnitude
            ticks.push(rounded)
        }
        else {
            ticks.push(Math.floor(min * 10) / 10)
        }

        if (max > 1) {
            const magnitude = Math.pow(10, String(Math.floor(max)).length - 1)
            const rounded = Math.ceil(max / magnitude) * magnitude
            ticks.push(rounded)
        }
        else {
            ticks.push(Math.ceil(max * 10) / 10)
        }

        if (tickCount > 2) {
            const minTick = ticks[0]
            const maxTick = ticks[1]
            const intervalCount = tickCount - 2
            const stepSize = (maxTick - minTick) / (intervalCount + 1)

            for (let i = 1; i <= intervalCount; i++) {
                ticks.splice(i, 0, minTick + (stepSize * i))
            }
        }

        return ticks.reverse()
    })
}