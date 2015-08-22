angular.module('starter.controllers', [])

.factory('httpService', function($http){

  var loginUser = function (user, pass){
    var loginURL = "/api/api_login_auth.php";
    return $http.post(loginURL, {'username': user, 
      'password': pass})
    .then(function (result){
      return result.data;
    });
  };
  
  var downloadItems = function (userId){

    // TODO: ERROR IN PARSING JSON AS IT IS RETURNED

    var itemURL = "/api/api_category_auth.php";
    return $http.post(itemURL, {'user_id': userId})
    .then(function (result){
      return result.data;
    });
  };

  return { 
    loginUser: loginUser,
    downloadItems: downloadItems
  };
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, httpService, $window) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.errmsg = '';
    $scope.modal.show();
  };

  $scope.logout = function () {
    delete window.localStorage['current_user_id'];
    delete window.localStorage['current_user_name'];
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Login Pressed:', $scope.loginData);

    //From my httpService, establish the login function as a promise
    var loginPromise = httpService.loginUser($scope.loginData.username, 
      $scope.loginData.password);

    // Display loading whilst awaiting on promise
    $scope.errmsg = 'Loading';
    // Run the promise, and perform then actions on request recieved
    loginPromise.then(function(result) {
      $scope.loginResponse = result;
      // Verify Successful Login
      if (angular.isDefined($scope.loginResponse['error'])) {
        $scope.errmsg = $scope.loginResponse['error_message'];
      } else if($scope.loginResponse == null){
        $scope.errmsg = "No connection to server";
      } else {
        //Save login to session and close modal:
        window.localStorage['current_user_id'] = $scope.loginResponse['user_id'];
        window.localStorage['current_user_name'] = $scope.loginResponse['username']
        $scope.reloadItems();
        $scope.errmsg = '';
        $scope.closeLogin();
      }
    });
  };

  $scope.reloadItems = function() {
    if (angular.isDefined(window.localStorage['current_user_id'])){
      
      //From my httpService, establish the login function as a promise
      var reloadPromise = httpService.downloadItems(window.localStorage['current_user_id']);

      // Run the promise, and perform then actions on request recieved
      reloadPromise.then(function(result) {
        $scope.categories = result['category_array'];
        $scope.items = result['item_array'];
      });
    } else {
      $scope.categories = [];
    }
  };

})

.controller('CategoriesCtrl', function($scope) {
  $scope.reloadItems();
})

.controller('CategoryCtrl', function($scope, $stateParams) {
  $scope.reloadItems();
})

.controller('ItemsCtrl', function($scope, $stateParams) {
});
