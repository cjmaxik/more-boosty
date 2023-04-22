const API_URL = 'https://api.boosty.to/v1/'

// dialog-related
const DEFAULT_OFFSET = Number.MAX_SAFE_INTEGER
const DEFAULT_LIMIT = 300

export const blog = async (metadata, accessToken) => {
  const endpoint = `blog/${metadata.blogName}/post/${metadata.id}?component_limit=0`
  return send(endpoint, accessToken)
}

// TODO: Make this function aware of `offset` and use it to grab mesages in smaller chunks progressively
export const dialog = async (metadata, accessToken, offset = DEFAULT_OFFSET) => {
  const endpoint = `dialog/${metadata.id}/message/?limit=${DEFAULT_LIMIT}&reverse=true&offset=${offset}`
  return send(endpoint, accessToken)
}

const send = async (endpoint, accessToken) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  const json = await response.json()

  return json.data
}
