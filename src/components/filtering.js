import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison([
    'skipNonExistentSourceFields',
    'skipEmptyTargetValues',
    'arrayAsRange',
    'caseInsensitiveStringIncludes'
]);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach((elementName) => {       // Получаем ключи из объекта// Перебираем по именам
        if (elements[elementName]) {
            elements[elementName].append(                    // в каждый элемент добавляем опции
                ...Object.values(indexes[elementName]).map(name => {         // формируем массив имён, значений опций// используйте name как значение и текстовое содержимое
                    const option = document.createElement('option');    // @todo: создать и вернуть тег опции
                    option.value = name;
                    option.textContent = name;
                    return option
                })
            );
        }    
    });

    function filterData(data, state) {
        const criteria = {};

        // 1. Фильтр по продавцу (из name="seller")
        if (state.seller && state.seller !== 'Все' && state.seller !== '—') {
            criteria.seller = state.seller;
        }

        // 2. Фильтр по дате (из name="date")
        if (state.date && state.date.trim() !== '') {
            criteria.date = state.date.trim();
        }

        // 3. Фильтр по покупателю (из name="customer")
        if (state.customer && state.customer.trim() !== '') {
            criteria.customer = state.customer.trim();
        }

        // 4. Фильтр по сумме (диапазон)
        const totalFrom = state.totalFrom?.trim();
        const totalTo = state.totalTo?.trim();

        if (totalFrom || totalTo) {
            criteria.total = [
                totalFrom ? parseFloat(totalFrom) : null,
                totalTo ? parseFloat(totalTo) : null
            ];
        }

        return data.filter(row => compare(row, criteria));
    }
    // Возвращаем функцию
    return (data, state, action) => {
        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const field = parent ? parent.querySelector('input, select') : null;
            if (field) {
                field.value = '';
            }
            const fieldName = action.dataset?.field;
            if (fieldName && state) {
                state[fieldName] = '';
            }
        }

        return filterData(data, state);
    };
}