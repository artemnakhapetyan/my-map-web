myMapApp.factory('mapService', function ($http, $mdDialog, $location, mapUtils, mapToolsService) {
    return {
        _initMap: function ($scope, baseLayers, overlayLayers) {

            var me = this;

            var options = {
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                projection: "EPSG:4326",
                units: "degrees",
                transitionEffect: null,
                zoomMethod: null,
                //zoomDuration: 0,
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

            $scope.map = me.map;

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

            var layers2Add = [];

            var wfsLayers = [];

            angular.forEach(baseLayers, function (value, key) {
                layers2Add.push(me._createBaseLayer(value));
            });

            angular.forEach(overlayLayers, function (value, key) {
                var lr = me._createOverlayLayer(value);
                layers2Add.push(lr);
                if (value.type === 5) {
                    wfsLayers.push(lr);
                }
            });

            layers2Add.push(me.drawingLayer);

            layers2Add.sort(function (a, b) {
                return a.mapLrOrder - b.mapLrOrder;
            });

            /*layers.push($scope.drawingLayer);
             wfsLrs.push($scope.drawingLayer)
             
             layers.sort(function (a, b) {
             return a.mapLrOrder - b.mapLrOrder;
             });
             
             $scope.map.addLayers(
             layers
             );
             $scope.addMapControls(wfsLrs);*/
            me.map.addLayers(layers2Add);
            
            /*var olFCont = document.getElementsByClassName("olForeignContainer")[0];
            if(olFCont){
                olFCont.remove();
            }*/

            me._addMapControls(wfsLayers);

            var zoom = 14;

            var centerPointLonLat = new OpenLayers.LonLat(4984970, 5118211);
            var mapInitialHash = window.location.hash;

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
            
        },
        _createBaseLayer: function (data) {

            var layer2Add = null;

            var lrParams = data.params ? eval("(" + data.params + ")") : {};
            var lrOptions = data.options ? eval("(" + data.options + ")") : {};

            switch (data.type) {
                case 1:
                {
                    //wms layer
                    var lrSrc = data.sourceUrls ? data.sourceUrls.split(',') : data.sourceUrl;
                    layer2Add = new OpenLayers.Layer.WMS(
                            data.name,
                            lrSrc,
                            lrParams,
                            lrOptions
                            );
                    break;
                }
                case 2:
                {
                    //osm layer
                    layer2Add = new OpenLayers.Layer.OSM(
                            data.name,
                            data.sourceUrl,
                            lrParams,
                            lrOptions
                            );
                    break;
                }
                case 3:
                {
                    //google layer
                    layer2Add = new OpenLayers.Layer.Google(
                            data.name,
                            lrParams
                            );
                    break;
                }
                default:
                {
                    break;
                }
            }

            layer2Add.lrId = data.lrId;
            layer2Add.mapLrOrder = data.mapLrOrder;

            return layer2Add;

        },
        _createOverlayLayer: function (data) {

            var layer2Add = null;

            var lrParams = data.params ? eval("(" + data.params + ")") : {};
            var lrOptions = data.options ? eval("(" + data.options + ")") : {};
            var cql = data.cql ? eval("(" + data.cql + ")") : {};

            switch (data.type) {
                case 1:
                {
                    //wms layer
                    var lrSrc = data.sourceUrls ? data.sourceUrls.split(',') : data.sourceUrl;
                    layer2Add = new OpenLayers.Layer.WMS(
                            data.name,
                            lrSrc,
                            lrParams,
                            lrOptions
                            );

                    if (cql) {
                        layer2Add.mergeNewParams(cql);
                    }
                    break;
                }
                case 5:
                {
                    //wfs layer

                    var styleMap = mapUtils.getStyleMap({
                        "Point": lrOptions
                    });

                    layer2Add = new OpenLayers.Layer.Vector(
                            data.name,
                            {
                                strategies: [
                                    new OpenLayers.Strategy.BBOX()
                                            //, lrRefreshStrategy
                                ],
                                protocol: new OpenLayers.Protocol.WFS(lrParams),
                                styleMap: styleMap,
                                minResolution: lrOptions.minResolution,
                                maxResolution: lrOptions.maxResolution,
                                //style: lrOptions,
                                filter: data.cql ? cql : null/*,
                                 events: {
                                 'featureselected': function(){
                                 AppUtils.messagebox('info', 'under construction...');
                                 }
                                 }*/
                            }
                    );

                    // create style from sld
                    if (data.wfsSld) {
                        var format = new OpenLayers.Format.SLD();
                        var sld = format.read(data.wfsSld);

                        if (sld.namedLayers[lrParams.featureType]) {

                            var styleFromSld = sld.namedLayers[lrParams.featureType].userStyles[0];

                            angular.forEach(styleFromSld.rules, function (rule) {
                                if (rule.symbolizer.Point) {
                                    rule.symbolizer.Point.cursor = "pointer";
                                    if (rule.symbolizer.Text) {
                                        rule.symbolizer.Point.label = rule.symbolizer.Text.label;
                                        rule.symbolizer.Point.fontColor = rule.symbolizer.Text.fillColor;
                                        rule.symbolizer.Point.fontWeight = rule.symbolizer.Text.fontWeight;
                                        rule.symbolizer.Point.fontStyle = rule.symbolizer.Text.fontStyle;
                                        rule.symbolizer.Point.fontSize = rule.symbolizer.Text.fontSize;
                                        rule.symbolizer.Point.fontFamily = rule.symbolizer.Text.fontFamily;
                                        rule.symbolizer.Point.fontOpacity = 1;
                                        rule.symbolizer.Point.labelAlign = "lm";
                                        rule.symbolizer.Point.labelXOffset = 12;
                                        rule.symbolizer.Point.labelOutlineColor = "black";
                                        rule.symbolizer.Point.labelOutlineWidth = 10;
                                        rule.symbolizer.Point.labelOutlineOpacity = 1;
                                        rule.symbolizer.Point.labelSelect = true;

                                    }
                                }
                            });

                            layer2Add.styleMap.styles.default = styleFromSld;
                            layer2Add.styleMap.styles.selected = styleFromSld;

                        } else {
                            console.log(data);
                        }
                    }

                    if (!data.isSelected) {
                        layer2Add.setVisibility(false);
                    }

                    break;
                }
                default:
                {
                    break;
                }
            }

            layer2Add.lrId = data.lrId;
            layer2Add.mapLrOrder = data.mapLrOrder;

            return layer2Add;

        },
        _addMapControls: function (wfsLrs) {

            var me = this;
            /*$scope.navHistory = new OpenLayers.Control.NavigationHistory();
             $scope.map.addControl($scope.navHistory);
             $scope.navHistory.activate();
             var styleMap = mapUtils.getBlueStyleMap();
             $scope.measureDistanceControl = new OpenLayers.Control.Measure(
             OpenLayers.Handler.Path, {
             persist: true, // 1
             immediate: true, // 2
             displaySystem: 'metric', // 3
             handlerOptions: {
             layerOptions: {styleMap: styleMap}
             },
             eventListeners: {
             'measure': function (event) {
             
             var measureContentText = '';
             
             switch (event.units) {
             case 'm':
             {
             var fixedMeasure = event.measure / 1.34628965;
             measureContentText = '{0} მეტრი'.format(parseFloat(fixedMeasure).toFixed(0));
             //AppUtils.messagebox('სრული სიგრძე', measureContentText);
             break;
             }
             case 'km':
             {
             var fixedMeasure = (event.measure * 1000) / 1.34628965;
             measureContentText = '{0} მეტრი'.format(parseFloat(fixedMeasure).toFixed(0));
             //AppUtils.messagebox('სრული სიგრძე', measureContentText);
             break;
             }
             default:
             {
             var fixedMeasure = event.measure;
             measureContentText = '{0} {1}'.format(parseFloat(fixedMeasure).toFixed(5), event.units);
             //AppUtils.messagebox('სრული სიგრძე', measureContentText);
             }
             }
             
             var centroid = event.geometry.getCentroid();
             
             $scope.map.lastMeasureInfoCenterLonLat = new OpenLayers.LonLat(centroid.x, centroid.y);
             $scope.map.panTo($scope.map.lastMeasureInfoCenterLonLat);
             setTimeout(function () {
             $scope.measurePopupHeight = 120;
             $scope.measurePopupWidth = 300;
             $scope.measurePopupTitle = 'სრული სიგრძე';
             $scope.measurePopupVisible = true;
             $scope.measureContent = measureContentText;
             }, 500);
             
             },
             'measurepartial': function (event) {
             //console.log(event.measure + ' ' + event.units);
             },
             'deactivate': function(){
             $scope.closeMeasurePopup();
             if (this.active) {
             if (this.handler) {
             this.handler.deactivate();
             }
             this.active = false;
             if (this.map) {
             OpenLayers.Element.removeClass(
             this.map.viewPortDiv,
             this.displayClass.replace(/ /g, "") + "Active"
             );
             }
             this.events.triggerEvent("deactivate");
             return true;
             }
             return false;
             }
             }
             });
             $scope.measureAreaControl = new OpenLayers.Control.Measure(
             OpenLayers.Handler.Polygon, {
             persist: true, // 1
             immediate: true, // 2
             displaySystem: 'metric', // 3
             handlerOptions: {
             layerOptions: {styleMap: styleMap}
             },
             eventListeners: {
             'measure': function (event) {
             //var fixedMeasure = event.measure / 1.815967468;
             //AppUtils.messagebox('სრული ფართობი', parseFloat(fixedMeasure).toFixed(5) + ' ' + event.units);
             var measureContentText = '';
             var allVertices = [];
             angular.forEach(event.geometry.components, function (value, key) {
             angular.forEach(value.getVertices(), function (value1, key1) {
             allVertices.push(value1);
             });
             });
             var curve = new OpenLayers.Geometry.Curve(allVertices);
             switch (event.units) {
             case 'm':
             {
             var fixedMeasure = event.measure / 1.815967468;
             
             measureContentText = 'ფართობი: {0} კვადრატული მეტრი პერიმეტრი: {1} მეტრი'.
             format(
             parseFloat(fixedMeasure).toFixed(2),
             parseFloat(curve.getLength()).toFixed(2)
             );
             
             //AppUtils.messagebox('სრული ფართობი და პერიმეტრი', measureContentText);
             break;
             }
             case 'km':
             {
             var fixedMeasure = (event.measure * 1000000) / 1.815967468;
             
             measureContentText = 'ფართობი: {0} კვადრატული მეტრი პერიმეტრი: {1} მეტრი'.
             format(
             parseFloat(fixedMeasure).toFixed(2),
             parseFloat(curve.getLength()).toFixed(2)
             );
             
             //AppUtils.messagebox('სრული ფართობი და პერიმეტრი', measureContentText);
             break;
             }
             default:
             {
             var fixedMeasure = event.measure;
             
             measureContentText = 'ფართობი: {0} {1} პერიმეტრი: {2} მეტრი'.
             format(
             parseFloat(fixedMeasure).toFixed(5), 
             event.units,
             parseFloat(curve.getLength()).toFixed(2)
             );
             
             //AppUtils.messagebox('სრული ფართობი და პერიმეტრი', measureContentText);
             }
             }
             
             var centroid = event.geometry.getCentroid();
             
             $scope.map.lastMeasureInfoCenterLonLat = new OpenLayers.LonLat(centroid.x, centroid.y);
             $scope.map.panTo($scope.map.lastMeasureInfoCenterLonLat);
             setTimeout(function () {
             $scope.measurePopupHeight = 150;
             $scope.measurePopupWidth = 400;
             $scope.measurePopupTitle = 'სრული ფართობი და პერიმეტრი';
             $scope.measurePopupVisible = true;
             $scope.measureContent = measureContentText;
             }, 500);
             
             },
             'measurepartial': function (event) {
             //console.log(event.measure + ' ' + event.units);
             },
             'deactivate': function(){
             $scope.closeMeasurePopup();
             if (this.active) {
             if (this.handler) {
             this.handler.deactivate();
             }
             this.active = false;
             if (this.map) {
             OpenLayers.Element.removeClass(
             this.map.viewPortDiv,
             this.displayClass.replace(/ /g, "") + "Active"
             );
             }
             this.events.triggerEvent("deactivate");
             return true;
             }
             return false;
             }
             }
             });
             $scope.measurePointLocationControl = new OpenLayers.Control.Measure(
             OpenLayers.Handler.Point, {
             single: true,
             persist: true, // 1
             immediate: true, // 2
             displaySystem: 'metric', // 3
             handlerOptions: {
             layerOptions: {styleMap: styleMap}
             },
             eventListeners: {
             'measure': function (event) {
             //AppUtils.messagebox('წერტილის კოორდინატები', 'X={0} მეტრი Y={1} მეტრი'.format(parseFloat(event.geometry.x).toFixed(0), parseFloat(event.geometry.y).toFixed(0)));
             $scope.map.lastMeasureInfoCenterLonLat = new OpenLayers.LonLat(event.geometry.x, event.geometry.y);
             $scope.map.panTo($scope.map.lastMeasureInfoCenterLonLat);
             setTimeout(function () {
             $scope.measurePopupHeight = 120;
             $scope.measurePopupWidth = 400;
             $scope.measurePopupTitle = 'წერტილის კოორდინატები';
             $scope.measurePopupVisible = true;
             $scope.measureContent = 'X={0} მეტრი Y={1} მეტრი'.format(parseFloat(event.geometry.x).toFixed(0), parseFloat(event.geometry.y).toFixed(0));
             }, 500);
             },
             'deactivate': function(){
             $scope.closeMeasurePopup();
             if (this.active) {
             if (this.handler) {
             this.handler.deactivate();
             }
             this.active = false;
             if (this.map) {
             OpenLayers.Element.removeClass(
             this.map.viewPortDiv,
             this.displayClass.replace(/ /g, "") + "Active"
             );
             }
             this.events.triggerEvent("deactivate");
             return true;
             }
             return false;
             }
             }
             });
             var featureAdded = function (feature) {
             var wktParser = new OpenLayers.Format.WKT();
             var wktGeometry = wktParser.extractGeometry(feature.geometry);
             AppUtils.http($http, 'LayersController', 'addTmapUserLrObj.do', {
             shape: wktGeometry,
             objType: 1
             }, function (data) {
             $scope.redrawLr('მომხმარებლის ფენა');
             });
             };
             $scope.drawQonebaPolygonControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer,
             OpenLayers.Handler.Polygon, {
             multi: false,
             featureAdded: function (feature) {
             var wktParser = new OpenLayers.Format.WKT();
             var wktGeometry = wktParser.extractGeometry(feature.geometry);
             AppUtils.http($http, 'LayersController', 'addTmapUserLrObj.do', {
             shape: wktGeometry,
             objType: 2
             }, function (rs) {
             //$scope.redrawLr('ქონების ფენა');
             //განცხადების გადასაგზავნად გამოიყენეთ ღილაკი {2}
             //,'<i style="color: #999;" class="fa fa-paper-plane"</i>'
             if ($scope.drawQonebaPolygonControl.lastFeature) {
             $scope.drawingLayer.removeFeatures($scope.drawQonebaPolygonControl.lastFeature);
             }
             
             $scope.drawQonebaPolygonControl.lastFeature = feature;
             
             AppUtils.messagebox(
             'შეტყობინება',
             'თქვენს მიერ შექმნილი გასაგზავნი განცხადების ნომერია: #{0}.<br/> \n\
             გასაგზავნი განცხადების პოლიგონის ფართობია: {1} მ<sup>2</sup>.<br/> \n\
             '.format(
             rs.data.objId,
             rs.data.area
             )
             );
             
             $timeout(function () {
             angular.element('#doc-tab-header').trigger('click');
             }, 0);
             if ($scope.drawQonebaPolygonControl.cb) {
             $scope.drawQonebaPolygonControl.cb();
             }
             angular.forEach($scope.mapControls, function (value, key) {
             value.deactivate();
             });
             
             $scope.drawingLayer.addFeatures(feature);
             });
             }
             });
             $scope.drawPolygonControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer,
             OpenLayers.Handler.Polygon, {
             multi: false,
             featureAdded: featureAdded
             });
             $scope.drawLineControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer,
             OpenLayers.Handler.Path, {
             multi: false,
             featureAdded: featureAdded
             });
             $scope.drawPointControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer,
             OpenLayers.Handler.Point, {
             multi: false,
             featureAdded: featureAdded
             });
             $scope.drawGalleryObjectControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer,
             OpenLayers.Handler.Point, {
             multi: false,
             featureAdded: function (feature) {
             var wktParser = new OpenLayers.Format.WKT();
             var wktGeometry = wktParser.extractGeometry(feature.geometry);
             AppUtils.http($http, 'LayersController', 'addTmapUserLrObj.do', {
             shape: wktGeometry,
             objType: 3
             }, function (data) {
             $scope.drawingLayer.removeAllFeatures();
             $scope.redrawLr('გალერეის ობიექტები', 17);
             });
             }
             });
             $scope.drawBoxControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer,
             OpenLayers.Handler.RegularPolygon, {
             multi: false,
             featureAdded: featureAdded
             });
             $scope.drawCircleControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer,
             OpenLayers.Handler.RegularPolygon, {
             handlerOptions: {sides: 50},
             multi: false,
             featureAdded: featureAdded
             });
             //var tmapUserObjectsLr = $scope.map.getLayersByName('გალერეის ობიექტები') ? $scope.map.getLayersByName('გალერეის ობიექტები')[0] : null;
             var tmapUserObjectsLr = $scope.map.getLayersBy('lrId', 17) ? $scope.map.getLayersBy('lrId', 17)[0] : null;
             */


            var selectCtrl = new OpenLayers.Control.SelectFeature(wfsLrs, {
                toggle: true,
                clickout: true,
                highlightOnly: true,
                onSelect: function (feature) {

                    if (feature.data && feature.data.callback) {
                        feature.data.callback(selectCtrl, feature);
                    }

                    if (feature.layer.lrId) {

                        //$scope.layersinfoVisible = false;
                        //$scope.clearInfoPopup();

                        if (!feature.layer.lrId) {
                            AppUtils.messagebox('შეტყობინება', 'ობიექტის ფენა ვერ მოიძებნა.');
                            return;
                        }

                        if (!feature.data.OBJECTID) {
                            AppUtils.messagebox('შეტყობინება', 'ობიექტის OBJECTID ვერ მოიძებნა.');
                            return;
                        }

                        //AppUtils.http($http, "api/layerseditorws", "getLrObjectDataByObjectid", {
                        mapToolsService._loadLayerObjectEditorData(feature.layer.lrId, feature.layer, feature.data.OBJECTID, function(){
                            
                            selectCtrl.unselectAll();
                                
                            me.drawingLayer.removeAllFeatures();

                            var locationMarker = me._createIconMarker(feature.geometry.clone(), 'resources/imgs/select.png', {
                                type: 'LOCATION_MARKER'
                            }, -16);

                            me.drawingLayer.addFeatures(locationMarker);
                            
                        });

                    }


                },
                autoActivate: true
            });

            /*$scope.lrsInfoControl = new OpenLayers.Control.DrawFeature(
             $scope.drawingLayer, OpenLayers.Handler.Point,
             {
             featureAdded: function (feature) {
             $scope.layersinfoVisible = false;
             $scope.clearInfoPopup();
             me.clearMarkersLr();
             var point = me.googleMercatorToEPSG4326(feature.geometry);
             var treeNodes = $scope.layersController.getTreeNodes($scope.layersController.treedata);
             var lrsIsOnIdsStr = '';
             angular.forEach(treeNodes, function (value, key) {
             if (
             value 
             && 
             value.data 
             && 
             value.checked 
             && 
             !value.data.isBaseLr 
             && 
             (value.data.type === 1 || value.data.type === 5) 
             ){
             lrsIsOnIdsStr += ',{0}'.format(value.data.lrId);
             }
             });
             if (!lrsIsOnIdsStr) {
             AppUtils.messagebox('შეტყობინება', 'ინფორმაციის ძებნისთვის გთხოვთ ჩართოთ მინიმუმ ერთი დამფარავი ფენა.');
             return;
             }
             
             lrsIsOnIdsStr = lrsIsOnIdsStr.substr(1);
             var locationMarker = me.createIconMarker(feature.geometry, 'resources/imgs/icons/location.png', {
             type: 'LOCATION_MARKER'
             });
             $scope.drawingLayer.addFeatures(locationMarker);
             AppUtils.http($http, "LayersController", "getLayersInfos.do", {
             lrsIds: lrsIsOnIdsStr,
             X: point.x,
             Y: point.y
             }, function (rs) {
             
             $scope.map.lastInfoFeatureCenterLonLat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
             $scope.map.panTo($scope.map.lastInfoFeatureCenterLonLat);
             if (rs.data && rs.data.length) {
             setTimeout(function () {
             $scope.layersinfoVisible = true;
             }, 500);
             } else {
             $scope.drawingLayer.removeFeatures(locationMarker);
             }
             
             if (rs.data && rs.data.length) {
             
             $scope.infoResult.layersDataArray = rs.data;
             $scope.infoResult.choosedLayer = $scope.infoResult.layersDataArray[0];
             } else {
             $scope.drawingLayer.removeFeatures(locationMarker);
             }
             
             });
             },
             deactivate: function () {
             $scope.layersinfoVisible = false;
             $scope.clearMarkersLr();
             $scope.clearDrawingLr();
             $scope.map.lastInfoFeatureCenterLonLat = null;
             if (this.active) {
             if (this.handler) {
             this.handler.deactivate();
             }
             this.active = false;
             if (this.map) {
             OpenLayers.Element.removeClass(
             this.map.viewPortDiv,
             this.displayClass.replace(/ /g, "") + "Active"
             );
             }
             this.events.triggerEvent("deactivate");
             return true;
             }
             return false;
             },
             multi: false
             }
             );*/
            me.map.addControl(selectCtrl);
            /*me.mapControls = [
             $scope.lrsInfoControl,
             $scope.drawQonebaPolygonControl,
             $scope.drawGalleryObjectControl,
             $scope.drawLineControl,
             $scope.drawPointControl,
             $scope.drawPolygonControl,
             $scope.drawBoxControl,
             $scope.drawCircleControl,
             $scope.measureAreaControl,
             $scope.measurePointLocationControl,
             $scope.measureDistanceControl
             ];
             me.map.addControls(me.mapControls);*/
        },
        _createIconMarker: function (point, iconUrl, data, graphicYOffset) {
            var markerSt = {
                graphicWidth: 32,
                graphicHeight: 32,
                graphicXOffset: -16,
                graphicYOffset: graphicYOffset ? graphicYOffset : -16,
                externalGraphic: iconUrl,
                graphicOpacity: 1,
                cursor: 'pointer'
            };
            var sty = OpenLayers.Util.applyDefaults(markerSt, OpenLayers.Feature.Vector.style["default"]);
            /*var sm = new OpenLayers.StyleMap({
             'default': sty
             });*/

            var markerFeature = new OpenLayers.Feature.Vector(
                    point,
                    data
                    );
            markerFeature.style = sty;
            return markerFeature;
        },
        _getLayer: function(lrId){
            return this.map.getLayersBy("lrId", lrId)[0];
        },
        _setBaseLayer: function (lrId) {

            var me = this;

            var layers = me.map.getLayersBy("lrId", lrId);
            
            /*console.log(layers[0]);

            if(layers[0].id.includes('OpenLayers_Layer_Google_')){
                console.log(document.getElementsByClassName("olForeignContainer"));
                document.getElementsByClassName("olForeignContainer")[0].style.display = "block";
            }*/

            me.map.setBaseLayer(layers[0]);

        },
        _changeOverlayLayerVisibility: function (lrId, visibility) {

            var me = this;

            var layers = me.map.getLayersBy("lrId", lrId);

            layers[0].setVisibility(visibility);

        },
        _refreshLayer: function (lrId) {

            var me = this;

            var layers = me.map.getLayersBy("lrId", lrId);

            layers[0].refresh({force: true});

        }

    }
});