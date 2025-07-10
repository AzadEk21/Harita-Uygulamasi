import WKT from "ol/format/WKT";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import CircleStyle from "ol/style/Circle";
import { vectorSource, map } from "./map";

export function loadPoints(data, clear = true) {
  if (!Array.isArray(data)) return;

  if (clear) {
    vectorSource.clear();
  }

  const format = new WKT();

  data.forEach((item) => {
    if (!item.geometry) return;
    try {
      const feature = format.readFeature(item.geometry, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      const geomType = feature.getGeometry().getType();
      let style;

      if (geomType === "Point") {
        style = new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: "#007bff" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        });
      } else if (geomType === "LineString") {
        style = new Style({
          stroke: new Stroke({ color: "#ffcc33", width: 3 }),
        });
      } else if (geomType === "Polygon") {
        style = new Style({
          stroke: new Stroke({ color: "#ff5733", width: 2 }),
          fill: new Fill({ color: "rgba(255, 0, 0, 0.3)" }),
        });
      }

      feature.setStyle(style);
      feature.set("id", item.id);
      feature.set("name", item.name);

      feature.set("username", item.username || "-");

      vectorSource.addFeature(feature);
    } catch (e) {
      console.error("Geometri yüklenemedi:", e, item);
    }
  });

  map.render();
}
