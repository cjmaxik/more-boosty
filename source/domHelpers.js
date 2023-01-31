import safeHTML from 'html-template-tag'

// Assets
import iconImage from 'url:./icon.png'
import changelogText from './changelog.json'

/** @see {@link scrollEvent} */
let topMenu

/** @see {@link injectStreamPageChanges} */
let body

/**
 * Inject options link in user menu
 * @public
 * @param {Node} element 
 */
export const injectOptionsLink = (element) => {
    const dropdownTopBlock = element.querySelector('div[class^=MiniProfile_dropdownTopBlock]')

    if (!dropdownTopBlock) {
        console.error('No dropdownTopBlock?')
        return
    }

    const optionsLinkTemplate = `
        <a class="Link_block_f6iQc MiniProfile_link_rQTY2" href="#" id="MB_options">
            <div class="DropdownItem_block_EtyZL DropdownItem_blockClickable_hJXfh">
                <div class="ProfileDropdownItem_item_oHFvi">
                    <span class="Icon_block_Hvwi5 ProfileDropdownItem_icon_iNRrH">
                        <img src="${iconImage}" class="MB_icon" />
                    </span>
                    ${chrome.i18n.getMessage('content_options_link')}
                </div>
            </div>
        </a>
    `

    // There is no user input for this call, this is safe
    dropdownTopBlock.lastElementChild.insertAdjacentHTML('afterEnd', optionsLinkTemplate)

    const optionsLink = dropdownTopBlock.querySelector('a#MB_options')
    optionsLink.addEventListener('click', openOptionsPage)
}

/**
 * Prepares to inject VK player changes (pip, max quality) using one-time event listener
 * @public
 * @param {Node} element `vk-video-player` node
 * @param {OptionsSync.UserOptions} options Extension options
 */
export const injectVkPlayerChanges = (element, options) => {
    const player_wrapper = element.shadowRoot.querySelector('div.player-wrapper')
    player_wrapper.addEventListener('click', (event) => {
        prepareVideoPlayer(event, options)
    }, { once: true })
}

/**
 * Inject extension icon in top menu on the left
 * @public
 * @param {Node} element top menu left element
 */
export const injectIconInTopMenu = (element) => {
    const changelogButtonTemplate = `
            <div class="TopMenu_messageContainer_bwglz append_animate" style="padding-left: 10px;" >
                <a class="TopMenu_messagesContainer_hzgjz" href="#" id="MB_changelog" title="${chrome.i18n.getMessage('content_about')}">
                    <span class="Icon_block_Hvwi5 TopMenu_iconMessages_zy_w6">
                        <img src="${iconImage}" style="height: 20px;" />
                    </span>
                    <span class="TopMenu_messageCaption_s_h7T" style="text-transform: initial;">
                        v${chrome.runtime.getManifest().version}
                    </span>
                </a>
            </div>
        `

    element.lastElementChild.insertAdjacentHTML('afterEnd', changelogButtonTemplate)

    const changelogButton = element.querySelector('a#MB_changelog')
    changelogButton.addEventListener('click', (event) => {
        event.preventDefault()
        prepareChangelogModal()
    })
}

/**
 * Prepare changelog modal
 * @private
 */
const prepareChangelogModal = () => {
    let uiLang = chrome.i18n.getUILanguage()
    if (uiLang !== 'ru' || uiLang !== 'en') {
        uiLang = 'ru'
    }

    const changelogModalTemplate = `
        <div class="ScrollBox_scrollContainer_g0g0j Popup_wrapper_ZeN1U FadeIn_fade_ecikC FadeIn_entered_uFjQ8 fade_animate" id="MB_changelog_modal">
            <div class="PopupContent_block_P9UTg Popup_block_EdudK">
                <span class="Icon_block_Hvwi5 PopupContent_close_s4F2c" id="MB_changelog_close">
                    <svg class="Icon_svg__DRUh"><use xlink:href="#svg-icon-close"></use></svg>
                </span>

                <div class="PopupContent_title_IHD2G">
                    <p>
                        <strong>
                            ${chrome.runtime.getManifest().name}, v${chrome.runtime.getManifest().version}
                        </strong>
                    </p>

                    <p>
                        <small>
                            Created by <a href="https://cjmaxik.ru" rel="noreferref noopener nofollow" target="_blank">CJMAXiK</a>
                        </small>
                    </p>
                </div>

                <div class="PopupContent_content_A2EA3">
                    <div>
                        <h2>${chrome.i18n.getMessage('changelog_latest_version')}</h2>
                        ${generateChangelogText('latest', uiLang)}
                    </div>

                    <div>
                        <h3>${chrome.i18n.getMessage('changelog_previous_version')}</h3>
                        <i>${generateChangelogText('previous', uiLang)}</i>
                    </div>

                    <div>
                        <h3>${chrome.i18n.getMessage('changelog_track_of_the_update')}</h3>
                        ${generateChangelogMusicTrack()}
                    </div>
                </div>
                
                <div class="Buttons_buttons_BbEpA" style="margin-top: 40px;">
                    <a href="https://boosty.to/cjmaxik" rel="noreferref noopener nofollow" target="_blank" class="BaseButton_button_yO8r5 ContainedButton_button_mJG1l ContainedButton_colorDefault_fJta6" style="color: rgb(232, 230, 227);">
                        ${chrome.i18n.getMessage('options_boosty_link')}
                    </a>
                    
                    <a href="#" id="MB_optionsButton" class="BaseButton_button_yO8r5 OutlinedButton_button_gVLJD">
                        ${chrome.i18n.getMessage('options_title')}
                    </a>
                </div>
            </div>
        </div>
    `

    document.querySelector('div[class^=App_app_]').insertAdjacentHTML('beforeEnd', changelogModalTemplate)

    const changelogModal = document.querySelector('div#MB_changelog_modal')
    const changelogClose = document.querySelector('span#MB_changelog_close')

    changelogClose.addEventListener('click', (event) => {
        event.preventDefault()
        changelogModal.remove()
    })

    const optionsButton = changelogModal.querySelector('a#MB_optionsButton')
    optionsButton.addEventListener('click', openOptionsPage)
}

