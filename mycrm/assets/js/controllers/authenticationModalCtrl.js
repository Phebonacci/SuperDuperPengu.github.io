app.controller("AuthModalCtrl", ["$state", "$scope", function($state, $scope) {
    $scope.goToLogin = function() {
        $state.go('login.signin');
    }
}])