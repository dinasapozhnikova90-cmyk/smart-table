//import './fonts/ys-display/fonts.css'
//import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import {initSearching} from "./components/searching.js";
import {initFiltering} from "./components/filtering.js";
import {initSorting} from "./components/sorting.js";
import {initPagination} from "./components/pagination.js";

// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    const rowsPerPage = parseInt(state.rowsPerPage);    // приведём количество страниц к числу
    const page = parseInt(state.page ?? 1);                // номер страницы по умолчанию 1 и тоже число

    return {                                            // расширьте существующий return вот так
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
let applySearching, applyFiltering, applySorting, applyPagination;

function render(action) {
    if (!applySearching || !applyFiltering || !applySorting || !applyPagination) {
        return;
    }

    let state = collectState(); // состояние полей из таблицы

    let result = [...data]; // копируем для последующего изменения
    // @todo: использование
    result = applySearching(result, state, action);
    result = applyFiltering(result, state, action);
    result = applySorting(result, state, action);
    result = applyPagination(result, state, action);
    
    sampleTable.render(result)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);
// @todo: инициализация
applySearching = initSearching('search');

applyFiltering = initFiltering(sampleTable.filter.elements, {    // передаём элементы фильтра
    searchBySeller: indexes.sellers                              // для элемента с именем searchBySeller устанавливаем массив продавцов
});

applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

applyPagination = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

//Слушаем события на всем контейнере таблицы
if (sampleTable.container) {

    // А) Перерисовываем на каждый ввод символа в ЛЮБОЙ инпут (поиск, фильтры даты, покупателя, суммы)
    sampleTable.container.addEventListener('input', () => {
        render(); 
    });

    // Б) Перерисовываем при изменении выпадающих списков (выбор продавца, выбор количества строк на странице)
    sampleTable.container.addEventListener('change', () => {
        render(); 
    });

    // В) Обработка клика по кнопке очистки (крестику)
    sampleTable.container.addEventListener('click', (event) => {
        // Ищем ближайшую кнопку с дата-атрибутом clear
        const clearButton = event.target.closest('[data-name="clear"], button[data-action="clear"]');
        if (clearButton) {
            // Передаем кнопку в render, чтобы сработал код сброса поля в модулях
            render(clearButton); 
        }
    });
}

// Первый запуск для отрисовки таблицы с исходными данными
render();