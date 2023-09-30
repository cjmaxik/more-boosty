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

export const changelogButton = () => `
  <div class="TopMenu_messageContainer_bwglz MB_changelogButton append_animate">
      <a class="TopMenu_messagesContainer_hzgjz" href="#" id="MB_changelog" title="${t('content_about')}">
          <span class="Icon_block_Hvwi5 TopMenu_iconMessages_zy_w6">
              <img src="${iconImage}" class="MB_icon"/>
          </span>
          <span class="TopMenu_messageCaption_s_h7T" style="text-transform: initial;">
              v${version}
          </span>
      </a>
  </div>
`

export const changelogModal = () => `
  <div class="ScrollBox_scrollContainer_g0g0j Popup_wrapper_ZeN1U FadeIn_fade_ecikC FadeIn_entered_uFjQ8 MB_changelogModal fade_animate" id="MB_changelog_modal" style="z-index: 99999999;">
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
                      Created by <a href="https://cjmaxik.ru?ref=more_boosty" rel="noreferref noopener nofollow" target="_blank">CJMAXiK</a>
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

          <div class="ChangePhone_buttons_vP_uE Buttons_root_X0BDd">
              <a href="https://boosty.to/cjmaxik?ref=more_boosty" rel="noreferref noopener nofollow" target="_blank" class="BaseButton_button_yO8r5 ContainedButton_button_mJG1l ContainedButton_colorDefault_fJta6">
                  ${t('options_boosty_link')}
              </a>

              <a href="#" id="MB_optionsButton" class="BaseButton_button_yO8r5 OutlinedButton_button_gVLJD">
                  ${t('options_title')}
              </a>
          </div>
      </div>
  </div>
`

export const videoDownloadModal = (links) => `
<div class="ScrollBox_scrollContainer_g0g0j Popup_wrapper_ZeN1U FadeIn_fade_ecikC FadeIn_entered_uFjQ8 fade_animate" id="MB_video_download" style="z-index: 99999999;">
  <div class="PopupContent_block_P9UTg Popup_block_EdudK">
      <span class="Icon_block_Hvwi5 PopupContent_close_s4F2c" id="MB_video_download_close">
          <svg class="Icon_svg__DRUh"><use xlink:href="#svg-icon-close"></use></svg>
      </span>

      <div class="PopupContent_title_IHD2G">
          <p>
              <strong>
                  ${t('download_video_modal_title')}:
              </strong>
          </p>
      </div>

      <div class="PopupContent_content_A2EA3 MB_videoLinks" style="display: grid !important;">
          ${generateVideoDownloadLinks(links)}
      </div>
  </div>
</div>
`

export const pipButton = () => `
  <div class="container controls-element-indent-right v-1fkqq1h MB_pip" style="cursor: pointer">
      <div role="button" tabindex="0" title="${t('content_pip')}">
          <svg class="icon v-daygaf" xmlns="http://www.w3.org/2000/svg">
              <g fill="#fff" fill-rule="evenodd">
              <path class="_enter" d="M18 11 10 11 10 17 18 17 18 11 18 11ZM22 19 22 4.98C22 3.88 21.1 3 20 3L2 3C.9 3 0 3.88 0 4.98L0 19C0 20.1.9 21 2 21L20 21C21.1 21 22 20.1 22 19L22 19ZM20 19.02 2 19.02 2 4.97 20 4.97 20 19.02 20 19.02Z"></path>
          </svg>
      </div>
  </div>
  <div class="container controls-element v-1fkqq1h"></div>
`
export const downloadButton = () => `
  <div class="container controls-element v-1fkqq1h MB_download" style="cursor: pointer">
      <div role="button" tabindex="0" title="${t('content_download')}">
          <svg class="icon v-daygaf" xmlns="http://www.w3.org/2000/svg">
              <g fill="#fff" fill-rule="evenodd">
              <path class="_enter" d="M5 21H19V19H5M19 10H15V3H9V10H5L12 17 19 10Z"></path>
          </svg>
      </div>
  </div>
  <div class="container controls-element v-1fkqq1h"></div>
`

export const audioDownloadButton = (url) => `
  <div class="AudioPlayer_header_JEUAU">
    <button
      class="Link_block_f6iQc AudioPlayer_link_juPqV MB_audio_download"
      style="background-color: initial !important; cursor: pointer !important;"
      data-url="${url}"
    >
      <span class="Icon_block_Hvwi5 AudioPlayer_iconDownload_wqoN1 Messages_audioPlayerIconDownload_A3oqM">
        <svg class="Icon_svg__DRUh">
          <use xlink:href="#svg-icon-download">
          </use>
        </svg>
      </span>
    </button>
  </div>
`

export const audioSpeedController = (initialPlaybackRate) =>
`
  <div class="AudioPlayer_header_JEUAU MB_audio_speed_controller">
    <button class="Link_block_f6iQc MB_audio_speed_decrease"
      style="background-color: initial !important; cursor: pointer !important; padding: 0;">
    <span class="Icon_block_Hvwi5" style="height:20px; width:20px; margin:0 !important">
      <svg class="Icon_svg__DRUh">
        <path fill-rule="evenodd" d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z"/>
      </svg>
    </span>
    </button>

    <span class="Icon_block_Hvwi5 Current_Playback_Rate"
      style="background-color: initial !important; cursor: pointer !important; min-width:2.7em; max-width:2.5em;">
      x${initialPlaybackRate}
    </span>

    <button class="Link_block_f6iQc MB_audio_speed_increase"
      style="background-color: initial !important; cursor: pointer !important;padding:0;">
      <span class="Icon_block_Hvwi5" style="height:20px; width:20px; margin:0 !important">
        <svg class="Icon_svg__DRUh">
          <use xlink:href="#svg-icon-plus-default">
          </use>
        </svg>
      </span>
    </button>
  </div>
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

const trackList = (track) => {
  const trackLink = (track) => safeHTML`
   <a href="${track.link}" rel="noreferref noopener nofollow" target="_blank">${track.name}</a>
  `

  let links = ''
  track.links.forEach((link, key, array) => {
    links += trackLink(link)
    if (!Object.is(array.length - 1, key)) links += ' | '
  })

  return `
    <div style="margin-left: 24px;">
        ${track.producer} - <strong>${track.name}</strong></br>
        ${links}
    </div>
  `
}

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
    producer: 'Darude',
    name: 'Sandstorm',
    links: [
      {
        name: 'YouTube',
        link: 'https://youtu.be/y6120QOlsfU?ref=more_boosty'
      },
      {
        name: 'Spotify',
        link: 'https://open.spotify.com/track/3dxDj8pDPlIHCIrUPXuCeG?si=188b40ce99aa4592?ref=more_boosty'
      }
    ]
  }

  if (changelogText.track) {
    track = changelogText.track
  }

  return trackList(track)
}

/**
 * Gererates a video download buttons for the modal
 * @param {Object[]} urls
 * @returns
 */
const generateVideoDownloadLinks = (urls) => {
  let text = ''
  for (const url of urls) {
    text += safeHTML`<button data-url="${url.url}" class="MB_video_download_link BaseButton_button_yO8r5 OutlinedButton_button_gVLJD">
      ${t(`video_quality_${url.type}`)}
    </button>`
  }

  return text
}
