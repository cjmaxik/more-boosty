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

  // Add PiP button (for supported browsers)
  if (document.pictureInPictureEnabled) {
    controls.lastElementChild.insertAdjacentHTML('beforeBegin', templates.pipButton())
    player.querySelector('div.MB_pip').addEventListener('click', pip)
  }

  // Add Download button
  controls.lastElementChild.insertAdjacentHTML('beforeBegin', templates.downloadButton())
  player.querySelector('div.MB_download').addEventListener('click', (event) => download(event))

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
 * Operate Download video
 * @private
 * @see {@link prepareVideoPlayer} for event conditions
 * @param {Event} event
 */
const download = async (event) => {
  const playerWrapper = event.currentTarget.parentElement.parentElement.parentElement
  const videoTitle = playerWrapper.querySelector('div.title').textContent
  console.log(videoTitle)

  let postLink = null
  // Check if we are on the post page
  const currentPageUrl = window.location.href
  if (currentPageUrl.indexOf('/posts/') !== -1) {
    // if so, then use post ID from the URL
    postLink = currentPageUrl
  } else {
    // else, use the post ID from the post link (createdAt)
    const postContent = playerWrapper.getRootNode().host.closest('div[class*=Post_container_]')
    postLink = postContent.querySelector('a[class*=CreatedAt_headerLink_]').href
  }

  const postId = postLink.split('/').reverse()[0]
  const blogName = postLink.split('/').reverse()[2]
  console.log('postId', postId, 'blogName', blogName)

  const postData = await getPostContent(postId, blogName)
  console.log('postData', postData)

  const playerUrls = findPlayerUrls(postData, videoTitle)
  console.log('playerUrls', playerUrls)

  const videoLinks = prepareVideoLinks(playerUrls)
  console.log('videoLinks', videoLinks)

  prepareVideoDownloadModal(videoTitle, videoLinks)
}

/**
 * Prepare video download modal
 * @param {String} title
 * @param {Object[]} links
 */
const prepareVideoDownloadModal = (title, links) => {
  document.querySelector('div[class^=App_app_]').insertAdjacentHTML('beforeEnd', templates.videoDownloadModal(title, links))

  const videoDownloadModal = document.querySelector('div#MB_video_download')
  const videoDownloadClose = document.querySelector('span#MB_video_download_close')

  videoDownloadClose.addEventListener('click', (event) => {
    event.preventDefault()
    videoDownloadModal.remove()
  })

  const videoDownloadLinks = videoDownloadModal.querySelectorAll('button.MB_video_download_link')
  for (const link of videoDownloadLinks) {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      videoDownloadModal.remove()
      generateDownloadLink(event)
    })
  }
}

/**
 * Send a message to background script to retrieve post data
 * @param {String} postId
 * @returns {Object}
 */
const getPostContent = async (postId, blogName) => {
  const auth = window.localStorage.getItem('auth')
  const accessToken = JSON.parse(auth).accessToken

  return await chrome.runtime.sendMessage({
    action: 'retrievePostData',
    postId,
    blogName,
    accessToken
  })
}

/**
 * Find suitable video URLs
 * @param {Object[]} postData
 * @param {String} videoTitle
 * @returns {Array|null}
 */
const findPlayerUrls = (postData, videoTitle) => {
  console.log('postData inside', postData)

  for (const data of postData) {
    if (data.type !== 'ok_video') continue
    if (!data.playerUrls) continue

    console.log(data)

    if (data.title === videoTitle) return data.playerUrls
  }

  return null
}

/**
 * Cleans the video links object
 * @param {*} urls
 */
const prepareVideoLinks = (urls) => {
  const videoQuality = [
    'ultra_hd', // 2160p
    'quad_hd', // 1440p
    'full_hd', // 1080p
    'high', // 720p
    'medium', // 480p
    'low', // 360p
    'lowest', // 240p
    'tiny' // 144p
  ]

  const filteredUrls = urls.filter(x =>
    x.url && videoQuality.indexOf(x.type) !== -1
  )

  return filteredUrls.sort(
    ({ type: a }, { type: b }) => videoQuality.indexOf(a) - videoQuality.indexOf(b)
  )
}

/**
 * Generate URL download
 * @param {Event} event
 */
const generateDownloadLink = (event) => {
  const element = event.target
  const url = element.dataset.url
  const title = element.dataset.title

  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.target = '_blank'
  // link.download = title // invalidates the context, do not use!

  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    link.parentNode.removeChild(link)
  }, 100)
}

/**
 * Open options page for the extension
 * @param {Event} event
 */
const openOptionsPage = (event) => {
  event.preventDefault()
  chrome.runtime.sendMessage({ action: 'openOptionsPage' })
}
