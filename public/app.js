(function () {
    var check = function () { };
    var app = angular.module('voting', ['ngRoute']);
    app.config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
    });

    var name, pictureUrl, email;




    app.controller('LoginCtrl', function () {
        this.loginStatus = check();
    });

    app.controller('SignUp', function () {
        this.sites = [
            {
                name: "Facebook",
                style: "fb-style",
                url: "/auth/facebook"
            },
            {
                name: "Twitter ",
                style: "twt-style",
                url: "/auth/twitter"
            }
        ];

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


    app.directive("signupButtons", function () {
        return {
            restrict: "E",
            templateUrl: "signup-buttons.html"
        };
    });

    app.directive("loginButtons", function () {
        return {
            restrict: "E",
            templateUrl: "login-buttons.html"
        };
    });

})();