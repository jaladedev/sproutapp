"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
  LayersControl,
  AttributionControl,
} from "react-leaflet";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ===================== SAFE DYNAMIC CLUSTER ===================== */
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster").then((m) => m.default || m),
  { ssr: false }
);

/* ===================== SAFE HEAT LOADER ===================== */
function useLeafletHeat() {
  useEffect(() => {
    import("leaflet.heat");
  }, []);
}

/* ===================== HELPERS ===================== */

const koboToNaira = (kobo) => Number(kobo) / 100;

function getLandPrice(land) {
  return (
    land.latest_price?.price_per_unit_kobo ??
    land.latestPrice?.price_per_unit_kobo ??
    land.price_per_unit_kobo ??
    0
  );
}

function getPriceColor(price) {
  if (price < 200000) return "#22c55e";
  if (price < 500000) return "#f59e0b";
  return "#ef4444";
}

function createMarkerIcon({ priceKobo, isActive }) {
  const price = koboToNaira(priceKobo);
  const color = getPriceColor(price);

  if (isActive) {
    return L.divIcon({
      className: "",
      iconSize: [44, 52],
      iconAnchor: [22, 52],
      html: `
        <div style="position:relative;width:44px;height:52px;display:flex;flex-direction:column;align-items:center;">
          <div style="
            width:36px;height:36px;border-radius:50%;
            background:${color};
            border:3px solid white;
            box-shadow:0 0 0 4px ${color}55, 0 4px 16px rgba(0,0,0,0.5);
            animation:pulse-ring 1.2s ease-out infinite;
          "></div>
          <div style="
            width:2px;height:14px;
            background:white;
            margin-top:2px;
            box-shadow:0 2px 4px rgba(0,0,0,0.3);
          "></div>
          <style>
            @keyframes pulse-ring {
              0%   { box-shadow: 0 0 0 0 ${color}88, 0 4px 16px rgba(0,0,0,0.5); }
              70%  { box-shadow: 0 0 0 12px ${color}00, 0 4px 16px rgba(0,0,0,0.5); }
              100% { box-shadow: 0 0 0 0 ${color}00, 0 4px 16px rgba(0,0,0,0.5); }
            }
          </style>
        </div>
      `,
    });
  }

  return L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    html: `
      <div style="
        width:18px;height:18px;border-radius:50%;
        background:${color};
        border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
      "></div>
    `,
  });
}

/* ===================== FLY + POPUP CONTROLLER ===================== */

function FlyAndPopup({ flyTarget, activeLandId, markerRefs, polygonRefs }) {
  const map = useMap();
  const lastTarget = useRef(null);

  useEffect(() => {
    if (!flyTarget || !map) return;

    // Avoid re-triggering for same target
    const key = `${flyTarget.lat},${flyTarget.lng}`;
    if (lastTarget.current === key) return;
    lastTarget.current = key;

    map.flyTo([flyTarget.lat, flyTarget.lng], 15, { duration: 1.4, easeLinearity: 0.25 });

    // After fly completes, open the popup
    const onMoveEnd = () => {
      map.off("moveend", onMoveEnd);

      if (activeLandId) {
        const markerRef = markerRefs.current[activeLandId];
        if (markerRef) {
          markerRef.openPopup();
          return;
        }
        // Polygon fallback — open popup at centroid
        const polyRef = polygonRefs.current[activeLandId];
        if (polyRef) {
          const bounds = polyRef.getBounds();
          const center = bounds.getCenter();
          polyRef.openPopup(center);
        }
      }
    };

    map.on("moveend", onMoveEnd);
    return () => map.off("moveend", onMoveEnd);
  }, [flyTarget, activeLandId, map, markerRefs, polygonRefs]);

  return null;
}

/* ===================== MOVE END HANDLER ===================== */

function MoveEndHandler({ onMoveEnd, onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const handler = () => {
      onMoveEnd?.(map.getBounds());
      onZoomChange?.(map.getZoom());
    };
    map.on("moveend", handler);
    return () => map.off("moveend", handler);
  }, [map, onMoveEnd, onZoomChange]);

  return null;
}

/* ===================== HEATMAP ===================== */

