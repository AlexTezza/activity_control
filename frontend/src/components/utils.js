export function minutesToHours(totalMinutes, useFormatting = true) {
    if (totalMinutes) {
        let hours = Math.trunc(totalMinutes / 60)
        let minutes = totalMinutes % 60
    
        if (hours < 10) {
            hours = `0${hours}`
        }
        if (minutes < 10) {
            minutes = `0${minutes}`
        }

        var hoursWithoutFormatting = `${hours}.${minutes}`

        return useFormatting ? formatterTooltip(hoursWithoutFormatting) : hoursWithoutFormatting
    }
    return "0h00min"
}

export function formatterTooltip(val) {
    if (val) {
        let hours = val.toString().split('.')[0]
        let minutes = val.toString().split('.')[1]
        if (minutes && minutes !== '00') {
            if (minutes.length === 1) {
                minutes = minutes + "0"
            }
            return hours + "h" + minutes + "min"
        }
        return hours + "h"
    }
    return "0h00min"
}

export function percentualPerActivity(val, serie, total) {
    if (total) {
        let serieIndex =  serie.seriesIndex
        let valueSerie = serie.w.config.series[serieIndex]
        let percentual = (valueSerie / total) * 100
    
        return val + `: <b>${percentual.toFixed(1)}%</b>`
    }
    return val
}