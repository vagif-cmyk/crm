import { hideTextOfErr, SERVER, getData, main, postStudent, patchStudent} from './main.js';

const modalWindow = `<div class="modal">
  <button class="modal__close">&times;</button>
  <div class="modal__box">
  <h2 class="modal__title">Изменить данные</h2>
  <span class="modal__id"></span>
  <p class="modal__desc">Вы действительно хотите удалить данного клиента?</p>
  <div class="input-group">
  <div class="modal__surname-err">Заполните это поле</div>

      <input class="modal__input" id="modalSurname" type="text" name="surname">
      <label for="modalSurname" class="modal__label">Фамилия*</label>
    </div>
    <div class="input-group">
  <div class="modal__name-err">Заполните это поле</div>

      <input class="modal__input" id="modalname" type="text" name="name">
      <label for="modalname" class="modal__label">Имя*</label>
    </div>
    <div class="input-group">
      <input class="modal__input" id="modalLastName" type="text" name="lastName">
      <label for="modalLastName" class="modal__label">Отчество</label>
    </div>
    <div class="modal__btn-box">
      <button class="modal__del-item">Удалить</button>

    </div>
    <button class="modal__cancel">Отмена</button>
  </div>

  <div class="wrapp-contacts"></div>

  <div class="modal__add-contacts">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.99998 4.66671C7.63331 4.66671 7.33331 4.96671 7.33331 5.33337V7.33337H5.33331C4.96665 7.33337 4.66665 7.63337 4.66665 8.00004C4.66665 8.36671 4.96665 8.66671 5.33331 8.66671H7.33331V10.6667C7.33331 11.0334 7.63331 11.3334 7.99998 11.3334C8.36665 11.3334 8.66665 11.0334 8.66665 10.6667V8.66671H10.6666C11.0333 8.66671 11.3333 8.36671 11.3333 8.00004C11.3333 7.63337 11.0333 7.33337 10.6666 7.33337H8.66665V5.33337C8.66665 4.96671 8.36665 4.66671 7.99998 4.66671ZM7.99998 1.33337C4.31998 1.33337 1.33331 4.32004 1.33331 8.00004C1.33331 11.68 4.31998 14.6667 7.99998 14.6667C11.68 14.6667 14.6666 11.68 14.6666 8.00004C14.6666 4.32004 11.68 1.33337 7.99998 1.33337ZM7.99998 13.3334C5.05998 13.3334 2.66665 10.94 2.66665 8.00004C2.66665 5.06004 5.05998 2.66671 7.99998 2.66671C10.94 2.66671 13.3333 5.06004 13.3333 8.00004C13.3333 10.94 10.94 13.3334 7.99998 13.3334Z"
        fill="#9873FF" />
    </svg>
    <button class="modal__add-contacts-btn">Добавить контакт</button>
  </div>

  <div class="response">
   <div class="response__err">Что-то пошло не так...</div>
  </div>


  <div class="modal__submit-wrapp">
    <button class="modal__submit" type="submit">
      Сохранить
    </button>
  </div>
  <div class="modal__delete-item">
    <button class="modal__delete-item-btn" type="submit">Удалить данные</button>
  </div>
</div>`;

