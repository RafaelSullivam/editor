import React, { useState } from 'react'
import type { DigitalPageFormat, DeviceType } from '../types/digitalFormats'
import { useEditorStore } from '../store/editor'
import { 
  DIGITAL_PAGE_FORMATS, 
  getFormatsByDevice, 
  getCommonFormats, 
  getDeviceIcon, 
  getOrientationIcon,
  getCategoryIcon
} from '../types/digitalFormats'

interface PageFormatSelectorProps {
  onClose?: () => void
}

export const PageFormatSelector: React.FC<PageFormatSelectorProps> = ({ onClose }) => {
  const { digitalFormat, setDigitalFormat } = useEditorStore()
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | 'all'>('all')
  const [showCommonOnly, setShowCommonOnly] = useState(true)

  const devices: { value: DeviceType | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'Todos', icon: 'bi-grid-3x3-gap' },
    { value: 'desktop', label: 'Desktop', icon: 'bi-display' },
    { value: 'tablet', label: 'Tablet', icon: 'bi-tablet' },
    { value: 'mobile', label: 'Mobile', icon: 'bi-phone' },
  ]

  const getFilteredFormats = (): DigitalPageFormat[] => {
    let formats = showCommonOnly ? getCommonFormats() : [...DIGITAL_PAGE_FORMATS]
    
    if (selectedDevice !== 'all') {
      formats = getFormatsByDevice(selectedDevice)
      if (showCommonOnly) {
        formats = formats.filter(f => f.isCommon)
      }
    }
    
    return formats
  }

  const handleFormatSelect = (format: DigitalPageFormat) => {
    setDigitalFormat(format)
    onClose?.()
  }

  const formatsByCategory = getFilteredFormats().reduce((acc, format) => {
    const category = format.category || 'Outros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(format)
    return acc
  }, {} as Record<string, DigitalPageFormat[]>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Selecionar Formato da Página
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Escolha o formato ideal para seu projeto digital
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Device Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Dispositivo:</span>
              <div className="flex bg-white rounded-lg border overflow-hidden">
                {devices.map((device) => (
                  <button
                    key={device.value}
                    onClick={() => setSelectedDevice(device.value)}
                    className={`px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                      selectedDevice === device.value
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className={device.icon}></i>
                    {device.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Common Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCommonOnly}
                onChange={(e) => setShowCommonOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Apenas formatos comuns</span>
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {Object.entries(formatsByCategory).map(([category, formats]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className={getCategoryIcon(category)}></i>
                {category}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatSelect(format)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      digitalFormat?.id === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className={`${getDeviceIcon(format.device)} text-gray-600`}></i>
                        <i className={`${getOrientationIcon(format.orientation)} text-gray-400 text-xs`}></i>
                      </div>
                      {format.isCommon && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {format.name}
                    </h4>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {format.width} × {format.height} px
                    </div>
                    
                    {format.description && (
                      <p className="text-xs text-gray-500">
                        {format.description}
                      </p>
                    )}
                    
                    {format.pixelDensity > 1 && (
                      <div className="mt-2 text-xs text-blue-600">
                        Retina {format.pixelDensity}x
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(formatsByCategory).length === 0 && (
            <div className="text-center py-12">
              <i className="bi bi-search text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum formato encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros para ver mais opções.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {digitalFormat && (
                <>
                  Formato atual: <span className="font-medium">{digitalFormat.name}</span>
                  {' '}({digitalFormat.width} × {digitalFormat.height} px)
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Aplicar Formato
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
