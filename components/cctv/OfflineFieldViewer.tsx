'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { OfflineMapExtract, saveOfflineProjectBuffer } from '@/lib/cctv-offline-storage';
import { DeviceType } from './CCTVMap';
import { Button } from '@/components/ui/button';
import { 
  Crosshair, 
  LocateFixed, 
  Layers, 
  Plus, 
  Trash2, 
  RotateCw, 
  RotateCcw, 
  Wifi, 
  Camera, 
  CloudUpload, 
  WifiOff, 
  Check, 
  Navigation,
  Eye,
  Sliders,
  X
} from 'lucide-react';

interface CameraInstance {
  id: string;
  name?: string;
  modelId: string;
  lat: number;
  lng: number;
  heading: number;
  fov: number;
  dori: {
    identify: number;
    recognize: number;
    observe: number;
    detect: number;
  };
  layer: string;
  section?: string;
  type?: DeviceType;
}

interface OfflineFieldViewerProps {
  extract: OfflineMapExtract;
  cameras: CameraInstance[];
  setCameras: React.Dispatch<React.SetStateAction<CameraInstance[]>>;
  layers: string[];
  visibleLayers: string[];
  activeLayer: string;
  sections: string[];
  activeSection: string;
  userLocation: { lat: number; lng: number } | null;
  userHeading: number | null;
  gpsAccuracy: number | null;
  onExitOffline: () => void;
  onSyncOnline?: () => Promise<void>;
  projectName: string;
  clientId: string;
}

