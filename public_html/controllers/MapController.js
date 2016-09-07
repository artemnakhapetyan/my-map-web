
myMapApp.controller('mapController', function ($http, $mdDialog, $location, $scope, mapService, mapToolsService, $state) {

    
    $scope.initMap = function () {

        setTimeout(function () {

            /*AppUtils.http({}, '../api/usersws', 'registerSession', {
                params: {
                    orgId: 1,
                    username: 'acdc1',
                    password: 'test'
                },
                clientToken: 'traffic-test-token',
                sessionId: 'customSessionId'
            }, function (rs1) {*/

                AppUtils.http({}, 'api/layersws', 'getBaseLayers', {}, function (rs1) {

                    mapToolsService._initBaseLayersSwitcher($scope, rs1.data);

                    AppUtils.http({}, 'api/layersws', 'getOverlayLayers', {}, function (rs2) {

                        mapToolsService._initLayers4EditView($scope, rs2.data);

                        mapService._initMap($scope, rs1.data, rs2.data);

                    });

                });

            //});

        }, 400);

    },
            $scope.initMap(),
            $scope.zoomIn = function () {
                $scope.map.zoomIn();
            },
            $scope.zoomOut = function () {
                $scope.map.zoomOut();
            },
            
            $scope.logout = function() {
                
                AppUtils.http({}, '../TbilisimapCoreProxyController', 'process.do', {
                    action: 'usersws/unregisterSession',
                    orgId: orgId
                }, function (rs) {
                    console.log(rs);
                    $state.go('login');
                });
                
            }

});