/**
 * Generates a changelog text from `changelog.json`
 * @see {@link prepareChangelogModal}
 * @param {String} lang `ru` or `en`
 */
const generateChangelogText = (type, lang) => {
    if (changelogText[type] === undefined) return "<ul><li>🤷</li></ul>"
    if (changelogText[type][lang] === undefined) return "<ul><li>🤷</li></ul>"

    let text = '<ul>'
    for (const change of changelogText[type][lang]) {
        text += safeHTML`<li>${change}</li>`
    }
    text += '</ul>'

    return text
}

/**
 * Generates a music track from `changelog.json`
 * @see {@link prepareChangelogModal}
 * @returns {String}
 */
const generateChangelogMusicTrack = () => {
    const template = (track) => safeHTML`
        <div style="margin-left: 20px;">
            ${track.producer} - <strong>${track.name}</strong></br>
            <a href="${track.youtube}" rel="noreferref noopener nofollow" target="_blank">YouTube</a> | <a href="${track.spotify}" rel="noreferref noopener nofollow" target="_blank">Spotify</a>
        </div>
    `

    let track = {
        "producer": "Darude",
        "name": "Sandstorm",
        "youtube": "https://youtu.be/y6120QOlsfU",
        "spotify": "https://open.spotify.com/track/3dxDj8pDPlIHCIrUPXuCeG?si=188b40ce99aa4592"
    }

    if (changelogText.track) {
        track = changelogText.track
    }

    return template(track)
}

/**
 * Inject classes for widescreen layout
 * @public
 */
export const injectFullLayout = () => {
    document.querySelector('body').classList.add('MB_active')
}

/**
 * Inject stream page stuff
 * @param {Node} element 
 * @public
 */
export const injectStreamPageChanges = (enabled) => {
    if (!body) body = document.querySelector('body')

    if (enabled) {
        body.classList.add('MB_stream')
        window.addEventListener("scroll", scrollEvent);
    } else {
        body.classList.remove('MB_stream')
        window.removeEventListener("scroll", scrollEvent);
    }
}

/**
 * Scroll event for stream page
 * @private
 */
const scrollEvent = () => {
    if (!topMenu) topMenu = document.querySelector('div#topMenu')

    let scroll = window.scrollY;
    if (scroll >= 1) {
        topMenu.classList.add('MB_scrolled')
    } else {
        topMenu.classList.remove('MB_scrolled')
    }
}

/**
 * Actually inject VK player changes (pip, max quality)
 * @private
 * @see {@link injectVkPlayerChanges} for event conditions
 * @param {Event} event 
 * @param {OptionsSync.UserOptions} options Extension options
 */
const prepareVideoPlayer = (event, options) => {
    const player = event.currentTarget.parentElement
    const controls = player.querySelector('div.controls')

    if (document.pictureInPictureEnabled) {
        // PIP Spawn
        const pipButton = `
                <div class="container controls-element v-1fkqq1h MB_pip">
                    <div role="button" tabindex="0" title="${chrome.i18n.getMessage('content_pip')}">
                        <svg class="icon v-daygaf" xmlns="http://www.w3.org/2000/svg">
                            <g fill="#fff" fill-rule="evenodd">
                            <path class="_enter" d="M18 11 10 11 10 17 18 17 18 11 18 11ZM22 19 22 4.98C22 3.88 21.1 3 20 3L2 3C.9 3 0 3.88 0 4.98L0 19C0 20.1.9 21 2 21L20 21C21.1 21 22 20.1 22 19L22 19ZM20 19.02 2 19.02 2 4.97 20 4.97 20 19.02 20 19.02Z"></path>
                        </svg>
                    </div>
                </div>
                <div class="container controls-element v-1fkqq1h"></div>
            `

        // There is no user input for this call, this is safe
        controls.lastElementChild.insertAdjacentHTML('beforeBegin', pipButton)
        player.querySelector('div.MB_pip').addEventListener('click', pip)
    }

    // Force Video Quality
    if (options.force_video_quality) forceVideoQuality(player, options.video_quality)
}

/**
 * Force video quality
 * @see {@link prepareVideoPlayer}
 * @param {Node} player
 * @param {String} video_quality
 */
const forceVideoQuality = (player, video_quality) => {
    const item_quality = player.querySelectorAll('li.item-quality')
    for (const quality of item_quality) {
        if (quality.dataset.value === video_quality) {
            quality.click()
            break
        }

        item_quality[0].click()
    }
}

/**
 * Operate Picture-in-picture
 * @private
 * @see {@link prepareVideoPlayer} for event conditions
 * @param {Event} event 
 */
const pip = (event) => {
    const playerWrapper = event.currentTarget.parentElement.parentElement.parentElement
    const video = playerWrapper.querySelector('video')

    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
        video.requestPictureInPicture();
    }
}

/**
 * Open options page for the extension
 * @param {Event} event 
 */
const openOptionsPage = (event) => {
    event.preventDefault()
    chrome.runtime.sendMessage({ "action": "openOptionsPage" })
}