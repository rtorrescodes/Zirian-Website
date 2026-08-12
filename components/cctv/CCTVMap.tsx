'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon, Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Plus, Save, Layers, Map as MapIcon, Crosshair, ChevronLeft, X, LocateFixed, RotateCcw, RotateCw, FolderOpen, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { getClients } from '@/app/actions/clients';
import { createQuoteFromCctv } from '@/app/actions/cctvToQuote';
import { useRouter, useSearchParams } from 'next/navigation';

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

export type DeviceType = 'camera' | 'wifi';

interface CameraModel {
  id: string;
  name: string;
  friendlyName: string;
  fov: number; // grados de apertura
  dori: DoriZones; // distancias en metros
  type?: DeviceType;
}

const GENERIC_CAMERAS: CameraModel[] = [
  { id: 'cam-2.8mm', name: 'Hikvision DS-2CE56D0T-IRPF (2.8mm)', friendlyName: 'Domo 2MP Lente 2.8mm', fov: 105, dori: { identify: 4, recognize: 8, observe: 15, detect: 37 }, type: 'camera' },
  { id: 'cam-4mm', name: 'Hikvision DS-2CE16D0T-IRF (4mm)', friendlyName: 'Bala 4MP Lente 4mm', fov: 85, dori: { identify: 6, recognize: 12, observe: 24, detect: 60 }, type: 'camera' },
  { id: 'cam-ptz', name: 'Hikvision DS-2DE2204IW-DE3 (PTZ)', friendlyName: 'PTZ 25x (Zoom Máximo)', fov: 5, dori: { identify: 100, recognize: 200, observe: 500, detect: 1000 }, type: 'camera' },
  { id: 'cam-ezviz-cscb54k', name: 'EZVIZ CS-CB5 (4K Solar)', friendlyName: '4K Solar Wi-Fi', fov: 105, dori: { identify: 10, recognize: 20, observe: 40, detect: 80 }, type: 'camera' },
];

const GENERIC_WIFI_APS: CameraModel[] = [
  { id: 'wifi-ubiquiti-u6', name: 'Ubiquiti U6-Mesh (Omni 360°)', friendlyName: 'Ubiquiti U6-Mesh (360°)', fov: 360, dori: { identify: 0, recognize: 0, observe: 0, detect: 50 }, type: 'wifi' },
  { id: 'wifi-ruijie-rgrap', name: 'Ruijie RGRAP52ODSEC (Sectorial 90°)', friendlyName: 'Ruijie RGRAP (90°)', fov: 90, dori: { identify: 0, recognize: 0, observe: 0, detect: 150 }, type: 'wifi' },
  { id: 'wifi-tplink-bridge', name: 'TP-Link EAP215-Bridge (Direccional 5°)', friendlyName: 'TP-Link Bridge 5km', fov: 5, dori: { identify: 0, recognize: 0, observe: 0, detect: 5000 }, type: 'wifi' }
];

interface CameraInstance {
  id: string;
  name?: string;
  modelId: string;
  lat: number;
  lng: number;
  heading: number;
  fov: number;
  dori: DoriZones;
  layer: string;
  section?: string;
  type?: DeviceType;
  isNewProposal?: boolean;
  isRemovedProposal?: boolean;
}

interface CCTVMapProps {
  clientMode?: boolean;
  shareToken?: string;
}

