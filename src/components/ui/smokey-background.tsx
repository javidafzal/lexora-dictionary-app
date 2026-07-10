"use client";
import { useEffect, useRef, useState } from "react";

// Vertex shader — full-screen triangle pair, no transform needed.
const VERTEX_SRC = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

// Fragment shader — animated, mouse-reactive "smokey" glow field.
const FRAGMENT_SRC = `
  precision mediump float;

  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  uniform vec3 u_color;

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.35;

    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 7.0; i++) {
      distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
      distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.95, 0.15, wave);

    fragColor = vec4(u_color * glow, glow * 0.85);
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`;

type BlurSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface SmokeyBackgroundProps {
  /** Tailwind backdrop-blur size applied on top of the canvas. */
  backdropBlurAmount?: BlurSize;
  /** Hex color used to tint the glow field. Defaults to Lexora's gold accent. */
  color?: string;
  /** Overall opacity of the effect layer (0-1). Keep low on content-heavy pages. */
  opacity?: number;
  className?: string;
}

const BLUR_CLASS_MAP: Record<BlurSize, string> = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
  "3xl": "backdrop-blur-3xl",
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/**
 * Full-bleed animated WebGL "smokey glow" background.
 * Used behind the navbar/page shell and the auth screen for a shared,
 * ambient sense of motion across the app.
 */
export function SmokeyBackground({
  backdropBlurAmount = "none",
  color = "#C9A24B", // Lexora gold
  opacity = 0.5,
  className = "",
}: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return; // fails silently — background is decorative only

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("SmokeyBackground shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("SmokeyBackground link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLoc = gl.getUniformLocation(program, "iResolution");
    const iTimeLoc = gl.getUniformLocation(program, "iTime");
    const iMouseLoc = gl.getUniformLocation(program, "iMouse");
    const uColorLoc = gl.getUniformLocation(program, "u_color");

    const [r, g, b] = hexToRgb(color);
    gl.uniform3f(uColorLoc, r, g, b);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const startTime = Date.now();
    let raf = 0;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);

      const t = (Date.now() - startTime) / 1000;
      gl.uniform2f(iResolutionLoc, width, height);
      gl.uniform1f(iTimeLoc, t);
      gl.uniform2f(
        iMouseLoc,
        isHovering ? mousePosition.x : width / 2,
        isHovering ? height - mousePosition.y : height / 2
      );

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    render();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isHovering, mousePosition, color]);

  const blurClass = BLUR_CLASS_MAP[backdropBlurAmount];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      {blurClass !== BLUR_CLASS_MAP.none && <div className={`absolute inset-0 ${blurClass}`} />}
    </div>
  );
}
