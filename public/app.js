(function () {
    var check = function () { };
    var app = angular.module('voting', ['ngRoute']);
    app.config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
    });

    app.controller("FormCtrl", function () {
        var num = 2;
        this.options = ["option1", "option2"];
        this.addOption = function () {
            if (num < 10) {
                num += 1;
                this.options.push("option" + num);
            } else {
                alert("Oops you cannot have more than 10 options for a poll");
            }
        };
    });

})();