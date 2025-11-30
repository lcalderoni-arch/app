export const formatDateLocal = (dateString) => {
    if (!dateString) return '';

    // Parsear la fecha como local (sin conversión UTC)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    // Formatear a DD/MM/YYYY
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
};

/**
 * Alternativa más simple si solo necesitas DD/MM/YYYY
 */
export const formatDateSimple = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

export const getDayOfWeek = (dateString) => {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
};