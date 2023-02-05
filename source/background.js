import * as Cache from './cache'

// Assets
import iconImage from 'url:./icon.png'

/**
 * Message bus
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.action) {
        case "openOptionsPage":
            openOptionsPage()
            break

        case "retrieveTimestamp": 
            retrieveTimestamp(message.id).then(data => { 
                let timestamp = 0
                if (data && data.data) {
                    timestamp = data.data
                }
                
                sendResponse(timestamp)
            })
            return true

        case "saveTimestamp":
            saveTimestamp(message.id, message.timestamp)
            break

        default:
            break
    }
})

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
const retrieveTimestamp = async (id) => await Cache.read(`t:${id}`)

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
        details.reason === chrome.runtime.OnInstalledReason.UPDATE
        && chrome.runtime.getManifest().version !== details.previousVersion
    ) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: iconImage,
            title: chrome.i18n.getMessage('extension_has_been_updated'),
            message: "",
            contextMessage: "v" + details.previousVersion,
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
});

/**
 * Cache governor
 * Checks for expired cache items every hour
 */
chrome.alarms.clearAll()
chrome.alarms.create('cache-governor', { 
    periodInMinutes: 60
})
chrome.alarms.onAlarm.addListener(Cache.removeExpiredItems)