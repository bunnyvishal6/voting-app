(function () {
    var check = function () { };
    var app = angular.module('voting', ['ngRoute']);
    app.config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
    });

    app.controller("newPollOptionsCtrl", function () {
        var num = 2;
        this.options = [];
        for(var i = 1; i <= num; i++){
            this.options.push({name: "option", num:i});
        }
        this.addOption = function () {
            if (this.options.length < 10) {
                var currNum = this.options.length + 1;
                this.options.push({name: "option", num:currNum});
            } else {
                alert("Oops you cannot have more than 10 options for a poll");
            }
        };
        this.removeOption = function(option){
            var position = this.options.indexOf(option)
            if(this.options.length > 2){
                num -= 1;
                var removed = this.options.splice(position, 1);
            } else {
                alert("Your poll should have atleast two options");
            }
        }
    });


    app.directive("newPollOptions", function(){
        return{
            restrict: "E",
            templateUrl: 'new-poll-options.html',
            controller: 'newPollOptionsCtrl',
            controllerAs: 'poll'
        }
    });

})();