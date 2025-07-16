import React, { useState, useRef, useEffect } from "react";
import ChatPanel from "./components/ChatPanel";
import SiriRingVisualizer from "./components/SiriRingVisualizer";
import RotatingEarth from "./components/RotatingEarth";
import "./App.css";


function App() {
  const resizableRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(350); // default width

  const startResize = () => setIsResizing(true);
  const stopResize = () => setIsResizing(false);

  useEffect(() => {
    const doResize = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 250 && newWidth < 600) {
        setPanelWidth(newWidth);
      }
    };

    window.addEventListener("mousemove", doResize);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", doResize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing]);

  return (
    <div className="app-container">
      <div className="main-area">
        <div className="visualizer-wrapper">
          <SiriRingVisualizer />
        </div>
        <RotatingEarth />
      </div>

      <div
        className="resize-handle"
        onMouseDown={startResize}
      />

      <div
        className="chat-wrapper"
        ref={resizableRef}
        style={{ width: `${panelWidth}px` }}
      >
        <ChatPanel />
      </div>
    </div>
  );
}

export default App;
