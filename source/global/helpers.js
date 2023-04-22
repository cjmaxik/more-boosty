/**
 * List of supported video quality on Boosty
 */
export const videoQuality = [
  'ultra_hd', // 2160p
  'quad_hd', // 1440p
  'full_hd', // 1080p
  'high', // 720p
  'medium', // 480p
  'low', // 360p
  'lowest', // 240p
  'tiny' // 144p
]

/**
 * Returns a sorted filtered list of video URLs (non-empty with type from videoQuality)
 * @see {@link videoQuality} for the links of types
 * @param {Object[]} urls
 * @returns {Object[]}
 */
export const filterVideoUrls = (urls) => {
  return urls.filter(x =>
    x.url && videoQuality.indexOf(x.type) !== -1
  ).sort(
    ({ type: a }, { type: b }) => videoQuality.indexOf(a) - videoQuality.indexOf(b)
  )
}

/**
 * Returns a video ID from preview link
 * @param {String} url
 * @returns {String}
 */
export const parseVideoId = (url) => {
  url = new URL(url)

  if (url.pathname.includes('videoPreview')) {
    console.log(url)
    return url.searchParams.get('id')
  }

  if (url.hostname.includes('images.boosty.to')) {
    return url.pathname.split('/').reverse()[0]
  }
}