export default function CCTVMap({ clientMode = false, shareToken }: CCTVMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const autoLoadId = searchParams.get('cctvId');

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [cameras, setCameras] = useState<CameraInstance[]>([]);
  const [activeCamId, setActiveCamId] = useState<string | null>(null);
  
  const [showDori, setShowDori] = useState(true);
  const [doriOpacity, setDoriOpacity] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete>(null);
  const [searchText, setSearchText] = useState('');

  // Layers & Sections State
  const [layers, setLayers] = useState<string[]>(['General', 'Fase 1', 'Fase 2']);
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['General', 'Fase 1', 'Fase 2']);
  const [activeLayer, setActiveLayer] = useState<string>('General');
  
  const [sections, setSections] = useState<string[]>(['General', 'Perímetro', 'Interiores', 'Exteriores']);
  const [activeSection, setActiveSection] = useState<string>('General');

  // UI State
  const [demoMode, setDemoMode] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState<'cameras' | 'org'>('cameras');
  const [groupBy, setGroupBy] = useState<'layer' | 'section'>('layer');
  const [mobilePanel, setMobilePanel] = useState<'none' | 'left' | 'right' | 'dori'>('none');
  
  // Map View State
  const [mapHeading, setMapHeading] = useState(0);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite');

  // Save/Load Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [clients, setClients] = useState<{id: number, nombre: string, empresa: string | null}[]>([]);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadedProjectInfo, setLoadedProjectInfo] = useState<{id: number, nombre: string, clientName: string, hasClientChanges?: boolean, proposedMapState?: any} | null>(null);

  const fetchSavedProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch('/api/cctv');
      if (res.ok) {
        const data = await res.json();
        setSavedProjects(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleLoadProject = (project: any) => {
    const state = project.mapState;
    if (!state) return;
    
    setLoadedProjectInfo({
      id: project.id,
      nombre: project.nombre,
      clientName: project.client?.nombre || 'Cliente Anónimo',
      hasClientChanges: project.hasClientChanges,
      proposedMapState: project.proposedMapState
    });
    setSelectedClientId(project.clientId.toString());
    setProjectName(project.nombre);

    setCameras(state.cameras || []);
    setLayers(state.layers || ['General', 'Fase 1', 'Fase 2']);
    setVisibleLayers(state.visibleLayers || ['General', 'Fase 1', 'Fase 2']);
    setActiveLayer(state.activeLayer || 'General');
    
    if (state.sections) setSections(state.sections);
    
    if (state.heading !== undefined) setMapHeading(state.heading);
    if (state.mapType) setMapType(state.mapType);
    
    if (state.center && map) {
      map.panTo(state.center);
      if (state.zoom) map.setZoom(state.zoom);
      if (state.heading !== undefined) map.setHeading(state.heading);
      if (state.mapType) map.setMapTypeId(state.mapType);
    }
    setShowLoadModal(false);
  };

  useEffect(() => {
    getClients().then(data => setClients(data));
  }, []);

  // Handle auto-load from URL
  useEffect(() => {
    if (autoLoadId && map && !loadedProjectInfo) {
      fetch('/api/cctv')
        .then(res => res.json())
        .then(data => {
          const project = data.find((p: any) => p.id.toString() === autoLoadId);
          if (project) {
            handleLoadProject(project);
          }
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadId, map, loadedProjectInfo]);

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

  const handleAddDevice = (type: DeviceType = 'camera') => {
    if (!map) return;
    
    const center = map.getCenter();
    if (!center) return;
    
    const defaultModel = type === 'wifi' ? GENERIC_WIFI_APS[0] : GENERIC_CAMERAS[0];
    const newCamId = Math.random().toString(36).substring(7);
    const prefix = type === 'wifi' ? 'AP' : 'Cámara';
    
    setCameras(cams => {
      let maxNum = 0;
      cams.forEach(c => {
        const regex = new RegExp(`${prefix} (\\d+)`, 'i');
        const match = c.name?.match(regex);
        if (match && c.type === type) {
          const num = parseInt(match[1]);
          if (num > maxNum) maxNum = num;
        } else if (match && type === 'camera' && !c.type) {
           const num = parseInt(match[1]);
           if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      
      const newCam: CameraInstance = {
        id: newCamId,
        name: `${prefix} ${nextNum}`,
        modelId: defaultModel.id,
        lat: center.lat(),
        lng: center.lng(),
        heading: 0,
        fov: defaultModel.fov,
        dori: defaultModel.dori,
        layer: activeLayer,
        section: activeSection,
        type: type,
        isNewProposal: clientMode ? true : undefined
      };

      return [...cams, newCam];
    });
    
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
  const autoSaveProject = async () => {
    if (!loadedProjectInfo && !shareToken) return;
    
    const mapState = {
      cameras,
      layers,
      visibleLayers,
      activeLayer,
      sections,
      center: map ? { lat: map.getCenter()?.lat(), lng: map.getCenter()?.lng() } : null,
      zoom: map?.getZoom(),
      heading: mapHeading,
      mapType: mapType
    };

    try {
      const endpoint = clientMode ? '/api/cctv/proposal' : '/api/cctv';
      const body = clientMode 
        ? { shareToken, proposedMapState: mapState }
        : { id: loadedProjectInfo?.id, nombre: projectName, mapState, previewImage: '' };

      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      console.log('Proyecto autoguardado con éxito');
    } catch (e) {
      console.error('Error auto-guardando', e);
    }
  };

  useEffect(() => {
    if (!loadedProjectInfo) return;

    const timeoutId = setTimeout(() => {
      autoSaveProject();
    }, 2000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameras, layers, visibleLayers, activeLayer, sections]);

  const handleSave = async (isUpdate: boolean = false) => {
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
        try {
          const canvas = await html2canvas(mapRef.current, { useCORS: true, allowTaint: false, logging: false });
          previewImage = canvas.toDataURL('image/jpeg', 0.8);
        } catch (canvasError) {
          console.warn("No se pudo generar el screenshot (posible error de CSS moderno o WebGL). Guardando sin preview.", canvasError);
        }
      }

      // 3. Obtener el state
      const mapState = {
        cameras,
        layers,
        visibleLayers,
        activeLayer,
        sections,
        center: map ? { lat: map.getCenter()?.lat(), lng: map.getCenter()?.lng() } : null,
        zoom: map?.getZoom(),
        heading: mapHeading,
        mapType: mapType
      };

      // 4. Mandar al API
      const endpoint = '/api/cctv';
      const method = isUpdate ? 'PUT' : 'POST';
      const bodyPayload = isUpdate ? {
        id: loadedProjectInfo?.id,
        nombre: projectName,
        mapState,
        previewImage
      } : {
        clientId: selectedClientId,
        nombre: projectName,
        mapState,
        previewImage
      };

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) throw new Error("Error al guardar");

      const savedData = await res.json();
      
      // Update loaded state so subsequent saves don't duplicate
      if (!isUpdate) {
        setLoadedProjectInfo({
          id: savedData.id,
          nombre: savedData.nombre,
          clientName: clients.find(c => c.id.toString() === selectedClientId)?.nombre || 'Cliente Anónimo'
        });
      } else {
        setLoadedProjectInfo(prev => prev ? { ...prev, nombre: projectName } : null);
      }

      alert("Proyecto guardado exitosamente!");
      setShowSaveModal(false);
    } catch (err) {
      console.error(err);
      alert("Error al generar vista previa. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToQuote = async () => {
    if (!loadedProjectInfo) {
      alert("Debes cargar o guardar un proyecto primero para asociarlo a un cliente.");
      return;
    }
    if (cameras.length === 0) {
      alert("No hay cámaras en el diseño para cotizar.");
      return;
    }

    try {
      const quoteId = await createQuoteFromCctv(
        parseInt(selectedClientId),
        cameras.map(c => ({ modelId: c.modelId, name: c.name, section: c.section }))
      );
      router.push(`/admin/cotizador?editId=${quoteId}`);
    } catch (error: any) {
      console.error(error);
      alert("Error al crear presupuesto: " + error.message);
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
      
      {/* Top Banner indicating current project */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 pointer-events-auto">
        {loadedProjectInfo && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-brand-blue/30 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(0,163,255,0.15)] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
            <span className="text-white text-sm font-bold">{loadedProjectInfo.nombre}</span>
            <span className="text-slate-500 text-xs px-2 border-l border-slate-700">{loadedProjectInfo.clientName}</span>
            {!clientMode && loadedProjectInfo.hasClientChanges && (
              <Button 
                onClick={async () => {
                  try {
                    await fetch('/api/cctv', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: loadedProjectInfo.id,
                        nombre: loadedProjectInfo.nombre,
                        mapState: loadedProjectInfo.proposedMapState,
                        hasClientChanges: false,
                        proposedMapState: null
                      })
                    });
                    setLoadedProjectInfo({ ...loadedProjectInfo, hasClientChanges: false });
                    handleLoadProject({ ...loadedProjectInfo, mapState: loadedProjectInfo.proposedMapState });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-orange-500 hover:bg-orange-400 text-white text-xs py-1 px-3 ml-2 h-7"
              >
                Aceptar Propuesta
              </Button>
            )}
            <button 
              onClick={() => {
                setLoadedProjectInfo(null);
                setProjectName('');
                setCameras([]);
                setMapHeading(0);
                if (map) map.setHeading(0);
                setActiveCamId(null);
              }}
              className="ml-2 text-slate-400 hover:text-white"
              title="Cerrar Proyecto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Demo Mode Toggle */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-full flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={demoMode} 
              onChange={e => setDemoMode(e.target.checked)} 
              className="accent-brand-blue w-4 h-4 cursor-pointer"
            />
            <span className="text-white text-sm font-bold tracking-wide">Demo Cliente</span>
          </label>
        </div>
      </div>

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
                {cam.isRemovedProposal ? (
                  <Polygon
                    paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.detect, cam.fov)}
                    options={{
                      fillColor: '#64748b', fillOpacity: 0.1 * doriOpacity, strokeColor: isActive ? '#fff' : '#64748b', strokeWeight: isActive ? 2 : 1, clickable: false
                    }}
                  />
                ) : cam.type === 'wifi' ? (
                  <>
                    {/* Inner 30% */}
                    <Polygon
                      paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.detect * 0.33, cam.fov)}
                      options={{ fillColor: cam.isNewProposal ? '#ef4444' : '#9333ea', fillOpacity: 0.3 * doriOpacity, strokeOpacity: 0, clickable: false }}
                    />
                    {/* Mid 66% */}
                    <Polygon
                      paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.detect * 0.66, cam.fov)}
                      options={{ fillColor: cam.isNewProposal ? '#ef4444' : '#9333ea', fillOpacity: 0.15 * doriOpacity, strokeOpacity: 0, clickable: false }}
                    />
                    {/* Outer 100% */}
                    <Polygon
                      paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.detect, cam.fov)}
                      options={{ fillColor: cam.isNewProposal ? '#ef4444' : '#9333ea', fillOpacity: 0.05 * doriOpacity, strokeColor: isActive ? '#fff' : (cam.isNewProposal ? '#ef4444' : '#9333ea'), strokeWeight: isActive ? 2 : 1, clickable: false }}
                    />
                  </>
                ) : (
                  showDori && !cam.isNewProposal ? (
                    <>
                      {/* Detect (Azul) */}
                      <Polygon
                        paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.detect, cam.fov)}
                        options={{
                          fillColor: '#3b82f6', fillOpacity: 0.2 * doriOpacity, strokeColor: isActive ? '#fff' : '#3b82f6', strokeWeight: isActive ? 2 : 1, clickable: false
                        }}
                      />
                      {/* Observe (Verde) */}
                      <Polygon
                        paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.observe, cam.fov)}
                        options={{
                          fillColor: '#22c55e', fillOpacity: 0.3 * doriOpacity, strokeColor: 'transparent', clickable: false
                        }}
                      />
                      {/* Recognize (Amarillo) */}
                      <Polygon
                        paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.recognize, cam.fov)}
                        options={{
                          fillColor: '#eab308', fillOpacity: 0.4 * doriOpacity, strokeColor: 'transparent', clickable: false
                        }}
                      />
                      {/* Identify (Rojo) */}
                      <Polygon
                        paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.identify, cam.fov)}
                        options={{
                          fillColor: '#ef4444', fillOpacity: 0.5 * doriOpacity, strokeColor: 'transparent', clickable: false
                        }}
                      />
                    </>
                  ) : (
                    <Polygon
                      paths={calculateFOV(cam.lat, cam.lng, cam.heading, cam.dori.detect, cam.fov)}
                      options={{
                        fillColor: cam.isNewProposal ? '#ef4444' : '#3b82f6', fillOpacity: 0.4 * doriOpacity, strokeColor: isActive ? '#fff' : (cam.isNewProposal ? '#ef4444' : '#3b82f6'), strokeWeight: isActive ? 2 : 1, clickable: false
                      }}
                    />
                  )
                )}

                <Marker
                position={{ lat: cam.lat, lng: cam.lng }}
                draggable={true}
                onClick={() => setActiveCamId(cam.id)}
                label={{
                  text: cam.name || '',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  className: `px-1 py-0.5 rounded -mt-8 absolute ${cam.isRemovedProposal ? 'bg-slate-800/80 line-through text-slate-400' : (cam.isNewProposal ? 'bg-red-600/80 text-white' : 'bg-black/50')} ${cam.type === 'wifi' && !cam.isRemovedProposal && !cam.isNewProposal ? 'border-b-2 border-purple-500' : ''}`
                }}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    updateCamera(cam.id, { lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }
                }}
                icon={{
                  url: cam.isRemovedProposal 
                    ? 'https://maps.google.com/mapfiles/kml/shapes/info-i_maps.png'
                    : cam.type === 'wifi' 
                      ? 'https://maps.google.com/mapfiles/kml/shapes/target.png' 
                      : 'https://maps.google.com/mapfiles/kml/shapes/camera.png',
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
            onClick={() => {
              setShowLoadModal(true);
              fetchSavedProjects();
            }}
            variant="outline" 
            className="bg-slate-900/80 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-slate-950 transition-all shadow-lg shadow-brand-blue/10 backdrop-blur-sm"
          >
            <FolderOpen className="w-4 h-4 mr-2" /> Cargar Proyecto
          </Button>
        <div className="flex gap-2 pointer-events-auto">
          <Button 
            onClick={autoSaveProject}
            className="bg-brand-blue text-slate-950 font-bold hover:bg-brand-blue/90 shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" /> {clientMode ? 'Guardar Propuesta' : 'Guardar'}
          </Button>
          {!clientMode && (
            <Button 
              onClick={handleConvertToQuote}
              className="bg-emerald-500 text-blue-950 font-bold hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] ml-4"
            >
              <FileText className="w-4 h-4 mr-2" /> Cotizar Cámaras
            </Button>
          )}
        </div>
      </div>
      </div>

      {/* Left Sidebar (Cameras & Organization) */}
      {/* Left Floating Panel (Layers/Organization) */}
      {!clientMode && (
      <div className={`absolute top-20 left-4 w-72 p-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden pointer-events-auto z-10 flex flex-col max-h-[80vh] transition-transform ${mobilePanel === 'left' ? 'translate-x-0' : '-translate-x-[150%] md:translate-x-0'}`}>
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg mb-4 shrink-0">
          <button 
            onClick={() => setLeftPanelTab('cameras')} 
            className={`flex-1 text-xs font-bold font-tech uppercase tracking-wider py-2 rounded-md transition-colors ${leftPanelTab === 'cameras' ? 'bg-brand-blue text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Cámaras
          </button>
          <button 
            onClick={() => setLeftPanelTab('org')} 
            className={`flex-1 text-xs font-bold font-tech uppercase tracking-wider py-2 rounded-md transition-colors ${leftPanelTab === 'org' ? 'bg-brand-blue text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Capas / Secc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {leftPanelTab === 'cameras' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Agrupar por:</span>
                <select 
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'layer' | 'section')}
                  className="bg-slate-900 border border-slate-700 text-white rounded p-1 text-xs outline-none"
                >
                  <option value="layer">Capa / Fase</option>
                  <option value="section">Sección</option>
                </select>
              </div>

              {(() => {
                const groups = groupBy === 'layer' ? layers : sections;
                return groups.map(group => {
                  const groupCams = cameras.filter(c => (groupBy === 'layer' ? c.layer : (c.section || 'General')) === group);
                  if (groupCams.length === 0) return null;
                  
                  return (
                    <div key={group} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-full h-px bg-slate-800 flex-1"></div>
                        <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">{group}</span>
                        <div className="w-full h-px bg-slate-800 flex-1"></div>
                      </div>
                      <div className="space-y-2">
                        {groupCams.map(cam => {
                          const isWifi = cam.type === 'wifi';
                          const modelList = isWifi ? GENERIC_WIFI_APS : GENERIC_CAMERAS;
                          const model = modelList.find(m => m.id === cam.modelId);
                          const modelDisplay = model ? (demoMode ? model.friendlyName : model.name) : 'Desconocido';
                          
                          return (
                            <button
                              key={cam.id}
                              onClick={() => {
                                setActiveCamId(cam.id);
                                if (map) {
                                  map.panTo({ lat: cam.lat, lng: cam.lng });
                                  map.setZoom(20);
                                }
                              }}
                              className={`w-full text-left p-2 rounded border transition-all ${activeCamId === cam.id ? 'bg-brand-blue/10 border-brand-blue/50 text-slate-950 hover:bg-brand-cyan' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'}`}
                            >
                              <div className="font-bold text-sm truncate">{cam.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{modelDisplay}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
              {cameras.length === 0 && (
                <div className="text-center text-slate-500 text-xs py-8">
                  Agrega cámaras para verlas aquí
                </div>
              )}
            </div>
          )}

          {leftPanelTab === 'org' && (
            <div className="space-y-6">
              {/* Layers */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase mb-2">Capas / Fases</h3>
                <div className="space-y-2">
                  {layers.map(layer => (
                    <div key={layer} className={`flex items-center justify-between p-2 rounded bg-slate-900 border group transition-colors ${activeLayer === layer ? 'border-brand-blue ring-1 ring-brand-blue/50' : 'border-slate-800'}`}>
                      <div className="flex items-center gap-2 flex-1">
                        <div 
                          className={`w-3 h-3 rounded-full cursor-pointer flex-shrink-0 border flex items-center justify-center transition-colors ${activeLayer === layer ? 'border-brand-blue bg-brand-blue/20' : 'border-slate-500 bg-slate-800 hover:border-brand-blue/50'}`}
                          onClick={() => setActiveLayer(layer)}
                          title="Establecer como capa activa"
                        >
                          {activeLayer === layer && <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={visibleLayers.includes(layer)}
                          onChange={(e) => {
                            if (e.target.checked) setVisibleLayers([...visibleLayers, layer]);
                            else setVisibleLayers(visibleLayers.filter(l => l !== layer));
                          }}
                          className="accent-brand-blue cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue={layer}
                          onBlur={(e) => {
                            const newName = e.target.value.trim();
                            if (newName && newName !== layer && !layers.includes(newName)) {
                              setLayers(layers.map(l => l === layer ? newName : l));
                              setVisibleLayers(visibleLayers.map(l => l === layer ? newName : l));
                              if (activeLayer === layer) setActiveLayer(newName);
                              setCameras(cameras.map(c => c.layer === layer ? { ...c, layer: newName } : c));
                            } else {
                              e.target.value = layer;
                            }
                          }}
                          className="bg-transparent border-none outline-none text-sm text-slate-300 focus:text-white w-full"
                        />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          className="bg-transparent text-slate-500 hover:text-brand-blue text-[10px] outline-none cursor-pointer w-4 appearance-none text-center"
                          title="Mover elementos a otra capa"
                          onChange={(e) => {
                            const target = e.target.value;
                            if(target) {
                              setCameras(cameras.map(c => c.layer === layer ? { ...c, layer: target } : c));
                              e.target.value = '';
                            }
                          }}
                          value=""
                        >
                          <option value="" disabled>➜</option>
                          {layers.filter(l => l !== layer).map(l => (
                            <option key={l} value={l}>Mover a {l}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            if (layers.length > 1) {
                              setLayers(layers.filter(l => l !== layer));
                              setVisibleLayers(visibleLayers.filter(l => l !== layer));
                              if (activeLayer === layer) setActiveLayer(layers.find(l => l !== layer) || 'General');
                              setCameras(cameras.map(c => c.layer === layer ? { ...c, layer: 'General' } : c));
                            }
                          }}
                          className="text-slate-600 hover:text-red-400"
                          title="Eliminar Capa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input 
                    type="text" 
                    placeholder="Nueva capa..." 
                    id="newLayerInput"
                    className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-1 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val && !layers.includes(val)) {
                          setLayers([...layers, val]);
                          setVisibleLayers([...visibleLayers, val]);
                          setActiveLayer(val);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    className="h-6 w-6 p-0 bg-slate-800 hover:bg-slate-700 text-white"
                    onClick={() => {
                      const input = document.getElementById('newLayerInput') as HTMLInputElement;
                      if (!input) return;
                      const val = input.value.trim();
                      if (val && !layers.includes(val)) {
                        setLayers([...layers, val]);
                        setVisibleLayers([...visibleLayers, val]);
                        setActiveLayer(val);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Sections */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase mb-2">Secciones</h3>
                <div className="space-y-2">
                  {sections.map(sec => (
                    <div key={sec} className={`flex items-center justify-between p-2 rounded bg-slate-900 border group transition-colors ${activeSection === sec ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-slate-800'}`}>
                      <div className="flex items-center gap-2 flex-1">
                        <div 
                          className={`w-3 h-3 rounded-full cursor-pointer flex-shrink-0 border flex items-center justify-center transition-colors ${activeSection === sec ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-500 bg-slate-800 hover:border-emerald-500/50'}`}
                          onClick={() => setActiveSection(sec)}
                          title="Establecer como sección activa"
                        >
                          {activeSection === sec && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                        <input
                          type="text"
                        defaultValue={sec}
                        onBlur={(e) => {
                          const newName = e.target.value.trim();
                          if (newName && newName !== sec && !sections.includes(newName)) {
                            setSections(sections.map(s => s === sec ? newName : s));
                            if (activeSection === sec) setActiveSection(newName);
                            setCameras(cameras.map(c => c.section === sec ? { ...c, section: newName } : c));
                          } else {
                            e.target.value = sec;
                          }
                        }}
                        className="bg-transparent border-none outline-none text-sm text-slate-300 focus:text-white w-full"
                      />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          className="bg-transparent text-slate-500 hover:text-emerald-500 text-[10px] outline-none cursor-pointer w-4 appearance-none text-center"
                          title="Mover elementos a otra sección"
                          onChange={(e) => {
                            const target = e.target.value;
                            if(target) {
                              setCameras(cameras.map(c => c.section === sec ? { ...c, section: target } : c));
                              e.target.value = '';
                            }
                          }}
                          value=""
                        >
                          <option value="" disabled>➜</option>
                          {sections.filter(s => s !== sec).map(s => (
                            <option key={s} value={s}>Mover a {s}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            if (sections.length > 1) {
                              setSections(sections.filter(s => s !== sec));
                              if (activeSection === sec) setActiveSection(sections.find(s => s !== sec) || 'General');
                              setCameras(cameras.map(c => c.section === sec ? { ...c, section: 'General' } : c));
                            }
                          }}
                          className="text-slate-600 hover:text-red-400"
                          title="Eliminar Sección"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input 
                    type="text" 
                    placeholder="Nueva sección..." 
                    id="newSectionInput"
                    className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-1 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val && !sections.includes(val)) {
                          setSections([...sections, val]);
                          setActiveSection(val);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    className="h-6 w-6 p-0 bg-slate-800 hover:bg-slate-700 text-white"
                    onClick={() => {
                      const input = document.getElementById('newSectionInput') as HTMLInputElement;
                      if (!input) return;
                      const val = input.value.trim();
                      if (val && !sections.includes(val)) {
                        setSections([...sections, val]);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      )}


      {/* Right Floating Panel (Devices) */}
      <div className={`absolute top-20 right-4 w-80 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-6 pointer-events-auto z-10 max-h-[75vh] overflow-y-auto transition-transform ${mobilePanel === 'right' ? 'translate-x-0' : 'translate-x-[150%] md:translate-x-0'}`}>
        <h2 className="text-white font-tech font-bold uppercase tracking-widest text-sm mb-4">Diseña tu sistema</h2>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Coloca cámaras reales y equipos inalámbricos sobre tu sitio para visualizar su alcance y cobertura.
        </p>
        
        <div className="space-y-3 mb-8">
          <Button onClick={() => handleAddDevice('camera')} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 font-tech uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
            <Plus className="w-4 h-4 mr-2" /> Agregar Cámara
          </Button>
          
          {!clientMode && (
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
            <details className="group">
              <summary className="flex items-center justify-between p-3 cursor-pointer select-none text-xs font-tech font-bold text-slate-300 uppercase tracking-widest hover:bg-slate-800/50 transition-colors">
                Redes y Enlaces Inalámbricos
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="12" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-3 pt-0 border-t border-slate-800/50">
                <Button onClick={() => handleAddDevice('wifi')} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-tech uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all text-[10px] h-9">
                  <Plus className="w-3 h-3 mr-2" /> Agregar Access Point
                </Button>
              </div>
            </details>
          </div>
          )}
        </div>

        {activeCamId ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">
              {cameras.find(c => c.id === activeCamId)?.type === 'wifi' ? 'Configurar Equipo Wi-Fi' : 'Configurar Cámara'}
            </h3>
            
            {clientMode ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Las configuraciones detalladas están ocultas. Puede mover la cámara o sugerir eliminarla.</p>
              </div>
            ) : (
              <>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Identificador / Nombre</label>
              <input 
                type="text"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none focus:border-brand-blue"
                value={cameras.find(c => c.id === activeCamId)?.name || ''}
                onChange={(e) => updateCamera(activeCamId, { name: e.target.value })}
                placeholder="Ej. Cámara 1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Modelo</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none"
                value={cameras.find(c => c.id === activeCamId)?.modelId}
                onChange={(e) => {
                  const isWifi = cameras.find(c => c.id === activeCamId)?.type === 'wifi';
                  const modelList = isWifi ? GENERIC_WIFI_APS : GENERIC_CAMERAS;
                  const model = modelList.find(m => m.id === e.target.value);
                  if (model) {
                    updateCamera(activeCamId, { modelId: model.id, fov: model.fov, dori: model.dori });
                  }
                }}
              >
                {(cameras.find(c => c.id === activeCamId)?.type === 'wifi' ? GENERIC_WIFI_APS : GENERIC_CAMERAS).map(m => (
                  <option key={m.id} value={m.id}>{demoMode ? m.friendlyName : m.name}</option>
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
              <label className="text-xs text-slate-400">Sección</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none"
                value={cameras.find(c => c.id === activeCamId)?.section || 'General'}
                onChange={(e) => {
                  updateCamera(activeCamId, { section: e.target.value });
                }}
              >
                {sections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs text-slate-400">Ubicación GPS</label>
                <div className="bg-slate-950/50 rounded p-2 text-[10px] text-slate-400 font-mono border border-slate-800 flex justify-between items-center">
                  <span>{cameras.find(c => c.id === activeCamId)?.lat.toFixed(6)}, {cameras.find(c => c.id === activeCamId)?.lng.toFixed(6)}</span>
                  <button 
                    onClick={() => {
                      const cam = cameras.find(c => c.id === activeCamId);
                      if (cam && navigator.clipboard) navigator.clipboard.writeText(`${cam.lat.toFixed(6)}, ${cam.lng.toFixed(6)}`);
                    }}
                    className="text-brand-blue hover:text-white"
                    title="Copiar Coordenadas"
                  >
                    Copiar
                  </button>
                </div>
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
            </>
            )}
            
            
            <Button variant="destructive" size="sm" className="w-full mt-4" onClick={() => {
              if (clientMode) {
                setCameras(cams => cams.map(c => c.id === activeCamId ? { ...c, isRemovedProposal: true } : c));
              } else {
                setCameras(cams => cams.filter(c => c.id !== activeCamId));
              }
              setActiveCamId(null);
            }}>{clientMode ? 'Sugerir Eliminar' : 'Eliminar Cámara'}</Button>
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
      <div className={`absolute bottom-24 md:bottom-6 left-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-4 pointer-events-auto z-10 w-64 transition-transform ${mobilePanel === 'dori' ? 'translate-y-0' : 'translate-y-[200%] md:translate-y-0'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white font-tech uppercase tracking-widest">Zonas DORI (IEC)</h3>
          <button 
            onClick={() => setShowDori(!showDori)}
            className={`text-xs px-2 py-1 rounded font-bold transition-colors ${showDori ? 'bg-brand-blue text-slate-950' : 'bg-slate-800 text-slate-400'}`}
          >
            {showDori ? 'ON' : 'OFF'}
          </button>
        </div>
        
        {showDori ? (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500 opacity-60"></div><span className="text-[10px] text-slate-300">Detectar (25 PPM)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500 opacity-60"></div><span className="text-[10px] text-slate-300">Observar (62 PPM)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-yellow-500 opacity-60"></div><span className="text-[10px] text-slate-300">Reconocer (125 PPM)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500 opacity-60"></div><span className="text-[10px] text-slate-300">Identificar (250 PPM)</span></div>
          </div>
        ) : (
           <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500 opacity-60"></div><span className="text-[10px] text-slate-300">Cono Normal (Alcance Máx)</span></div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800">
          <label className="text-[10px] text-slate-400 flex justify-between mb-2">
            <span>Opacidad del Cono</span>
            <span>{Math.round(doriOpacity * 100)}%</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={doriOpacity * 100}
            onChange={(e) => setDoriOpacity(parseInt(e.target.value) / 100)}
            className="w-full accent-brand-blue h-1"
          />
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

              <div className="flex flex-col gap-2 pt-4">
                {loadedProjectInfo ? (
                  <>
                    <Button 
                      disabled={isSaving}
                      onClick={() => handleSave(true)} 
                      className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 font-bold py-6"
                    >
                      {isSaving ? "Sobrescribiendo..." : "Sobrescribir Proyecto Actual"}
                    </Button>
                    <Button 
                      disabled={isSaving}
                      onClick={() => handleSave(false)} 
                      variant="outline"
                      className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue/10 py-6"
                    >
                      {isSaving ? "Guardando..." : "Guardar como Nuevo (Copia)"}
                    </Button>
                  </>
                ) : (
                  <Button 
                    disabled={isSaving}
                    onClick={() => handleSave(false)} 
                    className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 font-bold py-6"
                  >
                    {isSaving ? "Guardando..." : "Confirmar y Guardar"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-[600px] max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-brand-blue" />
                Cargar Diseño Guardado
              </h2>
              <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingProjects ? (
                <div className="text-center py-12 text-slate-400">Cargando proyectos...</div>
              ) : savedProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  No hay proyectos guardados todavía.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProjects.map(p => (
                    <div key={p.id} onClick={() => handleLoadProject(p)} className="bg-slate-950 border border-slate-800 rounded-lg p-4 cursor-pointer hover:border-brand-blue/50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-white group-hover:text-brand-blue transition-colors">{p.nombre}</h3>
                          <p className="text-xs text-slate-400">{p.client?.nombre || 'Cliente Anónimo'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                        <Layers className="w-3 h-3" /> {p.mapState?.cameras?.length || 0} cámaras
                        <span className="mx-2">•</span>
                        {new Date(p.fecha_creacion).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Bottom Mobile Action Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4 z-20 md:hidden pointer-events-none">
        <Button 
          onClick={() => setMobilePanel(p => p === 'left' ? 'none' : 'left')} 
          className={`pointer-events-auto rounded-full w-12 h-12 shadow-lg transition-colors ${mobilePanel === 'left' ? 'bg-brand-blue text-slate-950' : 'bg-slate-900 text-white border border-slate-700'}`}
        >
          <Layers className="w-5 h-5" />
        </Button>
        <Button 
          onClick={() => setMobilePanel(p => p === 'dori' ? 'none' : 'dori')} 
          className={`pointer-events-auto rounded-full w-12 h-12 shadow-lg transition-colors ${mobilePanel === 'dori' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-900 text-white border border-slate-700'}`}
        >
          <Crosshair className="w-5 h-5" />
        </Button>
        <Button 
          onClick={() => setMobilePanel(p => p === 'right' ? 'none' : 'right')} 
          className={`pointer-events-auto rounded-full w-14 h-14 shadow-lg transition-colors ${mobilePanel === 'right' ? 'bg-brand-blue text-slate-950' : 'bg-brand-blue text-slate-950'}`}
        >
          {mobilePanel === 'right' ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
}
