export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;
                el.value = name;
                return el;
            }))
        })
    }

    const applyFiltering = (query, state, action) => {
        // код с обработкой очистки поля
        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const field = parent ? parent.querySelector('input, select') : null;
            if (field) {
                field.value = ''; // Сбрасываем значение в самом HTML-элементе
            }
            const fieldName = action.dataset?.field;
            if (fieldName && state) {
                state[fieldName] = '';  // Сбрасываем значение в объекте состояния
            }
        } 

        // @todo: #4.5 — отфильтровать данные, используя компаратор
        const filter = {};
        //находим элементы полей значений "от" и "до"
        const fromInput = Object.values(elements).find(el => el?.name === 'totalFrom');
        const toInput = Object.values(elements).find(el => el?.name === 'totalTo');
        //Превращаем текст из инпута в настоящее число, а если там пустота — получаем NaN
        const fromVal = fromInput ? parseFloat(fromInput.value) : NaN;
        const toVal = toInput ? parseFloat(toInput.value) : NaN;

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) { // ищем поля ввода в фильтре с непустыми данными
                    if (elements[key].name === 'totalTo' && !isNaN(fromVal) && !isNaN(toVal) && toVal < fromVal) { //если это инпут "Сумма ДО", но введённое число МЕНЬШЕ, чем "Сумма ОТ",
            // мы его временно игнорируем и не отправляем на сервер, пока пользователь не допишет число
                        return;
                    }
                    filter[`filter[${elements[key].name}]`] = elements[key].value; // чтобы сформировать в query вложенный объект фильтра
                }
            }
        })

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; // если в фильтре что-то добавилось, применим к запросу
    }

    return {
        updateIndexes,
        applyFiltering
    }
}