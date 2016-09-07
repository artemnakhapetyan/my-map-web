
myMapApp.controller('navigationController', function($scope, mapService, $state) {
  
  $scope.zoomIn = function(){
      mapService._zoomIn();
  },
  
  $scope.zoomOut = function(){
      mapService._zoomOut();
  }
  
});

