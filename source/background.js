// Assets
import iconImage from 'url:./icon.png'

chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case "openOptionsPage":
            openOptionsPage()
            break

        default:
            break
    }
})

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

function openOptionsPage() {
    chrome.runtime.openOptionsPage()
}