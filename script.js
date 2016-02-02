/*******INDEX APP*******/
var indexApp = angular.module('indexApp', []);

indexApp.controller('main', ['$scope', '$http', '$location', function($scope, $http, $location) {
	/*Button function*/
	$scope.createList = function() {
		$scope.goToList($scope.convertListName($scope.newListName));
	};
	
	/*Utility funcions*/
    //Converts a list name to a valid URI value
	$scope.convertListName = function(originalName) {
			return encodeURIComponent(originalName);
				
	};
	
    //Transfers the user to the list page
	$scope.goToList = function(listName) {
			window.location = 'list.html?list='+listName;
	};
	
}]);


/*******LIST APP*******/
var listApp = angular.module('listApp', []);

listApp.controller('main', ['$scope', '$http', 'urlParam', function($scope, $http, urlParam) {
	$scope.items = [];
	$scope.showingAddForm = false;
	$scope.newItem = "";
	$scope.loading = false;
    $scope.listName = urlParam('list');
    
    $scope.getListName = function() {
        return decodeURIComponent($scope.listName);  
    };
	
	$scope.showAddForm = function() {
		$scope.showingAddForm = true;	
	};
	
	$scope.hideAddForm = function() {
		$scope.showingAddForm = false;	
	};
	
	$scope.todoFilter = function(item) {
		return item.status == 'todo';	
	};
	
	$scope.doneFilter = function(item) {
		return item.status == 'done';	
	};
	
	$scope.markAsDone = function(item) {
		$scope.loading = true;
		$http.post('/item-done', {id:item._id}) //BACKEND: Endpoint for marking an item as done
		.success(function(data, status, headers, config) {
			$scope.loading = false;
			//Change to done
			item.status = 'done';
		})
		.error(function(data, status, headers, config) {
			$scope.loading = false;
			console.warn("There was an error marking this item as done. We truly apologize");
		});
	};
	
	$scope.addItem = function() {
		var listName = urlParam('list');
		var item = $scope.newItem;
		
		$scope.loading = true;
		$http.post('/item', { //BACKEND: Endpoint for creating an item
			list : listName,
			item : item
		})
		.success(function(data, status, headers, config) {
			$scope.loading = false;
			
			$scope.getListItems(urlParam('list')); //Reload data with new item
			$scope.newItem = ""; //Clear text field
		})
		.error(function(data, status, headers, config) {
			$scope.loading = false;
			
			console.warn("There was an error adding the item. We truly apologize");
		});
	};
	
	//Utility functions
	$scope.getListItems = function(listName) {
		$scope.loading = true;
		$http.post('/list', {list: listName}) //BACKEND: Endpoint for getting all the items in a list
		.success(function(data, status, headers, config) {
			$scope.loading = false;
			
			console.log(data);
			$scope.items = data;
		})
		.error(function(data, status, headers, config) {
			$scope.loading = false;
			
			console.warn("There was an error loading the list. We truly apologize");
		});
	};
	
	//Get list items
	$scope.getListItems($scope.listName);
	
}]);

listApp.factory('urlParam', [function() {
	return function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};
}]);