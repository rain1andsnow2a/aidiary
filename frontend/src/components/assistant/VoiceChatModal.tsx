// 跟映记精灵语音对话 modal：按住说话 → STT → DeepSeek → TTS → 自动播放回复
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mic, X, Loader2, Volume2 } from 'lucide-react'

import { assistantService, type VoiceChatResponse } from '@/services/assistant.service'
import { toast } from '@/components/ui/toast'
import { downsampleBuffer, encodePcm16, pcmChunksToWav } from '@/utils/audio'

type Turn = {
  id: string
  role: 'user' | 'assistant'
  text: string
  audioUrl?: string
}

type Phase = 'idle' | 'recording' | 'thinking' | 'speaking'

const MAX_RECORD_MS = 60_000

export default function VoiceChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<Phase>('idle')
  const [turns, setTurns] = useState<Turn[]>([])
  const [sessionId, setSessionId] = useState<number | undefined>(undefined)

  // 录音相关 refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const pcmChunksRef = useRef<ArrayBuffer[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playerRef = useRef<HTMLAudioElement | null>(null)
  const sessionRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    sessionRef.current = sessionId
  }, [sessionId])

  const cleanupRecording = useCallback(async () => {
    if (recordTimerRef.current) {
      clearTimeout(recordTimerRef.current)
      recordTimerRef.current = null
    }
    if (processorRef.current) {
      try { processorRef.current.disconnect() } catch {}
      processorRef.current = null
    }
    if (sourceRef.current) {
      try { sourceRef.current.disconnect() } catch {}
      sourceRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      try { await audioCtxRef.current.close() } catch {}
      audioCtxRef.current = null
    }
  }, [])

  const stopAudioPlayback = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause()
      playerRef.current = null
    }
  }, [])

  const fullCleanup = useCallback(async () => {
    await cleanupRecording()
    stopAudioPlayback()
  }, [cleanupRecording, stopAudioPlayback])

  useEffect(() => {
    return () => {
      void fullCleanup()
    }
  }, [fullCleanup])

  useEffect(() => {
    if (!open) {
      void fullCleanup()
      setPhase('idle')
    }
  }, [open, fullCleanup])

  const playAudio = useCallback((audioUrl: string) => {
    stopAudioPlayback()
    setPhase('speaking')
    const audio = new Audio(audioUrl)
    playerRef.current = audio
    audio.onended = () => {
      setPhase('idle')
      playerRef.current = null
    }
    audio.onerror = () => {
      setPhase('idle')
      playerRef.current = null
    }
    audio.play().catch(() => {
      setPhase('idle')
    })
  }, [stopAudioPlayback])

  const sendWav = useCallback(async (wav: Blob) => {
    setPhase('thinking')
    try {
      const res: VoiceChatResponse = await assistantService.voiceChatAudio(wav, sessionRef.current)
      if (!sessionRef.current) setSessionId(res.session_id)

      const userTurn: Turn = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: res.user_text,
      }
      let aiTurn: Turn = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: res.reply_text,
      }
      if (res.reply_audio_base64) {
        const url = base64ToObjectUrl(res.reply_audio_base64, res.reply_audio_mime || 'audio/mpeg')
        aiTurn = { ...aiTurn, audioUrl: url }
      }
      setTurns((prev) => [...prev, userTurn, aiTurn])

      if (aiTurn.audioUrl) {
        playAudio(aiTurn.audioUrl)
      } else {
        setPhase('idle')
      }
    } catch (e: any) {
      setPhase('idle')
      toast(e?.response?.data?.detail || e?.message || t('voiceChat.errorSend'), 'error')
    }
  }, [playAudio, t])

  const startRecording = useCallback(async () => {
    if (phase !== 'idle') return
    stopAudioPlayback()
    pcmChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      })
      streamRef.current = stream

      const Ctor: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx = new Ctor()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      sourceRef.current = source
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0)
        const downsampled = downsampleBuffer(input, ctx.sampleRate, 16000)
        const pcm = encodePcm16(downsampled)
        if (pcm.byteLength > 0) pcmChunksRef.current.push(pcm)
      }
      source.connect(processor)
      processor.connect(ctx.destination)

      setPhase('recording')

      recordTimerRef.current = setTimeout(() => {
        void stopRecordingAndSend()
      }, MAX_RECORD_MS)
    } catch (e: any) {
      await cleanupRecording()
      setPhase('idle')
      toast(e?.message || t('voiceChat.errorMicPermission'), 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, t])

  const stopRecordingAndSend = useCallback(async () => {
    if (phase !== 'recording') return
    const chunks = pcmChunksRef.current
    pcmChunksRef.current = []
    await cleanupRecording()

    const totalSamples = chunks.reduce((n, c) => n + c.byteLength / 2, 0)
    if (totalSamples < 16000 * 0.4) {
      // 不到 0.4s 视为误触
      setPhase('idle')
      toast(t('voiceChat.tooShort'), 'info')
      return
    }
    const wav = pcmChunksToWav(chunks, 16000)
    await sendWav(wav)
  }, [phase, cleanupRecording, sendWav, t])

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case 'recording': return t('voiceChat.phaseRecording')
      case 'thinking': return t('voiceChat.phaseThinking')
      case 'speaking': return t('voiceChat.phaseSpeaking')
      default: return t('voiceChat.phaseIdle')
    }
  }, [phase, t])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/45 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex h-[88vh] w-[92%] max-w-md flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(170deg,#fffaf3,#f6efe7)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#eadfd8]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4dc] text-[#c47a61]">
              <Volume2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-800">{t('voiceChat.title')}</h2>
              <p className="text-xs text-stone-500">{phaseLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-2">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {turns.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center text-stone-400 py-10">
              <img src="/foxy-small.png" alt="" width={96} height={96} className="h-24 w-24 object-contain opacity-90" />
              <p className="mt-4 text-sm leading-6">{t('voiceChat.welcomeLine1')}</p>
              <p className="text-sm leading-6">{t('voiceChat.welcomeLine2')}</p>
            </div>
          )}
          {turns.map((turn) => (
            <Bubble key={turn.id} turn={turn} onReplay={(url) => playAudio(url)} t={t} />
          ))}
          {phase === 'thinking' && (
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('voiceChat.phaseThinking')}
            </div>
          )}
        </div>

        <footer className="px-6 py-5 bg-white/70 border-t border-[#eadfd8]">
          <p className="mb-3 text-center text-xs text-stone-400">{t('voiceChat.holdToTalkHint')}</p>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecordingAndSend}
              onMouseLeave={() => phase === 'recording' && stopRecordingAndSend()}
              onTouchStart={startRecording}
              onTouchEnd={stopRecordingAndSend}
              onContextMenu={(e) => e.preventDefault()}
              disabled={phase === 'thinking' || phase === 'speaking'}
              className={`flex h-20 w-20 select-none items-center justify-center rounded-full text-white shadow-[0_18px_40px_rgba(214,135,116,0.32)] transition-all ${
                phase === 'recording'
                  ? 'bg-[#dd6d62] scale-110 ring-8 ring-[#ffd0c8]/50'
                  : 'bg-[linear-gradient(135deg,#f58b7d,#b19adc)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Mic className="h-8 w-8" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function Bubble({
  turn,
  onReplay,
  t,
}: {
  turn: Turn
  onReplay: (url: string) => void
  t: ReturnType<typeof useTranslation>['t']
}) {
  const isUser = turn.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? 'bg-[linear-gradient(135deg,#f58b7d,#b19adc)] text-white'
            : 'bg-white text-stone-700 border border-[#eadfd8]'
        }`}
      >
        <p>{turn.text}</p>
        {turn.audioUrl && !isUser && (
          <button
            onClick={() => onReplay(turn.audioUrl!)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#b56f61] hover:text-[#9c5e52]"
          >
            <Volume2 className="h-3.5 w-3.5" />
            {t('voiceChat.replay')}
          </button>
        )}
      </div>
    </div>
  )
}

function base64ToObjectUrl(b64: string, mime: string): string {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: mime })
  return URL.createObjectURL(blob)
}
