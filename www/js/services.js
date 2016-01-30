// This is not yet used

angular.module('erlenmeyer-stock.services', [])

.factory('httpService', function($http){

  var comp_env = "";
  var mobile_env = "http://stock.erlenmeyer.com.au/server";

  var loginUser = function (user, pass){
    var loginURL = mobile_env + "/api/api_login_auth.php";
    return $http.post(loginURL, {'username': user, 
      'password': pass})
    .then(function (result){
      return result.data;
    });
  };
  
  var downloadItems = function (userId){

    var itemURL = mobile_env + "/api/api_category_auth.php";
    return $http.post(itemURL, {'user_id': userId})
    .then(function (result){
      return result.data;
    });
  };

  var sellItem = function (itemId, count){

    var sellURL = mobile_env + "/api/api_sell.php";
    return $http.post(sellURL, {'sell_amount': count, 'item_id': itemId})
    .then(function (result){
      return result.data;
    });
  };

  var undoItem = function (itemId){

    var undoURL = mobile_env + "/api/api_undo_sell.php";
    return $http.post(undoURL, {'item_id': itemId})
    .then(function (result){
      return result.data;
    });
  };

  var fetchSaleData = function (userId, rangeStart, rangeEnd){
    var saleUrl =mobile_env + "api/api_sales_get.php";

    var startDate = rangeStart.setHours(0,0,0,0);
    var endDate = rangeEnd.setHours(23,59,59,999);

    // need to convert date time to mysql friendly
    var startDateUTC = rangeStart.getUTCFullYear() + '-' +
        ('00' + (rangeStart.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + rangeStart.getUTCDate()).slice(-2) + ' ' + 
        ('00' + rangeStart.getUTCHours()).slice(-2) + ':' + 
        ('00' + rangeStart.getUTCMinutes()).slice(-2) + ':' + 
        ('00' + rangeStart.getUTCSeconds()).slice(-2);

    var endDateUTC = rangeEnd.getUTCFullYear() + '-' +
        ('00' + (rangeEnd.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + rangeEnd.getUTCDate()).slice(-2) + ' ' + 
        ('00' + rangeEnd.getUTCHours()).slice(-2) + ':' + 
        ('00' + rangeEnd.getUTCMinutes()).slice(-2) + ':' + 
        ('00' + rangeEnd.getUTCSeconds()).slice(-2);

    // Create hash object to send
    var postData = {'user_id': userId, 'date_start': startDateUTC, 'date_end': endDateUTC};

    return $http.post(saleUrl, postData)
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