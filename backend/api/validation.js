module.exports = app => {
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

    function validarHoraInicioFim(horaInicio, horaFim, msg) {
        if (horaInicio > horaFim) {
            throw msg;
        }
    }

    return { existsOrError, notExistsOrError, equalsOrError, objectContainsIdOrErro, validarHoraInicioFim }
}