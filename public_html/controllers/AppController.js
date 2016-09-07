
myMapApp.controller('appController', function($scope, mapService, $state, $http, $mdDialog, $location, Upload) {
  
  AppUtils.angularServices = {
        $http: $http,
        $mdDialog: $mdDialog,
        $location: $location,
        Upload: Upload
    },
  $scope.init = function(){
      
       $state.go('map');
      
  },
  
  $scope.init();
  
});

