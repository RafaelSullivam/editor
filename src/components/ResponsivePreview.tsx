import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import { 
  DIGITAL_PAGE_FORMATS, 
  getFormatsByDevice, 
  getDeviceIcon, 
  calculateCanvasScale,
  type DigitalPageFormat 
} from '../types/digitalFormats'

interface ResponsivePreviewProps {
  onClose?: () => void
}

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({ onClose }) => {
  const { digitalFormat, currentPage } = useEditorStore()
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'desktop-1920x1080',
    'tablet-768x1024', 
    'mobile-390x844'
  ])

  // Get preview formats
  const previewFormats = selectedFormats
    .map(id => DIGITAL_PAGE_FORMATS.find(f => f.id === id))
    .filter(Boolean) as DigitalPageFormat[]

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    )
  }

  const formatGroups = [
    { device: 'desktop' as const, label: 'Desktop', formats: getFormatsByDevice('desktop').filter(f => f.isCommon) },
    { device: 'tablet' as const, label: 'Tablet', formats: getFormatsByDevice('tablet').filter(f => f.isCommon) },
    { device: 'mobile' as const, label: 'Mobile', formats: getFormatsByDevice('mobile').filter(f => f.isCommon) }
  ]

  const renderMiniCanvas = (format: DigitalPageFormat) => {
    const containerSize = 240 // Fixed container size for preview
    const scale = calculateCanvasScale(format, containerSize, containerSize * 0.7)
    const previewWidth = format.width * scale
    const previewHeight = format.height * scale

    return (
      <div 
        className="border rounded bg-gray-100 mx-auto flex items-center justify-center"
        style={{ 
          width: containerSize, 
          height: containerSize * 0.7,
          minHeight: '120px'
        }}
      >
        <div 
          className="bg-white shadow-sm border border-gray-300 relative overflow-hidden"
          style={{ 
            width: previewWidth, 
            height: previewHeight,
            minWidth: '80px',
            minHeight: '60px'
          }}
        >
          {/* Simulated content */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="p-2 text-xs text-gray-600">
              <div className="bg-gray-300 h-2 w-3/4 mb-1 rounded"></div>
              <div className="bg-gray-300 h-1 w-1/2 mb-2 rounded"></div>
              <div className="bg-blue-300 h-8 w-full rounded mb-1"></div>
              <div className="bg-gray-300 h-1 w-2/3 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Preview Responsivo
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Visualize como seu layout se adapta em diferentes dispositivos
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        {/* Format Selection */}
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Selecione formatos para comparar:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formatGroups.map(group => (
              <div key={group.device} className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1">
                  <i className={getDeviceIcon(group.device)}></i>
                  {group.label}
                </h4>
                <div className="space-y-1">
                  {group.formats.map(format => (
                    <label key={format.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(format.id)}
                        onChange={() => toggleFormat(format.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{format.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Grid */}
        <div className="flex-1 overflow-auto p-6">
          {previewFormats.length === 0 ? (
            <div className="text-center py-12">
              <i className="bi bi-display text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum formato selecionado
              </h3>
              <p className="text-gray-600">
                Selecione pelo menos um formato para ver o preview.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {previewFormats.map(format => (
                <div key={format.id} className="text-center">
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center justify-center gap-2">
                      <i className={`${getDeviceIcon(format.device)} text-gray-600`}></i>
                      {format.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {format.width} × {format.height} px
                    </p>
                    {digitalFormat?.id === format.id && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                        Formato Ativo
                      </span>
                    )}
                  </div>
                  
                  {renderMiniCanvas(format)}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {format.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {currentPage && (
                <>
                  Página: <span className="font-medium">{currentPage.name}</span>
                  {' '}• {currentPage.elements.length} elemento(s)
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Fechar Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
