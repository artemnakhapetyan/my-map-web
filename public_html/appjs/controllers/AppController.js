
myMapApp.controller('appController', function($scope, mapService, $state) {
  
  $scope.init = function(){
      
      $state.go('map');
      
  },
  
  $scope.init();
  
});

