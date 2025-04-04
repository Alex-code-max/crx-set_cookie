import { Button, Grid, Input, Message, Tabs } from "@arco-design/web-react"
import React, { useEffect, useState } from "react"

import "@arco-design/web-react/dist/css/arco.css"

import { sleep } from "~utils/common"
import { CookieKeysEnum, Login_Status, OperationStatus } from "~utils/enum"

import "~popup.css"

const TabPane = Tabs.TabPane
const Row = Grid.Row
const Col = Grid.Col

const Popup = () => {
  const [OMC_COOKIE, setOMC_COOKIE] = useState({
    status: Login_Status[1],
    value: "",
    cookie: ""
  })
  const handleGetOMCCookie = () => {
    setLoading(true)
    const close = Message.info({
      content: "正在获取和过期校验中...",
      duration: 0
    })
    setOMC_COOKIE({
      status: Login_Status[1],
      value: "",
      cookie: ""
    })
    chrome.runtime.sendMessage({ action: "OMC_GET_COOKIE" }, (response) => {
      setOMC_COOKIE(response.OMC_COOKIE)
      setLoading(false)
      close()
    })
  }

  const [loading, setLoading] = useState(false)

  const handleWriteOMCToLocal = () => {
    chrome.runtime.sendMessage(
      {
        action: "OMC_SET_COOKIE",
        payload: {
          cookie: OMC_COOKIE.cookie,
          token: OMC_COOKIE.value
        }
      },
      (response) => {
        if (response.type === OperationStatus[1]) {
          Message.success({
            content: "写入成功",
            duration: 1000,
            style: { top: "-35px" }
          })
        } else {
          Message.error("写入失败请重新登录")
          sleep(800).then(() => {
            // chrome.tabs.create({
            //   url: CookieKeysEnum.OMC.test_env_url
            // })
          })
        }
      }
    )
  }
  useEffect(() => {
    if (
      OMC_COOKIE.status === Login_Status[0] ||
      OMC_COOKIE.status === Login_Status[2]
    ) {
      if (OMC_COOKIE.status === Login_Status[0]) {
        Message.error("未找到cookie，请重新登录")
      } else {
        Message.error("Token已过期，请重新登录")
      }
      sleep(800).then(() => {
        chrome.tabs.create({
          url: CookieKeysEnum.OMC.test_env_url
        })
      })
    }
  }, [OMC_COOKIE])

  return (
    <div className="alexyu-w-80 alexyu-h-full alexyu-px-2.5 alexyu-pb-4">
      <h3 className="alexyu-text-base alexyu-text-center alexyu-py-2.5">
        获取和设置OMC cookie
      </h3>
      <Tabs>
        <TabPane title="OMC" key="OMC">
          <div className="alexyu-leading-8 pb-5">
            <Button
              long
              type="primary"
              onClick={handleGetOMCCookie}
              loading={loading}>
              Get OMC Cookie
            </Button>
            <div>
              <div>key：{CookieKeysEnum.OMC.key}</div>
              <Row>
                <Col span={4}>value：</Col>
                <Col span={14}>
                  <Input value={OMC_COOKIE.value} />
                </Col>
                <Col span={6}>
                  <Button
                    type="text"
                    style={{ padding: "0 10px" }}
                    disabled={!OMC_COOKIE.value}
                    onClick={handleWriteOMCToLocal}>
                    写入本地
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default Popup
