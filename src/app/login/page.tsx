"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { bschAuth } from "@/lib/bschAuth";
import { QRCodeSVG } from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BschLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [needCaptcha, setNeedCaptcha] = useState(false);
  const [captchaImg, setCaptchaImg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // QR constants
  const [qrToken, setQrToken] = useState("");
  const [qrContent, setQrContent] = useState("");
  const [qrStatus, setQrStatus] = useState<"waiting" | "expired" | "success">(
    "waiting",
  );

  const updateCaptcha = useCallback(async () => {
    const isNeeded = await bschAuth.checkNeedCaptcha();
    setNeedCaptcha(isNeeded);
    if (isNeeded) {
      setCaptchaImg(bschAuth.getCaptchaUrl());
    }
  }, []);

  const refreshQRCode = useCallback(async () => {
    try {
      setQrStatus("waiting");
      const res = await bschAuth.getQRCodeInfo();
      if (res.code === 0) {
        setQrToken(res.data.token);
        setQrContent(res.data.loginPage);
      } else {
        toast.error("获取二维码失败");
      }
    } catch (e) {
      toast.error("网络错误");
    }
  }, []);

  useEffect(() => {
    updateCaptcha();
    refreshQRCode();
  }, [updateCaptcha, refreshQRCode]);

  const completeLogin = async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("登录成功，进入系统");
        router.push("/");
        router.refresh();
      } else {
        toast.error("启动会话失败，请重试");
      }
    } catch (error) {
      console.error("Complete login error:", error);
      toast.error("完成登录时发生错误");
    }
  };

  // QR status polling
  useEffect(() => {
    if (!qrToken || qrStatus !== "waiting" || activeTab !== "qr") return;

    const timer = setInterval(async () => {
      try {
        const res = await bschAuth.getQRStatus(qrToken);
        if (res.code === 0) {
          if (res.data.url) {
            setQrStatus("success");
            clearInterval(timer);
            // Instead of redirecting to the external URL, we handle auth locally
            await completeLogin();
          } else if (res.data.status !== 0) {
            setQrStatus("expired");
            clearInterval(timer);
          }
        } else {
          setQrStatus("expired");
          clearInterval(timer);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [qrToken, qrStatus, activeTab]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await bschAuth.login(username, password, captcha);
      if (res.code === 0 && res.data.url) {
        await completeLogin();
      } else if (res.code === 0) {
        await completeLogin();
      } else {
        toast.error(res.msg || "登录失败");
        if (res.data.needCaptcha) {
          setNeedCaptcha(true);
          setCaptchaImg(bschAuth.getCaptchaUrl());
        }
      }
    } catch (e) {
      toast.error("网络错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        <h1 className="mb-8 text-2xl font-bold text-center tracking-tight text-zinc-50">
          使用铃铛教育账号登录
        </h1>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            if (val === "qr" && !qrToken) refreshQRCode();
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-800 rounded-lg">
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 rounded-md transition-all"
            >
              密码登录
            </TabsTrigger>
            <TabsTrigger
              value="qr"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 rounded-md transition-all"
            >
              扫码登录
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">
                  账号
                </label>
                <Input
                  type="text"
                  placeholder="手机号/账号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-800 border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">
                  密码
                </label>
                <Input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-800 border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500 text-zinc-100"
                />
              </div>

              {needCaptcha && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 ml-1">
                    验证码
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="验证码"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500 text-zinc-100"
                    />
                    <div className="relative group">
                      <img
                        src={captchaImg}
                        alt="Captcha"
                        className="cursor-pointer border border-zinc-700 rounded-md bg-white hover:opacity-90 transition-opacity"
                        onClick={() => setCaptchaImg(bschAuth.getCaptchaUrl())}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-zinc-700 text-zinc-400">
                        点击刷新
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-semibold rounded-lg mt-4 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                    <span>登录中...</span>
                  </div>
                ) : (
                  "立即登录"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="qr">
            <div className="flex flex-col items-center py-6">
              <div className="relative p-4 border border-zinc-800 rounded-2xl bg-zinc-800 shadow-2xl transition-all hover:border-zinc-700">
                {qrContent ? (
                  <div className="p-2 bg-white rounded-lg">
                    <QRCodeSVG
                      value={qrContent}
                      size={200}
                      className={
                        qrStatus === "expired" ? "opacity-5 grayscale" : ""
                      }
                      marginSize={1}
                    />
                  </div>
                ) : (
                  <div className="w-[216px] h-[216px] bg-zinc-800 animate-pulse flex items-center justify-center text-zinc-600 rounded-lg">
                    正在生成...
                  </div>
                )}

                {qrStatus === "expired" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-[2px] rounded-2xl border border-zinc-700">
                    <p className="mb-4 text-sm text-zinc-400 font-medium">
                      二维码已过期
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshQRCode}
                      className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    >
                      点击重新获取
                    </Button>
                  </div>
                )}

                {qrStatus === "success" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-emerald-900/30">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                      <svg
                        className="h-6 w-6 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-emerald-400 font-bold text-lg">
                      验证成功
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      正在为您同步状态...
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-10 flex items-center gap-3 text-zinc-500">
                <div className="h-[1px] w-8 bg-zinc-800"></div>
                <p className="text-xs font-medium uppercase tracking-widest">
                  使用 “铃铛教育 APP” 扫码
                </p>
                <div className="h-[1px] w-8 bg-zinc-800"></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
