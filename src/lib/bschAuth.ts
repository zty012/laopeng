/**
 * SSO 登录逻辑封装
 * 移植自 https://sso.bestsch.com/old/
 */

import JSEncrypt from "jsencrypt";

const SSO_CONFIG = {
  ssoProxy: "/api/sso/",
  loginProxy: "/api/bsch-login/",
  authProxy: "/api/bsch-authapi/",
  publicKey:
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFKLeH1AOOCNi24fyafTvAQYDuthH3UIlvBU5DxBz+uP6UFWclbk707Hwnuq9tI4I78vzJdmw2F5bu+7wqZeI5OczdEgIjxdEzgLX1QQvk2y4Eaxv6ui9h0/lXoTqHW7gtAcmyLBexl+v/ig22fLfG6XKvXThdTZ2jWRF5ws/KlQIDAQABgwQco1KRMDSmXSMkDwIDAQAB",
};

export interface LoginResponse {
  code: number;
  msg: string;
  data: {
    url?: string;
    needCaptcha?: boolean;
  };
}

export interface QRInfoResponse {
  code: number;
  msg: string;
  data: {
    token: string;
    loginPage: string;
    expireTime: number;
    status: number;
  };
}

export interface QRStatusResponse {
  code: number;
  msg: string;
  data: {
    status: number;
    url?: string;
    expireTime?: number;
    createTime?: string;
  };
}

class BschAuth {
  private encryptor: JSEncrypt;

  constructor() {
    this.encryptor = new JSEncrypt();
    this.encryptor.setPublicKey(SSO_CONFIG.publicKey);
  }

  /**
   * 检查是否需要验证码
   */
  async checkNeedCaptcha(): Promise<boolean> {
    try {
      const res = await fetch(`${SSO_CONFIG.ssoProxy}NeedCaptcha`, {
        credentials: "include",
      });
      const data = await res.json();
      return data.code === 0 ? !!data.data.needCaptcha : true;
    } catch (e) {
      console.error("Check captcha failed:", e);
      return true;
    }
  }

  /**
   * 获取验证码图片 URL
   */
  getCaptchaUrl(): string {
    return `${SSO_CONFIG.ssoProxy}Captcha?k=${Date.now()}`;
  }

  /**
   * 账号密码登录
   */
  async login(
    username: string,
    password: string,
    captcha: string = "",
    service: string = "",
  ): Promise<LoginResponse> {
    const encryptedUser = this.encryptor.encrypt(username) || "";
    const encryptedPwd = this.encryptor.encrypt(password) || "";

    const params = new URLSearchParams({
      loginname: encryptedUser,
      pwd: encryptedPwd,
      captcha: captcha,
    });

    if (service) params.append("service", service);

    const res = await fetch(
      `${SSO_CONFIG.ssoProxy}Login?${params.toString()}`,
      {
        credentials: "include",
      },
    );
    return await res.json();
  }

  /**
   * 获取扫码登录二维码信息
   */
  async getQRCodeInfo(): Promise<QRInfoResponse> {
    const res = await fetch(`${SSO_CONFIG.loginProxy}GetLoginInfo?tag=sso`, {
      credentials: "include",
    });
    return await res.json();
  }

  /**
   * 轮询扫码状态
   */
  async getQRStatus(
    token: string,
    service: string = "",
  ): Promise<QRStatusResponse> {
    const params = new URLSearchParams({
      token,
      service,
      ran: Math.random().toString(),
    });
    const res = await fetch(
      `${SSO_CONFIG.loginProxy}v2/GetLoginStatus?${params.toString()}`,
      { credentials: "include" },
    );
    return await res.json();
  }

  /**
   * 获取用户信息 (登录/跳转后)
   */
  async getUserInfo(): Promise<any> {
    const res = await fetch(`${SSO_CONFIG.authProxy}GetUserInfo`, {
      credentials: "include",
    });
    return await res.json();
  }
}

export const bschAuth = new BschAuth();
