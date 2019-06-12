module.exports = app => {

    function formatterMinutesToHours(totalMinutes) {
        if (totalMinutes) {
            let hours = Math.trunc(totalMinutes / 60)
            let minutes = totalMinutes % 60

            if (hours < 10) {
                hours = `0${hours}`
            }
            if (minutes < 10) {
                minutes = `0${minutes}`
            }
            return `${hours}h${minutes}min`
        }
        return "0h00min"
    }

    return { formatterMinutesToHours }
}