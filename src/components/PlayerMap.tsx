import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Move, AlertTriangle } from 'lucide-react';

export interface MapPinItem {
  id: string;
  number: number;
  lat: number;
  lng: number;
  status: 'cleared' | 'locked' | 'active' | 'pending';
  label: string;
  place?: string;
}

export interface SearchArea {
  lat: number;
  lng: number;
  radius: number;
}

export interface PlayerMapProps {
  pins: MapPinItem[];
  userLocation: { lat: number; lng: number };
  accuracy?: number;
  canMove: boolean;
  onMove: (lat: number, lng: number) => void;
  mapTheme?: 'dark' | 'light';
  searchArea?: SearchArea;
}

export const PlayerMap: React.FC<PlayerMapProps> = ({
  pins,
  userLocation,
  accuracy = 0,
  canMove,
  onMove,
  mapTheme = 'dark',
  searchArea,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const pinMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const searchAreaCircleRef = useRef<L.Circle | null>(null);
  const [hasTileError, setHasTileError] = useState<boolean>(false);

  // Refs for callbacks to prevent stale closures in leaflet events
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const canMoveRef = useRef(canMove);
  canMoveRef.current = canMove;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    // Add Tile Layer (OpenStreetMap with clean aesthetic)
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    });

    // Listen for tileerror event
    tileLayer.on('tileerror', () => {
      setHasTileError(true);
    });

    tileLayer.addTo(map);

    // Zoom control in bottom right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Click on map to move in simulator mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (canMoveRef.current) {
        onMoveRef.current(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      }
    });

    // Create Player Marker with custom divIcon
    const playerIcon = L.divIcon({
      className: 'custom-player-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: ${
          canMove ? 'grab' : 'default'
        };">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(43, 63, 224, 0.25); animation: pulse 2s infinite ease-out;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #2B3FE0; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35); z-index: 2;"></div>
          <div style="margin-top: 3px; font-family: sans-serif; font-size: 11px; font-weight: 800; background: #101A4A; color: #FFFFFF; padding: 1px 6px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.25); white-space: nowrap; border: 1px solid rgba(255,255,255,0.4); z-index: 3;">
            You
          </div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 20],
    });

    const playerMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: playerIcon,
      draggable: canMove,
      zIndexOffset: 1000,
    }).addTo(map);

    playerMarker.on('dragend', (e) => {
      const marker = e.target as L.Marker;
      const pos = marker.getLatLng();
      onMoveRef.current(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
    });

    playerMarkerRef.current = playerMarker;

    // Initial bounds fit
    const allCoords: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      ...pins.map((p) => [p.lat, p.lng] as [number, number]),
    ];
    if (searchArea) {
      allCoords.push([searchArea.lat, searchArea.lng]);
    }

    if (allCoords.length > 1) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 17 });
    } else {
      map.setView([userLocation.lat, userLocation.lng], 17);
    }

    // Leaflet needs an invalidateSize once container has settled
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      playerMarkerRef.current = null;
      accuracyCircleRef.current = null;
      if (searchAreaCircleRef.current) {
        searchAreaCircleRef.current.remove();
        searchAreaCircleRef.current = null;
      }
      pinMarkersRef.current.clear();
    };
  }, []); // Run on mount only, cleanup on unmount

  // Update Player Marker Position & Draggable state
  useEffect(() => {
    if (!playerMarkerRef.current || !mapInstanceRef.current) return;
    playerMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);

    // Update Draggable state
    if (canMove) {
      playerMarkerRef.current.dragging?.enable();
    } else {
      playerMarkerRef.current.dragging?.disable();
    }

    // Update player icon cursor style
    const iconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: ${
        canMove ? 'grab' : 'default'
      };">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(43, 63, 224, 0.25); animation: pulse 2s infinite ease-out;"></div>
        <div style="width: 18px; height: 18px; border-radius: 50%; background: #2B3FE0; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35); z-index: 2;"></div>
        <div style="margin-top: 3px; font-family: sans-serif; font-size: 11px; font-weight: 800; background: #101A4A; color: #FFFFFF; padding: 1px 6px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.25); white-space: nowrap; border: 1px solid rgba(255,255,255,0.4); z-index: 3;">
          You
        </div>
      </div>
    `;

    playerMarkerRef.current.setIcon(
      L.divIcon({
        className: 'custom-player-marker',
        html: iconHtml,
        iconSize: [40, 48],
        iconAnchor: [20, 20],
      })
    );
  }, [userLocation.lat, userLocation.lng, canMove]);

  // Update Checkpoint Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Track active pin IDs to remove stale ones
    const currentPinIds = new Set(pins.map((p) => p.id));

    // Remove markers that are no longer in pins
    pinMarkersRef.current.forEach((marker, id) => {
      if (!currentPinIds.has(id)) {
        marker.remove();
        pinMarkersRef.current.delete(id);
      }
    });

    // Create or update each pin marker
    pins.forEach((pin) => {
      // Pin styling according to status:
      // cleared = green #0F8A68 with a check mark
      // locked = red #D8281F with a cross
      // active = gold #FFB627 and slightly larger
      // pending = navy #101A4A
      let bgColor = '#101A4A';
      let textColor = '#FFFFFF';
      let borderColor = '#FFFFFF';
      let size = 30;
      let badgeContent = `${pin.number}`;
      let haloHtml = '';

      if (pin.status === 'cleared') {
        bgColor = '#0F8A68';
        textColor = '#FFFFFF';
        borderColor = '#FFFFFF';
        badgeContent = '✓';
      } else if (pin.status === 'locked') {
        bgColor = '#D8281F';
        textColor = '#FFFFFF';
        borderColor = '#FFFFFF';
        badgeContent = '✕';
      } else if (pin.status === 'active') {
        bgColor = '#FFB627';
        textColor = '#101A4A';
        borderColor = '#101A4A';
        size = 38;
        badgeContent = `${pin.number}`;
        haloHtml = `
          <div style="position: absolute; width: 50px; height: 50px; border-radius: 50%; background: rgba(255, 182, 39, 0.35); border: 1.5px dashed #FFB627; animation: spin 8s linear infinite; pointer-events: none;"></div>
        `;
      } else {
        // Pending
        bgColor = '#101A4A';
        textColor = '#FFFFFF';
        borderColor = 'rgba(255, 255, 255, 0.7)';
        size = 30;
        badgeContent = `${pin.number}`;
      }

      const pinIconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; transform: translate(-50%, -50%);">
          ${haloHtml}
          <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${bgColor}; color: ${textColor}; border: 2.5px solid ${borderColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: ${
            size > 32 ? '15px' : '12px'
          }; font-weight: 800; z-index: 2; transition: all 0.2s;">
            ${badgeContent}
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        className: `custom-pin-marker-${pin.status}`,
        html: pinIconHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      // Popup Content:
      // A pin's popup shows "Checkpoint N" and the real place name ONLY when cleared; otherwise "Place revealed when cleared".
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 150px; padding: 4px; color: #101A4A;">
          <div style="font-size: 13px; font-weight: 800; color: #101A4A; margin-bottom: 2px;">
            Checkpoint ${pin.number}
          </div>
          <div style="font-size: 12px; font-weight: 500; color: ${
            pin.status === 'cleared' ? '#0F8A68' : '#64748B'
          };">
            ${
              pin.status === 'cleared'
                ? pin.place || pin.label
                : 'Place revealed when cleared'
            }
          </div>
          ${
            pin.status === 'locked'
              ? '<div style="margin-top: 4px; font-size: 10px; font-weight: bold; color: #D8281F; text-transform: uppercase;">Stage Locked</div>'
              : ''
          }
          ${
            pin.status === 'active'
              ? '<div style="margin-top: 4px; font-size: 10px; font-weight: bold; color: #B45309; text-transform: uppercase;">Active Target</div>'
              : ''
          }
        </div>
      `;

      const existingMarker = pinMarkersRef.current.get(pin.id);
      if (existingMarker) {
        existingMarker.setLatLng([pin.lat, pin.lng]);
        existingMarker.setIcon(pinIcon);
        existingMarker.setPopupContent(popupHtml);
      } else {
        const marker = L.marker([pin.lat, pin.lng], {
          icon: pinIcon,
          zIndexOffset: pin.status === 'active' ? 500 : 100,
        }).addTo(map);

        marker.bindPopup(popupHtml, {
          closeButton: false,
          className: 'custom-leaflet-popup',
        });

        pinMarkersRef.current.set(pin.id, marker);
      }
    });
  }, [pins]);

  // Update Search Area Circle (Dashed 150m boundary)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (searchArea) {
      if (searchAreaCircleRef.current) {
        searchAreaCircleRef.current.setLatLng([searchArea.lat, searchArea.lng]);
        searchAreaCircleRef.current.setRadius(searchArea.radius);
      } else {
        const circle = L.circle([searchArea.lat, searchArea.lng], {
          radius: searchArea.radius,
          dashArray: '8, 8',
          color: '#FFB627',
          weight: 2.5,
          fillColor: '#FFB627',
          fillOpacity: 0.14,
          interactive: false,
        }).addTo(map);
        searchAreaCircleRef.current = circle;
      }
    } else {
      if (searchAreaCircleRef.current) {
        searchAreaCircleRef.current.remove();
        searchAreaCircleRef.current = null;
      }
    }
  }, [searchArea]);

  // Center on me handler
  const handleCenterOnMe = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(
      [userLocation.lat, userLocation.lng],
      Math.max(mapInstanceRef.current.getZoom(), 17),
      { animate: true }
    );
  };

  return (
    <div
      className={`relative w-full h-[340px] sm:h-[400px] rounded-xl overflow-hidden border shadow-inner transition-colors duration-300 ${
        mapTheme === 'dark'
          ? 'border-white/10 bg-[#050811] dark-tiles'
          : 'border-slate-300 bg-[#E2E8F0] light-tiles'
      }`}
    >
      {/* Map DOM Node */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${mapTheme === 'dark' ? 'dark-tiles' : 'light-tiles'}`}
      />

      {/* Map Tile Failure Notice */}
      {hasTileError && (
        <div className="absolute top-3 left-3 right-14 z-[1000] bg-[#101A4A]/95 backdrop-blur-sm text-white border border-[#D8281F]/50 shadow-xl px-3 py-2 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FFB627] shrink-0" />
          <span className="text-white/90 font-medium">
            Map tiles can&apos;t load. Check your internet connection. Your location still works.
          </span>
        </div>
      )}

      {/* Control Overlay Buttons */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {/* Center on Me Button */}
        <button
          onClick={handleCenterOnMe}
          className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-[#101A4A] shadow-lg border border-slate-300 font-semibold text-xs flex items-center justify-center transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFB627]"
          title="Center map on your location"
          aria-label="Center on me"
        >
          <Navigation className="w-4 h-4 text-[#2B3FE0]" />
        </button>
      </div>

      {/* Simulator Tap Hint */}
      {canMove && (
        <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-[#101A4A]/90 backdrop-blur-xs text-white/90 px-3 py-1.5 rounded-lg border border-white/20 text-[11px] flex items-center gap-1.5 shadow-md pointer-events-none">
          <Move className="w-3 h-3 text-[#FFB627]" />
          <span>Tap anywhere on the map or drag the blue dot to move</span>
        </div>
      )}
    </div>
  );
};
