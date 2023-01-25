// eslint-disable-next-line import/no-unassigned-import
import 'webext-base-css';
import 'chota'
import './options.css';

import optionsStorage from './options-storage.js';

if (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
}

async function init() {
    await optionsStorage.syncForm('#options-form');
    getMessage();
}

function getMessage() {
    document.querySelectorAll('[data-locale]').forEach(elem => {
        elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
    })
}

init();
