export const CookieKeysEnum = {
  OMC: {
    key: "_micro-common-info",
    subKeyPath: "dev_new.xToken",
    qa_domain: ".payermax.com",
    local_url: "http://localhost:9539/",
    test_env_url: "https://upms-dev-new.payermax.com/#/login",
    test_api_url:
      "https://omc-dev-new.payermax.com/omc-gateway/upms/user/basicInfo"
  }
}

export const Login_Status = {
  0: "unLogin",
  1: "login",
  2: "expired"
}

export const OperationStatus = {
  0: "error",
  1: "success"
}
