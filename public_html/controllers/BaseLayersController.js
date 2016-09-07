
myMapApp.controller('baseLayersController', function ($http, $mdDialog, $location, $scope, mapService, mapToolsService, $state) {
            
            $scope.baseLayers = [];
            $scope.baseLayersSwitchPanelVisible = false;
            $scope.baseLayerImage = '';
            
            $scope.init = function(){
                
                mapToolsService._registerbaseLayersControllerCb(function(baseLayersData){
                    
                    angular.forEach(baseLayersData, function (value, key) {

                        if (value.isSelected) {
                            $scope.baseLayerImage = 'data:image/png;base64,{0}'.format(value.base64Icon);
                        }

                        var baseLayer = {
                            lrId: value.lrId,
                            data: value,
                            baseLayerImage: 'data:image/png;base64,{0}'.format(value.base64Icon)
                        };
                        $scope.baseLayers.push(baseLayer)

                    });
                    
                });
            },
            $scope.init(),
            
            $scope.showHideBaseLayersSwitchPanel = function () {
                $scope.baseLayersSwitchPanelVisible = !$scope.baseLayersSwitchPanelVisible;
            },
            
            $scope.changeBaseLayer = function (baseLayer) {
                
                $scope.baseLayersSwitchPanelVisible = false;
                $scope.baseLayerImage = baseLayer.baseLayerImage;
                
                angular.forEach($scope.baseLayers, function (value, key) {
                        value.data.isSelected = false;
                });
                
                baseLayer.data.isSelected = true;
                
                mapService._setBaseLayer(baseLayer.data.lrId);
                
            }

});

