'use strict'
/**
* controller use for contact details (summary, client, etc)
**/

app.controller("ContactDetailsCtrl", ["$scope", "$http", "$stateParams", "$state", "$filter", "API_END_POINT", "ClientsService", "SweetAlert", function($scope, $http, $stateParams, $state, $filter, API_END_POINT, ClientsService, SweetAlert) {
     
    $scope.contact = null;
    $scope.clients = [];
    
    $scope.$watch('clients', function (newValue, oldValue) {
        if (newValue !== oldValue) ClientsService.setClients(newValue);
    });
    
    $scope.init = function() {
        $http.get(API_END_POINT + '/contacts/ClientInformGet', {params:{
            "familyId": $stateParams.contact_id
        }}).then(function(response) {
            if (response) {
                $scope.clients = response.data;
                  
                for (let client of response.data) {
                    if (client.Role === 'Adult' || client.Role === 'PolicyOwner') {
                        $scope.contact = client;
                        break;
                    }
                }
                
                if (!$scope.contact) {
                    for (let client of response.data) {
                        if (client.Role === 'Adult') {
                            $scope.contact = client;
                            break;
                        }
                    }
                }                
                
                $scope.contact.DisplayName = $scope.contact.LastName + '(' + $scope.contact.FirstName + ')';
                $scope.contact.UpdatedAt = 'Today ' + $filter('date', 'longDate')(new Date());
                
            }
        }, function(error) {
            console.log('error' + error.Message);
            console.log('status' + error.status);
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
                alert("Sorry! An error occurred while trying to load the contact.");
            }
        });
    }
}]);

app.controller("ContactDetailsMainTabCtrl", ["$scope", "$http", "$translate", "API_END_POINT", function($scope, $http, $translate, API_END_POINT) {
    var summaryTab = 'summary';
    var clientsTab = 'clients';
    var loansTab = 'loans';
    var insuranceTab = 'insurance';
    var financialsTab = 'financials';
    var workflowTab = 'workflow';
    var recordsTab = 'records';
    
    $scope.tabs = [
        {
            slug: summaryTab,
            title: $translate.instant('contactsummary.SUMMARY'),
            content: 'assets/views/contactsummary.html'
        },
        {
            slug: clientsTab,
            title: $translate.instant('contactsummary.CLIENTS'),
            content: 'assets/views/contactclients.html'
        },
        {
            slug: loansTab,
            title: $translate.instant('contactsummary.LOANS'),
            content: 'assets/views/contactloans.html'
        },
        {
            slug: insuranceTab,
            title: $translate.instant('contactsummary.INSURANCE')
        },
        {
            slug: financialsTab,
            title: $translate.instant('contactsummary.FINANCIALS')
        },
        {
            slug: workflowTab,
            title: $translate.instant('contactsummary.WORKFLOW')
        },
        {
            slug: recordsTab,
            title: $translate.instant('contactsummary.RECORDS')
        }
    ];
    $scope.activeTab = $scope.tabs[0];
    
    $scope.onTabSelected = function(slug) {
      if (slug !== $scope.activeTab.slug) {
          for(let tab of $scope.tabs) {
              if (tab.slug === slug) {
                  $scope.activeTab = tab;
                  break;
              }
          }
      }
    };
}]);

app.controller("ContactSummaryTabCtrl", ["$scope", "$http", "$translate", "$stateParams", "API_END_POINT", "ClientsService", function($scope, $http, $translate, $stateParams, API_END_POINT, ClientsService) {
    $scope.alert = {
        type: 'info',
        msg: $translate.instant('contactsummary.NOADDR')
    };
    
    $scope.closeAlert = function() {
        
    };
}]);

app.controller("ContactClientsSummaryCtrl", ["$scope", "$http", "$translate", "$stateParams", "API_END_POINT", "ClientsService", "SweetAlert", function($scope, $http, $translate, $stateParams, API_END_POINT, ClientsService, SweetAlert) {
    $scope.adults = [];
    $scope.children = [];
    $scope.address = {};
    $scope.client = null;
        
    $scope.$watch(function () {
        return ClientsService.getClients();
    }, function (newValue, oldValue) {
        $scope.constructValuesFromClientsList(newValue);
    });
    
    $scope.constructValuesFromClientsList = function(clients) {
        $scope.adults = [];
        $scope.children = [];
        
        for (let client of clients) {
            if (client.Role === 'Adult' || client.Role === 'PolicyOwner') {
                $scope.adults.push(client);
                /*if (client.Role === 'PolicyOwner') {
                    $scope.client = client;
                }*/
            } else if (client.Role === 'Child') {
                $scope.children.push(client);
            }
        }
        
        if (!$scope.client) {
            $scope.client = $scope.adults[0];
        }
        
        if ($scope.client) {
            $scope.client.PrimaryPhone = $scope.getContactNumber();
            $scope.client.PrimaryEmail = $scope.getEmailAddress(); 
        }
    };
    
    $scope.initClientsSummary = function() {
        $scope.constructValuesFromClientsList(ClientsService.getClients());
        
        $http.get(API_END_POINT + "/contacts/FamilyAddressInformGet", {params: {
            "familyId": $stateParams.contact_id
        }}).then(function(response) {
            if (response && response.data && response.data.length > 0) {
                $scope.address = response.data[0];
            }
        }, function(error) {
            console.log('status: ' + error.status);
            console.log('error: ' + error.Message);
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
            }
        });
    };
    
    $scope.hasChildren = function() {
        return $scope.children && $scope.children.length > 0;
    }
    
    $scope.getContactNumber = function() {
        if ($scope.client && $scope.client.Phone && $scope.client.Phone.length > 0) {
            return $scope.client.Phone[0].Number;
        }
        return null;
    }
    $scope.getEmailAddress = function() {
        if ($scope.client && $scope.client.Email && $scope.client.Email.length > 0) {
            return $scope.client.Email[0].EmailAddress;
        }
        return null;
    }
}]);

