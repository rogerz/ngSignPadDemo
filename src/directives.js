'use strict';

var app = angular.module('ngSignPadApp');

app.directive('signPad', function ($window) {
  function controller($scope) {
    function Param(name, value, min, max, step, label) {
      this.name = name;
      this.value = value;
      this.min = min;
      this.max = max;
      this.step = step;
      this.label = label;
    }
    $scope.params = [
      new Param('min', 10, 5, 20, 1, 'width'),
      new Param('max', 15, 5, 20, 1, 'width'),
      new Param('red', 90, 0, 255, 1, 'red'),
      new Param('green', 90, 0, 255, 1, 'green'),
      new Param('blue', 90, 0, 255, 1, 'blue'),
      new Param('smooth', 70, 0, 100, 1, 'smooth')
    ];

    $scope.panel = {
      show: true
    };
  }

  return {
    controller: controller,
    templateUrl: 'src/sign-pad-tpl.html',
    restrict: 'E',
    link: function (scope, elem) {
      var canvas = elem.find('canvas')[0];

      /* global SignaturePad:false */
      var signPad = new SignaturePad(canvas);

      // https://github.com/szimek/signature_pad/blob/gh-pages/js/app.js
      //
      // Adjust canvas coordinate space taking into account pixel ratio,
      // to make it look crisp on mobile devices.
      // This also causes canvas to be cleared.
      function resizeCanvas() {
        var ratio =  $window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
      }

      $window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      scope.pad = {
        clear: function () {signPad.clear(); },
        replay: function () {signPad.replay(); }
      };

      scope.vals = {};

      function updateConfig() {
        var params = scope.params;
        var vals = scope.vals = {};
        for (var i = 0; i < params.length; i++) {
          var param = params[i];
          vals[param.name] = parseInt(param.value);
        }
        if (vals.min > vals.max) {
          /* swap value */
          vals.max = vals.min + vals.max;
          vals.min = vals.max - vals.min;
          vals.max = vals.max - vals.min;
        }
        var opts = {
          minWidth: parseFloat(vals.min),
          maxWidth: parseFloat(vals.max),
          color: 'rgb(' + vals.red + ',' + vals.green + ',' + vals.blue + ')',
          velocityFilterWeight: 1 - vals.smooth / 100
        };
        signPad.config(opts);
      }

      for (var i in scope.params) {
        scope.$watch('params[' + i + '].value', updateConfig);
      }
    }
  };
});
