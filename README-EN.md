# Extension is no longer supported

# ![logo](source/assets/icon24.png)ore Boosty

> **More Boosty** is a browser extention which improves interface and functions of crowdfunding platform [Boosty](https://boosty.to)

## [--> Support the project on VK.com <--](https://vk.com/donut/iamcjmaxik?ref=more_boosty)

[README на Русском](./README.md)

# Features

* Widescreen page layout
* Force video quality *(for Boosty player)*
* Picture-in-picture *(for Boosty player)*
* Download video *(for Boosty player)*
* Save where you left off video/audio *(for Boosty players)*
* Theater mode for streams

> Screenshots - *see Installation page*

# Installation

**Click [here][1], then click "Add to Chrome"**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kpcbalinpdhnlgonfoflhflnfgcbffbl?color=red&label=Latest+version&logo=google-chrome&logoColor=red&style=for-the-badge)][1]

> * Developed and tested for **Google Chrome**
> * Can be installed on any Chromium browser - Opera (GX), Vivaldi, etc.
> * In Microsoft Edge, click "Allow extensions from other stores" fisrt (is asked)

### Firefox version when?

There are currently no plans to support Firefox.

1. Firefox does not support some crucial functions *(PiP API and background service workers)*.
2. Partial support will require an extensive tooling changes.
3. There is no demand for the Firefox version.

## Honorable mentions

* [fregante](https://github.com/fregante)

* Boosty chat for [StopGame.ru](https://boosty.to/stopgame)

---

# For developers

[![Latest release](https://img.shields.io/github/v/release/cjmaxik/more-boosty?label=Latest+release&logo=github&style=for-the-badge)][2]

## Notes for official releases

* Extension is built and published via [Github Actions](./.github/workflows/release.yml)

* Extension version - build date formatted as `YEAR.MONTH.DAY`

## Manual build

1. Download [latest release][2] or the whole repository
2. Install Node.js (required version in [package.json](./package.json))
3. Install all dependencies

```js
npm install
```

4. Build the extension

```js
npm run build
```

5. Extension files are in `distribution` folder

> Extension version will be `0.0.0`

## Hot-reload for development (HMR)

1. Start the development server

```js
npm run watch
```

2. *(first time)* [Load](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) the unpacked extension from `distribution` folder
3. *(if not)* [Reload](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#reload) the extension manually
4. Open Boosty website in a new tab

### Please note

* [Background service worker](./source/background/background.js) hot-reloads as usual
  * Might require a page reload for content script

* [Content script](./source/content/content.js) requires a page reload
* [Options page](./source/options/options.html) requires a page or extension reload
* Assets (changelog icons) require an extension reload

[1]: https://chrome.google.com/webstore/detail/more-boosty/kpcbalinpdhnlgonfoflhflnfgcbffbl
[2]: https://github.com/cjmaxik/more-boosty/releases
