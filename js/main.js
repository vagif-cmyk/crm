import { modalWindow, modal, stylesForModal, stylesForModalDelete, stylesForModalContactViewer } from './modalWindow.js';


let hash = location.hash.slice(1);  // при отрисовке таблицы будет проверятся hash если в hash значение записано id откроется модальное окно с инфо о клиенте.
const SERVER = 'http://localhost:3000/api/clients/'; // сервер к которому мы будем обращатся.
let students = []; // здесь будет хранится данные о клиентах полученые из api.
let timeoutID;  // переменная для хранения id метода setTimeout
let idContact = 0; // уникальный id будет храниться в dataset каждого контакта, такой же id будет у каждого элемента в выподающем списке контакта.

const modalWin = modal(modalWindow);

// элементы с которыми будем работать.
const responseErr = document.querySelector('.response');
const responseErrText = document.querySelector('.response__err');
const nameErr = document.querySelector('.modal__name-err');
const surnameErr = document.querySelector('.modal__surname-err');
const modalInputs = document.querySelectorAll('.modal__input');
const preloader = document.querySelector('.preloader');
const tableBody = document.querySelector('.table__body');
const input = document.querySelector('.header__input');

const idItem = document.querySelector('#id');
const nameItem = document.querySelector('#name');
const createAt = document.querySelector('#createdAt');
const updateAt = document.querySelector('#updatedAt');

const removeStudent = document.querySelector('.modal__del-item');
const cancel = document.querySelector('.modal__cancel');
const modalSubmit = document.querySelector('.modal__submit');
const opened = document.querySelectorAll('.modal__wrapp');
const btnDeleteDataOfStudent = document.querySelector('.modal__delete-item-btn');
const wrappContacts = document.querySelector('.wrapp-contacts');
const btnAddContact = document.querySelector('.modal__add-contacts-btn');
const modalContent = document.querySelector('.modal');
const btnAddStudent = document.querySelector('.table__btn');

const headItems = [
  idItem,
  nameItem,
  createAt,
  updateAt,
];

await getData();
main(students); // запуск функции отрисовки таблицы.

//при клике на кнопку "Добавить студента" открыть модальное окно добавления студента.
btnAddStudent.addEventListener('click', (el) => {

  stylesForModal('Новый клиент');
  document.querySelector('.wrapp-contacts').textContent = '';
  document.querySelector('.modal__delete-item-btn').style.display = 'none';

  addTextContent('#modalname', '');
  addTextContent('#modalSurname', '');
  addTextContent('#modalLastName', '');

  modalWin.open();
});
// при фокусе на полях для ввода данных убираем DOM элементы с предупреждениями об ошибках.
modalInputs.forEach((el) => {
  el.addEventListener('focus', (event) => {
    hideTextOfErr();
  })
});
// при клике  на кнопку "удалить данные", внутри модального окна, удалить студента по id.
btnDeleteDataOfStudent.addEventListener('click', async (event) => {

  location.hash = 0;
  const id = event.target.dataset.id;
  modalWin.close();
  await modalWin.deleteStudent(id);
});

// при клике  на кнопку "создать контакт", внутри модального окна, создаем блок в котором будет находится контакт.
btnAddContact.addEventListener('click', (event) => {

  idContact++;

  createBoxContact();
  checkNumberOfContacts();
});

// отменяем всплытие для модальных окон.
modalContent.addEventListener('click', (event) => {
  event.stopPropagation();
});

// если при открытом модальном окне происходит клик в любое место кроме самого окна, закрыть окно.
opened.forEach((el) => {
  el.addEventListener('click', (event) => {
    modalWin.close();
    wrappContacts.textContent = '';
  });
});

cancel.addEventListener('click', () => {
  modalWin.close();
});

modalSubmit.addEventListener('click', async (event) => {

  hash = 0;

  if (nameIsCreated() && checkContacts()) { // проверяем заполнены ли поля "имя" и "фамилия"
    preloader.style.display = 'flex';

    await modalWin.updateStudent(event.target.dataset.id);
    wrappContacts.textContent = '';
  }
});

// при клике на кнопку "удалить", внутри модального окна удаления клиента, удалить клиента из базы и отрисовать таблицу заново.
removeStudent.addEventListener('click', async (event) => {

  modalWin.close();
  preloader.style.display = 'flex';
  await modalWin.deleteStudent(event.target.dataset.id);
});

// при клике на кнопку с классом "modal__close" закрыть модальное окно.
const modalclose = document.querySelector('.modal__close');

