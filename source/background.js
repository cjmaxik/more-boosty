// eslint-disable-next-line import/no-unassigned-import
// import './options-storage.js';

chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case "openOptionsPage":
            openOptionsPage()
            break

        default:
            break
    }
})

chrome.runtime.onInstalled.addListener(function (object) {
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        openOptionsPage()
    }
});

function openOptionsPage() {
    chrome.runtime.openOptionsPage()
}