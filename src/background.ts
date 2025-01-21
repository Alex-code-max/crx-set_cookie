import { get } from "lodash"

import { CookieKeysEnum, Login_Status } from "~utils/enum"
import { RequestFetch } from "~utils/request"

let OMC_COOKIE = {
  status: Login_Status[1],
  value: "",
  cookie: ""
}

const SET_OMC_COOKIE_VAL = (callback?) => {
  chrome.cookies.getAll(
    {
      domain: CookieKeysEnum.OMC.qa_domain,
      name: CookieKeysEnum.OMC.key
    },
    async (cookie) => {
      try {
        if (
          Array.isArray(cookie) &&
          cookie.length > 0 &&
          cookie.some((item) => item.domain === CookieKeysEnum.OMC.qa_domain)
        ) {
          const cookieVal = cookie.find(
            (item) => item.domain === CookieKeysEnum.OMC.qa_domain
          )
          const token = get(
            JSON.parse(decodeURIComponent(cookieVal.value)),
            CookieKeysEnum.OMC.subKeyPath
          )
          if (token) {
            const res = await RequestFetch(
              CookieKeysEnum.OMC.test_api_url,
              "GET",
              token
            )
            if (res.code === "502") {
              OMC_COOKIE.status = Login_Status[2]
              OMC_COOKIE.value = ""
            } else {
              OMC_COOKIE.status = Login_Status[1]
              OMC_COOKIE.value = token
              OMC_COOKIE.cookie = cookieVal.value.toString()
            }
          } else {
            OMC_COOKIE.status = Login_Status[0]
            OMC_COOKIE.value = ""
          }
        } else {
          OMC_COOKIE.status = Login_Status[0]
          OMC_COOKIE.value = ""
        }
      } catch (err) {
        OMC_COOKIE.status = Login_Status[0]
        OMC_COOKIE.value = ""
      }
      callback && callback()
    }
  )
}

SET_OMC_COOKIE_VAL()

chrome.runtime.onMessage.addListener(
  ({ action, payload }, sender, sendResponse) => {
    switch (action) {
      case "OMC_GET_COOKIE":
        GET_OMC_COOKIE().then(sendResponse)
        break
      case "OMC_SET_COOKIE":
        SET_OMC_COOKIE(payload).then(sendResponse).catch(sendResponse)
        break
      default:
        break
    }
    return true
  }
)

function GET_OMC_COOKIE() {
  return new Promise((resolve) => {
    SET_OMC_COOKIE_VAL(() => {
      resolve({ OMC_COOKIE })
    })
  })
}

function SET_OMC_COOKIE({ cookie, token }) {
  return new Promise((resolve, reject) => {
    chrome.cookies.set(
      {
        url: CookieKeysEnum.OMC.local_url,
        name: CookieKeysEnum.OMC.key,
        value: cookie
      },
      async () => {
        if (chrome.runtime.lastError) {
          reject({ type: "error" })
        } else {
          resolve({ type: "success" })
        }
      }
    )
  })
}
