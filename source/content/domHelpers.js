import * as templates from './templates.js'

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

  // There is no user input for this call, this is safe
  dropdownTopBlock.lastElementChild.insertAdjacentHTML('afterEnd', templates.optionsLink())

  const optionsLink = dropdownTopBlock.querySelector('a#MB_options')
  optionsLink.addEventListener('click', openOptionsPage)
}

/**
 * Prepares to inject VK player changes using one-time event listener
 * @public
 * @param {Node} element `vk-video-player` node
 * @param {OptionsSync.UserOptions} options Extension options
 */
export const injectVkPlayerChanges = (element, options) => {
  const playerWrapper = element.shadowRoot.querySelector('div.player-wrapper')

  playerWrapper.addEventListener('click', (event) => {
    prepareVideoPlayer(event, options)
  }, { once: true })
}

/**
 * Prepares to inject audio player changes using one-time event listeners
 * @public
 * @param {Node} element player node
 * @param {OptionsSync.UserOptions} options Extension options
 * @returns
 */
export const injectAudioPlayerChanges = (element, options) => {
  if (!options.save_last_timestamp) return

  lastAudioTimestamp(element, options)
}

/**
 * Inject extension icon in top menu on the left
 * @public
 * @param {Node} element top menu left element
 */
export const injectIconInTopMenu = (element) => {
  element.lastElementChild.insertAdjacentHTML('afterEnd', templates.changelogButton())

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
  document.querySelector('div[class^=App_app_]').insertAdjacentHTML('beforeEnd', templates.changelogModal())

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
    window.addEventListener('scroll', scrollEvent)
  } else {
    body.classList.remove('MB_stream')
    window.removeEventListener('scroll', scrollEvent)
  }
}

/**
 * Scroll event for stream page
 * @private
 */
const scrollEvent = () => {
  if (!topMenu) topMenu = document.querySelector('div#topMenu')

  const scroll = window.scrollY
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
    // There is no user input for this call, this is safe
    controls.lastElementChild.insertAdjacentHTML('beforeBegin', templates.pipButton())
    player.querySelector('div.MB_pip').addEventListener('click', pip)
  }

  // Force Video Quality
  if (options.force_video_quality) forceVideoQuality(player, options.video_quality)

  // Save Timestamp
  if (options.save_last_timestamp) lastVideoTimestamp(player, options)
}

/**
 * Save/retrieve the last timestamp for the video
 * @param {Node} player
 * @param {OptionsSync.UserOptions} options
 */
const lastVideoTimestamp = (player, options) => {
  const video = player.querySelector('video')

  playContentEvent(video, player)
}

/**
 * Save/retrieve the last timestamp for the audio
 * @param {Node} player
 * @param {OptionsSync.UserOptions} options
 */
const lastAudioTimestamp = (player, options) => {
  const audio = player.querySelector('audio')

  playContentEvent(audio, player)
}

/**
 * Inject play event for timestamps
 * @param {Node} element
 */
const playContentEvent = (element, player) => {
  element.addEventListener('play', (event) => contentIsLoaded(event, player), { once: true })
}

/**
 * Generate a last timestamp indicator for a video
 * @param {Node} player
 * @param {Number} duration
 * @param {Number} timestamp
 */
const injectSavedTimestampIndicator = (player, duration, timestamp) => {
  const position = timestamp * 100 / duration
  const template = templates.timestampIndicator(position)
  const bars = player.querySelector('div.bars')

  bars.insertAdjacentHTML('beforeEnd', template)
}

/**
 * Save the current audio/video timestamp
 * @param {Event} content Event
 * @param {Node} content Audio/video element
 * @param {Number} [timeout=10] Timeout (in seconds)
 */
const contentIsLoaded = async (event, player, timeout = 10) => {
  const content = event.currentTarget
  const contentID = getContentID(content)
  if (contentID === undefined) {
    console.error('Cannot find a content ID for', content)
  }
  if (content.duration <= 180) return

  const savedTimestamp = await retrieveTimestamp(contentID)
  if (savedTimestamp) {
    content.currentTime = savedTimestamp
    if (content.tagName === 'VIDEO') injectSavedTimestampIndicator(player, content.duration, savedTimestamp)
  }

  let timeToSave = true
  let previouslySavedTimestamp = 0
  content.addEventListener('timeupdate', async (event) => {
    if (!timeToSave) return

    let currentTimestamp = event.target.currentTime
    if (
      // First one minute of the content
      currentTimestamp <= 60 ||
      // Last one minute of the content
      content.duration - currentTimestamp <= 60
    ) {
      // Ignore this video
      currentTimestamp = 0
    };

    // Disable the function call
    timeToSave = false
    if (
      // Prevents useless caching right after starts playing
      currentTimestamp !== savedTimestamp &&
      // Prevents useless caching when timestamp has not changed (pause, ignored)
      currentTimestamp !== previouslySavedTimestamp
    ) {
      saveTimestamp(contentID, currentTimestamp)
      previouslySavedTimestamp = currentTimestamp
    }

    // Throttle 'timeupdate' event call to once in 10 seconds
    /* eslint-disable no-return-assign */
    setTimeout(() => timeToSave = true, 10000)
  })
}

/**
 * Send a message to background script to retrieve timestamp
 * @param {String} id
 * @returns {Number}
 */
const retrieveTimestamp = async (id) => {
  return await chrome.runtime.sendMessage({
    action: 'retrieveTimestamp',
    id
  })
}

/**
 * Send a message to background script to save timestamp
 * @param {String} id
 * @param {Number} timestamp
 */
const saveTimestamp = (id, timestamp) => {
  chrome.runtime.sendMessage({
    action: 'saveTimestamp',
    id,
    timestamp
  })
}

/**
 * Retrieves an ID for the audio/video element
 * @param {Node} element
 * @returns
 */
const getContentID = (element) => {
  const contentURL = new URL(element.getAttribute('src'))

  switch (element.tagName) {
    case 'AUDIO':
      return contentURL.pathname.replace('/audio/', '')

    case 'VIDEO':
      return contentURL.searchParams.get('id')
  }

  return undefined
}

/**
 * Force video quality
 * @see {@link prepareVideoPlayer}
 * @param {Node} player
 * @param {String} videoQuality
 */
const forceVideoQuality = (player, videoQuality) => {
  const itemQuality = player.querySelectorAll('li.item-quality')
  for (const quality of itemQuality) {
    if (quality.dataset.value === videoQuality) {
      quality.click()
      break
    }

    itemQuality[0].click()
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
    document.exitPictureInPicture()
  } else if (document.pictureInPictureEnabled) {
    video.requestPictureInPicture()
  }
}

/**
 * Open options page for the extension
 * @param {Event} event
 */
const openOptionsPage = (event) => {
  event.preventDefault()
  chrome.runtime.sendMessage({ action: 'openOptionsPage' })
}
