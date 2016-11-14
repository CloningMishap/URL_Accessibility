'use strict';

angular.module('myApp.view1', ['ngRoute', 'angular.ping', 'ng.deviceDetector'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$q', '$http', 'netTesting', 'deviceDetector', function($scope, $q, $http, netTesting, deviceDetector) {

  // Expose methods
  $scope.validateURLAccessibility = validateURLAccessibility;
  $scope.toggleFullReport = toggleFullReport;

  // Fetch data for page
  getPSCStatistics();
  $scope.deviceInfo = deviceDetector; // Get OS info using deviceDetector
  validateURLAccessibility();



  // Function definitions
  function getPSCStatistics() {
    $scope.statisticsLoaded = false;
    asyncGetPSCStatistics().then(function(pcsStatistics) {
      $scope.pcsStatistics = pcsStatistics;
      $scope.statisticsLoaded = true;
    }, function(error) {
      alert('Failed: ' + error);
    });
  }

  function asyncGetPSCStatistics() {
    return $q(function(resolve, reject) {
      setTimeout(function() {
        var pcsStatistics = {
          installedGrades: ['GR2 ELA', 'GR9 MATH'],
          lessonCount: 25,
          lessonMBSize: 3.2,
          pscVersion: '2.1.5.17'
        };
        resolve(pcsStatistics);
        //reject('Greeting ' + name + ' is not allowed.');
      }, 3000);
    });
  }

  function validateURLAccessibility() {
    $scope.viewFullReport = false;
    $scope.isValidatingURLs = true;
    asyncValidateWhitelistURLs().then(function(validationResults) {
      $scope.validationResults = validationResults;
      $scope.isValidatingURLs = false;
    }, function(error) {
      alert('Failed: ' + error);
    });
  }

  function asyncValidateWhitelistURLs() {
    return $q(function(resolve, reject) {
      setTimeout(function() {
        var urlsToValidate = [
          'http://thisisnotarealurlnotreal.com',
          'http://www.google.com',
          'https://schoolnet.ccsocdev.net',
          'https://seer-beacon.ecollege.com',
          'http://teachersupport.pearsonsystemofcourses.com',
          'http://conceptcorner.com',
          'http://more-to-explore.com',
          'http://www.commoncoresystemofcourses.com',
          'https://psocwcsrepo.ccsocdev.net',
          'https://psocwcontentstorage.blob.core.windows.net',
          'http://psoc-k1west.cloudapp.net',
          'https://psocwcsagg.ccsocdev.net',
          'https://psocwcsugc.ccsocdev.net',
          'https://spt.psonsvc.net',
          'https:/schoolprodtech-prod-gps.dn.apigee.net',
          'https://asmt-api.prod.pearsonpsc.com',
          'https://acnuatpems.cloudapp.net',
          'http://itsup.ccsocdev.net'
        ];

        var validationResults = {
          hasErrors: false,
          erroredURLs: [],
          successURLs: []
        };

        var promises = [];
        for (var urlIndex in urlsToValidate) {
          var url = urlsToValidate[urlIndex];

          var start = (new Date()).getTime();
          promises.push(ping(url, start).then(function(urlResult) {
            // successful ping
            validationResults.successURLs.push(urlResult);
          }, function(urlResult) {
            // this may or may not be a failed ping
            if (urlResult.requestTime > 30 && urlResult.requestStatus == -1) {
              // This is probably a success. The logic is sketchy but we have to do this.
              validationResults.successURLs.push(urlResult);
            } else {
              // definite failure
              validationResults.hasErrors = true;
              validationResults.erroredURLs.push(urlResult);
            }
          }));
        }

        $q.all(promises).then(function() {
          resolve(validationResults);
        });
      }, 1000);

    });
  }

  function ping(url, start) {
    return $q(function(resolve, reject) {

      $http.get(url + '?rnd=' + (new Date().getTime()))
        .then(function (response) {
          var responseTime = (new Date().getTime()) - start;
          var urlResult = {
            url: url,
            requestStatus: response.status,
            statusText: response,
            requestTime: responseTime//Math.round(responseTime / 10) / 100
          };
          resolve(urlResult);
        }, function (response) {
          var responseTime = (new Date().getTime()) - start;
          var urlResult = {
            url: url,
            requestStatus: response.status,
            statusText: response,
            requestTime: responseTime// Math.round(responseTime / 10) / 100
          };
          reject(urlResult);
        });
    });
  }

  function toggleFullReport() {
    $scope.viewFullReport = !$scope.viewFullReport;
  }
}]);