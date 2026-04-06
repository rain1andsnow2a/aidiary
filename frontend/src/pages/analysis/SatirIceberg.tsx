// 萨提亚冰山模型可视化组件
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import type { SatirAnalysis } from '@/types'

interface SatirIcebergProps {
  analysis: SatirAnalysis
}

export default function SatirIceberg({ analysis }: SatirIcebergProps) {
  const { t } = useTranslation()

  const layers = [
    {
      id: 'behavior',
      name: t('satirIceberg.behaviorLayer'),
      description: t('satirIceberg.behaviorDesc'),
      color: 'bg-blue-400',
      content: analysis.behavior_layer,
    },
    {
      id: 'emotion',
      name: t('satirIceberg.emotionLayer'),
      description: t('satirIceberg.emotionDesc'),
      color: 'bg-cyan-400',
      content: analysis.emotion_layer,
    },
    {
      id: 'cognitive',
      name: t('satirIceberg.cognitiveLayer'),
      description: t('satirIceberg.cognitiveDesc'),
      color: 'bg-teal-400',
      content: analysis.cognitive_layer,
    },
    {
      id: 'belief',
      name: t('satirIceberg.beliefLayer'),
      description: t('satirIceberg.beliefDesc'),
      color: 'bg-purple-400',
      content: analysis.belief_layer,
    },
    {
      id: 'existence',
      name: t('satirIceberg.existenceLayer'),
      description: t('satirIceberg.existenceDesc'),
      color: 'bg-pink-400',
      content: analysis.core_self_layer,
    },
  ]

  return (
    <div className="relative">
      {/* 冰山背景 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <svg
          viewBox="0 0 400 600"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="200,50 350,200 350,550 50,550 50,200" fill="currentColor" />
        </svg>
      </div>

      {/* 冰山层次 */}
      <div className="relative space-y-2">
        {layers.map((layer, index) => (
          <IcebergLayer
            key={layer.id}
            layer={layer}
            index={index}
            total={layers.length}
          />
        ))}
      </div>
    </div>
  )
}

interface IcebergLayerProps {
  layer: {
    id: string
    name: string
    description: string
    color: string
    content: any
  }
  index: number
  total: number
}

function IcebergLayer({ layer, index, total }: IcebergLayerProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { t } = useTranslation()

  // 每层宽度逐渐变窄（形成冰山形状）
  const widthPercentage = 100 - (index * 80) / total

  const hasContent = () => {
    if (!layer.content) return false

    if (layer.id === 'emotion') {
      return layer.content.surface_emotion || layer.content.underlying_emotion
    }
    if (layer.id === 'cognitive') {
      return (
        layer.content.irrational_beliefs &&
        layer.content.irrational_beliefs.length > 0
      )
    }
    if (layer.id === 'belief') {
      return layer.content.core_beliefs && layer.content.core_beliefs.length > 0
    }
    if (layer.id === 'existence') {
      return layer.content.deepest_desire
    }
    return false
  }

  return (
    <div
      className="relative transition-all duration-300"
      style={{ width: `${widthPercentage}%`, margin: '0 auto' }}
    >
      <Card
        className={`${layer.color} text-white cursor-pointer hover:shadow-lg transition-all`}
        onClick={() => hasContent() && setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">
                {layer.name}
                {hasContent() && (
                  <span className="ml-2 text-xs opacity-75">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
              </h3>
              <p className="text-sm opacity-90">{layer.description}</p>
            </div>
            <div className="text-2xl font-bold opacity-50">{index + 1}</div>
          </div>

          {/* 展开内容 */}
          {isExpanded && hasContent() && (
            <div className="mt-4 pt-4 border-t border-white/20">
              {layer.id === 'emotion' && (
                <div className="space-y-2">
                  {layer.content.surface_emotion && (
                    <div>
                      <label className="text-xs opacity-75">{t('satirIceberg.surfaceEmotion')}</label>
                      <p className="font-semibold">{layer.content.surface_emotion}</p>
                    </div>
                  )}
                  {layer.content.underlying_emotion && (
                    <div>
                      <label className="text-xs opacity-75">{t('satirIceberg.underlyingEmotion')}</label>
                      <p className="font-semibold">{layer.content.underlying_emotion}</p>
                    </div>
                  )}
                  {layer.content.emotion_intensity && (
                    <div>
                      <label className="text-xs opacity-75">{t('satirIceberg.emotionIntensity')}</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full"
                            style={{ width: `${layer.content.emotion_intensity * 10}%` }}
                          />
                        </div>
                        <span className="text-sm">{layer.content.emotion_intensity}/10</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {layer.id === 'cognitive' &&
                layer.content.irrational_beliefs &&
                layer.content.irrational_beliefs.length > 0 && (
                  <div>
                    <label className="text-xs opacity-75">{t('satirIceberg.irrationalBeliefs')}</label>
                    <ul className="space-y-1 mt-1">
                      {layer.content.irrational_beliefs.map((belief: string, i: number) => (
                        <li key={i} className="text-sm">
                          • {belief}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {layer.id === 'belief' && layer.content.core_beliefs && layer.content.core_beliefs.length > 0 && (
                <div>
                  <label className="text-xs opacity-75">{t('satirIceberg.coreBeliefs')}</label>
                  <ul className="space-y-1 mt-1">
                    {layer.content.core_beliefs.map((belief: string, i: number) => (
                      <li key={i} className="text-sm">
                        • {belief}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {layer.id === 'existence' && layer.content.deepest_desire && (
                <div>
                  <label className="text-xs opacity-75">{t('satirIceberg.deepDesire')}</label>
                  <p className="font-semibold mt-1">{layer.content.deepest_desire}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
