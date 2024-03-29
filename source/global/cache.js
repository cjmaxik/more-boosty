const STORAGE = chrome.storage.local
const DEFAULT_TIMEOUT = 24 * 60 * 7

/**
 * Write to the cache
 * @public
 * @param {String} key Cache key
 * @param {Object} data Data to write
 * @param {Number} [timeout=10080] Timeout (in minutes)
 */
export const write = async (key, data, timeout = DEFAULT_TIMEOUT) => {
  timeout = generateTimeout(timeout)

  await STORAGE.set({
    [key]: {
      data,
      timeout
    }
  })

  console.group(`Cache write for ${key}`)
  console.log('Data:', data)
  console.log('Expires on:', new Date(timeout))
  console.log('Expires in:', msToReadable(timeout - new Date()))
  console.groupEnd()
}

/**
 * Read from the cache
 * @public
 * @param {String} key
 * @param {Number} [timeout=10080] Timeout (in minutes)
 * @returns {Object}
 */
export const read = async (key, timeout = DEFAULT_TIMEOUT) => {
  const cachedData = await STORAGE.get(key)
  const data = cachedData[key]

  console.group(`Cache read for ${key}`)
  if (data && data.data) {
    console.log('Data:', data.data)
    console.log('Expires on:', new Date(data.timeout))
    console.log('Expires in:', msToReadable(data.timeout - new Date()))
  } else {
    console.log('No data')
  }

  if (existsAndNotExpired(data)) {
    console.log('✅ Not expired')
    console.groupEnd()
    return data
  }

  console.log('⚠️ Expired, returning `null`')
  console.groupEnd()
  return null
}

/**
 * Remove from the cache
 * @public
 * @param {string} key
 */
export const remove = async (key) => {
  STORAGE.remove(key)

  console.log(`Cache removal for ${key}`)
}

/**
 * Remove expired items
 * @public
 */
export const removeExpiredItems = async () => {
  console.group('Cache governor started')
  const cachedData = await STORAGE.get(null)

  let removedCount = 0
  for (const key in cachedData) {
    const data = cachedData[key]
    if (existsAndNotExpired(data)) {
      console.log(`${key} is fine, continuing...`)
      continue
    }

    console.log(`Removing ${key}...`)
    remove(key)
    removedCount++
  }

  console.groupEnd()
  console.log(`${removedCount} items were expired and removed`)
}

/**
 * Convert milliseconds to readable timestamp
 * @param {Number} miliseconds
 * @returns {String}
 */
const msToReadable = (miliseconds) => {
  const totalSeconds = parseInt(Math.floor(miliseconds / 1000))
  const totalMinutes = parseInt(Math.floor(totalSeconds / 60))
  const totalHours = parseInt(Math.floor(totalMinutes / 60))
  const days = parseInt(Math.floor(totalHours / 24))

  const seconds = parseInt(totalSeconds % 60)
  const minutes = parseInt(totalMinutes % 60)
  const hours = parseInt(totalHours % 24)

  return `${days} d ${hours} h ${minutes} m ${seconds} s`
}

/**
 * Check if the cache data exists and not expired
 * @param {Object} data
 * @param {*} data.data
 * @returns
 */
const existsAndNotExpired = (data) => {
  const currentDate = new Date()

  return data && data.timeout && data.data &&
    currentDate <= data.timeout
}

/**
 * Generate a timeout value from minutes
 * @param {Number} [timeout=10080] Timeout (in minutes)
 * @returns
 */
const generateTimeout = (timeout = DEFAULT_TIMEOUT) => {
  return Date.now() + timeout * 60 * 1000
}