function HeatmapLayer({ lands }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    if (!lands?.length || typeof L.heatLayer !== "function") return;

    const points = lands.filter((l) => l.lat && l.lng).map((l) => [+l.lat, +l.lng, 0.6]);
    if (!points.length) return;

    const heat = L.heatLayer(points, { radius: 45, blur: 25, maxZoom: 17 });
    heat.addTo(map);
    layerRef.current = heat;

    return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
  }, [lands, map]);

  return null;
}

/* ===================== POPUP CARD ===================== */

function LandPopup({ land }) {
  const priceKobo = getLandPrice(land);
  const priceNaira = koboToNaira(priceKobo);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minWidth: "200px",
      padding: "2px 0",
    }}>
      <p style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 700,
        fontSize: "15px",
        color: "#1a1a1a",
        marginBottom: "4px",
        lineHeight: 1.3,
      }}>
        {land.title}
      </p>
      <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
        📍 {land.location}
      </p>
      {priceKobo > 0 && (
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#C8873A", marginBottom: "10px" }}>
          ₦{priceNaira.toLocaleString()} <span style={{ fontWeight: 400, color: "#999", fontSize: "11px" }}>/ unit</span>
        </p>
      )}
      <a
        href={`/lands/${land.id}`}
        style={{
          display: "block",
          textAlign: "center",
          padding: "8px 16px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #C8873A 0%, #E8A850 100%)",
          color: "#0D1F1A",
          fontWeight: 700,
          fontSize: "12px",
          textDecoration: "none",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => e.target.style.opacity = "0.85"}
        onMouseLeave={(e) => e.target.style.opacity = "1"}
      >
        View Details →
      </a>
    </div>
  );
}

/* ===================== MAIN MAP ===================== */

export default function LandMap({
  defaultCenter,
  landsWithPoints,
  landsWithPolygons,
  allLandsWithCoords,
  activeLandId,
  hoverLandId,
  flyTarget,
  showHeatmap,
  onMoveEnd,
  onZoomChange,
}) {
  useLeafletHeat();

  // Refs for imperative popup control
  const markerRefs  = useRef({});
  const polygonRefs = useRef({});

  const setMarkerRef  = useCallback((id, ref) => { if (ref) markerRefs.current[id]  = ref; }, []);
  const setPolygonRef = useCallback((id, ref) => { if (ref) polygonRefs.current[id] = ref; }, []);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={8}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      <AttributionControl prefix={false} />

      <MoveEndHandler onMoveEnd={onMoveEnd} onZoomChange={onZoomChange} />

      <FlyAndPopup
        flyTarget={flyTarget}
        activeLandId={activeLandId}
        markerRefs={markerRefs}
        polygonRefs={polygonRefs}
      />

      <LayersControl position="topleft">
        <LayersControl.BaseLayer checked name="Street">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="© Esri"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* MARKERS */}
      {!showHeatmap && (
        <MarkerClusterGroup>
          {landsWithPoints.map((land) => {
            const isActive = activeLandId === land.id;
            const isHovered = hoverLandId === land.id;

            return (
              <Marker
                key={land.id}
                position={[+land.lat, +land.lng]}
                icon={createMarkerIcon({
                  priceKobo: getLandPrice(land),
                  isActive: isActive || isHovered,
                })}
                ref={(ref) => setMarkerRef(land.id, ref)}
                zIndexOffset={isActive ? 1000 : 0}
              >
                <Popup
                  offset={[0, -20]}
                  closeButton={false}
                  className="land-popup"
                >
                  <LandPopup land={land} />
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}

      {/* POLYGONS */}
      {!showHeatmap &&
        landsWithPolygons.map((land) => {
          const isActive = activeLandId === land.id;
          return (
            <Polygon
              key={land.id}
              positions={land.polygon.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: isActive ? "#E8A850" : "#f59e0b",
                fillOpacity: isActive ? 0.45 : 0.25,
                weight: isActive ? 3 : 1.5,
              }}
              ref={(ref) => setPolygonRef(land.id, ref)}
            >
              <Popup closeButton={false} className="land-popup">
                <LandPopup land={land} />
              </Popup>
            </Polygon>
          );
        })}

      {/* HEATMAP */}
      {showHeatmap && <HeatmapLayer lands={allLandsWithCoords} />}
    </MapContainer>
  );
}