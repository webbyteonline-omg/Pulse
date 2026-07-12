"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { PROFILE_COLUMNS } from "@/lib/supabase/columns";
import { useFriends } from "@/hooks/useFriends";
import { useAuthStore } from "@/store/authStore";
import type { UserProfile } from "@/lib/supabase/types";

interface FriendLocationRow {
  user_id: string;
  latitude: number;
  longitude: number;
  last_updated: string;
  is_sharing: boolean;
  profile: UserProfile | null;
}

/** Friend locations that are currently shared, joined with profile info —
 * plain two-step fetch (not a PostgREST FK join) to match this codebase's
 * existing pattern in useFriends/useFriendRequests. */
function useFriendLocationRows() {
  const user = useAuthStore((s) => s.user);
  const { data: friends } = useFriends();
  const friendIds = (friends ?? []).map((f) => f.id);

  return useQuery({
    queryKey: ["user-locations", friendIds],
    enabled: !!user && friendIds.length > 0,
    refetchInterval: 60_000,
    queryFn: async (): Promise<FriendLocationRow[]> => {
      const supabase = getSupabaseBrowser();
      const { data: locations, error } = await supabase
        .from("user_locations")
        .select("user_id,latitude,longitude,last_updated,is_sharing")
        .in("user_id", friendIds)
        .eq("is_sharing", true);
      if (error) throw error;
      if (!locations || locations.length === 0) return [];

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select(PROFILE_COLUMNS)
        .in(
          "id",
          locations.map((l) => l.user_id)
        );
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

      return locations.map((l) => ({ ...l, profile: byId.get(l.user_id) ?? null }));
    },
  });
}

function initialsFor(profile: UserProfile | null, fallbackId: string): string {
  const name = profile?.display_name ?? profile?.username ?? fallbackId;
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Friends-page live campus map. Shows friends who currently have location
 * sharing on (via useLocationSharing/user_locations) as pins on the same
 * Esri satellite basemap as CampusMap.tsx. Realtime-subscribed so a friend
 * toggling sharing on/off or moving updates the map without a manual
 * refresh.
 */
export default function FriendsMap() {
  const queryClient = useQueryClient();
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const [ready, setReady] = useState(false);

  const locationsQuery = useFriendLocationRows();
  const locations = locationsQuery.data ?? [];

  // Init map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        center: [28.4499, 77.5842],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        maxZoom: 20,
        minZoom: 15,
      });
      mapRef.current = map;

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Esri World Imagery", maxZoom: 20, maxNativeZoom: 19 }
      ).addTo(map);
      L.control.attribution({ prefix: false }).addAttribution("© Esri").addTo(map);

      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw friend markers whenever locations change.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      locations.forEach((loc) => {
        const initials = initialsFor(loc.profile, loc.user_id);
        const minsAgo = Math.floor((Date.now() - new Date(loc.last_updated).getTime()) / 60_000);
        const isRecent = minsAgo < 5;
        const ringColor = isRecent ? "#43D98C" : "#FFB347";

        const markerHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(108,99,255,0.6));">
            <div style="
              width:44px;height:44px;border-radius:50%;
              background:linear-gradient(135deg,#6C63FF,#4FACFE);
              border:3px solid ${ringColor};
              display:flex;align-items:center;justify-content:center;
              font-family:Inter,sans-serif;font-weight:700;font-size:14px;color:white;
              box-shadow:0 0 0 2px rgba(0,0,0,0.5);
            ">${initials}</div>
            <div style="
              width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
              border-top:8px solid ${ringColor};margin-top:-1px;
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "",
          iconSize: [44, 60],
          iconAnchor: [22, 60],
          popupAnchor: [0, -65],
        });

        const name = loc.profile?.display_name ?? loc.profile?.username ?? "Friend";
        const username = loc.profile?.username ?? "";
        const popupContent = `
          <div style="background:#1C1C2E;border-radius:12px;padding:12px 16px;min-width:150px;font-family:Inter,sans-serif;border:1px solid rgba(108,99,255,0.3);">
            <p style="color:#fff;font-size:14px;font-weight:700;margin:0 0 2px">${name}</p>
            ${username ? `<p style="color:#8888A8;font-size:11px;margin:0 0 8px">@${username}</p>` : ""}
            <span style="background:${ringColor}22;color:${ringColor};font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;">
              ${minsAgo < 1 ? "Just now" : `${minsAgo}m ago`}
            </span>
          </div>
        `;

        const marker = L.marker([loc.latitude, loc.longitude], { icon }).bindPopup(popupContent, {
          closeButton: false,
          className: "pulse-popup",
        });
        marker.addTo(mapRef.current!);
        markersRef.current[loc.user_id] = marker;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [ready, locations]);

  // Realtime: any change to user_locations invalidates the query so the
  // marker set stays fresh without waiting for the 60s poll.
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("friend-locations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_locations" },
        () => void queryClient.invalidateQueries({ queryKey: ["user-locations"] })
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const onlineCount = locations.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#43D98C",
            boxShadow: "0 0 6px #43D98C",
          }}
        />
        <span style={{ color: "#8888A8", fontSize: 12 }}>
          {onlineCount} friend{onlineCount !== 1 ? "s" : ""} sharing location
        </span>
      </div>
      <div
        ref={containerRef}
        style={{ flex: 1, borderRadius: 16, overflow: "hidden", minHeight: 300 }}
      />
    </div>
  );
}
