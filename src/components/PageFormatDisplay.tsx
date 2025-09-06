import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import { PageFormatSelector } from './PageFormatSelector'
import { getDeviceIcon, getOrientationIcon } from '../types/digitalFormats'

export const PageFormatDisplay: React.FC = () => {
  const { digitalFormat } = useEditorStore()
  const [showSelector, setShowSelector] = useState(false)

  if (!digitalFormat) {
    return null
  }

  const formatInfo = `${digitalFormat.width} × ${digitalFormat.height} px`
  const deviceIcon = getDeviceIcon(digitalFormat.device)
  const orientationIcon = getOrientationIcon(digitalFormat.orientation)

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        title="Clique para alterar o formato da página"
      >
        <i className={`${deviceIcon} text-gray-600`}></i>
        <i className={`${orientationIcon} text-gray-400 text-xs`}></i>
        <span className="font-medium text-gray-900">
          {digitalFormat.name}
        </span>
        <span className="text-gray-500 text-xs">
          {formatInfo}
        </span>
        <i className="bi bi-chevron-down text-gray-400 text-xs"></i>
      </button>

      {showSelector && (
        <PageFormatSelector onClose={() => setShowSelector(false)} />
      )}
    </>
  )
}
