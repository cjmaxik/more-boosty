import optionsStorage from '../global/options-storage.js'
import * as domHelpers from './domHelpers.js'

// Classes and tag names
const optionsInMenuBaseClass = 'MiniProfile_dropdownContainer_'
const topMenuLeftBaseClass = 'TopMenu_left_'
const streamPageBaseClass = 'StreamPage_block_'
const vkVideoPlayerElement = 'vk-video-player'
const audioPlayerElement = 'AudioBlock_root_'

// Global variables
let options
let theaterMode = false

/**
 * Main function
 * @async
 */
const main = async () => {
  options = await optionsStorage.getAll()

  // 1. Permanent changes

  // Inject extension icon to the top left menu
  const topMenuLeft = document.querySelector(`div[class*=${topMenuLeftBaseClass}]`)
  domHelpers.injectIconInTopMenu(topMenuLeft)

  if (location.hash && location.hash.includes('mb_update')) {
    location.href = '#'

    const changelogButton = document.querySelector('a#MB_changelog')
    changelogButton.click()
  }

  // Inject VK video player changes (if loaded directly)
  const videoPlayer = document.querySelectorAll(vkVideoPlayerElement)
  for (const player of videoPlayer) {
    domHelpers.injectVkPlayerChanges(player, options)
  }

  // Inject audio player changes (if loaded diretly)
  const audioPlayer = document.querySelectorAll(`div[class*=${audioPlayerElement}]`)
  for (const player of audioPlayer) {
    domHelpers.injectAudioPlayerChanges(player, options)
  }

  // Inject stream page stuff (if loaded directly)
  if (options.theater_mode && !theaterMode) {
    const streamPageBlock = document.querySelector(`div[class*=${streamPageBaseClass}]`)

    if (streamPageBlock) {
      domHelpers.injectStreamPageChanges(true)
      theaterMode = true
    }
  }

  // Apply widescreen layout (if enabled)
  if (options.full_layout) domHelpers.injectFullLayout()

  // 2. Dynamic changes
  const observer = new MutationObserver((mutations, _observer) => {
    try {
      for (const mutation of mutations) {
        // Checking added elements
        for (const node of mutation.addedNodes) {
          // 1. Checking for whole elements

          // Inject VK video player changes
          if (node.tagName === vkVideoPlayerElement.toUpperCase()) {
            domHelpers.injectVkPlayerChanges(node, options)
            continue
          }

          // 2. Checking for classes only
          if (!node.classList || !node.classList.length) continue
          const classes = node.classList.value

          // Inject VK audio player changes
          if (classes.includes(audioPlayerElement)) {
            domHelpers.injectAudioPlayerChanges(node, options)
            continue
          }

          // Inject extension options link to the menu
          if (classes.includes(optionsInMenuBaseClass)) {
            domHelpers.injectOptionsLink(node)
            continue
          }

          // Inject stream page stuff
          if (classes.includes('StreamPage_block_') && options.theater_mode && !theaterMode) {
            domHelpers.injectStreamPageChanges(true)
            theaterMode = true
          }
        }

        // Checking removed elements
        for (const node of mutation.removedNodes) {
          // 1. Checking for classes only
          if (!node.classList || !node.classList.length) continue
          const classes = node.classList.value

          if (classes.includes('StreamPage_block_') && options.theater_mode && theaterMode) {
            domHelpers.injectStreamPageChanges(false)
            theaterMode = false
          }
        }
      }
    } catch (error) {
      console.log('uncaught mutation error', error)
    }
  })

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true
  })
}

console.log('💈 Content script loaded for', chrome.runtime.getManifest().name)
main()