export default function OfflineFieldViewer({
  extract,
  cameras,
  setCameras,
  layers,
  visibleLayers,
  activeLayer,
  sections,
  activeSection,
  userLocation,
  userHeading,
  gpsAccuracy,
  onExitOffline,
  onSyncOnline,
  projectName,
  clientId
}: OfflineFieldViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeCamId, setActiveCamId] = useState<string | null>(null);
  const [draggingCamId, setDraggingCamId] = useState<string | null>(null);
  const [showDori, setShowDori] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [showToolsPanel, setShowToolsPanel] = useState(false);

  const { bounds, width, height, imageDataUrl } = extract;

  // Calculate pixels per meter for scaling DORI zones and GPS accuracy
  const centerLat = (bounds.north + bounds.south) / 2;
  const metersNorthSouth = (bounds.north - bounds.south) * 111139;
  const metersEastWest = (bounds.east - bounds.west) * (111139 * Math.cos((centerLat * Math.PI) / 180));
  const pixelsPerMeter = ((height / metersNorthSouth) + (width / metersEastWest)) / 2;

  // Convert lat/lng to image pixel coords
  const latLngToPixel = useCallback((lat: number, lng: number) => {
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height;
    return { x, y };
  }, [bounds, width, height]);

  // Convert image pixel coords to lat/lng
  const pixelToLatLng = useCallback((x: number, y: number) => {
    const lng = bounds.west + (x / width) * (bounds.east - bounds.west);
    const lat = bounds.north - (y / height) * (bounds.north - bounds.south);
    return { lat, lng };
  }, [bounds, width, height]);

  // Center on user if follow mode is active
  useEffect(() => {
    if (followUser && userLocation && containerRef.current) {
      const { x, y } = latLngToPixel(userLocation.lat, userLocation.lng);
      const viewW = containerRef.current.clientWidth;
      const viewH = containerRef.current.clientHeight;
      setOffset({
        x: viewW / 2 - x * scale,
        y: viewH / 2 - y * scale
      });
    }
  }, [userLocation, followUser, scale, latLngToPixel]);

  // Initial fit to screen
  useEffect(() => {
    if (containerRef.current) {
      const viewW = containerRef.current.clientWidth;
      const viewH = containerRef.current.clientHeight;
      const s = Math.min(viewW / width, viewH / height) * 0.9;
      setScale(Math.max(s, 0.4));
      setOffset({
        x: (viewW - width * s) / 2,
        y: (viewH - height * s) / 2
      });
    }
  }, [width, height]);

  // Auto-save offline project to buffer
  useEffect(() => {
    saveOfflineProjectBuffer({
      nombre: projectName || extract.name || 'Levantamiento Salara',
      clientId: clientId || '1',
      mapState: {
        cameras,
        layers,
        visibleLayers,
        activeLayer,
        sections,
        center: extract.center,
        zoom: extract.zoom
      },
      lastUpdated: Date.now(),
      pendingSync: true
    });
  }, [cameras, layers, visibleLayers, activeLayer, sections, projectName, clientId, extract]);

  // Touch gesture handling for Tablet (Pan & Pinch to zoom)
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setFollowUser(false);
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      setFollowUser(false);
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(touchStartScaleRef.current * ratio, 0.3), 5);
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Mouse pan handling (Desktop / trackpad)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setFollowUser(false);
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setFollowUser(false);
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.3), 6);
    setScale(newScale);
  };

  // Plant camera or Wi-Fi AP at GPS or Center
  const handlePlantDevice = (type: DeviceType = 'camera') => {
    let targetLat = extract.center.lat;
    let targetLng = extract.center.lng;
    let initialHeading = userHeading || 0;

    if (userLocation) {
      targetLat = userLocation.lat;
      targetLng = userLocation.lng;
    }

    const prefix = type === 'wifi' ? 'AP' : 'Cám';
    const nextNum = cameras.filter(c => (c.type || 'camera') === type).length + 1;
    const newId = 'off_' + Math.random().toString(36).substring(2, 9);

    const newCam: CameraInstance = {
      id: newId,
      name: `${prefix} ${nextNum} (Campo)`,
      modelId: type === 'wifi' ? 'wifi-ubiquiti-u6' : 'cam-2.8mm',
      lat: targetLat,
      lng: targetLng,
      heading: Math.round(initialHeading),
      fov: type === 'wifi' ? 360 : 105,
      dori: type === 'wifi' 
        ? { identify: 0, recognize: 0, observe: 0, detect: 50 } 
        : { identify: 4, recognize: 8, observe: 15, detect: 37 },
      layer: activeLayer || 'General',
      section: activeSection || 'General',
      type
    };

    setCameras(prev => [...prev, newCam]);
    setActiveCamId(newId);
  };

  const activeCam = cameras.find(c => c.id === activeCamId);

  // Calculate SVG arc path for FOV cone
  const getFovConePath = (cam: CameraInstance, radiusMeters: number) => {
    const { x, y } = latLngToPixel(cam.lat, cam.lng);
    const radiusPx = radiusMeters * pixelsPerMeter;

    if (cam.fov >= 360) {
      return `M ${x} ${y} m -${radiusPx}, 0 a ${radiusPx},${radiusPx} 0 1,0 ${radiusPx * 2},0 a ${radiusPx},${radiusPx} 0 1,0 -${radiusPx * 2},0`;
    }

    const startAngle = (cam.heading - cam.fov / 2 - 90) * (Math.PI / 180);
    const endAngle = (cam.heading + cam.fov / 2 - 90) * (Math.PI / 180);

    const x1 = x + radiusPx * Math.cos(startAngle);
    const y1 = y + radiusPx * Math.sin(startAngle);
    const x2 = x + radiusPx * Math.cos(endAngle);
    const y2 = y + radiusPx * Math.sin(endAngle);

    const largeArcFlag = cam.fov > 180 ? 1 : 0;

    return `M ${x} ${y} L ${x1} ${y1} A ${radiusPx} ${radiusPx} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const handleTriggerSync = async () => {
    if (!onSyncOnline) return;
    try {
      setIsSyncing(true);
      await onSyncOnline();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (e) {
      alert('Error sincronizando con la nube. Asegúrate de tener conexión a internet.');
    } finally {
      setIsSyncing(false);
    }
  };

  const userPx = userLocation ? latLngToPixel(userLocation.lat, userLocation.lng) : null;
  const accuracyPx = gpsAccuracy ? gpsAccuracy * pixelsPerMeter : 0;

  return (
    <div className="relative w-full h-full bg-slate-950 select-none overflow-hidden touch-none font-tech">
      
      {/* Top Banner: Status & Controls */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        
        {/* Left: Mode Badge & GPS status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/50 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">
              Modo Terreno Offline ({extract.name})
            </span>
          </div>

          {userLocation ? (
            <div className="bg-slate-900/90 backdrop-blur-md border border-brand-blue/50 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs">
              <Crosshair className="w-3.5 h-3.5 text-brand-blue animate-spin" />
              <span className="text-brand-blue font-bold">
                GPS: ±{gpsAccuracy ? Math.round(gpsAccuracy) : '?'}m
              </span>
            </div>
          ) : (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs text-slate-400">
              <Crosshair className="w-3.5 h-3.5 text-slate-500" />
              <span>Buscando satélites...</span>
            </div>
          )}
        </div>

        {/* Right: Sync & Exit buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onSyncOnline && (
            <Button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 h-9 px-3"
              title="Subir cambios a la nube cuando haya internet"
            >
              <CloudUpload className="w-4 h-4" />
              <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar Nube'}</span>
            </Button>
          )}

          <Button
            onClick={onExitOffline}
            variant="outline"
            size="sm"
            className="bg-slate-900/80 border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs h-9 px-3"
            title="Volver al mapa online de Google Maps"
          >
            <Wifi className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Modo Online</span>
          </Button>
        </div>
      </div>

      {syncSuccess && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          ¡Diseño sincronizado con éxito a Zirian Cloud!
        </div>
      )}

      {/* Main Interactive Canvas / Image Layer */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: `${width}px`,
            height: `${height}px`,
            position: 'absolute'
          }}
          className="transition-transform duration-75 ease-out"
        >
          {/* Satellite Extract Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt="Extracto Satelital Offline"
            width={width}
            height={height}
            draggable={false}
            className="pointer-events-none select-none w-full h-full object-cover shadow-2xl"
          />

          {/* SVG Overlay for DORI Cones, GPS Accuracy & Heading */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${width} ${height}`}
          >
            {/* GPS Accuracy Circle */}
            {userPx && accuracyPx > 0 && (
              <circle
                cx={userPx.x}
                cy={userPx.y}
                r={accuracyPx}
                fill="#3b82f6"
                fillOpacity="0.15"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            )}

            {/* Cameras DORI Cones */}
            {cameras
              .filter(cam => visibleLayers.includes(cam.layer || 'General'))
              .map(cam => {
                const isActive = activeCamId === cam.id;
                const isWifi = cam.type === 'wifi';

                if (isWifi) {
                  return (
                    <g key={`cone-${cam.id}`}>
                      <path
                        d={getFovConePath(cam, cam.dori.detect)}
                        fill="#9333ea"
                        fillOpacity={isActive ? 0.25 : 0.15}
                        stroke={isActive ? '#fff' : '#9333ea'}
                        strokeWidth={isActive ? 2 : 1}
                      />
                    </g>
                  );
                }

                return (
                  <g key={`cone-${cam.id}`}>
                    {showDori ? (
                      <>
                        {/* Detect (Blue) */}
                        <path
                          d={getFovConePath(cam, cam.dori.detect)}
                          fill="#3b82f6"
                          fillOpacity="0.2"
                          stroke={isActive ? '#fff' : '#3b82f6'}
                          strokeWidth={isActive ? 2 : 1}
                        />
                        {/* Observe (Green) */}
                        <path
                          d={getFovConePath(cam, cam.dori.observe)}
                          fill="#22c55e"
                          fillOpacity="0.3"
                          stroke="none"
                        />
                        {/* Recognize (Yellow) */}
                        <path
                          d={getFovConePath(cam, cam.dori.recognize)}
                          fill="#eab308"
                          fillOpacity="0.35"
                          stroke="none"
                        />
                        {/* Identify (Red) */}
                        <path
                          d={getFovConePath(cam, cam.dori.identify)}
                          fill="#ef4444"
                          fillOpacity="0.45"
                          stroke="none"
                        />
                      </>
                    ) : (
                      <path
                        d={getFovConePath(cam, cam.dori.detect)}
                        fill="#3b82f6"
                        fillOpacity="0.35"
                        stroke={isActive ? '#fff' : '#3b82f6'}
                        strokeWidth={isActive ? 2 : 1}
                      />
                    )}
                  </g>
                );
              })}
          </svg>

          {/* Interactive Camera Markers */}
          {cameras
            .filter(cam => visibleLayers.includes(cam.layer || 'General'))
            .map(cam => {
              const { x, y } = latLngToPixel(cam.lat, cam.lng);
              const isActive = activeCamId === cam.id;
              const isWifi = cam.type === 'wifi';

              return (
                <div
                  key={cam.id}
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isActive ? 30 : 20
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCamId(cam.id);
                  }}
                  className="cursor-pointer group select-none"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shadow-lg ${
                      isActive
                        ? 'bg-brand-blue border-white ring-4 ring-brand-blue/50 scale-125'
                        : isWifi
                        ? 'bg-purple-600 border-white text-white'
                        : 'bg-slate-900 border-brand-blue text-brand-blue'
                    }`}
                  >
                    {isWifi ? <Wifi className="w-3.5 h-3.5 text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-sm text-[10px] text-white font-bold px-1.5 py-0.5 rounded border border-white/20 pointer-events-none">
                    {cam.name}
                  </div>
                </div>
              );
            })}

          {/* Real-time GPS Location Marker with Heading Cone */}
          {userPx && (
            <div
              style={{
                position: 'absolute',
                left: `${userPx.x}px`,
                top: `${userPx.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 35
              }}
              className="pointer-events-none"
            >
              {/* Heading Indicator Cone / Arrow */}
              {userHeading !== null && (
                <div
                  style={{
                    transform: `rotate(${userHeading}deg)`,
                    transformOrigin: 'center center'
                  }}
                  className="w-16 h-16 -ml-5 -mt-5 relative transition-transform duration-200"
                >
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[18px] border-b-brand-blue mx-auto opacity-80 filter drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
                </div>
              )}

              {/* Pulsing Blue Dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-brand-blue rounded-full border-2 border-white shadow-[0_0_15px_#00a3ff] relative">
                  <div className="absolute inset-0 rounded-full bg-brand-blue animate-ping opacity-75" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Center Action: Plant at GPS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-auto">
        <Button
          onClick={() => handlePlantDevice('camera')}
          className="bg-brand-blue hover:bg-brand-blue/90 text-slate-950 font-tech font-bold uppercase tracking-widest text-xs h-12 px-6 rounded-full shadow-[0_0_30px_rgba(0,163,255,0.6)] border-2 border-white/20 flex items-center gap-2 active:scale-95 transition-transform animate-pulse"
        >
          <Camera className="w-4 h-4" />
          <span>Plantar Cámara en mi GPS</span>
        </Button>

        <Button
          onClick={() => handlePlantDevice('wifi')}
          className="bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold uppercase tracking-widest text-xs h-12 px-4 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.5)] border-2 border-white/20 flex items-center gap-1.5 active:scale-95 transition-transform"
          title="Plantar punto de acceso Wi-Fi"
        >
          <Wifi className="w-4 h-4" />
          <span className="hidden sm:inline">AP Wi-Fi</span>
        </Button>

        {userLocation && (
          <Button
            onClick={() => setFollowUser(true)}
            size="icon"
            className={`w-12 h-12 rounded-full border-2 shadow-lg transition-colors ${
              followUser
                ? 'bg-brand-blue border-white text-slate-950'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Centrar en mi ubicación GPS"
          >
            <LocateFixed className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Floating Camera Editor (Right side when camera is selected) */}
      {activeCam && (
        <div className="absolute bottom-20 md:bottom-auto md:top-20 right-4 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl text-white space-y-3 pointer-events-auto animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-sm text-brand-blue truncate">{activeCam.name}</span>
            <button onClick={() => setActiveCamId(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Nombre</label>
            <input
              type="text"
              value={activeCam.name || ''}
              onChange={(e) => {
                const val = e.target.value;
                setCameras(prev => prev.map(c => c.id === activeCam.id ? { ...c, name: val } : c));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Orientación (Heading)</span>
              <span className="text-brand-blue font-bold">{activeCam.heading}°</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCameras(prev => prev.map(c => c.id === activeCam.id ? { ...c, heading: (c.heading - 15 + 360) % 360 } : c));
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                title="Girar 15° antihorario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0"
                max="360"
                value={activeCam.heading}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCameras(prev => prev.map(c => c.id === activeCam.id ? { ...c, heading: val } : c));
                }}
                className="flex-1 accent-brand-blue h-1"
              />
              <button
                onClick={() => {
                  setCameras(prev => prev.map(c => c.id === activeCam.id ? { ...c, heading: (c.heading + 15) % 360 } : c));
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                title="Girar 15° horario"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {userLocation && (
            <Button
              onClick={() => {
                setCameras(prev => prev.map(c => c.id === activeCam.id ? { ...c, lat: userLocation.lat, lng: userLocation.lng, heading: userHeading || c.heading } : c));
              }}
              size="sm"
              variant="outline"
              className="w-full text-xs border-brand-blue/50 text-brand-blue hover:bg-brand-blue/10 h-8"
            >
              📍 Mover a mi GPS actual
            </Button>
          )}

          <Button
            onClick={() => {
              setCameras(prev => prev.filter(c => c.id !== activeCam.id));
              setActiveCamId(null);
            }}
            variant="destructive"
            size="sm"
            className="w-full text-xs h-8"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar Cámara
          </Button>
        </div>
      )}

      {/* Floating Bottom Left: DORI & Layers toggles */}
      <div className="absolute bottom-6 left-4 z-40 flex items-center gap-2 pointer-events-auto">
        <Button
          onClick={() => setShowDori(!showDori)}
          size="sm"
          className={`rounded-xl text-xs font-bold border h-10 px-3 shadow-lg ${
            showDori ? 'bg-brand-blue text-slate-950 border-white/20' : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5 mr-1" /> DORI {showDori ? 'ON' : 'OFF'}
        </Button>
      </div>

    </div>
  );
}
