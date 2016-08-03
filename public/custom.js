$(document).ready(function () {
    $(".mainOptionsSelector").on('click', function () {
        var $child = $(this).children();
        $(".optionsSelector").prop("checked", false);
        $child.prop("checked", true);
    });

    console.log($('input[name="url"]').val());
    var url = "http://localhost/api/data/" + $('input[name="url"]').val();
    $.getJSON(url, function (data) {
        console.log(url);
        console.log(data.options);
        if (data.err) {
            console.log(data.err);
        } else {
            var array = ["FF5A5E", "5AD3D1", "FFC870", "A8B3C5", "616774", "8953BF", "79D779", "A30909", "03BD60", "E0E079"]
            var inputData = [];
            data.options.forEach(function (element) {
                inputData.push({
                    value: element[1],
                    color: "#" + array[data.options.indexOf(element)],
                    label: element[0]
                });
            });
            console.log(inputData);
            var options = {
                bezierCurve: false,
                animation: true,
                animationEasing: "easeOutQuart",
                showScale: false,
                tooltipEvents: ["mousemove", "touchstart", "touchmove"],
                tooltipCornerRadius: 3,
                pointDot: true,
                pointDotRadius: 4,
                datasetFill: true,
                scaleShowLine: true,
                animateRotate: true,
                animateScale: true,
            };
        }
        var ctx = document.getElementById("doughnutChart").getContext("2d");
        var doughnutChart = new Chart(ctx).Doughnut(inputData, options);
    });


});

