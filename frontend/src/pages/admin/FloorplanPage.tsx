import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, PrimaryButton } from '../../widgets';
import { Building2, Layers, MapPin, Plus, Edit2, Trash2, Save, RefreshCw, Monitor, Settings } from 'lucide-react';
import apiService from '../../utils/services/api';

interface Location {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

interface Floor {
  id: string;
  name: string;
  floorNumber: number;
  description?: string;
  floorPlanImageUrl?: string;
  locationId: string;
  locationName: string;
  zoneCount: number;
  deskCount: number;
}

interface Zone {
  id: string;
  name: string;
  description?: string;
  zoneType: string;
  isActive: boolean;
  maxCapacity?: number;
  floorId: string;
  floorName: string;
  locationName: string;
  deskCount: number;
  activeDeskCount: number;
}

interface FloorDesk {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  hasMonitor: boolean;
  hasKeyboard: boolean;
  hasMouse: boolean;
  hasDockingStation: boolean;
  features?: string;
  xCoordinate?: number;
  yCoordinate?: number;
  zoneId: string;
  zoneName: string;
  floorId: string;
  floorName: string;
  locationId: string;
  locationName: string;
}

const FloorPlanPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [desks, setDesks] = useState<FloorDesk[]>([]);
  
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedDesk, setSelectedDesk] = useState<FloorDesk | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Drag state
  const [draggedDesk, setDraggedDesk] = useState<FloorDesk | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Canvas settings
  const canvasWidth = 800;
  const canvasHeight = 600;
  const deskSize = 50;

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await apiService.getLocations();
        setLocations(data);
        if (data.length > 0) {
          setSelectedLocationId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Lokasyonlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Fetch floors when location changes
  useEffect(() => {
    if (!selectedLocationId) {
      setFloors([]);
      return;
    }
    
    const fetchFloors = async () => {
      try {
        const data = await apiService.getFloors(selectedLocationId);
        setFloors(data);
        if (data.length > 0) {
          setSelectedFloorId(data[0].id);
        } else {
          setSelectedFloorId('');
        }
      } catch (err) {
        console.error('Error fetching floors:', err);
        setFloors([]);
      }
    };
    fetchFloors();
  }, [selectedLocationId]);

  // Fetch zones when floor changes
  useEffect(() => {
    if (!selectedFloorId) {
      setZones([]);
      return;
    }
    
    const fetchZones = async () => {
      try {
        const data = await apiService.getZones(selectedFloorId);
        setZones(data);
        if (data.length > 0) {
          setSelectedZoneId(data[0].id);
        } else {
          setSelectedZoneId('');
        }
      } catch (err) {
        console.error('Error fetching zones:', err);
        setZones([]);
      }
    };
    fetchZones();
  }, [selectedFloorId]);

  // Fetch desks when floor changes
  useEffect(() => {
    if (!selectedFloorId) {
      setDesks([]);
      return;
    }
    
    const fetchDesks = async () => {
      try {
        const data = await apiService.getDesks(selectedFloorId);
        setDesks(data);
      } catch (err) {
        console.error('Error fetching desks:', err);
        setDesks([]);
      }
    };
    fetchDesks();
  }, [selectedFloorId]);

  // Handle desk drag start
  const handleDragStart = (desk: FloorDesk, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggedDesk(desk);
    setIsDragging(true);
    setSelectedDesk(desk);
  };

  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !draggedDesk) return;
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasWidth - deskSize, e.clientX - rect.left - deskSize / 2));
    const y = Math.max(0, Math.min(canvasHeight - deskSize, e.clientY - rect.top - deskSize / 2));
    
    setDesks(prev => prev.map(d => 
      d.id === draggedDesk.id 
        ? { ...d, xCoordinate: Math.round(x), yCoordinate: Math.round(y) }
        : d
    ));
    setHasChanges(true);
  }, [isDragging, draggedDesk]);

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedDesk(null);
  };

  // Save positions
  const handleSavePositions = async () => {
    setSaving(true);
    try {
      const positions = desks.map(d => ({
        deskId: d.id,
        xCoordinate: d.xCoordinate || 0,
        yCoordinate: d.yCoordinate || 0,
      }));
      await apiService.updateDeskPositions(positions);
      setHasChanges(false);
      setError(null);
    } catch (err) {
      console.error('Error saving positions:', err);
      setError('Pozisyonlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  // Add new desk
  const handleAddDesk = async () => {
    if (!selectedZoneId) {
      setError('Lütfen önce bir bölge seçin');
      return;
    }
    
    try {
      const newDesk = await apiService.createDesk({
        name: `Masa ${desks.length + 1}`,
        zoneId: selectedZoneId,
        xCoordinate: 50 + (desks.length % 10) * 60,
        yCoordinate: 50 + Math.floor(desks.length / 10) * 60,
      });
      setDesks(prev => [...prev, { ...newDesk, zoneName: zones.find(z => z.id === selectedZoneId)?.name || '', floorId: selectedFloorId, floorName: floors.find(f => f.id === selectedFloorId)?.name || '', locationId: selectedLocationId, locationName: locations.find(l => l.id === selectedLocationId)?.name || '' }]);
    } catch (err) {
      console.error('Error creating desk:', err);
      setError('Masa oluşturulurken hata oluştu');
    }
  };

  // Get zone color
  const getZoneColor = (zoneId: string) => {
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
    const index = zones.findIndex(z => z.id === zoneId);
    return colors[index % colors.length];
  };

  const selectedFloor = floors.find(f => f.id === selectedFloorId);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6366f1' }}>
          <RefreshCw style={{ width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Yükleniyor...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Kat Planı Yönetimi"
        description="Ofis kat planlarını ve masa/oda konumlarını yönetin."
      />

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Location Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 style={{ width: 20, height: 20, color: '#6366f1' }} />
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', fontSize: '0.95rem', minWidth: '180px', cursor: 'pointer' }}
          >
            <option value="">Lokasyon Seçin</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Floor Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers style={{ width: 20, height: 20, color: '#22c55e' }} />
          <select
            value={selectedFloorId}
            onChange={(e) => setSelectedFloorId(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', fontSize: '0.95rem', minWidth: '180px', cursor: 'pointer' }}
            disabled={!selectedLocationId}
          >
            <option value="">Kat Seçin</option>
            {floors.map(floor => (
              <option key={floor.id} value={floor.id}>{floor.name} (Kat {floor.floorNumber})</option>
            ))}
          </select>
        </div>

        {/* Zone Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin style={{ width: 20, height: 20, color: '#f59e0b' }} />
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', fontSize: '0.95rem', minWidth: '180px', cursor: 'pointer' }}
            disabled={!selectedFloorId}
          >
            <option value="">Bölge Seçin (Masa Eklemek için)</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          <PrimaryButton onClick={handleAddDesk} size="medium" disabled={!selectedZoneId}>
            <Plus style={{ width: 18, height: 18, marginRight: '0.5rem' }} />
            Masa Ekle
          </PrimaryButton>
          
          {hasChanges && (
            <PrimaryButton onClick={handleSavePositions} size="medium" disabled={saving}>
              <Save style={{ width: 18, height: 18, marginRight: '0.5rem' }} />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Floor Plan Canvas */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Canvas */}
        <div 
          style={{ 
            flex: 1, 
            background: '#fff', 
            borderRadius: '1.5rem', 
            padding: '1.5rem', 
            boxShadow: '0 8px 32px rgba(31,38,135,0.10)',
            minHeight: canvasHeight + 100
          }}
        >
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#312e81', fontSize: '1.1rem' }}>
              {selectedFloor ? `${selectedFloor.name} - Kat Planı` : 'Kat planını görüntülemek için bir kat seçin'}
            </h3>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              {desks.length} masa
            </span>
          </div>

          {selectedFloorId ? (
            <div
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: canvasWidth,
                height: canvasHeight,
                background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%)',
                border: '2px dashed #c7d2fe',
                borderRadius: '1rem',
                position: 'relative',
                cursor: isDragging ? 'grabbing' : 'default',
                overflow: 'hidden',
                backgroundImage: selectedFloor?.floorPlanImageUrl ? `url(${selectedFloor.floorPlanImageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Grid lines */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {Array.from({ length: Math.floor(canvasWidth / 50) }).map((_, i) => (
                  <line key={`v${i}`} x1={(i + 1) * 50} y1="0" x2={(i + 1) * 50} y2={canvasHeight} stroke="#e0e7ff" strokeWidth="1" />
                ))}
                {Array.from({ length: Math.floor(canvasHeight / 50) }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={(i + 1) * 50} x2={canvasWidth} y2={(i + 1) * 50} stroke="#e0e7ff" strokeWidth="1" />
                ))}
              </svg>

              {/* Desks */}
              {desks.map((desk) => (
                <div
                  key={desk.id}
                  onMouseDown={(e) => handleDragStart(desk, e)}
                  onClick={() => setSelectedDesk(desk)}
                  style={{
                    position: 'absolute',
                    left: desk.xCoordinate || 10,
                    top: desk.yCoordinate || 10,
                    width: deskSize,
                    height: deskSize,
                    backgroundColor: getZoneColor(desk.zoneId),
                    borderRadius: '0.5rem',
                    cursor: isDragging && draggedDesk?.id === desk.id ? 'grabbing' : 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    boxShadow: selectedDesk?.id === desk.id 
                      ? '0 0 0 3px #fff, 0 0 0 5px #6366f1, 0 4px 12px rgba(0,0,0,0.3)' 
                      : '0 2px 8px rgba(0,0,0,0.15)',
                    transition: isDragging ? 'none' : 'box-shadow 0.15s',
                    userSelect: 'none',
                    zIndex: selectedDesk?.id === desk.id ? 10 : 1,
                  }}
                  title={`${desk.name}\n${desk.zoneName}\n${desk.hasMonitor ? '🖥️ Monitör' : ''}`}
                >
                  <Monitor style={{ width: 20, height: 20 }} />
                </div>
              ))}

              {/* Empty state */}
              {desks.length === 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#6366f1'
                }}>
                  <MapPin style={{ width: 48, height: 48, marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Bu katta henüz masa yok</p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#888' }}>Bir bölge seçip "Masa Ekle" butonuna tıklayın</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              width: canvasWidth, 
              height: canvasHeight, 
              background: '#f8fafc', 
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#94a3b8'
            }}>
              <Layers style={{ width: 64, height: 64, marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Kat planını görüntülemek için bir lokasyon ve kat seçin</p>
            </div>
          )}
        </div>

        {/* Sidebar - Desk Details */}
        <div style={{ width: 300, flexShrink: 0 }}>
          {/* Legend */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '1rem', 
            padding: '1.25rem', 
            marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(31,38,135,0.08)'
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#312e81', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin style={{ width: 16, height: 16 }} />
              Bölgeler
            </h4>
            {zones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {zones.map(zone => (
                  <div 
                    key={zone.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      background: selectedZoneId === zone.id ? '#eef2ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedZoneId(zone.id)}
                  >
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '0.25rem', 
                      backgroundColor: getZoneColor(zone.id) 
                    }} />
                    <span style={{ fontSize: '0.9rem', color: '#374151' }}>{zone.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>{zone.activeDeskCount} masa</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>Bu katta bölge yok</p>
            )}
          </div>

          {/* Selected Desk Details */}
          {selectedDesk && (
            <div style={{ 
              background: '#fff', 
              borderRadius: '1rem', 
              padding: '1.25rem',
              boxShadow: '0 4px 16px rgba(31,38,135,0.08)'
            }}>
              <h4 style={{ margin: '0 0 1rem', color: '#312e81', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings style={{ width: 16, height: 16 }} />
                Masa Detayları
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Masa Adı</label>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#374151' }}>{selectedDesk.name}</p>
                </div>
                
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bölge</label>
                  <p style={{ margin: '0.25rem 0 0', color: '#374151' }}>{selectedDesk.zoneName}</p>
                </div>
                
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Konum</label>
                  <p style={{ margin: '0.25rem 0 0', color: '#374151', fontSize: '0.9rem' }}>
                    X: {selectedDesk.xCoordinate?.toFixed(0) || 0}, Y: {selectedDesk.yCoordinate?.toFixed(0) || 0}
                  </p>
                </div>
                
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Donanım</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      fontSize: '0.75rem',
                      background: selectedDesk.hasMonitor ? '#dcfce7' : '#f3f4f6',
                      color: selectedDesk.hasMonitor ? '#166534' : '#9ca3af'
                    }}>
                      🖥️ Monitör
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      fontSize: '0.75rem',
                      background: selectedDesk.hasKeyboard ? '#dcfce7' : '#f3f4f6',
                      color: selectedDesk.hasKeyboard ? '#166534' : '#9ca3af'
                    }}>
                      ⌨️ Klavye
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      fontSize: '0.75rem',
                      background: selectedDesk.hasMouse ? '#dcfce7' : '#f3f4f6',
                      color: selectedDesk.hasMouse ? '#166534' : '#9ca3af'
                    }}>
                      🖱️ Mouse
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      fontSize: '0.75rem',
                      background: selectedDesk.hasDockingStation ? '#dcfce7' : '#f3f4f6',
                      color: selectedDesk.hasDockingStation ? '#166534' : '#9ca3af'
                    }}>
                      ⚡ Dock
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => console.log('Edit desk', selectedDesk.id)}
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '0.5rem', 
                      background: 'white', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.85rem',
                      color: '#374151'
                    }}
                  >
                    <Edit2 style={{ width: 14, height: 14 }} />
                    Düzenle
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Bu masayı silmek istediğinizden emin misiniz?')) {
                        apiService.deleteDesk(selectedDesk.id).then(() => {
                          setDesks(prev => prev.filter(d => d.id !== selectedDesk.id));
                          setSelectedDesk(null);
                        });
                      }
                    }}
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      border: '1px solid #fee2e2', 
                      borderRadius: '0.5rem', 
                      background: '#fef2f2', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.85rem',
                      color: '#991b1b'
                    }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  );
};

export default FloorPlanPage;
