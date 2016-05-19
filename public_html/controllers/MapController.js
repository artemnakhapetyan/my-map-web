
myMapApp.controller('mapController', function($scope, mapService, $state) {
  
  $scope.initMap = function(){
      
      setTimeout(function(){
          mapService._initMap($scope);
      }, 400);
      
  },
  
  $scope.initMap();
  
});