modalclose.addEventListener('click', () => {
  modalWin.close();
  wrappContacts.textContent = '';
});

// навешиваем события на input
input.addEventListener('input', (event) => {
  eventForInputSearch(event);
});
// навешиваем события на кнопки заголовков.
headItems.forEach((el) => {
  el.addEventListener('click', (event) => {
    sortTable(event);
  });
});
// убирает dom элементы с текстом ощибок.
function hideTextOfErr() {
  nameErr.style.display = 'none';
  surnameErr.style.display = 'none';
}
// проверяет заполнены ли поля "имя" и "фамилия" в модальном окне.
function nameIsCreated() {
  const name = document.querySelector('#modalname').value;
  const surname = document.querySelector('#modalSurname').value;

  if (name.trim() && surname.trim()) {
    hideTextOfErr();
    return true;
  }
  else {
    nameErr.style.display = name.trim() ? 'none' : 'block';
    surnameErr.style.display = surname.trim() ? 'none' : 'block';

    return false;
  }
}
// проверяет правильность заполнения значения контакта на основе регулярного вырожения.
function isValidValue(title, value) {

  const phone = /^\d+$/;
  const text = /^[\wА-Яа-я./]+$/;
  const mail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  switch (title) {
    case 'Email':
      return mail.test(value);

    case 'Телефон':
      return phone.test(value);

    default:
      return text.test(value);
  }
}
// устанавливает текст ошибки в значении контакта
function setTextErr(element, target = 'default') {
  if (target === 'default') {
    element.textContent = 'Заполните это поле';
  }
  else if (target === 'Телефон') {
    element.textContent = 'Могут быть введены только цифры';
  }
  else {
    element.textContent = 'Введите валидное значение';
  }
  element.style.display = 'block';

  setTimeout(() => {
    element.style.display = 'none';
  }, 2000);
}
// провеляет заполнен ли каждый созданый контакт.
function checkContacts() {
  let ok = true;
  const contact = document.querySelector('.contact');

  if (contact) {
    const values = document.querySelectorAll('.contact__input-value');
    const title = document.querySelectorAll('.contact__input-title');
    const contactErr = document.querySelectorAll('.contact__err');

    values.forEach((el, index) => {
      if (!el.value.trim()) {
        ok = false;
        el.focus();

        setTextErr(contactErr[index]);
      }

      if (el.value.trim() && !isValidValue(title[index].value, el.value)) {
        ok = false;
        el.focus();

        setTextErr(contactErr[index], title[index].value);
      }
    });
  }
  return ok;
}
/*
 берет данные из инпута, данные из сервера, проходит циклом по данным из сервера
 и проверяет есть ли в полном имени(имя+фамилия+отчество) содержится подстрока из инпута,
 объекты в которых есть совпадения закидываются в массив и на его основе рисуется таблица.
 */
