// eslint-disable-next-line import/no-unassigned-import
import 'chota'
import './options.css';

import optionsStorage from './options-storage.js';

// Dark mode
if (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
}

// Locales
document.querySelectorAll('[data-locale]').forEach(elem => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})

// Links
const links = document.getElementsByClassName('openURL')
Array.from(links).forEach((element) => {
    element.addEventListener('click', (event) => {
        event.preventDefault();
        const url = event.target.getAttribute('href')
        if (url) chrome.tabs.create({ url })
    })
})

/**
 * Main function
 * @async
 */
async function init() {
    await optionsStorage.syncForm('#options-form');
}

init();