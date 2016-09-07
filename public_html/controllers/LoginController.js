
myMapApp.controller('loginController', function($scope, mapService, $state) {
  
  $scope.init = function(){
      
      
      
  },
  
  $scope.init(),
  
  $scope.login = function(){
      
      AppUtils.http({}, '../TbilisimapCoreProxyController', 'process.do', {
            action: 'usersws/registerSession',
            orgId: orgId,
            username: $scope.user.username,
            password: $scope.user.password
        }, function (rs) {
            window.location.reload();
        });
      
  }
  
});

