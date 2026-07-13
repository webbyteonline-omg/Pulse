"use client";

import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, CloudSun, Moon, Sun } from "lucide-react";
import { nowIST } from "@/lib/utils";

// Open-Meteo — free, no API key. Coordinates = campus.
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=28.4496&longitude=77.5856&current=temperature_2m,weather_code&timezone=Asia%2FKolkata";

interface WeatherNow {
  temp: number;
  code: number;
}

function describe(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 82) return "Showers";
  return "Stormy";
}

function WeatherIcon({ code }: { code: number }) {
  const night = nowIST().getHours() >= 19 || nowIST().getHours() < 6;
  const cls = "h-5 w-5";
  if (code === 0) return night ? <Moon className={`${cls} text-primary`} fill="#6C63FF33" /> : <Sun className={`${cls} text-warning`} fill="#FFB34733" />;
  if (code <= 3) return <CloudSun className={`${cls} text-warning`} />;
  if (code >= 51) return <CloudRain className={`${cls} text-[#5AB0FF]`} />;
  return <Cloud className={`${cls} text-ink-dim`} />;
}

/** "24°C Sunny" chip on the dashboard header (Open-Meteo, cached 30 min). */
export function WeatherChip() {
  const { data } = useQuery({
    queryKey: ["weather"],
    staleTime: 30 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<WeatherNow> => {
      const res = await fetch(WEATHER_URL);
      if (!res.ok) throw new Error("weather fetch failed");
      const json = (await res.json()) as {
        current: { temperature_2m: number; weather_code: number };
      };
      return { temp: Math.round(json.current.temperature_2m), code: json.current.weather_code };
    },
  });

  if (!data) return null;

  return (
    <div className="flex flex-col items-center gap-0.5 clay rounded-btn px-3 py-1.5 shrink-0">
      <WeatherIcon code={data.code} />
      <p className="text-xs font-bold leading-none">
        {data.temp}°C <span className="text-[9px] text-ink-dim font-semibold">{describe(data.code)}</span>
      </p>
    </div>
  );
}
