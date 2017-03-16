'use strict'
/**
* controllers used for contacts
*/
app.controller("ContactsCtrl", ["$scope", "$http", "$filter", "$state", "$rootScope", "$translate", "SweetAlert", "AuthService", "API_END_POINT", 
                                function($scope, $http, $filter, $state, $rootScope, $translate, SweetAlert, AuthService, API_END_POINT) {
    
    $scope.currentPage = 0;
    $scope.perPage = 20;
    $scope.contacts = {
        TotalNumber: 0,
        UpdatedAt: 'Today ' + $filter('date', 'longDate')(new Date()),
        FamilyList: []
    };
    $scope.letters = [];
    $scope.filter = "*";
    $scope.searchCriteria = null;
    $scope.mergeEnabled = false;
        
    $scope.init = function() {
        var first = "A", last = "Z";
        var letterIndex = 0;
        for(var i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
            $scope.letters[letterIndex] = eval("String.fromCharCode(" + i + ")");
            letterIndex++;
        }
        $scope.loadContacts(1);        
    };
    $scope.loadContacts = function(page) {
        if(!page) {
            page = 1;
        }
        $http.get(API_END_POINT + "/contacts/FamilyListGet", {params:{
            "startWith": $scope.filter, 
            "searchCriteria": $scope.searchCriteria,
            "page": page, 
            "count": $scope.perPage
        }}).then(function(response) {
            console.log('resonse: ' + response.status);
            $scope.currentPage = page;
            $scope.contacts.TotalNumber = response.data.TotalNumber;
            $scope.contacts.FamilyList = response.data.FamilyList;
        }, function(error) {
            console.log('error: ' + error.Message);
            console.log('status: ' + error.status);
            if (error && error.status === 401) {
                        
                SweetAlert.swal({
                   title: $translate.instant('modal.SESSIONEXPIRED'),
                   text:  $translate.instant('modal.RELOGINPROMPT'),
                   type: "error",
                   showCancelButton: false,
                   confirmButtonColor: "#2DBFC1",
                   confirmButtonText: $translate.instant('modal.OK'),
                   closeOnConfirm: true}, 
                function(){ 
                   $state.go('login.signin');
                });
            } else {
                alert("Sorry! An error occurred while trying to load your contacts.");
            }
        });
    };
    $scope.loadMore = function() {
        $scope.loadContacts($scope.currentPage + 1);
    };
    $scope.filterChanged = function(filter) {
        console.log('filterChanged : ' + filter);
        if (filter !== $scope.filter) {
            $scope.filter = filter;
            $scope.searchCriteria = null;
            $scope.loadContacts(1);
        }
    };
    $scope.search = function() {
        console.log('search : ' + $scope.searchCriteria);
        if ($scope.searchCriteria === '') {
            $scope.searchCriteria = null;
        }
        $scope.loadContacts(1);
    };
    $scope.openContact = function(contactId) {
        if (contactId) {                        
            $state.go('app.contactdetails', {'contact_id': contactId});
        }
    };
}]);