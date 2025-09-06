import React, { useState } from 'react'
import type { Gradient, GradientStop, LinearGradient, RadialGradient } from '../types/layout'

interface GradientEditorProps {
  gradient?: Gradient
  onChange: (gradient: Gradient | undefined) => void
  onClose: () => void
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
  gradient,
  onChange,
  onClose
}) => {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>(
    gradient?.type || 'linear'
  )
  
  const [linearGradient, setLinearGradient] = useState<LinearGradient>({
    type: 'linear',
    angle: gradient?.type === 'linear' ? gradient.angle : 0,
    stops: gradient?.stops || [
      { color: '#ff0000', position: 0 },
      { color: '#0000ff', position: 100 }
    ]
  })

  const [radialGradient, setRadialGradient] = useState<RadialGradient>({
    type: 'radial',
    centerX: gradient?.type === 'radial' ? gradient.centerX : 50,
    centerY: gradient?.type === 'radial' ? gradient.centerY : 50,
    radius: gradient?.type === 'radial' ? gradient.radius : 50,
    stops: gradient?.stops || [
      { color: '#ff0000', position: 0 },
      { color: '#0000ff', position: 100 }
    ]
  })

  const currentGradient = gradientType === 'linear' ? linearGradient : radialGradient

  const handleTypeChange = (type: 'linear' | 'radial') => {
    setGradientType(type)
  }

  const handleStopChange = (index: number, field: keyof GradientStop, value: string | number) => {
    const newStops = [...currentGradient.stops]
    newStops[index] = { ...newStops[index], [field]: value }
    
    if (gradientType === 'linear') {
      setLinearGradient({ ...linearGradient, stops: newStops })
    } else {
      setRadialGradient({ ...radialGradient, stops: newStops })
    }
  }

  const addStop = () => {
    const newStop: GradientStop = {
      color: '#808080',
      position: 50
    }
    
    if (gradientType === 'linear') {
      setLinearGradient({ ...linearGradient, stops: [...linearGradient.stops, newStop] })
    } else {
      setRadialGradient({ ...radialGradient, stops: [...radialGradient.stops, newStop] })
    }
  }

  const removeStop = (index: number) => {
    if (currentGradient.stops.length <= 2) return
    
    if (gradientType === 'linear') {
      setLinearGradient({
        ...linearGradient,
        stops: linearGradient.stops.filter((_: GradientStop, i: number) => i !== index)
      })
    } else {
      setRadialGradient({
        ...radialGradient,
        stops: radialGradient.stops.filter((_: GradientStop, i: number) => i !== index)
      })
    }
  }

  const generateCSSGradient = () => {
    if (gradientType === 'linear') {
      const stops = linearGradient.stops
        .map((stop: GradientStop) => `${stop.color} ${stop.position}%`)
        .join(', ')
      return `linear-gradient(${linearGradient.angle}deg, ${stops})`
    } else {
      const stops = radialGradient.stops
        .map((stop: GradientStop) => `${stop.color} ${stop.position}%`)
        .join(', ')
      return `radial-gradient(circle at ${radialGradient.centerX}% ${radialGradient.centerY}%, ${stops})`
    }
  }

  const handleApply = () => {
    onChange(currentGradient)
    onClose()
  }

  const handleRemove = () => {
    onChange(undefined)
    onClose()
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-palette me-2"></i>
              Editor de Gradientes
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Tipo de gradiente */}
            <div className="mb-4">
              <label className="form-label fw-bold">Tipo de Gradiente</label>
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="gradientType"
                  id="linear"
                  checked={gradientType === 'linear'}
                  onChange={() => handleTypeChange('linear')}
                />
                <label className="btn btn-outline-primary" htmlFor="linear">
                  <i className="bi bi-arrow-right me-1"></i>
                  Linear
                </label>
                
                <input
                  type="radio"
                  className="btn-check"
                  name="gradientType"
                  id="radial"
                  checked={gradientType === 'radial'}
                  onChange={() => handleTypeChange('radial')}
                />
                <label className="btn btn-outline-primary" htmlFor="radial">
                  <i className="bi bi-circle me-1"></i>
                  Radial
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-4">
              <label className="form-label fw-bold">Preview</label>
              <div
                className="border rounded"
                style={{
                  height: '100px',
                  background: generateCSSGradient(),
                  backgroundSize: '100% 100%'
                }}
              ></div>
            </div>

            {/* Configurações específicas do tipo */}
            {gradientType === 'linear' && (
              <div className="mb-4">
                <label className="form-label fw-bold">Ângulo</label>
                <div className="row align-items-center">
                  <div className="col-8">
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="360"
                      value={linearGradient.angle}
                      onChange={(e) => setLinearGradient({
                        ...linearGradient,
                        angle: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="360"
                      value={linearGradient.angle}
                      onChange={(e) => setLinearGradient({
                        ...linearGradient,
                        angle: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {gradientType === 'radial' && (
              <div className="mb-4">
                <div className="row">
                  <div className="col-4">
                    <label className="form-label fw-bold">Centro X (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={radialGradient.centerX}
                      onChange={(e) => setRadialGradient({
                        ...radialGradient,
                        centerX: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label fw-bold">Centro Y (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={radialGradient.centerY}
                      onChange={(e) => setRadialGradient({
                        ...radialGradient,
                        centerY: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label fw-bold">Raio (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="200"
                      value={radialGradient.radius}
                      onChange={(e) => setRadialGradient({
                        ...radialGradient,
                        radius: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pontos de cor */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-label fw-bold mb-0">Pontos de Cor</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addStop}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Adicionar
                </button>
              </div>
              
              {currentGradient.stops.map((stop: GradientStop, index: number) => (
                <div key={index} className="row align-items-center mb-2">
                  <div className="col-4">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={stop.color}
                      onChange={(e) => handleStopChange(index, 'color', e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <div className="input-group">
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => handleStopChange(index, 'position', parseInt(e.target.value))}
                      />
                      <span className="input-group-text">{stop.position}%</span>
                    </div>
                  </div>
                  <div className="col-2">
                    {currentGradient.stops.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeStop(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-danger" onClick={handleRemove}>
              <i className="bi bi-trash me-1"></i>
              Remover Gradiente
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleApply}>
              <i className="bi bi-check me-1"></i>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
