import * as Cache from '../global/cache.js'
import * as Api from '../global/boostyApi.js'
import * as helpers from '../global/helpers.js'

// Assets
import iconImage from 'url:../assets/icon.png'

/**
 * Message bus
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.action) {
    case 'openOptionsPage':
      openOptionsPage()
      break

    case 'retrieveTimestamp':
      retrieveTimestamp(message.id).then(data => {
        let timestamp = 0
        if (data && data.data) {
          timestamp = data.data
        }

        sendResponse(timestamp)
      })
      return true

    case 'saveTimestamp':
      saveTimestamp(message.id, message.timestamp)
      break

    case 'retrieveContentData':
      retrieveContentData(message.metadata, message.accessToken).then(data => sendResponse(data))
      return true

    default:
      break
  }
})

/**
 * Retrieve content data from Boosty API
 * @param {Object} metadata
 * @param {String} accessToken
 * @returns {Object|null}
 */
const retrieveContentData = async (metadata, accessToken) => {
  let key
  let apiCall

  console.group(`Content data for ${metadata.id}`)
  console.log('Metadata:', metadata)

  switch (metadata.type) {
    case 'post':
      key = `p:${metadata.id}`
      apiCall = Api.blog
      break

    case 'dialog':
      key = `d:${metadata.id}`
      apiCall = Api.dialog
      break

    default:
      return null
  }

  const cachedData = await Cache.read(key)
  if (cachedData) {
    console.log('✅ Retrieving from cache')
    console.groupEnd()
    return cachedData.data
  } else {
    console.log('⚠️ Cache is empty, retrieving from API')
  }

  const data = await apiCall(metadata, accessToken)

  // We need videos only (localStorage is not that big)
  const videos = filterVideos(data, metadata.type)

  // 5 minutes is enough (in case the post was edited)
  Cache.write(key, videos, 5)

  console.log(`✅ ${metadata.id} from API`, videos)
  console.groupEnd()
  return videos
}

/**
 * Returns the filtered post content (only videos)
 * @param {Object[]} data
 * @param {String} type
 * @returns {Object[]|null}
 */
const filterVideos = (data, type) => {
  if (type === 'dialog') {
    data = data.map(message => message.data).flat()
  }

  return data.filter(block => block.type === 'ok_video')
    .map(({ playerUrls, preview }) => {
      const videoUrls = helpers.filterVideoUrls(playerUrls)
      const videoId = helpers.parseVideoId(preview)
      return { videoUrls, videoId }
    })
}

/**
 * Save the current timestamp
 * @param {String} id
 * @param {String} timestamp
 */
const saveTimestamp = async (id, timestamp) => {
  const key = `t:${id}`
  if (timestamp === 0) {
    await Cache.remove(key)
  } else {
    await Cache.write(key, timestamp)
  }
}

/**
 * Retrieve the last timestamp
 * @param {String} id
 * @returns {Object}
 */
const retrieveTimestamp = async (id) => {
  console.group(`Timestamp data for ${id}`)
  const timestamp = await Cache.read(`t:${id}`)
  console.groupEnd()
  return timestamp
}

/**
 * Open options page
 */
const openOptionsPage = () => {
  chrome.runtime.openOptionsPage()
}

/**
 * Install/update listener
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    openOptionsPage()
    return
  }

  if (
    details.reason === chrome.runtime.OnInstalledReason.UPDATE &&
    chrome.runtime.getManifest().version !== details.previousVersion
  ) {
    let notificationID
    chrome.notifications.create({
      type: 'basic',
      iconUrl: iconImage,
      title: chrome.i18n.getMessage('extension_has_been_updated'),
      message: '',
      contextMessage: 'v' + details.previousVersion,
      buttons: [
        {
          title: chrome.i18n.getMessage('changelog')
        }
      ],
      requireInteraction: true,
      silent: true
    }, function (id) {
      notificationID = id
    })

    chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
      if (notifId === notificationID) {
        if (btnIdx === 0) {
          chrome.tabs.create({ url: 'https://boosty.to/cjmaxik#mb_update' })
        }
      }

      chrome.notifications.clear(notificationID)
    })
  }
})

/**
 * Cache governor
 * Checks for expired cache items every hour
 */
chrome.alarms.clearAll()
chrome.alarms.create('cache-governor', {
  periodInMinutes: 60
})
chrome.alarms.onAlarm.addListener(Cache.removeExpiredItems)
