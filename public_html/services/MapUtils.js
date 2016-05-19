myMapApp.factory('mapUtils', function () {
    return {
        findGeometry: function (wktGeometry, map, drawingLayer) {

            var wktParser = new OpenLayers.Format.WKT();
            var draftFeature = wktParser.read(wktGeometry);
            drawingLayer.removeAllFeatures();
            map.zoomToExtent(draftFeature.geometry.getBounds());
            drawingLayer.addFeatures([draftFeature]);

        },
        convertGeometrySrid: function (olGeometry, fromSrid, toSrid){
           
            return olGeometry.transform(new OpenLayers.Projection(fromSrid), new OpenLayers.Projection(toSrid));
            
        },
        toWKT: function(olGeometry){
            var wktParser = new OpenLayers.Format.WKT();
            return wktParser.extractGeometry(olGeometry);
        },
        
        getBlueStyleMap: function () {

            // style the sketch fancy
            var sketchSymbolizers = {
                "Point": {
                    pointRadius: 4,
                    graphicName: "square",
                    fillColor: "#2196F3",
                    fillOpacity: 1,
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "white"
                },
                "Line": {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    strokeColor: "#2196F3"/*,
                     strokeDashstyle: "dash"*/
                },
                "Polygon": {
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    strokeColor: "#2196F3",
                    fillColor: "white",
                    fillOpacity: 0.3
                }
            };
            var style = new OpenLayers.Style();
            style.addRules([
                new OpenLayers.Rule({symbolizer: sketchSymbolizers})
            ]);
            var styleMap = new OpenLayers.StyleMap({"default": style});

            return styleMap;

        },
        getStyleMap: function (symbolizers) {

            // style the sketch fancy
            var sketchSymbolizers = symbolizers? symbolizers: {
                "Point": {
                    pointRadius: 4,
                    graphicName: "square",
                    fillColor: "#2196F3",
                    fillOpacity: 1,
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "white"
                },
                "Line": {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    strokeColor: "#2196F3"/*,
                     strokeDashstyle: "dash"*/
                },
                "Polygon": {
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    strokeColor: "#2196F3",
                    fillColor: "white",
                    fillOpacity: 0.3
                }
            };
            var style = new OpenLayers.Style();
            style.addRules([
                new OpenLayers.Rule({symbolizer: sketchSymbolizers})
            ]);
            var styleMap = new OpenLayers.StyleMap({"default": style});

            return styleMap;

        }

    }
});