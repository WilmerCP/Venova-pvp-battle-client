import React, { useMemo, useState } from "react";

/**
 * Sistema de clima para simulador de combates.
 * Cada efecto es una capa absoluta que se coloca ENCIMA del fondo de batalla
 * (position: absolute; inset: 0; pointer-events: none) para no bloquear clicks.
 *
 * Técnica por clima:
 * - sunny: tu PNG con fade in/out (lo dejo de referencia, ya lo tenías resuelto)
 * - rain: N divs (gotas) cayendo con CSS keyframes, randomizados en JS con useMemo
 * - hail: igual que la lluvia pero con "partículas" redondas + rebote en el suelo
 * - sandstorm: NO son partículas individuales; son 2-3 capas de textura de ruido
 *   (SVG feTurbulence) desplazándose horizontalmente + un overlay de color ámbar
 *   pulsando. Eso es lo que da la sensación de "polvo en el aire", no puntitos.
 */

// ---------- Utilidad para generar partículas aleatorias una sola vez ----------
function useParticles(count, generator, deps = []) {
  return useMemo(
    () => Array.from({ length: count }, (_, i) => generator(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, ...deps]
  );
}

// ---------- 1. SOL ----------
// No es solo un fade: rayos rotando lentamente + resplandor pulsante + motas de
// polvo/luz flotando (lo que realmente vende una "tarde soleada", no un PNG estático).
export function SunnyLayer({ src, visible = true, intensity = 26 }) {
  const motes = useParticles(intensity, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 6,
    drift: 20 + Math.random() * 40, // recorrido horizontal
    opacity: 0.25 + Math.random() * 0.4,
  }));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 1.2s ease-in-out",
      }}
    >
      {/* Fondo/PNG opcional del usuario, con su propio fade */}
      {src && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Rayos de luz: conic-gradient girando muy lento desde una esquina superior */}
      <div
        style={{
          position: "absolute",
          top: "-60%",
          right: "-40%",
          width: "140%",
          height: "140%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,231,160,0.16) 8deg, transparent 20deg, transparent 60deg, rgba(255,231,160,0.12) 70deg, transparent 85deg, transparent 360deg)",
          mixBlendMode: "screen",
          animation: "sun-rotate 40s linear infinite",
        }}
      />

      {/* Resplandor cálido concentrado, pulsando en intensidad */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,244,200,0.55), rgba(255,214,120,0.15) 55%, transparent 75%)",
          filter: "blur(2px)",
          animation: "sun-pulse 4s ease-in-out infinite",
        }}
      />

      {/* Tinte cálido general muy sutil sobre toda la escena */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(255,236,180,0.08), transparent 55%)",
        }}
      />

      {/* Motas de polvo/luz flotando */}
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            borderRadius: "50%",
            background: "rgba(255,244,214,0.9)",
            boxShadow: "0 0 4px rgba(255,244,214,0.8)",
            opacity: m.opacity,
            animation: `sun-mote-float ${m.duration}s ease-in-out ${m.delay}s infinite`,
            "--drift": `${m.drift}px`,
          }}
        />
      ))}

      <style>{`
        @keyframes sun-rotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sun-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.08); }
        }
        @keyframes sun-mote-float {
          0%   { transform: translate(0, 0); opacity: 0; }
          15%  { opacity: 1; }
          50%  { transform: translate(var(--drift), -18px); }
          85%  { opacity: 1; }
          100% { transform: translate(calc(var(--drift) * 1.6), -4px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------- 2. LLUVIA ----------
export function RainLayer({ intensity = 120 }) {
  const drops = useParticles(intensity, () => ({
    left: Math.random() * 100,
    duration: 0.4 + Math.random() * 0.4, // velocidad de caída
    delay: Math.random() * 2,
    length: 14 + Math.random() * 18,
    drift: -25 - Math.random() * 15, // viento hacia la izquierda
    opacity: 0.35 + Math.random() * 0.45,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {drops.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: "-10%",
            width: "2px",
            height: `${d.length}px`,
            borderRadius: "2px",
            background: "linear-gradient(to bottom, transparent, rgba(190,210,235,0.9))",
            opacity: d.opacity,
            transform: "rotate(12deg)",
            animation: `rain-fall ${d.duration}s linear ${d.delay}s infinite`,
            // el --drift se usa dentro del keyframe para el desplazamiento lateral
            "--drift": `${d.drift}px`,
          }}
        />
      ))}
      {/* leve neblina para que no se vea "vacío" entre gotas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(120,140,170,0.05), rgba(120,140,170,0.15))",
        }}
      />
      <style>{`
        @keyframes rain-fall {
          0%   { transform: translate(0, 0) rotate(12deg); }
          100% { transform: translate(var(--drift), 130vh) rotate(12deg); }
        }
      `}</style>
    </div>
  );
}

// ---------- 3. GRANIZO ----------
export function HailLayer({ intensity = 40 }) {
  const stones = useParticles(intensity, () => ({
    left: Math.random() * 100,
    size: 4 + Math.random() * 5,
    duration: 0.6 + Math.random() * 0.5,
    delay: Math.random() * 1.5,
    spin: Math.random() > 0.5 ? 1 : -1,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stones.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: "-8%",
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #ffffff, #c9d6e3 70%)",
            boxShadow: "0 0 3px rgba(255,255,255,0.6)",
            animation: `hail-fall ${s.duration}s linear ${s.delay}s infinite`,
            "--spin": s.spin,
          }}
        />
      ))}
      <style>{`
        @keyframes hail-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          85%  { transform: translateY(105vh) rotate(calc(var(--spin) * 180deg)); opacity: 1; }
          88%  { transform: translateY(108vh) scale(1.4); opacity: 0.9; } /* rebote/impacto */
          100% { transform: translateY(108vh) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------- 4. TORMENTA DE ARENA ----------
// La clave: capas de textura (no partículas) + tinte de color + algunas rachas rápidas.
export function SandstormLayer({ intensity = 1 }) {
  const streaks = useParticles(18, () => ({
    top: Math.random() * 100,
    duration: 0.5 + Math.random() * 0.6,
    delay: Math.random() * 2,
    length: 40 + Math.random() * 90,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Filtro SVG que genera ruido/turbulencia reutilizable como textura */}
      <svg width="0" height="0">
        <filter id="sand-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.75
                    0 0 0 0 0.6
                    0 0 0 0 0.35
                    0 0 0 0.6 0"
          />
        </filter>
      </svg>

      {/* Capa de textura 1 - se mueve más rápido, más cerca de "cámara" */}
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          filter: "url(#sand-noise)",
          mixBlendMode: "overlay",
          animation: "sand-drift-1 6s linear infinite",
        }}
      />
      {/* Capa de textura 2 - más lenta, da profundidad */}
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          filter: "url(#sand-noise)",
          opacity: 0.6,
          mixBlendMode: "overlay",
          animation: "sand-drift-2 11s linear infinite reverse",
        }}
      />

      {/* Rachas rápidas: dan sensación de viento con fuerza */}
      {streaks.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: "-20%",
            width: `${s.length}px`,
            height: "2px",
            background: `linear-gradient(to right, transparent, rgba(214,178,110,${s.opacity}), transparent)`,
            animation: `sand-streak ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Tinte general ámbar + pulso sutil de opacidad para dar sensación de densidad variable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(196,150,80,0.35), rgba(150,110,55,0.45))",
          animation: "sand-pulse 3s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes sand-drift-1 {
          0%   { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-15%) translateY(3%); }
        }
        @keyframes sand-drift-2 {
          0%   { transform: translateX(0) translateY(0); }
          100% { transform: translateX(20%) translateY(-4%); }
        }
        @keyframes sand-streak {
          0%   { transform: translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(140vw); opacity: 0; }
        }
        @keyframes sand-pulse {
          0%, 100% { opacity: 0.9; }
          50%      { opacity: 1.15; filter: brightness(1.05); }
        }
      `}</style>
    </div>
  );
}

// ---------- Selector de clima que usarías en el simulador ----------
function WeatherStage() {
  const [weather, setWeather] = useState("sunny");

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {["sunny", "rain", "hail", "sandstorm"].map((w) => (
          <button
            key={w}
            onClick={() => setWeather(w)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #444",
              background: weather === w ? "#333" : "#111",
              color: "#eee",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {w}
          </button>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: 380,
          borderRadius: 12,
          overflow: "hidden",
          background: "linear-gradient(180deg, #2b3a4a, #1a2430)",
        }}
      >
        {/* Aquí iría tu escena de batalla (sprites, arena, etc.) */}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#8fa", opacity: 0.4 }}>
          escena de combate
        </div>

        {weather === "sunny" && <SunnyLayer visible={true} src={null /* pasá acá tu PNG, ej: "/sunny-bg.png" */} />}
        {weather === "rain" && <RainLayer intensity={130} />}
        {weather === "hail" && <HailLayer intensity={45} />}
        {weather === "sandstorm" && <SandstormLayer />}
      </div>
    </div>
  );
}