app.controller("ContactLoansCtrl", ["$scope", "$http", "$stateParams", "API_END_POINT", function($scope, $http, $stateParams, API_END_POINT) {
    
    $scope.loans = [];
    
    $scope.initLoansSummary = function() {
        $http.get(API_END_POINT + "/contacts/LoanList", {params: {
            "familyID": $stateParams.contact_id
        }}).then(function(response) {
            if (response && response.data) {
                $scope.loans = response.data;
            }
        }, function(error) {
            console.log('status: ' + error.status);
            console.log('error: ' + error.Message);            
        });
    }
}]);

app.controller("ContactsExistingBenefitsCtrl", ["$scope", function($scope) {
    $scope.insurances = [
        {
            Benefit: "Trauma Cover",
            AmountCovered: 68000,
            Insurers:  [
                {
                    icon: ".../assets/images/logo2.png",
                    name: "Dummy Insurer 1"
                },
                {
                    icon: ".../assets/images/logo2.png",
                    name: "Dummy Insurer 2"
                },
                {
                    icon: ".../assets/images/logo2.png",
                    name: "Dummy Insurer 3"
                }
            ]
        },
        {
            Benefit: "Car Accident",
            AmountCovered: 68000,
            Insurers:  [
                {
                    icon: ".../assets/images/logo2.png",
                    name: "Dummy Insurer 1"
                },
                {
                    icon: ".../assets/images/logo2.png",
                    name: "Dummy Insurer 2"
                },
                {
                    icon: ".../assets/images/logo2.png",
                    name: "Dummy Insurer 3"
                }
            ]
        },
        {
            Benefit: "Disability",
            AmountCovered: 68000,
            Insurers:  [
                {
                    icon: "assets/images/logo2.png",
                    name: "Dummy Insurer 1"
                },
                {
                    icon: "assets/images/logo2.png",
                    name: "Dummy Insurer 2"
                },
                {
                    icon: "assets/images/logo2.png",
                    name: "Dummy Insurer 3"
                }
            ]
        }
    ];
}]);

app.controller("ContactsSummaryNotesCtrl", ["$scope", "$http", "$stateParams", "API_END_POINT", function($scope, $http, $stateParams, API_END_POINT) {  
    $scope.notes = [];
    $scope.initNotes = function() {
        $http.get(API_END_POINT + "/contacts/NoteList", {params: {
            "familyID": $stateParams.contact_id
        }}).then(function(response) {
            if (response) {
                $scope.notes = response.data;
            }
        }, function(error) {
            if (error) {
                console.log('status: ' + error.status);
                console.log('error: ' + error.Message);
            }  
        });
    }
    $scope.getCount = function() {
        if ($scope.notes) {
            return $scope.notes.length;
        }
        return 0;
    }
}]);

app.controller("ContactClientsTabCtrl", ["$scope", "$http", "$stateParams", "API_END_POINT", "ClientsService", function($scope, $http, $stateParams, API_END_POINT, ClientsService) {
    $scope.clients = [];
    $scope.$watch(function () {
        return ClientsService.getClients();
    }, function (newValue, oldValue) {
        $scope.constructValuesFromClientsList(newValue);
    });
    
    $scope.constructValuesFromClientsList = function(clients) {
        $scope.clients = clients;
    }
    
    $scope.initClients = function() {
        $scope.constructValuesFromClientsList(ClientsService.getClients());
    }
}]);

app.controller("ContactRelationshipsCtrl", ["$scope", "$http", "$stateParams", "API_END_POINT", "ClientsService", function($scope, $http, $stateParams, API_END_POINT, ClientsService) {
    $scope.relationships = [];
    
    $scope.initRelationships = function() {
        $http.get(API_END_POINT + '/contacts/RelationshipGet', {params: {
            "familyID": $stateParams.contact_id
        }}).then(function(response) {
           if (response) {
               $scope.relationships = response.data;
           }
        }, function(error) {
            if (error) {
                console.log('error:' + error.Message);
                console.log('status:' + error.status);
            }
        });
    }
    
    $scope.hasRelationships = function() {
        return $scope.relationships && $scope.relationships.length > 0;
    }
}]);

app.controller("ContactInfoCtrl", ["$scope", "$http", "$stateParams", "API_END_POINT", "ClientsService", function($scope, $http, $stateParams, API_END_POINT, ClientsService) {
    $scope.home = {};
    $scope.mailing = {};
    
    
}]);

