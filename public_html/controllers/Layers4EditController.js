
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
            
            $scope.showAddLayerObjectForm = function(layer){
                
                mapToolsService._loadLayerObjectEditor(layer);
                
            }

});

