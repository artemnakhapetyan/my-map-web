myMapApp.factory('mapToolsService', function ($http, $mdDialog, $mdSidenav, $location, mapUtils) {
    return {
        _initBaseLayersSwitcher: function ($scope, baseLayersData) {

            var me = this;
            me.baseLayersControllerCb(baseLayersData);

        },
        _initLayers4EditView: function ($scope, layers4EditData) {

            var me = this;
            me.layers4EditControllerCb(layers4EditData);

        },
        _registerbaseLayersControllerCb: function (baseLayersControllerCb) {

            var me = this;
            me.baseLayersControllerCb = baseLayersControllerCb;

        },
        _registerLayers4EditControllerCb: function (layers4EditControllerCb) {

            var me = this;
            me.layers4EditControllerCb = layers4EditControllerCb;

        },
        _initLayerObjectEditor: function (layerData, layerObjectFields, layerObjectData, objectId) {

            var me = this;
            me.loadObjectInEditorControllerCb(layerData, layerObjectFields, layerObjectData, objectId);

        },
        _registerLoadObjectInEditorControllerCb: function (loadObjectInEditorControllerCb) {

            var me = this;
            me.loadObjectInEditorControllerCb = loadObjectInEditorControllerCb;

        },
        _loadLayerObjectEditor: function (layer, layerObjectData, objectId) {

            var me = this;

            //AppUtils.http({}, 'api/managelayersws', 'getLayerTableColumnsConfig', {
            AppUtils.http({}, '../TbilisimapCoreProxyController', 'process.do', {
                    action: 'managelayersws/getLayerTableColumnsConfig',
                    orgId: 1,
                    useType: 6,
                    lrId: layer.lrId
            }, function (rs) {

                me._initLayerObjectEditor(layer, rs.data, layerObjectData, objectId);

                $mdSidenav('layer-object-editor').open();
                
            });


        },
        _loadLayerObjectEditorData: function(lrId, layer, objectId, cb) {
            
            var me = this;
            
            AppUtils.http({}, '../TbilisimapCoreProxyController', 'process.do', {
                            action: 'layerseditorws/getLrObjectDataByObjectid',
                            lrId: lrId,
                            objectId: objectId + ''
                        }, function (rs) {

                            if (rs.data) {

                                me._loadLayerObjectEditor(layer, rs.data[0], objectId);

                                if(cb){
                                    cb();
                                }

                                /*$scope.infoResult.layersDataArray = [rs.data];
                                 $scope.infoResult.choosedLayer = $scope.infoResult.layersDataArray[0];
                                 
                                 $scope.map.lastInfoFeatureCenterLonLat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
                                 $scope.map.panTo($scope.map.lastInfoFeatureCenterLonLat);
                                 
                                 $scope.layersinfoVisible = true;
                                 
                                 selectCtrl.unselectAll();
                                 
                                 var locationMarker = me.createIconMarker(feature.geometry.clone(), 'resources/imgs/icons/select.png', {
                                 type: 'LOCATION_MARKER'
                                 }, -16);
                                 
                                 $scope.drawingLayer.addFeatures(locationMarker);*/


                            }

                        });
            
            
            
        }

    }

});