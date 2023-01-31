// eslint-disable-next-line import/no-unassigned-import
import 'minstyle.io/dist/css/minstyle.io.min.css'
import './options.css';

import optionsStorage from './options-storage.js';
import { videoQuality } from './videoQuality';

// Dark mode
if (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// Locales
document.querySelectorAll('[data-locale]').forEach(elem => {
    let text = chrome.i18n.getMessage(elem.dataset.locale)
    if (!text) return
    elem.innerText = text
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
 * Video quality stuff
 * TODO: Develope a proper support in fregante/webext-options-sync
 */
const videoQualityOptions = document.getElementById('video_quality')
const forceVideoQuality = document.querySelector('input[name=force_video_quality]')

const generateVideoQualityOptions = (options) => {    
    videoQualityOptions.disabled = !options.force_video_quality

    for (const quality in videoQuality) {
        let option = document.createElement('option')
        option.value = videoQuality[quality]
        option.innerText = videoQuality[quality]
        videoQualityOptions.appendChild(option)
    }

    videoQualityOptions.value = options.video_quality
    videoQualityOptions.addEventListener('change', (event) => {
        event.preventDefault();
        optionsStorage.set({'video_quality': videoQualityOptions.value})
    })

    forceVideoQuality.addEventListener('change', (event) => {
        videoQualityOptions.disabled = !event.currentTarget.checked
    })
}

/**
 * Main function
 * @async
 */
const init = async () => {
    await optionsStorage.syncForm('#options-form');
    let options = await optionsStorage.getAll()

    console.log(options)

    generateVideoQualityOptions(options)
}

init();