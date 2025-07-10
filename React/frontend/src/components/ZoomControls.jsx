import React from "react";
import { map, vectorSource } from "../openlayers/map";
import { fromLonLat } from "ol/proj";

const ZoomControls = () => {
  const zoomIn = () => {
    const view = map.getView();
    view.animate({ zoom: view.getZoom() + 1, duration: 300 });
  };

  const zoomOut = () => {
    const view = map.getView();
    view.animate({ zoom: view.getZoom() - 1, duration: 300 });
  };

  const resetZoom = () => {
    const view = map.getView();
    view.animate({
      center: fromLonLat([35, 39]),
      zoom: 6,
      duration: 500,
    });
  };

  const fitToFeatures = () => {
    const extent = vectorSource.getExtent();
    if (!extent || extent.every((v) => !isFinite(v))) {
      alert("Haritada gösterilecek veri bulunamadı.");
      return;
    }
    map.getView().fit(extent, { padding: [80, 80, 80, 80], duration: 600 });
  };

  return (
    <div className="zoom-controls">
      <button onClick={zoomIn} title="Yakınlaştır ">＋</button>
      <button onClick={zoomOut} title="Uzaklaştır ">−</button>
      <button onClick={resetZoom} title="Başlangıca Dön ">⟳</button>
      <button onClick={fitToFeatures} title="Tüm Verileri Göster ">⛶</button>
    </div>
  );
};

export default ZoomControls;
