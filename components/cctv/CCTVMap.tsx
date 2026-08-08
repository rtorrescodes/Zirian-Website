'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon, Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Plus, Save, Layers, Map as MapIcon, Crosshair, ChevronLeft, X, LocateFixed, RotateCcw, RotateCw } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { getClients } from '@/app/actions/clients';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places', 'geometry'];

// Default center: Mexico City
const defaultCenter = {
  lat: 19.4326,
  lng: -99.1332
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

interface DoriZones {
  identify: number;
  recognize: number;
  observe: number;
  detect: number;
}

interface CameraModel {
  id: string;
  name: string;
  fov: number; // grados de apertura
  dori: DoriZones; // distancias en metros
}

const GENERIC_CAMERAS: CameraModel[] = [
  { id: 'cam-2.8mm', name: 'Domo 2MP Lente 2.8mm', fov: 105, dori: { identify: 4, recognize: 8, observe: 15, detect: 37 } },
  { id: 'cam-4mm', name: 'Bala 4MP Lente 4mm', fov: 85, dori: { identify: 6, recognize: 12, observe: 24, detect: 60 } },
  { id: 'cam-ptz', name: 'PTZ 25x (Zoom Máximo)', fov: 5, dori: { identify: 100, recognize: 200, observe: 500, detect: 1000 } },
  { id: 'cam-ezviz-cscb54k', name: 'EZVIZ Solar 4K Wi-Fi 6', fov: 105, dori: { identify: 10, recognize: 20, observe: 40, detect: 80 } },
];

interface CameraInstance {
  id: string;
  modelId: string;
  lat: number;
  lng: number;
  heading: number;
  fov: number;
  dori: DoriZones;
  layer: string;
}

export default function CCTVMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [cameras, setCameras] = useState<CameraInstance[]>([]);
  const [activeCamId, setActiveCamId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete>(null);
  const [searchText, setSearchText] = useState('');

  // Layers State
  const [layers, setLayers] = useState<string[]>(['General', 'Fase 1', 'Fase 2']);
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['General', 'Fase 1', 'Fase 2']);
  const [activeLayer, setActiveLayer] = useState<string>('General');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  
  // Map View State
  const [mapHeading, setMapHeading] = useState(0);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite');

  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [clients, setClients] = useState<{id: number, nombre: string, empresa: string | null}[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getClients().then(data => setClients(data));
  }, []);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const calculateFOV = (lat: number, lng: number, heading: number, distance: number, fov: number) => {
    if (!window.google) return [];
    
    const center = new google.maps.LatLng(lat, lng);
    const points: google.maps.LatLngLiteral[] = [{ lat, lng }];
    
    const startAngle = heading - (fov / 2);
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (i * fov / steps);
      const point = google.maps.geometry.spherical.computeOffset(center, distance, angle);
      points.push({ lat: point.lat(), lng: point.lng() });
    }
    
    return points;
  };

  const handleAddCamera = () => {
    if (!map) return;
    
    const center = map.getCenter();
    if (!center) return;
    
    const defaultModel = GENERIC_CAMERAS[0];
    
    const newCamId = Math.random().toString(36).substring(7);
    const newCam: CameraInstance = {
      id: newCamId,
      modelId: defaultModel.id,
      lat: center.lat(),
      lng: center.lng(),
      heading: 0, // North
      fov: defaultModel.fov,
      dori: defaultModel.dori,
      layer: activeLayer
    };
    
    setCameras([...cameras, newCam]);
    setActiveCamId(newCamId);
  };

  const updateCamera = (id: string, updates: Partial<CameraInstance>) => {
    setCameras(cams => cams.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const onPlaceChanged = () => {
    if (searchBoxRef.current !== null) {
      const place = searchBoxRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        if (map) {
          map.panTo(place.geometry.location);
          map.setZoom(19);
        }
      }
    }
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parts = searchText.split(',').map(p => p.trim());
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng) && map) {
          map.panTo({ lat, lng });
          map.setZoom(19);
        }
      }
    }
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map) {
            map.panTo({ lat: position.coords.latitude, lng: position.coords.longitude });
            map.setZoom(19);
          }
        },
        (error) => {
          console.error("Error obteniendo ubicación GPS", error);
          alert("No se pudo obtener tu ubicación actual.");
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  const handleSave = async () => {
    if (!selectedClientId || !projectName) {
      alert("Por favor selecciona un cliente y dale un nombre al proyecto.");
      return;
    }

    try {
      setIsSaving(true);
      
      // 1. Quitar selección para que el screenshot no salga con los controles verdes
      setActiveCamId(null);
      
      // Esperamos un ciclo para que react renderice el des-select
      await new Promise(r => setTimeout(r, 100));

      // 2. Tomar screenshot del mapa (ignorando controles flotantes)
      let previewImage = '';
      if (mapRef.current) {
        // Encontrar el div del mapa. @react-google-maps/api renderiza divs internos.
        // Hacemos html2canvas con useCORS = true para que los tiles del satélite pasen (si Google lo permite)
        const canvas = await html2canvas(mapRef.current, { useCORS: true, allowTaint: false, logging: false });
        previewImage = canvas.toDataURL('image/jpeg', 0.8);
      }

      // 3. Obtener el state
      const mapState = {
        cameras,
        layers,
        visibleLayers,
        activeLayer,
        center: map ? { lat: map.getCenter()?.lat(), lng: map.getCenter()?.lng() } : null,
        zoom: map?.getZoom()
      };

      // 4. Mandar al API
      const res = await fetch('/api/cctv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          nombre: projectName,
          mapState,
          previewImage
        })
      });

      if (!res.ok) throw new Error("Error al guardar");

      alert("Proyecto guardado exitosamente!");
      setShowSaveModal(false);
    } catch (err) {
      console.error(err);
      alert("Error al generar vista previa. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white font-tech">
        <p className="text-red-400">Error al cargar el mapa. Verifica tu API Key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white font-tech">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900">
      
      <div ref={mapRef} className="w-full h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={18}
          heading={mapHeading}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapId: '5c8f34a7bc0bdb2632572d5f',
            mapTypeId: mapType,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            rotateControl: true,
            tilt: 0,
          }}
        >
          {cameras.filter(cam => visibleLayers.includes(cam.layer || 'General')).map(cam => {
            const isActive = activeCamId === cam.id;
            
            return (
              <React.Fragment key={cam.id}>
                {/* Detect (Azul) */}
                <Polygon
                  paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.detect, cam.fov)}
                  options={{
                    fillColor: '#3b82f6', fillOpacity: 0.2, strokeColor: isActive ? '#fff' : '#3b82f6', strokeWeight: isActive ? 2 : 1, clickable: false
                  }}
                />
                {/* Observe (Verde) */}
                <Polygon
                  paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.observe, cam.fov)}
                  options={{
                    fillColor: '#22c55e', fillOpacity: 0.3, strokeColor: 'transparent', clickable: false
                  }}
                />
                {/* Recognize (Amarillo) */}
                <Polygon
                  paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.recognize, cam.fov)}
                  options={{
                    fillColor: '#eab308', fillOpacity: 0.4, strokeColor: 'transparent', clickable: false
                  }}
                />
                {/* Identify (Rojo) */}
                <Polygon
                  paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.identify, cam.fov)}
                  options={{
                    fillColor: '#ef4444', fillOpacity: 0.5, strokeColor: 'transparent', clickable: false
                  }}
                />

                <Marker
                position={{ lat: cam.lat, lng: cam.lng }}
                draggable={true}
                onClick={() => setActiveCamId(cam.id)}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    updateCamera(cam.id, { lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }
                }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/kml/shapes/camera.png',
                  scaledSize: typeof window !== 'undefined' && window.google ? new window.google.maps.Size(24, 24) : undefined
                }}
              />
              </React.Fragment>
            );
          })}
        </GoogleMap>
      </div>

      {/* Top Floating Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="bg-slate-900/80 border-slate-700 text-white backdrop-blur-sm">
              <ChevronLeft className="w-4 h-4 mr-2" /> Volver
            </Button>
          </Link>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <Crosshair className="w-5 h-5 text-brand-blue" />
            <h1 className="font-tech font-bold uppercase tracking-widest text-white text-sm">Proyecto CCTV</h1>
          </div>
          
          <div className="relative pointer-events-auto flex items-center bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
            <Autocomplete
              onLoad={(autocomplete) => { searchBoxRef.current = autocomplete; }}
              onPlaceChanged={onPlaceChanged}
            >
              <input 
                type="text" 
                placeholder="Buscar (ej. Zócalo) o lat, lng..." 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                className="bg-transparent border-none outline-none text-white text-sm px-4 py-2 w-72 placeholder:text-slate-500"
              />
            </Autocomplete>
            <button 
              onClick={handleGPS} 
              className="p-2 text-slate-400 hover:text-white border-l border-slate-700 bg-slate-800/50 hover:bg-slate-700 transition-colors"
              title="Usar mi ubicación GPS"
            >
              <LocateFixed className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <Button 
            onClick={() => setMapType(t => t === 'satellite' ? 'roadmap' : 'satellite')}
            variant="outline" 
            className="bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white backdrop-blur-sm"
          >
            <MapIcon className="w-4 h-4 mr-2" /> {mapType === 'satellite' ? 'Vista Vector' : 'Vista Satélite'}
          </Button>
          <Button 
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            variant="outline" 
            className={`bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white backdrop-blur-sm ${showLayerPanel ? 'bg-brand-blue/20 border-brand-blue text-white' : ''}`}
          >
            <Layers className="w-4 h-4 mr-2" /> Capas / Fases
          </Button>
          <Button 
            onClick={() => setShowSaveModal(true)}
            variant="outline" 
            className="bg-brand-blue border-brand-blue text-white hover:bg-brand-blue/80 hover:text-white transition-all shadow-lg shadow-brand-blue/30"
          >
            <Save className="w-4 h-4 mr-2" /> Guardar Proyecto
          </Button>
        </div>
      </div>

      {/* Layer Management Panel */}
      {showLayerPanel && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-4 pointer-events-auto z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-tech font-bold uppercase tracking-widest text-sm">Capas / Fases</h3>
            <button onClick={() => setShowLayerPanel(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
          </div>
          
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {layers.map(layer => (
              <div key={layer} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={visibleLayers.includes(layer)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVisibleLayers([...visibleLayers, layer]);
                      } else {
                        setVisibleLayers(visibleLayers.filter(l => l !== layer));
                      }
                    }}
                    className="accent-brand-blue"
                  />
                  <span className="text-sm text-slate-300">{layer}</span>
                </label>
                <button 
                  onClick={() => setActiveLayer(layer)}
                  className={`text-xs px-2 py-1 rounded ${activeLayer === layer ? 'bg-brand-blue text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {activeLayer === layer ? 'Activa' : 'Fijar'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-slate-800 pt-4">
            <input 
              type="text" 
              placeholder="Nueva Capa..." 
              value={newLayerName}
              onChange={e => setNewLayerName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded px-3 py-1 outline-none"
            />
            <Button 
              size="sm"
              onClick={() => {
                if (newLayerName && !layers.includes(newLayerName)) {
                  setLayers([...layers, newLayerName]);
                  setVisibleLayers([...visibleLayers, newLayerName]);
                  setActiveLayer(newLayerName);
                  setNewLayerName('');
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}


      {/* Right Floating Panel */}
      <div className="absolute top-20 right-4 w-80 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-6 pointer-events-auto z-10 max-h-[80vh] overflow-y-auto">
        <h2 className="text-white font-tech font-bold uppercase tracking-widest text-sm mb-4">Diseña tu sistema</h2>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Coloca cámaras reales sobre tu sitio y ve exactamente qué alcanza a ver cada una.
        </p>
        
        <Button onClick={handleAddCamera} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white font-tech uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all mb-8">
          <Plus className="w-4 h-4 mr-2" /> Agregar Cámara
        </Button>

        {activeCamId ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Configurar Cámara</h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Modelo</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none"
                value={cameras.find(c => c.id === activeCamId)?.modelId}
                onChange={(e) => {
                  const model = GENERIC_CAMERAS.find(m => m.id === e.target.value);
                  if (model) {
                    updateCamera(activeCamId, { modelId: model.id, fov: model.fov, dori: model.dori });
                  }
                }}
              >
                {GENERIC_CAMERAS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Capa / Fase</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none"
                value={cameras.find(c => c.id === activeCamId)?.layer || 'General'}
                onChange={(e) => {
                  updateCamera(activeCamId, { layer: e.target.value });
                }}
              >
                {layers.map(layer => (
                  <option key={layer} value={layer}>{layer}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Rotación (Heading)</span>
                <span>{cameras.find(c => c.id === activeCamId)?.heading}°</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={cameras.find(c => c.id === activeCamId)?.heading || 0}
                onChange={(e) => updateCamera(activeCamId, { heading: parseInt(e.target.value) })}
                className="w-full accent-brand-blue"
              />
            </div>
            
            <Button variant="destructive" size="sm" className="w-full mt-4" onClick={() => {
              setCameras(cams => cams.filter(c => c.id !== activeCamId));
              setActiveCamId(null);
            }}>Eliminar Cámara</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {[
              { step: 1, title: 'Ubica tu sitio', desc: 'Busca la dirección en el satélite o sube el croquis de tu planta.' },
              { step: 2, title: 'Agrega cámaras', desc: 'Catálogo de 10 modelos seleccionados con óptica precargada.' },
              { step: 3, title: 'Acomoda cada cono', desc: 'Arrastra el icono para mover, ajusta el ángulo y la apertura.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-tech text-slate-300">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2 rounded-full shadow-2xl pointer-events-auto z-10">
        <button 
          onClick={() => {
            if (map) {
              const newHeading = (map.getHeading() || 0) - 90;
              map.setHeading(newHeading);
              setMapHeading(newHeading);
            }
          }} 
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          title="Rotar a la izquierda (90°)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-slate-700 mx-2"></div>
        <button 
          onClick={() => {
            if (map) {
              const newHeading = (map.getHeading() || 0) + 90;
              map.setHeading(newHeading);
              setMapHeading(newHeading);
            }
          }} 
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          title="Rotar a la derecha (90°)"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* DORI Legend */}
      <div className="absolute bottom-6 left-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-4 pointer-events-auto z-10">
        <h3 className="text-xs font-bold text-white font-tech uppercase tracking-widest mb-3">Zonas DORI (IEC 62676-4)</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500 opacity-60"></div><span className="text-[10px] text-slate-300">Detectar (25 PPM)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500 opacity-60"></div><span className="text-[10px] text-slate-300">Observar (62 PPM)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-yellow-500 opacity-60"></div><span className="text-[10px] text-slate-300">Reconocer (125 PPM)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500 opacity-60"></div><span className="text-[10px] text-slate-300">Identificar (250 PPM)</span></div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-[400px] p-6 shadow-2xl relative">
            <button onClick={() => setShowSaveModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            <h2 className="text-xl font-bold text-white mb-6">Guardar Diseño CCTV</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Cliente</label>
                <select 
                  value={selectedClientId} 
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded outline-none"
                >
                  <option value="">Selecciona un cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.empresa ? `(${c.empresa})` : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Nombre del Proyecto</label>
                <input 
                  type="text" 
                  placeholder="Ej. Planta Monterrey"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded outline-none"
                />
              </div>

              <Button 
                disabled={isSaving}
                onClick={handleSave} 
                className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white py-6"
              >
                {isSaving ? "Guardando y capturando..." : "Confirmar y Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
