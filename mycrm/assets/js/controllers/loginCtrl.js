'use strict';

app.controller('LoginCtrl', ["$scope", "$state", "AuthService", function($scope, $state, AuthService) {
    $scope.username = '';
    $scope.password = '';
    $scope.errorMessage = '';
    $scope.success;
    
    $scope.login = function() {
        AuthService.login($scope.username, $scope.password, function(isSuccessful, errorMsg) {
            if (isSuccessful) {
                console.log('logged in successfully!');
                $state.go("app.contacts");
            } else {
                console.log('failed to login!');
                $scope.errorMessage = errorMsg;
            }
            $scope.success = isSuccessful;
        });
    }
}]);