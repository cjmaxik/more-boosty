import optionsStorage from './options-storage.js'
let options
let body
let App
let topMenu

console.log('💈 Content script loaded for', chrome.runtime.getManifest().name)
async function init() {

    options = await optionsStorage.getAll()

    // document.addEventListener('DOMContentLoaded', () => {
    // Instant execution
    if (options.full_layout) {
        full_layout()
    } else {
        console.log('💈 Full Layout is disabled')
    }

    // Deffered execution (via MutationObserver)
    initPage()
    // })
}

function initPage() {
    // Observer for VK Player
    if (!App) App = document.querySelector('div[class^=App_app_]')
    new MutationObserver(() => {
        prepareVideo()
    }).observe(App, { subtree: true, childList: true })

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
    } else {
        console.log('💈 Theater Mode is disabled')
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

function prepareVideo() {
    const videoPlayer = document.querySelectorAll("vk-video-player:not(.MB_done)")

    if (!videoPlayer) {
        console.error('Cannot find `vk-video-player`, aborting `prepareVideo`')
        return
    }

    videoPlayer.forEach(player => {
        const player_wrapper = player.shadowRoot.querySelector('div.player-wrapper')

        player_wrapper.addEventListener('click', (event) => {
            const player = event.currentTarget.parentElement
            const controls = player.querySelector('div.controls')

            if (document.pictureInPictureEnabled) {
                // PIP Spawn
                const pipButton = `
                    <div class="container controls-element v-1fkqq1h MB_pip">
                        <div role="button" tabindex="0">
                            <svg class="icon v-daygaf" xmlns="http://www.w3.org/2000/svg">
                                <g fill="#fff" fill-rule="evenodd">
                                <path class="_enter" d="M18 11 10 11 10 17 18 17 18 11 18 11ZM22 19 22 4.98C22 3.88 21.1 3 20 3L2 3C.9 3 0 3.88 0 4.98L0 19C0 20.1.9 21 2 21L20 21C21.1 21 22 20.1 22 19L22 19ZM20 19.02 2 19.02 2 4.97 20 4.97 20 19.02 20 19.02Z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="container controls-element v-1fkqq1h"></div>
                `
                controls.lastElementChild.insertAdjacentHTML('beforeBegin', pipButton)

                const newButton = player.querySelector('div.MB_pip')
                newButton.addEventListener('click', pip)
            }

            // Max Video Quality
            if (options.max_video_quality) {
                const item_quality = player.querySelectorAll('li.item-quality')
                item_quality[0].click()
            }
        }, { once: true })

        player.classList.add('MB_done')
    });
}

function pip(event) {
    // TODO: find a better way to query this wrapper
    const playerWrapper = event.currentTarget.parentElement.parentElement.parentElement
    const video = playerWrapper.querySelector('video')

    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
        video.requestPictureInPicture();
    }
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