function eventForInputSearch(event) {

  clearTimeout(timeoutID);

  timeoutID = setTimeout(async () => {
    const items = [];
    const data = await getData();
    const inputValue = event.target.value.trim().toLowerCase(); // здесь если inputValue пустой(в случае если юзер удалил все что напечатал), то в items запишутся все объекты с сервера т.к. '' содержется в любой строке.

    data.forEach(el => {
      const fullName = `${el.surname}${el.name}${el.lastName}`.toLowerCase();

      if (fullName.search(inputValue) !== -1) {
        items.push(el);
      }
    });
    main(items);
  }, 300);
}
// постит на сервер объект с данными студента.
async function postStudent(student) {

  const request = await fetch(SERVER, {
    method: 'POST',
    body: JSON.stringify(student),
    headers: {
      'Content-Type': 'application/json',
    }
  });
  await checkStatus(request);
  return request;
}
// проверяет статус ответа асинхронной функции.
async function checkStatus(response) {
  const st = response.status;

  if (st === 200 || st === 201) {
    modalWin.close();
    let items = await getData();
    main(items);
  }
  else {
    preloader.style.display = 'none';
    responseErr.style.display = 'block';

    if (st === 404 || st === 422 || st >= 500) {
      responseErrText.textContent = response.statusText;
    }
    else {
      responseErrText.textContent = 'Что-то пошло не так...';
    }
  }
}
//обновляет на сервере объект с данными студента.
async function patchStudent(id, student) {
  const request = await fetch(`${SERVER}${id}`, {
    method: 'PATCH',
    body: JSON.stringify(student),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  await checkStatus(request);
  return request;
}
// возвращает данные с сервера.
async function getData() {
  const request = await fetch(SERVER);
  students = await request.json();

  return students;
}

// создает таблицу
function main(data) {

  tableBody.textContent = '';

  if (data.length) {    // если массив не пустой(есть какие-то данные)

    data.forEach((el) => {   // проходимся по данным из сервера
      const tr = document.createElement('tr');
      tr.classList.add('table__tr');

      let name = `${el.surname} ${el.name} ${el.lastName}`;

      const id = createDOMElementByTag('th', ['id-item', 'table__body-item'], el.id);
      name = createDOMElementByTag('th', ['name-item', 'table__body-item'], name);

      const created = createDOMElementByTag('th', ['table__body-item', 'created-item'], formatDate(el.createdAt)[0]);
      const createdAt = createDOMElementByTag('span', ['created-at-item'], formatDate(el.createdAt)[1]);
      const updated = createDOMElementByTag('th', ['table__body-item', 'updated-item'], formatDate(el.updatedAt)[0]);
      const updatedAt = createDOMElementByTag('span', ['updated-at-item'], formatDate(el.updatedAt)[1]);
      const contacts = createContacts(el.contacts);
      const actions = createButtons(el.id);

      created.appendChild(createdAt);
      updated.appendChild(updatedAt);

      tr.appendChild(id);
      tr.appendChild(name);
      tr.appendChild(created);
      tr.appendChild(updated);
      tr.appendChild(contacts);
      tr.appendChild(actions);

      tableBody.appendChild(tr);
    });

    const btnUdate = document.querySelectorAll('.table__btn-update');  // кнопка изменить.

    //  при клике на кнопку "изменить" передать id пользователя кнопке "отправить данные" внутри модального окна
    //  значениями по умолчанию в инпутах установить данные студента.
    btnUdate.forEach(el => {

      el.addEventListener('click', async (event) => {
        const id = event.target.dataset.id;

        location.hash = id;
        openModalUpdate(id, false);
      });
    });

    const btnsRemove = document.querySelectorAll('.table__btn-remove');

    //  при клике  на кнопку "удалить" передать id пользователя кнопке "удалить" внутри модального окна и открыть окно удаления.
    btnsRemove.forEach(el => {
      el.addEventListener('click', async (event) => {

        location.hash = 0;

        stylesForModalDelete();
        const id = event.target.dataset.id;

        const removeStudent = document.querySelector('.modal__del-item');
        removeStudent.setAttribute('data-id', id);

        modalWin.open();
      });
    });

    if (hash > 0) {
      openModalUpdate(hash, true);
    }
  }
  preloader.style.display = 'none'; // после отрисовки таблицы, удаляем анимацию загрузки.
}

async function openModalUpdate(id, onlyRead) {
  const idItem = document.querySelector('.modal__id');
  document.querySelector('.modal__delete-item-btn').style.display = 'inline-block';

  idItem.textContent = `ID: ${id}`;
  modalSubmit.setAttribute('data-id', id);
  btnDeleteDataOfStudent.setAttribute('data-id', id);

  const { name, surname, lastName, contacts } = await getDataById(id);

  addTextContent('#modalname', name);
  addTextContent('#modalSurname', surname);
  addTextContent('#modalLastName', lastName);

  if (contacts) {
    for (let i of contacts) {
      createBoxContact(i);
    }
  }
  stylesForModal('Изменить данные');
  checkNumberOfContacts();

  if (onlyRead) {
    stylesForModalContactViewer();
  }
  modalWin.open();
}
// если кол-во имеющихся контактов у клиента больше или равно 10, убираем кнопку "Добавить контакт"
function checkNumberOfContacts() {

  const wrappContacts = document.querySelector('.modal__add-contacts');
  const len = document.querySelectorAll('.contact').length;

  if (len >= 10) {
    wrappContacts.style.display = 'none';
  }
  else {
    wrappContacts.style.display = 'flex';
  }
}
// добавляет контент для DОМ-элемента переданого в параметре
function addTextContent(element, content) {
  document.querySelector(element).value = content;
}
// функция принимает id студента и возвращает объект с данными этого студента.
async function getDataById(id) {
  let item = await fetch(`${SERVER}${id}`);
  item = await item.json();
  return item;
}

// создает контейнер с контактом.
function createBoxContact(contact = {}) {

  const { type, value } = contact;

  idContact++;
  const boxContact = document.createElement('div');

  boxContact.classList.add('contact');
  boxContact.setAttribute('data-contact', `${idContact}`);
  boxContact.innerHTML = `<div class="dropdown contact__wrapp-title" data-contact=${idContact}>
      <ul class="dropdown__list" data-contact=${idContact}>
          <li class="dropdown__item">Телефон</li>
          <li class="dropdown__item">Email</li>
          <li class="dropdown__item">Facebook</li>
          <li class="dropdown__item">VK</li>
          <li class="dropdown__item">Другое</li>
      </ul>
      <input class="contact__input contact__input-title" type="text" value="${type || 'Телефон'}" disabled data-contact=${idContact}>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
              d="M0.495029 0.690033C0.250029 0.935033 0.250029 1.33003 0.495029 1.57503L4.65003 5.73003C4.84503 5.92503 5.16003 5.92503 5.35503 5.73003L9.51003 1.57503C9.75503 1.33003 9.75503 0.935032 9.51003 0.690032C9.26503 0.445032 8.87003 0.445032 8.62503 0.690032L5.00003 4.31003L1.37503 0.685034C1.13503 0.445034 0.735029 0.445033 0.495029 0.690033Z"
              fill="#9873FF" />
      </svg>
  </div>
  <div class="contact__wrapp-value">
  <div class="contact__err">Это поле необходимо заполнить</div>
      <input class="contact__input contact__input-value" type="text" placeholder="Введите данные контакта" value="${value || ''}">
  </div>
  <div class="contact__btn-remove" data-contact=${idContact}>
      <span class="contact-icon"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="#B0B0B0"/>
      </svg>

          </span>
  </div>`;

  wrappContacts.appendChild(boxContact);

  const btnRemove = document.querySelector(`[data-contact="${idContact}"].contact__btn-remove`);

  btnRemove.addEventListener('click', (event) => {
    boxContact.remove();
    checkNumberOfContacts();
  });

  const dropdown = boxContact.children[0];

  // по клику на dropdown закрываем все открытые до этого dropdown-ы.
  dropdown.addEventListener('click', (event) => {
    const dropdownItems = document.querySelectorAll('.opened');
    dropdownItems.forEach((el) => {
      if (el.dataset.contact !== event.target.dataset.contact) // не трогаем dropdown по которому произошел клик.
        el.classList.remove('opened');                         // остальные закрываем.
    });
    const data = event.target.dataset.contact;

    const list = document.querySelector(`[data-contact="${data}"].dropdown__list`);
    list.classList.toggle('opened');
  });

  const dropdownChildren = Array.from(dropdown.children[0].children);
  const title = document.querySelector(`[data-contact="${idContact}"].contact__input-title`);

  dropdownChildren.forEach((el) => {
    el.addEventListener('click', (event) => {

      event.stopPropagation();

      const dropdownItems = document.querySelectorAll('.opened');
      dropdownItems.forEach((e) => {
        e.classList.remove('opened');
      })

      if (el.textContent === 'Другое') {
        title.disabled = false;
        title.value = '';
        title.focus();
      }
      else {
        title.value = el.textContent;
      }
    });
  });
}
// создает иконки контактов исходя из данных с сервера.
function createContacts(contacts) {

  const parent = createDOMElementByTag('th', ['table__body-item', 'contacts-item']);

  for (let i of contacts) {
    const vk = `<svg class="contact-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF"/>
      </g>
      </svg>`;
    const fb = `<svg class="contact-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF"/>
      </g>
      </svg>
      `;
    const phone = `<svg class="contact-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill="#9873FF"/>
      <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
      </g>
      </svg>
      `;
    const email = `<svg class="contact-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF"/>
      </svg>
      `;
    const defaultIcon = `<svg class="contact-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF"/>
      </svg>`;

    const span = document.createElement('span');

    switch (i.type) {
      case 'Email':
        span.setAttribute('data-tooltip', `email: ${i.value}`);  // добавляем атрибут, он нам нужен для отрисовки тултипа.
        span.innerHTML = email;
        break;
      case 'Телефон':
        span.setAttribute('data-tooltip', `телефон: ${i.value}`);
        span.innerHTML = phone;
        break;
      case 'VK':
        span.setAttribute('data-tooltip', `вконтакте: ${i.value}`);
        span.innerHTML = vk;
        break;
      case 'Facebook':
        span.setAttribute('data-tooltip', `фейсбук: ${i.value}`);
        span.innerHTML = fb;
        break;
      default:
        span.setAttribute('data-tooltip', `${i.type}: ${i.value}`);
        span.innerHTML = defaultIcon;
    }
    parent.appendChild(span);
  }
  return parent;
}
// форматирует строку с датой в строку вида 00.00.0000 00:00  (число.месяц.год часы:минуты)
function formatDate(str) {

  const date = new Date(str);

  const dayOfMonth = (pad(date.getDate()));
  const month = (pad(date.getMonth() + 1));
  const year = (pad(date.getFullYear()));
  const hours = (pad(date.getHours()));
  const minutes = (pad(date.getMinutes()));

  return [`${dayOfMonth}.${month}.${year} `, `${hours}:${minutes}`];
}
// если передаваемое число меньше 10 добавляет вперед ноль.
function pad(n) {
  return n < 10 ? '0' + n : n;
}
// создает елемент и добавляет классы и контент по необходимости.
function createDOMElementByTag(tag, classes, value) {

  const DOMElement = document.createElement(tag);
  DOMElement.classList.add(...classes);
  DOMElement.textContent = value;

  return DOMElement;
}
// создание кнопок и иконок для кнопок.
function createButtons(id) {
  const th = createDOMElementByTag('th', ['table__body-item', 'created-item']);

  const update = createDOMElementByTag('button', ['table__btn-update'], 'Изменить');
  const remove = createDOMElementByTag('button', ['table__btn-remove'], 'Удалить');
  const updateIcon = createDOMElementByTag('span', ['table__btn-span']);
  const removeIcon = createDOMElementByTag('span', ['table__btn-span']);

  updateIcon.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 10.5V13H2.5L9.87333 5.62662L7.37333 3.12662L0 10.5ZM11.8067 3.69329C12.0667 3.43329 12.0667 3.01329 11.8067 2.75329L10.2467 1.19329C9.98667 0.933291 9.56667 0.933291 9.30667 1.19329L8.08667 2.41329L10.5867 4.91329L11.8067 3.69329Z" fill="#9873FF"/>
    </svg>
    `;
  removeIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="#F06A4D"/>
    </svg>
    `;

  update.setAttribute('data-id', id); // связываем кнопки с объектами при помощи id
  remove.setAttribute('data-id', id);

  update.appendChild(updateIcon);
  remove.appendChild(removeIcon);
  th.appendChild(update);
  th.appendChild(remove);

  return th;
}

// сортирует таблицу
function sortTable(event) {

  event.target.classList.toggle('sort');
  const dataAtr = event.target.dataset.head;

  if (event.target.classList.contains('sort')) {  // если целевой элемент содержит класс "sort" сортируем по возрастанию иначе по убыванию.
    event.target.children[0].classList.toggle('transform-up');

    switch (dataAtr) {
      case 'name':
        students.sort((a, b) => `${a.surname}${a.name}${a.lastName}` > `${b.surname}${b.name}${b.lastName}` ? 1 : -1); // по объединенной строке в алфавитном порядке.
        break;
      case 'id':
        students.sort((a, b) => a.id - b.id);
        break;
      case 'createdAt':
        students.sort((a, b) => {
          const dateOne = new Date(a.createdAt);  // сначала преобразуем в объект Date чтобы можно было производить вычисления.
          const dateTwo = new Date(b.createdAt);
          return dateOne - dateTwo;
        });
        break;
      case 'updatedAt':
        students.sort((a, b) => {
          const dateOne = new Date(a.updatedAt);
          const dateTwo = new Date(b.updatedAt);
          return dateOne - dateTwo;
        });
        break;
    }
  }
  else {
    event.target.children[0].classList.toggle('transform-up');

    switch (dataAtr) {
      case 'name':
        students.sort((a, b) => `${a.surname}${a.name}${a.lastName}` < `${b.surname}${b.name}${b.lastName}` ? 1 : -1);
        break;
      case 'id':
        students.sort((a, b) => b.id - a.id);
        break;
      case 'createdAt':
        students.sort((a, b) => {
          const dateOne = new Date(a.createdAt);
          const dateTwo = new Date(b.createdAt);
          return dateTwo - dateOne;
        });
        break;
      case 'updatedAt':
        students.sort((a, b) => {
          const dateOne = new Date(a.updatedAt);
          const dateTwo = new Date(b.updatedAt);
          return dateTwo - dateOne;
        });
        break;
    }
  }
  main(students);  // после сортировки заново отрисовываем таблицу.
}

export { SERVER, hideTextOfErr, getData, main, patchStudent, postStudent };