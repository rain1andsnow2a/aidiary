"""
讯飞语音听写服务（IAT WebSocket）
"""
import asyncio
import base64
import hashlib
import hmac
import io
import json
import wave
from email.utils import formatdate
from typing import Awaitable, Callable, Optional
from urllib.parse import quote

import websockets

from app.core.config import settings


class SpeechService:
    def __init__(self) -> None:
        self.host = "iat-api.xfyun.cn"
        self.path = "/v2/iat"

    @staticmethod
    def _appid() -> str:
        appid = (settings.xfyun_iat_appid or "").strip()
        if appid.upper().startswith("APPID"):
            appid = appid[5:].strip()
        return appid

    @staticmethod
    def _api_key() -> str:
        return (settings.xfyun_iat_api_key or "").strip()

    @staticmethod
    def _api_secret() -> str:
        return (settings.xfyun_iat_api_secret or "").strip()

    def is_configured(self) -> bool:
        return bool(
            self._appid()
            and self._api_key()
            and self._api_secret()
        )

    def _build_ws_url(self) -> str:
        date = formatdate(timeval=None, localtime=False, usegmt=True)
        signature_origin = f"host: {self.host}\n" f"date: {date}\n" f"GET {self.path} HTTP/1.1"
        signature_sha = hmac.new(
            self._api_secret().encode("utf-8"),
            signature_origin.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        signature = base64.b64encode(signature_sha).decode("utf-8")

        authorization_origin = (
            f'api_key="{self._api_key()}", '
            f'algorithm="hmac-sha256", '
            f'headers="host date request-line", '
            f'signature="{signature}"'
        )
        authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode("utf-8")
        return (
            f"wss://{self.host}{self.path}"
            f"?authorization={quote(authorization)}"
            f"&date={quote(date)}"
            f"&host={self.host}"
        )

    @staticmethod
    def _extract_text(result: dict) -> str:
        ws_items = result.get("ws", [])
        return "".join(
            cw.get("w", "")
            for item in ws_items
            for cw in item.get("cw", [])
        )

    @staticmethod
    def _merge_result(result_map: dict[int, str], result: dict) -> str:
        """
        合并讯飞流式返回结果。

        讯飞可能返回普通追加结果，也可能通过 pgs=rpl + rg 做动态修正。
        这里按 sn 分片维护文本，避免简单 append 带来的重复字。
        """
        sn_raw = result.get("sn")
        try:
            sn = int(sn_raw)
        except (TypeError, ValueError):
            sn = len(result_map) + 1

        if result.get("pgs") == "rpl":
            rg = result.get("rg") or []
            if len(rg) == 2:
                try:
                    start, end = int(rg[0]), int(rg[1])
                    for idx in range(start, end + 1):
                        result_map.pop(idx, None)
                except (TypeError, ValueError):
                    pass

        result_map[sn] = SpeechService._extract_text(result)
        return "".join(result_map[k] for k in sorted(result_map))

    @staticmethod
    def _extract_pcm_from_wav(wav_bytes: bytes) -> bytes:
        with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
            channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            sample_rate = wf.getframerate()
            if channels != 1:
                raise ValueError("仅支持单声道音频")
            if sample_width != 2:
                raise ValueError("仅支持16-bit PCM音频")
            if sample_rate != 16000:
                raise ValueError("仅支持16kHz音频")
            return wf.readframes(wf.getnframes())

    async def transcribe_wav(self, wav_bytes: bytes) -> str:
        if not self.is_configured():
            raise ValueError("语音识别服务未配置")

        pcm_bytes = self._extract_pcm_from_wav(wav_bytes)
        if not pcm_bytes:
            return ""

        ws_url = self._build_ws_url()
        frame_size = 1280  # 40ms @ 16kHz, 16bit mono
        result_map: dict[int, str] = {}

        async with websockets.connect(ws_url, ping_interval=20, ping_timeout=20, close_timeout=8) as ws:
            index = 0
            first_frame = True

            while index < len(pcm_bytes):
                chunk = pcm_bytes[index:index + frame_size]
                index += frame_size
                status = 0 if first_frame else (2 if index >= len(pcm_bytes) else 1)
                first_frame = False

                payload: dict = {
                    "data": {
                        "status": status,
                        "format": "audio/L16;rate=16000",
                        "audio": base64.b64encode(chunk).decode("utf-8"),
                        "encoding": "raw",
                    }
                }
                if status == 0:
                    payload["common"] = {"app_id": self._appid()}
                    payload["business"] = {
                        "domain": "iat",
                        "language": "zh_cn",
                        "accent": "mandarin",
                        "vad_eos": 10000,
                    }

                await ws.send(json.dumps(payload))
                await asyncio.sleep(0.04)

                try:
                    response = await asyncio.wait_for(ws.recv(), timeout=3.5)
                    msg = json.loads(response)
                    if msg.get("code", 0) != 0:
                        raise ValueError(msg.get("message", "语音识别失败"))
                    data = msg.get("data", {})
                    result = data.get("result", {})
                    if result:
                        self._merge_result(result_map, result)
                except asyncio.TimeoutError:
                    pass

            for _ in range(6):
                try:
                    response = await asyncio.wait_for(ws.recv(), timeout=1.6)
                except asyncio.TimeoutError:
                    break
                msg = json.loads(response)
                if msg.get("code", 0) != 0:
                    break
                data = msg.get("data", {})
                result = data.get("result", {})
                if result:
                    self._merge_result(result_map, result)
                if data.get("status") == 2:
                    break

        return "".join(result_map[k] for k in sorted(result_map)).strip()

    async def stream_pcm(
        self,
        incoming: "asyncio.Queue[Optional[bytes]]",
        on_text: Callable[[str, bool], Awaitable[None]],
    ) -> str:
        """
        将前端实时传入的 16kHz/16bit/mono PCM 流转发给讯飞。

        Args:
            incoming: PCM 队列，None 表示用户停止录音。
            on_text: 回调，参数为当前完整文本、是否最终结果。
        """
        if not self.is_configured():
            raise ValueError("语音识别服务未配置")

        ws_url = self._build_ws_url()
        result_map: dict[int, str] = {}
        final_text = ""

        async with websockets.connect(
            ws_url,
            ping_interval=20,
            ping_timeout=20,
            close_timeout=8,
            max_size=2 * 1024 * 1024,
        ) as ws:
            first_frame = True
            finished_sending = False
            final_received = asyncio.Event()

            async def receiver() -> None:
                nonlocal final_text
                while True:
                    response = await ws.recv()
                    msg = json.loads(response)
                    if msg.get("code", 0) != 0:
                        raise ValueError(msg.get("message", "语音识别失败"))

                    data = msg.get("data", {})
                    result = data.get("result", {})
                    if result:
                        final_text = self._merge_result(result_map, result).strip()
                        await on_text(final_text, data.get("status") == 2)

                    if data.get("status") == 2:
                        final_received.set()
                        break

            recv_task = asyncio.create_task(receiver())
            try:
                while True:
                    chunk = await asyncio.wait_for(incoming.get(), timeout=65)
                    if chunk is None:
                        finished_sending = True
                        if first_frame:
                            final_received.set()
                            break
                        payload = {
                            "data": {
                                "status": 2,
                                "format": "audio/L16;rate=16000",
                                "audio": "",
                                "encoding": "raw",
                            }
                        }
                        await ws.send(json.dumps(payload))
                        break

                    if not chunk:
                        continue

                    status = 0 if first_frame else 1
                    first_frame = False
                    payload: dict = {
                        "data": {
                            "status": status,
                            "format": "audio/L16;rate=16000",
                            "audio": base64.b64encode(chunk).decode("utf-8"),
                            "encoding": "raw",
                        }
                    }
                    if status == 0:
                        payload["common"] = {"app_id": self._appid()}
                        payload["business"] = {
                            "domain": "iat",
                            "language": "zh_cn",
                            "accent": "mandarin",
                            "vad_eos": 2500,
                            "dwa": "wpgs",
                        }

                    await ws.send(json.dumps(payload))

                if finished_sending:
                    if first_frame:
                        return ""
                    try:
                        await asyncio.wait_for(final_received.wait(), timeout=8)
                    except asyncio.TimeoutError:
                        pass
                else:
                    final_received.set()

                if not recv_task.done():
                    recv_task.cancel()
                    try:
                        await recv_task
                    except asyncio.CancelledError:
                        pass
                else:
                    await recv_task
            finally:
                if not recv_task.done():
                    recv_task.cancel()
                    try:
                        await recv_task
                    except asyncio.CancelledError:
                        pass

        return final_text.strip()


speech_service = SpeechService()
