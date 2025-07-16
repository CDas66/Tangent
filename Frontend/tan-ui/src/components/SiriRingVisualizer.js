import React, { useEffect, useRef } from "react";
import "./SiriRingVisualizer.css";

export default function SiriRingVisualizer() {
  const canvasRef = useRef();
  const smoothedVolume = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      let time = 0;

      const draw = () => {
        analyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i] - 128;
          sum += v * v;
        }

        let volume = Math.sqrt(sum / buffer.length) * 2;
        const noiseThreshold = 2;
        if (volume < noiseThreshold) volume = 0;

        smoothedVolume.current = smoothedVolume.current * 0.85 + volume * 0.15;

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.3;
        const resolution = 720;

        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "lighter";

        const rawVolume = smoothedVolume.current;
        const safeVolume = Math.min(Math.pow(rawVolume, 0.8), 12);
        const visualBoost = Math.min(rawVolume / 10, 1);

        for (let layer = 0; layer < 3; layer++) {
          const amplitude = safeVolume * (1 - layer * 0.2);
          const points = [];

          for (let i = 0; i <= resolution; i++) {
            const angle = (i / resolution) * Math.PI * 2;
            const wave = Math.sin(angle * (3 + layer) + time * 0.03);
            const deform = wave * amplitude;
            const r = baseRadius + deform;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            points.push({ x, y });
          }

          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          }

          ctx.quadraticCurveTo(
            points[points.length - 2].x,
            points[points.length - 2].y,
            points[0].x,
            points[0].y
          );

          const hue = 200 + layer * 10;
          const glowAlpha = 0.5 + visualBoost * 0.5;
          const strokeAlpha = 0.3 + visualBoost * 0.7;

          ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${strokeAlpha})`;
          ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${glowAlpha})`;
          ctx.shadowBlur = 40 + visualBoost * 40;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.6;
          ctx.stroke();
        }

        ctx.globalCompositeOperation = "source-over";
        time += 1;
        requestAnimationFrame(draw);
      };

      draw();
    });

    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="siri-canvas" />;
}
