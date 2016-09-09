
myMapApp.controller('layers4EditController', function ($scope, $mdSidenav, mapService, mapToolsService) {
            
            $scope.layers4Edit = [];
            
            $scope.init = function(){
                
                mapToolsService._registerLayers4EditControllerCb(function(layers4EditData){
                    
                    $scope.layers4Edit = layers4EditData;
                    
                });
            },
            $scope.init(),
            
            $scope.changeLayerVisibility = function(layer){
                
                layer.isSelected = !layer.isSelected;
                
                mapService._changeOverlayLayerVisibility(layer.lrId, (layer.isSelected));
                
            },
            
            $scope.regenerateData = function(layer){
                
                switch(layer.lrId){
                    case 11: {
                            
                            AppUtils.http({}, 'api/glws', 'generateRandomCrimes', {
                                params: {
                                    cnt: 100
                                }
                            }, function (rs1) {
                                mapService._refreshLayer(layer.lrId);
                            });
                            
                            break;
                    }
                    case 10: {
                            
                            AppUtils.http({}, 'api/analysisws', 'analyzeCrimesByTbilisiRegions', {
                                params: {}
                            }, function (rs1) {
                                mapService._refreshLayer(layer.lrId);
                            });
                            
                            break;
                            
                    }
                    case 12: {
                            
                            AppUtils.http({}, 'api/analysisws', 'analyzeInfrastructureIndexByTbilisiRegions', {
                                params: {}
                            }, function (rs1) {
                                mapService._refreshLayer(layer.lrId);
                            });
                            
                            break;
                            
                    }
                    case 13: {
                            AppUtils.http({}, 'api/glws', 'generateRandomInfrastructure', {
                                params: {
                                    cnt: 100
                                }
                            }, function (rs1) {
                                mapService._refreshLayer(layer.lrId);
                            });
                            
                            break;
                    }
                }
                
                
            }

});

