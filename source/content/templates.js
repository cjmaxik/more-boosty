import safeHTML from 'html-template-tag'

// Assets
import iconImage from 'url:../assets/icon.png'

// Changelog JSON
import changelogText from '../assets/changelog.json'

// Chrome aliases
const t = (name) => chrome.i18n.getMessage(name)
const name = chrome.runtime.getManifest().name
const version = chrome.runtime.getManifest().version

// Checking browser language
let uiLang = chrome.i18n.getUILanguage()
if (uiLang !== 'ru' || uiLang !== 'en') {
  uiLang = 'ru'
}

export const optionsLink = () => `
  <a class="Link_block_f6iQc MiniProfile_link_rQTY2" href="#" id="MB_options"> 
      <div class="DropdownItem_block_EtyZL DropdownItem_blockClickable_hJXfh">
          <div class="ProfileDropdownItem_item_oHFvi">
              <span class="Icon_block_Hvwi5 ProfileDropdownItem_icon_iNRrH">
                  <img src="${iconImage}" class="MB_icon" />
              </span>
              ${t('content_options_link')}
          </div>
      </div>
  </a>
`

export const changelogButton = () => `
  <div class="TopMenu_messageContainer_bwglz append_animate" style="padding-left: 10px;" >
      <a class="TopMenu_messagesContainer_hzgjz" href="#" id="MB_changelog" title="${t('content_about')}">
          <span class="Icon_block_Hvwi5 TopMenu_iconMessages_zy_w6">
              <img src="${iconImage}" style="height: 20px;" />
          </span>
          <span class="TopMenu_messageCaption_s_h7T" style="text-transform: initial;">
              v${version}
          </span>
      </a>
  </div>
`

export const changelogModal = () => `
  <div class="ScrollBox_scrollContainer_g0g0j Popup_wrapper_ZeN1U FadeIn_fade_ecikC FadeIn_entered_uFjQ8 fade_animate" id="MB_changelog_modal">
      <div class="PopupContent_block_P9UTg Popup_block_EdudK">
          <span class="Icon_block_Hvwi5 PopupContent_close_s4F2c" id="MB_changelog_close">
              <svg class="Icon_svg__DRUh"><use xlink:href="#svg-icon-close"></use></svg>
          </span>

          <div class="PopupContent_title_IHD2G">
              <p>
                  <strong>
                      ${name}, v${version}
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
                  <h2>🎉 ${t('changelog_latest_version')}</h2>
                  ${generateChangelogText('latest', uiLang)}
              </div>

              <div>
                  <h3>📒 ${t('changelog_previous_version')}</h3>
                  <i>${generateChangelogText('previous', uiLang)}</i>
              </div>

              <div>
                  <h3>🎵 ${t('changelog_track_of_the_update')}</h3>
                  ${generateChangelogMusicTrack()}
              </div>
          </div>
          
          <div class="Buttons_buttons_BbEpA" style="margin-top: 40px;">
              <a href="https://boosty.to/cjmaxik" rel="noreferref noopener nofollow" target="_blank" class="BaseButton_button_yO8r5 ContainedButton_button_mJG1l ContainedButton_colorDefault_fJta6" style="color: rgb(232, 230, 227);">
                  ${t('options_boosty_link')}
              </a>
              
              <a href="#" id="MB_optionsButton" class="BaseButton_button_yO8r5 OutlinedButton_button_gVLJD">
                  ${t('options_title')}
              </a>
          </div>
      </div>
  </div>
`
export const pipButton = () => `
  <div class="container controls-element v-1fkqq1h MB_pip">
      <div role="button" tabindex="0" title="${t('content_pip')}">
          <svg class="icon v-daygaf" xmlns="http://www.w3.org/2000/svg">
              <g fill="#fff" fill-rule="evenodd">
              <path class="_enter" d="M18 11 10 11 10 17 18 17 18 11 18 11ZM22 19 22 4.98C22 3.88 21.1 3 20 3L2 3C.9 3 0 3.88 0 4.98L0 19C0 20.1.9 21 2 21L20 21C21.1 21 22 20.1 22 19L22 19ZM20 19.02 2 19.02 2 4.97 20 4.97 20 19.02 20 19.02Z"></path>
          </svg>
      </div>
  </div>
  <div class="container controls-element v-1fkqq1h"></div>
`

export const timestampIndicator = (position) => `
  <span class="MB_last_timestamp" style="
      display: block; 
      position: absolute; 
      z-index: 99999; 
      height: 100%; 
      width: 3px; 
      background-color: rgb(174,54,12);
      left: ${position}%;
  "></span>
`

const trackList = (track) => safeHTML`
  <div style="margin-left: 24px;">
      ${track.producer} - <strong>${track.name}</strong></br>
      <a href="${track.youtube}" rel="noreferref noopener nofollow" target="_blank">YouTube</a> | <a href="${track.spotify}" rel="noreferref noopener nofollow" target="_blank">Spotify</a>
  </div>
`

const noChangelog = '<ul><li>🤷</li></ul>'

/**
 * Generates a changelog text from `changelog.json`
 * @see {@link prepareChangelogModal}
 * @param {String} lang `ru` or `en`
 */
const generateChangelogText = (type, lang) => {
  if (changelogText[type] === undefined) return noChangelog
  if (changelogText[type][lang] === undefined) return noChangelog

  let text = '<ul>'
  for (const change of changelogText[type][lang]) {
    text += safeHTML`<li>${change}</li>`
  }
  text += '</ul> '

  return text
}

/**
 * Generates a music track from `changelog.json`
 * @see {@link prepareChangelogModal}
 * @returns {String}
 */
const generateChangelogMusicTrack = () => {
  let track = {
    producer: 'Darude ',
    name: 'Sandstorm',
    youtube: 'https://youtu.be/y6120QOlsfU',
    spotify: 'https://open.spotify.com/track/3dxDj8pDPlIHCIrUPXuCeG?si=188b40ce99aa4592'
  }

  if (changelogText.track) {
    track = changelogText.track
  }

  return trackList(track)
}
