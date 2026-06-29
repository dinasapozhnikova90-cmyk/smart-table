import {createComparison, defaultRules, rules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules, [rules.arrayAsRange()]);

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
    // Обработчики формы
    const form = document.querySelector('form');
    let currentData = [];
    let currentState = {};

    function filterData(data, state) {
        const criteria = {};

        // Фильтр по продавцу
        if (state.searchBySeller && state.searchBySeller !== 'Все') {
            criteria.seller = state.searchBySeller;
        }

        // Фильтр по сумме (диапазон)
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

    // Функция обновления таблицы
    function updateTable(data, state) {
        const filtered = filterData(data, state);
        console.log('Отфильтровано строк:', filtered.length);
        return filtered;
    }

    // Обработчик событий формы
    function handleFilterChange(e) {
        if (['submit', 'reset'].includes(e.type)) {
            e.preventDefault();
        }

        const formData = new FormData(form);
        currentState.searchBySeller = formData.get('searchBySeller') || '';
        currentState.totalFrom = formData.get('totalFrom') || '';
        currentState.totalTo = formData.get('totalTo') || '';

        updateTable(currentData, currentState);
    }

    // Навешиваем обработчики
    if (form) {
        form.addEventListener('change', handleFilterChange);
        form.addEventListener('submit', handleFilterChange);
        form.addEventListener('reset', handleFilterChange);
    }

    // Возвращаем функцию
    return (data, state, action) => {
        currentData = data;
        currentState = state;

        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const field = parent ? parent.querySelector('input, select') : null;
            if (field) {
                field.value = '';
            }
            const fieldName = action.dataset?.field;
            if (fieldName) {
                state[fieldName] = '';
            }
            return updateTable(data, state);
        }

        return filterData(data, state);
    };
}