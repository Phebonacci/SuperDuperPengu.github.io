'use strict'

app.controller('TopNavCtrl', ["$localStore", "$scope", function($localStorage, $scope) {
    $scope.currentUser = $localStorage.user;
}]);