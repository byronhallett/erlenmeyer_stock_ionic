angular.module('starter.controllers', [])

.factory('httpService', function($http){

  var local_env = "127.0.0.1/~/byron/stock/server";
  var test_env = "";
  var prod_env = "http://stock.erleneyer.com.au/server";

  var loginUser = function (user, pass){
    var loginURL = local_env + "/api/api_login_auth.php";
    return $http.post(loginURL, {'username': user, 
      'password': pass})
    .then(function (result){
      return result.data;
    });
  };
  
  var downloadItems = function (userId){

    var itemURL = local_env + "/api/api_category_auth.php";
    return $http.post(itemURL, {'user_id': userId})
    .then(function (result){
      return result.data;
    });
  };

  var sellItem = function (itemId, count){

    var sellURL = local_env + "/api/api_sell.php";
    return $http.post(sellURL, {'sell_amount': count, 'item_id': itemId})
    .then(function (result){
      return result.data;
    });
  };

  var undoItem = function (itemId){

    var undoURL = local_env + "/api/api_undo_sell.php";
    return $http.post(undoURL, {'item_id': itemId})
    .then(function (result){
      return result.data;
    });
  };

  var fetchSaleData = function (userId, rangeStart, rangeEnd){
    var saleUrl =local_env + "api/api_sales_get.php";
    console.log(saleUrl);
    var startDateUTC = rangeStart.getUTCFullYear() + "-" + (rangeStart.getUTCMonth() + 1) + "-" + rangeStart.getUTCDate();
    var endDateUTC = rangeEnd.getUTCFullYear() + "-" + (rangeEnd.getUTCMonth() + 1) + "-" + rangeEnd.getUTCDate();
    console.log(startDateUTC);
    console.log(endDateUTC);
    return $http.post(saleUrl, {'user_id': userId, 'date_start': startDateUTC, 'date_end': endDateUTC})
    .then (function (result) {
      return result.data;
    });
  };

  return { 
    loginUser: loginUser,
    downloadItems: downloadItems,
    sellItem: sellItem,
    undoItem: undoItem,
    salesData: fetchSaleData
  };
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, httpService, $window, $filter) {

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
    delete window.localStorage['category_array'];
    delete window.localStorage['item_array'];
    location.reload();
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    // console.log('Login Pressed:', $scope.loginData);

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

      reloadPromise.then(function(result) {
        $scope.categories = result['category_array'];
        $scope.items = result['item_array']
        // window.localStorage['category_array'] = JSON.stringify($scope.categories);
        // window.localStorage['item_array'] = JSON.stringify($scope.items);
        $scope.$broadcast('scroll.refreshComplete');
      });
    } else {
      $scope.categories = [];
      $scope.$broadcast('scroll.refreshComplete');
    }
  };

  $scope.sellItem = function (item, count, idx) {

    $scope.itemsInCategory[idx]['current_stock'] -= count;

    //Use the http service to ensure that the item has been sold correctly
    var sellPromise = httpService.sellItem(item.item_id, count);

    sellPromise.then(function(result) {
      $scope.sellResponse = result;
      if ($scope.sellResponse != 'success') {
        $scope.itemsInCategory[idx]['current_stock'] += count;
      }
    });
  };

  $scope.undoSell = function (item, idx) {

    //Use the http service to ensure that the item has been sold correctly
    var undoPromise = httpService.undoItem(item.item_id);

    undoPromise.then(function(result) {
      var undoResponse = result;
      if (undoInt = parseInt(undoResponse)) {
        $scope.itemsInCategory[idx]['current_stock'] += undoInt;
      }
    });
  };  
  
  $scope.reloadItemValues = function(this_category_id) {
    $scope.categoryName = $filter('filter')($scope.categories,{category_id: this_category_id}, true)[0]['category_name'];
    $scope.itemsInCategory = $filter('filter')($scope.items,{category_id: this_category_id}, true);
  };

  $scope.getSalesSummary = function(startDate, endDate) {
    
    salesTotal = 0;

    if (angular.isDefined(window.localStorage['current_user_id'])) {
      userId = window.localStorage['current_user_id'];
      
      var salesDataPromise = httpService.salesData(userId, startDate, endDate);

      salesDataPromise.then(function(result) {
        var salesResponse = result;
      });

      $scope.salesTotal = salesTotal.toFixed(2);
    }
  };

})


// INDIVIDUAL PAGE CONTROLLERS

.controller('CategoriesCtrl', function($scope) {
})

.controller('CategoryCtrl', function($scope, $stateParams) {
  $scope.reloadItemValues($stateParams['categoryId']);
})

.controller('ItemsCtrl', function($scope, $stateParams) {
})

.controller('salesSummaryCtrl', function($scope, $stateParams) {
  
  $scope.fromDate = new Date();
  $scope.toDate = new Date();

  var fromDatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      var chosenDate = val;
      chosenDate.setHours(new Date().getHours());
      chosenDate.setMinutes(new Date().getMinutes());
      chosenDate.setSeconds(new Date().getSeconds());
      console.log('Selected date is : ', val);
      $scope.fromDate = chosenDate;
      $scope.fromDatePicker['inputDate'] = chosenDate;
      $scope.getSalesSummary($scope.fromDate, $scope.toDate);
    }
  };

  var toDatePickerCallback = function (val) {
  if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      var chosenDate = val;
      chosenDate.setHours(new Date().getHours());
      chosenDate.setMinutes(new Date().getMinutes());
      chosenDate.setSeconds(new Date().getSeconds());
      console.log('Selected date is : ', val);
      $scope.toDate = chosenDate;
      $scope.toDatePicker['inputDate'] = chosenDate;
      $scope.getSalesSummary($scope.fromDate, $scope.toDate);
    }
  };

  $scope.fromDatePicker = {
    titleLabel: 'From Date',
    setButtonType : 'button-assertive',
    todayButtonType : 'button-neutral',
    closeButtonType : 'button-neutral',
    templateType: 'popup',
    inputDate: $scope.fromDate,
    to: new Date(),
    callback: function (val) {
      fromDatePickerCallback(val);
    }
  };
  $scope.toDatePicker = {
    titleLabel: 'To Date',
    setButtonType : 'button-assertive',
    todayButtonType : 'button-neutral',
    closeButtonType : 'button-neutral',
    templateType: 'popup',
    inputDate: $scope.toDate,
    to: new Date(),
    callback: function (val) {
      toDatePickerCallback(val);
    }
  };

  // $scope.datepickerObject = {
  //     titleLabel: 'Title',  //Optional
  //     todayLabel: 'Today',  //Optional
  //     closeLabel: 'Close',  //Optional
  //     setLabel: 'Set',  //Optional
  //     setButtonType : 'button-assertive',  //Optional
  //     todayButtonType : 'button-assertive',  //Optional
  //     closeButtonType : 'button-assertive',  //Optional
  //     inputDate: new Date(),    //Optional
  //     mondayFirst: true,    //Optional
  //     disabledDates: disabledDates, //Optional
  //     weekDaysList: weekDaysList,   //Optional
  //     monthList: monthList, //Optional
  //     templateType: 'popup', //Optional
  //     showTodayButton: 'true', //Optional
  //     modalHeaderColor: 'bar-positive', //Optional
  //     modalFooterColor: 'bar-positive', //Optional
  //     from: new Date(2012, 8, 2),   //Optional
  //     to: new Date(2018, 8, 25),    //Optional
  //     callback: function (val) {    //Mandatory
  //       datePickerCallback(val);
  //     }
  //   };

})
