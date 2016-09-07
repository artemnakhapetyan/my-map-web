
myMapApp.controller('layerObjectEditorController', function ($scope, $mdSidenav, $mdToast, $animate, mapToolsService, mapService, mapUtils) {

    $scope.layerObject = {};
    $scope.libs = {};
    
    $scope.formMode = '';
    
    $scope.selectedLayerObjObjectId = null;
    
    

    $scope.init = function () {

        mapToolsService._registerLoadObjectInEditorControllerCb(function (layerData, layerObjectFields, layerObjectData, objectId) {

            $scope.selectedLayerObjObjectId = objectId;

            if ($scope.drawGeometryControl) {
                mapService.map.removeControl($scope.drawGeometryControl);
            }

            angular.forEach(layerObjectFields, function (value, key) {
                if (value.libType && !$scope.libs[value.libType]) {

                    //AppUtils.http({}, 'api/appws', 'getLibObjects', {
                    AppUtils.http({}, '../TbilisimapCoreProxyController', 'process.do', {
                        action: 'appws/getLibObjects',
                        libId: value.libType
                    }, function (rs) {
                        $scope.libs[value.libType] = rs.data;
                        $scope._fillFormWithValues(layerObjectData, layerObjectFields);
                    });

                }
            });

            $scope.drawGeometryControl = new OpenLayers.Control.DrawFeature(
                    mapService.drawingLayer,
                    OpenLayers.Handler.Point, {
                        multi: false,
                        featureAdded: function (feature) {
                            
                            var wktGeometry = mapUtils.toWKT(feature.geometry);
                            $scope.drawGeometryControl.deactivate();

                            $scope.layerObject[$scope.drawGeometryControl.fieldName] = wktGeometry;

                            var el = angular.element(document.querySelector('#layer-object-geometry-id-' + $scope.drawGeometryControl.fieldName));

                            el.focus();

                        }
                    });

            mapService.map.addControls([$scope.drawGeometryControl]);

            $scope.layerObjectFields = layerObjectFields;
            $scope.layerData = layerData;
            
            $scope._fillFormWithValues(layerObjectData, layerObjectFields);
          
        });

    },
            $scope.init(),
            
            $scope._fillFormWithValues = function(layerObjectData, layerObjectFields){
               
                $scope.layerObject = layerObjectData? layerObjectData: {};
                
                $scope.formMode = layerObjectData? 'edit': 'add';
            
                if(layerObjectData){
                    angular.forEach(layerObjectData, function (value, key) {
                        angular.forEach(layerObjectFields, function (value1, key1) {
                            if (key===value1.columnName) {
                                if(value1.dataType===63){
                                    layerObjectData[key]=new Date(value);
                                }
                                if(value1.dataType===61){
                                    $scope.comboChange(value, value1.libType);
                                }
                            }
                        });
                    });
                }
                
            },
            
            $scope.fillFormWithValuesTemp = function(){
               
                $scope.comboChange(1, 1);
               
                $scope.layerObject = {
                    TYPE: 1,
                    SUBTYPE: 7,
                    REPORT_DESCRIPTION: 'description text...',
                    COUNTRY: 'Georgia',
                    CITY: 'Tbilisi',
                    STREET: 'Rustaveli 25',
                    ROAD_TYPE: 40,
                    REPORT_RATING: 5,
                    RELIABILITY: 6,
                    PUB_DATE: new Date(),
                    MAGVAR: 250,
                    GEOMETRY: 'POINT(4988976.0175578 5126986.9783574)'
                };
                
                
                
            },
            
            $scope.resetForm = function(){
                $scope.layerObject = {};
            },
            
            $scope.closeSidenavView = function (viewName) {
                $scope.resetForm();
                $scope.drawGeometryControl.deactivate();
                $mdSidenav(viewName).close();
                mapService.drawingLayer.removeAllFeatures();
            },
            $scope.comboChange = function (libObjId, libType) {

                angular.forEach($scope.libs, function (value, key) {

                    angular.forEach(value, function (value1, key1) {

                        if (value1.parentLibId && value1.parentLibId === libType) {

                            if (value1.parentObjId === libObjId) {
                                value1.parentObjChoosed = true;
                            } else {
                                value1.parentObjChoosed = false;
                            }

                        }

                    });

                });

            },
            $scope.chooseCoordinates = function (fieldName) {

                mapService.drawingLayer.removeAllFeatures();
                $scope.layerObject[fieldName] = '';

                $scope.drawGeometryControl.activate();
                $scope.drawGeometryControl.fieldName = fieldName;

                $mdToast.show(
                        {
                            template:
                                    '<md-toast>' +
                                    '<div class="md-toast-content">' +
                                    'აირჩიეთ კოორდინატები რუკაზე' +
                                    '</div>' +
                                    '</md-toast>',
                            position: 'top right',
                            hideDelay: 4000,
                            parent: angular.element(document.querySelector('#map-header-toolbar'))
                        }
                );


            },
            $scope.saveLayerObject = function () {

                var me = this;
                
                //AppUtils.http({}, 'api/layerseditorws', 'saveLayerObject', {
                AppUtils.http({}, '../TbilisimapCoreProxyController', 'process.do', {
                        action: 'layerseditorws/saveLayerObject',
                        orgId: 1,
                        lrId: $scope.layerData.lrId+'',
                        layerObject: AppUtils.prepareJson4Submit($scope.layerObject),
                        layerObjectFields: $scope.layerObjectFields
                    }, function (rs) {
                        
                        mapService._refreshLayer($scope.layerData.lrId);
                        me.closeSidenavView('layer-object-editor');
                        
                    });

            },
            $scope.uploadPhoto = function (file) {
                
                if(!file){
                    return;
                }
            
                
            
                AppUtils.upload({}, '../TbilisimapCoreProxyController', 'uploadLrFeatureObject.do', {
                        file: file,
                        lrId: $scope.layerData.lrId+'',
                        featureId: $scope.selectedLayerObjObjectId,
                        objType: 1,
                        orgId: orgId
                }, function(rs){
                        console.log(rs);
                        mapToolsService._loadLayerObjectEditorData($scope.layerData.lrId, $scope.layerData, $scope.selectedLayerObjObjectId);
                        
                });
            
        
                
            },
            
            $scope.uploadDocument = function (file) {
               
                if(!file){
                    return;
                }
            
                
            
                AppUtils.upload({}, '../TbilisimapCoreProxyController', 'uploadLrFeatureObject.do', {
                        file: file,
                        lrId: $scope.layerData.lrId+'',
                        featureId: $scope.selectedLayerObjObjectId,
                        objType: 4,
                        orgId: orgId
                }, function(rs){
                        console.log(rs);
                        mapToolsService._loadLayerObjectEditorData($scope.layerData.lrId, $scope.layerData, $scope.selectedLayerObjObjectId);
                        
                });
                
            },
            
            $scope.showLayerObjectImages = function() {
                
                
                
            },
            
            $scope.deleteFeatureObj = function(featureObject) {
                
                AppUtils.http({}, '../TbilisimapCoreProxyController', 'process.do', {
                        action: 'managelrfeaturesws/deleteLrFeatureObj',
                        objId: featureObject.objId,
                        orgId: orgId
                    }, function (rs) {
                        
                        mapToolsService._loadLayerObjectEditorData($scope.layerData.lrId, $scope.layerData, $scope.selectedLayerObjObjectId);
                        
                    });
                
            }

});

