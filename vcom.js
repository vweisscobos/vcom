(function initVcom(global) {
  //  eslint-disable-next-line
  global.vcom = {};

  function get(url, params) {
    const headers = new Headers();

    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const query = params.entries.reduce((param) => `${param}=${params[param]}`).join('&');

    return fetch(`${url}?${query}`, {
      headers,
      credentials: 'include',
    }).then((res) => res.json())
      .then((res) => JSON.parse(res));
  }

  /**
   *
   *  AUTOCOMPLETE COMPONENT
   *
   */
  vcom.autocomplete = (el) => {
    let listItem = -1;
    let search = '';
    const parent = el.parentElement;
    const container = document.createElement('div');
    const valueHolder = document.createElement('input');
    const listContainer = document.createElement('div');
    const searchBar = document.createElement('input');
    const list = document.createElement('ul');
    const error = document.createElement('span');
    let result = [];
    let source = '';
    let initialValue = '';
    let placeholder = '';
    let tipText = '';

    let queryBuilder = (term) => ({ term });

    let responseHandler = (item) => item;

    let onValueChange = (item) => {
      console.log(item);
    };

    let inheritAttributes = false;

    const changeSelectedItem = (index) => {
      listItem = index;

      list.childNodes.forEach((child) => {
        child.classList.remove('selected');
      });

      if (list.childNodes.length === 0) return;

      list.childNodes[listItem].classList.add('selected');
      valueHolder.value = list.childNodes[listItem].innerText || '';

      onValueChange(
        [
          list.childNodes[listItem].value,
          list.childNodes[listItem].innerText,
          result[listItem],
        ],
      );
    };

    const handleArrowSelection = (evt) => {
      if (evt.key === 'ArrowUp') {
        if (listItem <= 0) return;
        changeSelectedItem(listItem - 1);
      }

      if (evt.key === 'ArrowDown') {
        if (listItem >= list.childElementCount - 1) return;
        changeSelectedItem(listItem + 1);
      }
    };

    const setSearch = (term = '') => {
      if (term.length < 3) {
        return new Promise((resolve) => {
          resolve([]);
        });
      }

      return get(source, queryBuilder(term))
        .then((res) => {
          let html = '';

          result = res;

          res.map(responseHandler).forEach((item) => {
            html += `<li value="${item[0]}">${item[1]}</li>`;
          });

          list.innerHTML = html;

          return true;
        });
    };

    const setChange = (term) => setSearch(term)
      .then(() => {
        changeSelectedItem(0);
        return true;
      });

    const reset = () => {
      const term = initialValue;

      valueHolder.value = '';
      searchBar.value = '';
      list.innerHTML = '';

      setSearch(term)
        .then(() => {
          changeSelectedItem(0);
        });
    };

    const disable = () => {
      valueHolder.setAttribute('disabled', 'true');
      searchBar.setAttribute('disabled', 'true');
    };

    const enable = () => {
      valueHolder.removeAttribute('disabled');
      searchBar.removeAttribute('disabled');
    };

    let toReturn = {};

    const setSource = (url) => {
      source = url;

      return toReturn;
    };

    const setInitialValue = (value) => {
      initialValue = value;

      return toReturn;
    };

    const setQueryBuilder = (cb) => {
      queryBuilder = cb;

      return toReturn;
    };

    const setResponseHandler = (cb) => {
      responseHandler = cb;

      return toReturn;
    };

    const setPlaceholder = (ph) => {
      placeholder = ph;

      return toReturn;
    };

    const mount = () => {
      searchBar.classList.add('vcom-search');
      valueHolder.classList.add('vcom-value');

      const inputTipText = vcom.tipText(valueHolder, tipText, false);

      listContainer.appendChild(searchBar);
      listContainer.setAttribute('tabindex', '-1');
      listContainer.appendChild(list);
      listContainer.classList.add('list-container');
      listContainer.addEventListener('focus', () => {
        container.classList.add('active');
      });

      list.setAttribute('tabindex', '-1');

      valueHolder.setAttribute('readonly', 'true');
      valueHolder.setAttribute('tabindex', '-1');
      valueHolder.setAttribute('placeholder', placeholder || '');
      valueHolder.addEventListener('click', () => {
        searchBar.focus();
      });

      if (inheritAttributes) {
        for (let i = 0; i < el.attributes.length; i++) {
          valueHolder.setAttribute(el.attributes[i].name, el.attributes[i].value);
        }
      }

      error.classList.add('error');

      searchBar.addEventListener('focus', () => {
        if (tipText !== '') inputTipText.show();
        container.classList.add('active');
      });
      searchBar.addEventListener('keyup', handleArrowSelection);
      searchBar.setAttribute('placeholder', placeholder);
      list.addEventListener('click', (evt) => {
        setChange(evt.target.innerText)
          .then(() => {
            searchBar.value = evt.target.innerText;
          });
      });
      searchBar.addEventListener('blur', () => {
        if (tipText !== '') inputTipText.hide();
        container.classList.remove('active');
      });

      container.appendChild(valueHolder);
      container.appendChild(error);
      container.appendChild(listContainer);
      container.classList.add('vcom-autocomplete');
      container.setAttribute('tabindex', '-1');
      container.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') {
          evt.stopPropagation();
          evt.preventDefault();
          searchBar.blur();
        }
      });
      container.addEventListener('keyup', (evt) => {
        if (evt.target === searchBar && evt.target.value !== search) {
          search = evt.target.value;
        } else {
          return;
        }

        setSearch(evt.target.value)
          .then(() => {
            changeSelectedItem(0);
          });
      });

      container.addEventListener('ul', (evt) => {
        console.log(evt.target);
      });

      parent.replaceChild(container, el);

      return toReturn;
    };

    const setOnValueChange = (cb) => {
      onValueChange = cb;

      return toReturn;
    };

    const setInheritAttributes = (bool) => {
      inheritAttributes = bool;

      return toReturn;
    };

    const getRef = () => valueHolder;

    const setTipText = (text) => {
      tipText = text;

      return toReturn;
    };

    toReturn = {
      setChange,
      setSearch,
      reset,
      disable,
      enable,
      setSource,
      setInitialValue,
      setPlaceholder,
      setQueryBuilder,
      setResponseHandler,
      setOnValueChange,
      setInheritAttributes,
      mount,
      getRef,
      setTipText,
    };

    return toReturn;
  };


  /**
   *
   *  MODAL COMPONENT
   *
   */
  vcom.modal = (msg, onOk) => {
    const modal = document.createElement('div');
    modal.classList.add('vcom-modal-container');

    const popup = document.createElement('div');
    popup.classList.add('vcom-modal-popup');

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('vcom-modal-btnContainer');

    popup.innerHTML = `<p>${msg}</p>`;
    popup.appendChild(btnContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancelar';
    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });
    btnContainer.appendChild(cancelBtn);

    const okBtn = document.createElement('button');
    okBtn.innerText = 'Ok';
    okBtn.addEventListener('click', () => {
      onOk();
      modal.remove();
    });
    btnContainer.appendChild(okBtn);

    modal.appendChild(popup);

    const container = document.querySelector('html');
    container.appendChild(modal);
  };

  vcom.modalForm = (onOk, fields) => {
    const modal = document.createElement('div');
    modal.classList.add('vcom-modal-container');

    const popup = document.createElement('div');
    popup.classList.add('vcom-modal-popup', 'vcom-modal-form');

    const form = document.createElement('form');

    const generateInput = (field) => {
      switch (field.type) {
        case 'textarea':
          return `<textarea class="form-control" placeholder="${field.placeholder}" name="${field.name}"></textarea>`;
        case 'select':
          return `<select class="form-control" name="${field.name}">
            <option value="" disabled selected>${field.placeholder}</option>
                ${field.options.map((opt) => `<option value="${opt.value}">${opt.text}</option>`)}
            </select>`;
        default:
          return `<input class="form-control" placeholder="${field.placeholder}" type="${field.type}" name="${field.name}"/>`;
      }
    };

    form.innerHTML = fields.reduce((acc, field) => {
      const input = generateInput(field);

      return `${acc}
        <div class="form-group">
            <label class="control-label">
                <span>${field.label}</span>
            </label>
            ${input}            
        </div>`;
    }, '');

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('vcom-modal-btnContainer');

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancelar';
    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });
    btnContainer.appendChild(cancelBtn);

    const removeModal = () => {
      modal.remove();
    };

    const okBtn = document.createElement('button');
    okBtn.innerText = 'Ok';
    okBtn.addEventListener('click', () => {
      const inputs = form.querySelectorAll('input, textarea, select');
      const formValues = {};

      inputs.forEach((input) => {
        formValues[input.getAttribute('name')] = input.value;
      });

      onOk(formValues, removeModal);
    });
    btnContainer.appendChild(okBtn);

    popup.appendChild(form);
    popup.appendChild(btnContainer);
    modal.appendChild(popup);

    const container = document.querySelector('html');
    container.appendChild(modal);
  };

  vcom.toaster = () => {
    const toaster = {};

    const html = document.querySelector('body');
    const container = document.createElement('div');
    container.classList.add('toaster-container');
    html.appendChild(container);

    function removing(el) {
      el.classList.add('removing');
      setTimeout(() => {
        el.remove();
      }, 1000);
    }

    function message(msg, status) {
      const notification = document.createElement('div');

      notification.innerHTML = `<span><i class="fas fa-exclamation-circle"></i></span><span>${msg}</span>`;

      notification.classList.add('toaster');
      notification.classList.add(status);

      notification.addEventListener('click', () => {
        removing(notification);
      });

      setTimeout(() => {
        removing(notification);
      }, 3000);

      container.prepend(notification);
    }

    toaster.error = (msg) => {
      message(msg, 'error');
    };

    toaster.success = (msg) => {
      message(msg, 'success');
    };

    toaster.warning = (msg) => {
      message(msg, 'warning');
    };

    toaster.info = (msg) => {
      message(msg, 'info');
    };

    return toaster;
  };

  vcom.table = (attributes, labels) => {
    let model = [];
    let checklist = false;
    let actionButtons = false;
    let searchEnabled = false;
    let source = '';
    let paginationEnabled = false;
    let placeholder = 'search here';
    let itemsPerPage = 2;
    let currentPage = 1;
    let selectedElements = [];

    let actionCallback = () => {
      // console.log('tabela clicada');
    };

    let queryBuilder = (term) => ({ term });

    let responseHandler = (item) => item;

    let checklistCallback = () => {
      // console.log(selectedItems);
    };

    const tableContainer = document.createElement('div');
    const table = document.createElement('table');
    const header = document.createElement('thead');
    const row = document.createElement('tr');
    const body = document.createElement('tbody');

    const generateActionButtons = (btns) => btns.reduce((acc, btn) => `${acc}<button data-action="${btn.action}">${btn.innerHTML || ''}</button>`, '');

    const lineContent = (item, index) => {
      let content = checklist ? `<td><input type="checkbox" value="${index}"/></td>` : '';

      content = attributes.reduce((acc, attr) => `${acc}<td>${item[attr]}</td>`, content);

      content += actionButtons.length > 0 ? `<td class="vcom-table__row__action-btns">${generateActionButtons(actionButtons)}</td>` : '';

      return content;
    };

    const isRowVisible = (index) => {
      if (!paginationEnabled) return true;

      // index++;
      let isVisible = (index + 1) <= itemsPerPage * currentPage;
      isVisible = isVisible && (index + 1) > itemsPerPage * (currentPage - 1);

      return isVisible;
    };

    const render = () => {
      body.innerHTML = '';


      model.forEach((item, index) => {
        const tableRow = document.createElement('tr');

        tableRow.classList.add('vcom-table__row');
        tableRow.style.display = isRowVisible(index) ? 'default' : 'none';
        tableRow.innerHTML = lineContent(item, index);

        tableRow.setAttribute('data-index', index);

        body.appendChild(tableRow);
      });

      insertPagination();
    };

    const insertSearchBar = () => {
      if (!searchEnabled) return;

      const searchBar = document.createElement('input');
      searchBar.classList.add('vcom-searchbar');
      searchBar.setAttribute('placeholder', placeholder);
      searchBar.addEventListener('keyup', (evt) => {
        if (evt.target.value.length < 3) return;

        onSearchChange(evt.target.value);
      });

      tableContainer.prepend(searchBar);
    };

    const insertPagination = () => {
      if (!paginationEnabled) return;

      tableContainer.style.paddingBottom = '60px';

      const pagination = document.querySelector('.vcom-table__nav') || document.createElement('nav');
      pagination.classList.add('vcom-table__nav');
      const pageNumber = Math.ceil(model.length / itemsPerPage);
      let buttons = '';

      for (let i = 1; i < pageNumber + 1; i++) {
        buttons += `<a data-page="${i}">${i}</a>`;
      }

      pagination.innerHTML = buttons;

      pagination.addEventListener('click', (evt) => {
        currentPage = evt.target.getAttribute('data-page');
        render();
      });

      tableContainer.appendChild(pagination);
    };

    table.appendChild(header);
    table.appendChild(body);
    tableContainer.appendChild(table);

    const mount = () => {
      tableContainer.classList.add('vcom-table-container');

      table.classList.add('vcom-table');

      let headerRow = checklist ? '<td><input class="select-all" type="checkbox"/></td>' : '';

      headerRow = labels.reduce((acc, label) => `${acc}<th>${label}</th>`, headerRow);
      headerRow += actionButtons.length > 0 ? '<th></th>' : '';
      row.innerHTML = headerRow;
      header.appendChild(row);

      body.classList.add('vcom-table__body');

      insertSearchBar();
      render();
      onSearchChange('');

      header.addEventListener('change', (evt) => {
        if (!evt.target.classList.contains('select-all')) return;

        const state = evt.target.checked;

        body.querySelectorAll("input[type='checkbox']").forEach((el) => {
          el.checked = state;
        });

        selectedElements = state ? model.map((item, index) => ({ index, item })) : [];

        checklistCallback(selectedElements);
      });

      body.addEventListener('click', (evt) => {
        let index = -1;
        let parent = evt.target;
        let action = 'click';


        while (index < 0) {
          if (parent.tagName === 'TR') index = parent.getAttribute('data-index');
          action = parent.getAttribute('data-action') || action;

          parent = parent.parentElement;
        }

        actionCallback({
          action,
          index,
          item: model[index],
        });
      });

      body.addEventListener('change', () => {
        selectedElements = [];
        body.querySelectorAll("input[type='checkbox']").forEach((el) => {
          if (el.checked) {
            selectedElements.push({
              index: el.value, item: model[el.value],
            });
          }
        });
        checklistCallback(selectedElements);
      });

      return tableContainer;
    };

    const add = (item) => {
      const index = model.length - 1;

      model.append(item);

      const newRow = document.createElement('tr');
      newRow.setAttribute('data-index', index);
      newRow.innerHTML = lineContent(item);

      body.appendChild(newRow);

      render();
    };

    const update = (item, index) => {
      model.splice(index, 1, item);

      const toUpdate = table.querySelector(`tr[data-index=${index}]`);

      toUpdate.innerHTML = '';
      toUpdate.innerHTML = lineContent(item);
    };

    const remove = (index) => {
      model.splice(index, 1);

      const toRemove = table.querySelector(`tr[data-index='${index}']`);

      toRemove.remove();

      render();
    };

    let toReturn = {};

    const getItem = (index) => model[index];

    const setChecklist = (bool) => {
      checklist = bool;

      return toReturn;
    };

    const setActionButtons = (btns) => {
      actionButtons = btns.reverse();

      return toReturn;
    };

    const setActionCallback = (callback) => {
      actionCallback = callback;

      return toReturn;
    };

    const setSource = (url) => {
      source = url;

      return toReturn;
    };

    const onSearchChange = (term) => {
      get(source, queryBuilder(term))
        .then((res) => {
          model = res.map(responseHandler);
          render();
        });
    };

    const setQueryBuilder = (cb) => {
      queryBuilder = cb;

      return toReturn;
    };

    const enableSearch = (bool) => {
      searchEnabled = bool;

      return toReturn;
    };

    const setResponseHandler = (cb) => {
      responseHandler = cb;

      return toReturn;
    };

    const enablePagination = (bool) => {
      paginationEnabled = bool;

      return toReturn;
    };

    const setSearchbarPlaceholder = (ph) => {
      placeholder = ph;

      return toReturn;
    };

    const setItemsPerPage = (num) => {
      itemsPerPage = num;

      return toReturn;
    };

    const setModel = (items) => {
      model = items.map(responseHandler);

      return toReturn;
    };

    const setChecklistCallback = (cb) => {
      checklistCallback = cb;

      return toReturn;
    };

    const getSelectedItems = () => selectedElements;

    const getModel = () => model;

    const removeAll = (indexes = false) => {
      if (!indexes) {
        model = [];
        return;
      }

      const reversedIndexes = [...indexes].sort(
        (a, b) => parseInt(a, 10) - parseInt(b, 10),
      ).reverse();

      reversedIndexes.forEach((item) => {
        remove(item);
      });
    };

    toReturn = {
      element: table,
      add,
      update,
      remove,
      getItem,
      mount,
      setChecklist,
      setActionButtons,
      setActionCallback,
      enableSearch,
      setResponseHandler,
      setQueryBuilder,
      setSource,
      enablePagination,
      setSearchbarPlaceholder,
      setItemsPerPage,
      setModel,
      setChecklistCallback,
      getSelectedItems,
      getModel,
      removeAll,
    };

    return toReturn;
  };

  vcom.tutorial = (config) => {
    let currentStep = -1;

    const mainContainer = document.createElement('div');
    const textHolder = document.createElement('span');
    const btnContainer = document.createElement('div');
    const cancelBtn = document.createElement('button');
    const nextBtn = document.createElement('button');
    const mainContainerWidth = 200;
    const mainContainerMargin = 20;

    mainContainer.classList.add('tip-text');
    cancelBtn.innerText = 'Cancelar';
    nextBtn.innerText = 'Próximo';

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(nextBtn);

    mainContainer.appendChild(textHolder);
    mainContainer.appendChild(btnContainer);


    const cancel = () => {
      currentStep = -1;
      textHolder.innerText = '';

      mainContainer.style.left = `${-99999}px`;
      mainContainer.style.top = `${-99999}px`;
    };

    const next = () => {
      currentStep += 1;

      if (currentStep >= config.length) {
        cancel();
        return;
      }

      const { el } = config[currentStep];
      const pos = el.getBoundingClientRect();

      textHolder.innerText = config[currentStep].text;

      if (pos.x - mainContainerMargin - mainContainerWidth < 0) {
        mainContainer.style.left = `${pos.x + pos.width + mainContainerWidth + mainContainerMargin}px`;
        mainContainer.classList.remove('to-left');
        mainContainer.classList.add('to-right');
      } else {
        mainContainer.style.left = `${pos.x - mainContainerMargin}px`;
        mainContainer.classList.remove('to-right');
        mainContainer.classList.add('to-left');
      }

      mainContainer.style.top = `${pos.y - pos.height / 2}px`;
    };

    cancelBtn.addEventListener('click', cancel);
    nextBtn.addEventListener('click', next);

    document.querySelector('html').appendChild(mainContainer);

    return {
      next,
      cancel,
    };
  };

  vcom.tipText = (el, text, defaultBehavior = true) => {
    let mainContainer;
    const mainContainerMargin = 20;
    const mainContainerWidth = 200;

    const show = () => {
      const pos = el.getBoundingClientRect();

      if (pos.x - mainContainerMargin - mainContainerWidth < 0) {
        mainContainer.style.left = `${pos.x + pos.width + mainContainerWidth + mainContainerMargin}px`;
        mainContainer.classList.remove('to-left');
        mainContainer.classList.add('to-right');
      } else {
        mainContainer.style.left = `${pos.x - mainContainerMargin}px`;
        mainContainer.classList.remove('to-right');
        mainContainer.classList.add('to-left');
      }

      mainContainer.style.top = `${pos.y - pos.height / 2}px`;
    };

    const hide = () => {
      mainContainer.style.left = `${-99999}px`;
      mainContainer.style.top = `${-99999}px`;
    };

    if (defaultBehavior) {
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);
    }

    mainContainer = document.createElement('div');
    mainContainer.classList.add('tip-text');
    mainContainer.classList.add('disabled');

    const textHolder = document.createElement('span');
    textHolder.innerText = text;

    mainContainer.appendChild(textHolder);

    document.querySelector('html').appendChild(mainContainer);

    return {
      show,
      hide,
    };
  };
}(this));
