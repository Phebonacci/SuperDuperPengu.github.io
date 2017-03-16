app.directive('contactsIcon', function() {
    return {
        restrict: 'AE',
        template: '<div class="letter-icon-wrapper"><span class="letter-icon">' + '{{letter}}</span></div>'
    }
});