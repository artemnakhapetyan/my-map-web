
myMapApp.controller('locationController', function($scope, mapService, $state) {
  
  $scope.myLocation = function(){
      
      mapService._location();
      
  }
  
});

