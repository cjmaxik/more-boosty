import optionsStorage from './options-storage.js'
let options
let body
let App
let topMenu

console.log('💈 Content script loaded for', chrome.runtime.getManifest().name)
async function init() {
    options = await optionsStorage.getAll()

    // Instant execution
    if (options.full_layout) {
        full_layout()
    }

    // Deffered execution (via MutationObserver)
    initPage()
}

function initPage() {
    if (options.max_video_quality) {
        // Observer for VK Player
        if (!App) App = document.querySelector('div[class^=App_app_]')
        new MutationObserver(() => {
            max_video_quality()
        }).observe(App, { subtree: true, childList: true })
    }

    if (options.theater_mode) {
        // Stream page
        if (!body) body = document.querySelector('body')
        if (location.href.includes('streams/video_stream')) {
            body.classList.add('MB_stream')
            window.addEventListener("scroll", scrollEvent);
        } else {
            body.classList.remove('MB_stream')
            window.removeEventListener("scroll", scrollEvent);
        }
    }
}

// For Theater Mode
function scrollEvent() {
    let scroll = this.scrollY;

    if (!topMenu) {
        topMenu = document.querySelector('div#topMenu')
    }

    if (scroll >= 1) {
        topMenu.classList.add('MB_scrolled')
    } else {
        topMenu.classList.remove('MB_scrolled')
    }
}

function max_video_quality() {
    const videoPlayer = document.querySelectorAll("vk-video-player:not(.MB_done)")

    if (!videoPlayer) {
        console.error('Cannot find `vk-video-player`, aborting `max_video_quality`')
        return
    }

    videoPlayer.forEach(player => {
        console.log(player)
        const item_quality = player.shadowRoot.querySelectorAll('li.item-quality')
        item_quality[0].click()
        player.classList.add('MB_done')
    });
}

function full_layout() {
    document.querySelector('body').classList.add('MB_active')
}

// Check if URL has changed
let lastUrl = location.href
new MutationObserver(() => {
    const url = location.href

    if (url !== lastUrl) {
        console.log('URL changed!', lastUrl, '->', url)
        lastUrl = url
        initPage()
    }
}).observe(document, { subtree: true, childList: true })

init()
