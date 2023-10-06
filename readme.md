# ![logo](source/assets/icon24.png)ore Boosty

> **More Boosty** - это браузерное расширение, улучшающее интерфейс и функции краудфандинговой платформы [Boosty](https://boosty.to) (Бусти)

## [--> Поддержать проект через VK Donut <--](https://vk.com/donut/iamcjmaxik?ref=more_boosty)

[README in English](./README-EN.md)

# Возможности

* Широкоформатный режим страниц
* Принудительное изменение качества видео на желаемое *(для плеера Boosty)*
* Картинка-в-картинке *(для плеера Boosty)*
* Скачивание видео *(для плеера Boosty)*
* Сохранение момента, на котором закончил видео/аудио *(для плееров Boosty)*
* Режим кинотеатра для стримов

> Скриншоты - *на странице установки*

# Установка

**Перейди [по этой ссылке][1] и нажми "Добавить в Chrome"**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kpcbalinpdhnlgonfoflhflnfgcbffbl?color=red&label=%D0%B0%D0%BA%D1%82%D1%83%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F%20%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F&logo=google-chrome&logoColor=red&style=for-the-badge)][1]

> * Разрабатывалось и тестировалось для **Google Chrome**
> * Устанавливается в любой браузер на базе Chromium - Яндекс Браузер, Opera (GX), Vivaldi и т.д.
> * В Microsoft Edge сначала нажми "Разрешить расширения из других магазинов" (если спросит)

### Когда версия для Firefox?

На данный момент **версия для Firefox не планируется**.

1. Firefox не поддерживает некоторые важные функции расширения *(PiP API и background service workers)*.
2. Для частичной поддержки потребуется сильно изменить рабочий процесс.
3. Нет спроса на версию для Firefox.

## Благодарности

* [fregante](https://github.com/fregante)

* Бусти-чат [StopGame.ru](https://boosty.to/stopgame)

---

# Для разработчиков

[![Свежий релиз](https://img.shields.io/github/v/release/cjmaxik/more-boosty?label=%D1%81%D0%B2%D0%B5%D0%B6%D0%B8%D0%B9%20%D1%80%D0%B5%D0%BB%D0%B8%D0%B7&logo=github&style=for-the-badge)][2]

## Особенности официальной сборки

* Расширение собирается и публикуется через [Github Actions](./.github/workflows/release.yml)

* Версия расширения - дата сборки в формате `год.месяц.день`

## Сборка расширения вручную

1. Скачай [свежий релиз](https://github.com/cjmaxik/more-boosty/releases) либо весь репозиторий
2. Установи Node.js (нужная версия - в [package.json](./package.json))
3. Установи все зависимости

```js
npm install
```

4. Запусти сборку расширения

```js
npm run build
```

5. Файлы расширения появятся в папке `distribution`

> Версия расширения будет `0.0.0`

## Hot-reload для разработки (HMR)

1. Запусти сервер разработки

```js
npm run watch
```

2. *(если впервые)* [Загрузи](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) распакованное расширение из папки `distribution`
3. *(если нет)* [Обнови](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#reload) расширение вручную
4. Открой сайт Бусти в новой вкладке

### Обрати внимание

* [Background page (service worker)](./source/background/background.js) перезагружается как положено
  * Может потребоваться обновление страницы для корректной работы content script

* [Content script](./source/content/content.js) требует ручного обновления страницы
* [Страница параметров](./source/options/options.html) требует ручного обновления страницы или расширения
* Ассеты (changelog, иконки) требуют ручного обновления расширения

[1]: https://chrome.google.com/webstore/detail/more-boosty/kpcbalinpdhnlgonfoflhflnfgcbffbl
[2]: https://github.com/cjmaxik/more-boosty/releases