// запускает функцию создания модального окна, и возвращает объект с двумя методами: открыть окно, скрыть окно.
function modal(str) {
  const modal = createModal(str);

  return {
    open() {
      document.body.style.overflow = 'hidden'; // при открытой модалке отменяем скролл у body.

      hideTextOfErr();

      modal.classList.add('open');
    },
    close() {
      document.body.style.overflow = 'visible';  // при закрытой модалке разрешаем скролл у body.

      modal.classList.remove('open');
      modal.classList.add('hide');
      setTimeout(() => {
        modal.classList.remove('hide');
      }, 200);

      location.hash = 0;
    },
    async deleteStudent(id) {

      await fetch(`${SERVER}${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      let items = await getData();
      main(items);

    },
    async updateStudent(id) {

      const [student, modalTitle] = collectDataFromModal();

      if (modalTitle === 'Изменить данные') {
        await patchStudent(id, student);
      }
      else if (modalTitle === 'Новый клиент') {
        await postStudent(student);
      }
    }
  };
}

// настраивает стили для модальных окон изменения данных о клиенте и добавления нового клиента.
function stylesForModal(title) {

  document.querySelector('.modal__title').textContent = title;

  if (title === 'Новый клиент') { // если это окно создания нового клиента ...
    document.querySelector('.modal__id').style.display = 'none';  // убираем ненужный элемент который должен содержать id клиента.
  }
  else {
    document.querySelector('.modal__id').style.display = 'inline-block';//
  }

  document.querySelector('.modal__box').style.textAlign = 'left';

  document.querySelector('.modal__desc').style.display = 'none';
  document.querySelector('.modal__btn-box').style.display = 'none';
  document.querySelector('.modal__delete-item').style.display = 'none';
  document.querySelector('.modal__cancel').style.display = 'none';

  document.querySelector('.modal__delete-item').style.display = 'flex';
  document.querySelector('.wrapp-contacts').style.display = 'block';
  document.querySelector('.modal__add-contacts').style.display = 'flex';
  document.querySelector('.modal__submit-wrapp').style.display = 'flex';
  document.querySelector('.modal__delete-item').style.display = 'flex';

  const inputs = document.querySelectorAll('.input-group');
  inputs.forEach((el) => {
    el.style.display = 'flex';
  });
}

function stylesForModalDelete() {

  document.querySelector('.modal__box').style.textAlign = 'center';
  document.querySelector('.modal__title').textContent = 'Удалить клиента';
  document.querySelector('.modal__btn-box').style.display = 'block';
  document.querySelector('.modal__delete-item').style.display = 'block';
  document.querySelector('.modal__cancel').style.display = 'inline-block';
  document.querySelector('.modal__desc').style.display = 'block';

  document.querySelector('.wrapp-contacts').style.display = 'none';
  document.querySelector('.modal__id').style.display = 'none';
  document.querySelector('.modal__add-contacts').style.display = 'none';
  document.querySelector('.modal__submit-wrapp').style.display = 'none';
  document.querySelector('.modal__delete-item').style.display = 'none';

  const inputs = document.querySelectorAll('.input-group');
  inputs.forEach((el) => {
    el.style.display = 'none';
  });
}
function stylesForModalContactViewer() {
  document.querySelector('.modal__title').textContent = 'Просмотр контакта';
  document.querySelector('.modal__add-contacts').style.display = 'none';
  document.querySelector('.modal__submit-wrapp').style.display = 'none';
  document.querySelector('.modal__delete-item').style.display = 'none';
}

// создает модальное окно и возращает родительский элемент этого окна.
function createModal(str, options) {
  const wrapp = document.createElement('div');

  wrapp.classList.add('modal__wrapp');

  wrapp.innerHTML = str;

  document.body.appendChild(wrapp);
  return wrapp;
}
function collectDataFromModal() {   /// проверит если имя и фамилия НЕ пустые - идем дальше иначе добавляем текст с ошибкой.

  const contacts = [];
  const modalTitle = document.querySelector('.modal__title').textContent;

  const studentName = document.querySelector('#modalname').value;
  const studentSurname = document.querySelector('#modalSurname').value;
  const studentLastName = document.querySelector('#modalLastName').value;

  const title = Array.from(document.querySelectorAll('.contact__input-title'));
  const value = Array.from(document.querySelectorAll('.contact__input-value'));

  for (let i = 0; i < title.length; i++) {
    contacts.push({ type: title[i].value, value: value[i].value });
  }

  const student = {
    name: studentName,
    surname: studentSurname,
    lastName: studentLastName,
    contacts: contacts,
  };

  return [student, modalTitle];
}
export {modalWindow, modal, stylesForModal, stylesForModalDelete, stylesForModalContactViewer};