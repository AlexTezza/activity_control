module.exports = app => {

    const MAX_TASK_NUMBER = 10000000000

    function existsOrError(value, msg) {
        if(!value) throw msg
        if(Array.isArray(value) && value.length === 0) throw msg
        if(typeof value === 'string' && !value.trim()) throw msg
    }
    
    function notExistsOrError(value, msg) {
        try {
            existsOrError(value, msg)
        } catch(msg) {
            return null
        }
        throw msg
    }
    
    function equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }

    function objectContainsIdOrErro(value, msg) {
        if (value) {
            existsOrError(value.id, msg)
        } else {
            throw msg
        }
    }

    function validateHourStartEnd(horaInicio, horaFim, msg) {
        if (horaInicio > horaFim) {
            throw msg;
        }
    }

    function validateTask(tarefa, msg) {
        if (tarefa && (tarefa <= 0 || tarefa > MAX_TASK_NUMBER)) {
            throw msg;
        }
    }

    return { existsOrError, notExistsOrError, equalsOrError, objectContainsIdOrErro, validateHourStartEnd, validateTask }
}