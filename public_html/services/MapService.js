myMapApp.factory('mapService', function ($http, $mdDialog, $location, mapUtils) {
    return {
        _initMap: function ($scope) {

            var me = this;

            var options = {
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                projection: "EPSG:4326",
                units: "degrees",
                transitionEffect: null,
                zoomMethod: null,
                controls: [
                    
                    /*new OpenLayers.Control.LoadingPanel({
                        displayClass: 'olControlLoadingPanel1'
                    }),
                    new OpenLayers.Control.MousePosition({
                        id: 'mousePositionControlId',
                        prefix: '',
                        suffix: ' &nbsp;',
                        div: document.getElementById('mouse-position-div'),
                        displayProjection: new OpenLayers.Projection("EPSG:32638")//new OpenLayers.Projection("EPSG:32638")
                    }),
                    new OpenLayers.Control.Scale(document.getElementById('map-scale-div'), {
                        prefix: '&nbsp;&nbsp;მაშტაბი: &nbsp;',
                        geodesic: true
                    }),*/
                    new OpenLayers.Control.Navigation()
                ]
            };

            me.map = new OpenLayers.Map('olmap', options);

            me.map.events.register('moveend', me.map, function () {

                if (me.map && me.map.center && me.map.center.lon) {
                    var centerPoint4326 = mapUtils.convertGeometrySrid(me.map.getCenter(), 'EPSG:900913', 'EPSG:4326');
                    location.hash = "C={0}-{1}@Z={2}".format(
                            centerPoint4326.lon.toFixed(7),
                            centerPoint4326.lat.toFixed(7),
                            me.map.zoom
                            );
                }

                /*if ($scope.map.lastInfoFeatureCenterLonLat) {
                    var viewportPx = $scope.map.getViewPortPxFromLonLat($scope.map.lastInfoFeatureCenterLonLat);
                    $scope.popupTop = viewportPx.y - 230;
                    $scope.popupLeft = viewportPx.x + 20;
                }

                if ($scope.map.lastMeasureInfoCenterLonLat) {
                    var viewportPx = $scope.map.getViewPortPxFromLonLat($scope.map.lastMeasureInfoCenterLonLat);
                    $scope.measurePopupTop = viewportPx.y - $scope.measurePopupHeight / 2;
                    $scope.measurePopupLeft = viewportPx.x + 20;
                }*/

                var bounds = me.map.getExtent().toGeometry();
                var wktParser = new OpenLayers.Format.WKT();
                var boundsWkt = wktParser.extractGeometry(bounds);
                /*AppUtils.http($http, 'LayersController', 'getLrUserObjsImgs.do', {
                    bbox: boundsWkt
                }, function (rs) {
                    var images = [];
                    angular.forEach(rs.data, function (value, key) {
                        if (value.objType === 1 || value.objType === 3) {
                            images.push(value);
                        }
                    });
                    $scope.mapImgs = images;
                }, null, true);*/
            });

            var drawingLayerSM = mapUtils.getBlueStyleMap();
            me.drawingLayer = new OpenLayers.Layer.Vector('Drawing Layer', {
                styleMap: drawingLayerSM
            });

            me.drawingLayer.mapLrOrder = 100001;
            
            /*layers.push($scope.drawingLayer);
            wfsLrs.push($scope.drawingLayer)

            layers.sort(function (a, b) {
                return a.mapLrOrder - b.mapLrOrder;
            });

            $scope.map.addLayers(
                    layers
                    );
            $scope.addMapControls(wfsLrs);*/
            me.map.addLayers([
                new OpenLayers.Layer.OSM(),
                me.drawingLayer
            ]);

            var zoom = 14;
            
            var centerPointLonLat = new OpenLayers.LonLat(4984970, 5118211);
            var mapInitialHash = location.hash;
            if (mapInitialHash) {
                mapInitialHash = mapInitialHash.substr(mapInitialHash.indexOf('#/') + 2);
                var params = mapInitialHash.split('@');
                angular.forEach(params, function (v, k) {
                    var key = v.split('=')[0];
                    var val = v.split('=')[1];
                    switch (key) {
                        case 'Z':
                        {
                            zoom = val;
                            break;
                        }
                        case 'C':
                        {
                            var centerPointLonLat4326 = new OpenLayers.LonLat(val.split("-")[0], val.split("-")[1]);
                            var centerPoint = mapUtils.convertGeometrySrid(centerPointLonLat4326, 'EPSG:4326', 'EPSG:900913');
                            centerPointLonLat = new OpenLayers.LonLat(centerPoint.lon, centerPoint.lat);
                            break;
                        }
                        default:
                        {
                            break;
                        }
                    }
                });
            }

            me.map.setCenter(centerPointLonLat, zoom);

        }

    }
});