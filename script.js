/*******INDEX APP*******/
var indexApp = angular.module('indexApp', []);

indexApp.controller('main', ['$scope', '$http', '$location', function($scope, $http, $location) {
	$scope.loading = false;
	$scope.newListName = "";
	
	//Button function
	$scope.createList = function() {
		$scope.sendList($scope.convertListName($scope.newListName));
	};
	
	//Utility funcions
	$scope.convertListName = function(originalName) {
			return encodeURIComponent(originalName.split(' ').join('-'));
				
	};
	
	$scope.goToList = function(listName) {
			window.location = 'list.html?list='+listName;
	};
	
	$scope.sendList = function(listName) {
		$scope.loading = true;
		$http.post('https://todo.imrapid.io/list', { //BACKEND: Endpoint for creating a new list
			name	: listName
		})
		.success(function(data, status, headers, config) {
			//Redirect to list page
			$scope.loading = false;
			$scope.goToList(listName);
		})
		.error(function(data, status, headers, config) {
			$scope.loading = false;
			alert("There was an error creating the list. We truly apologize");
		});
	};
}]);


/*******LIST APP*******/
var listApp = angular.module('listApp', []);

listApp.controller('main', ['$scope', '$http', 'urlParam', function($scope, $http, urlParam) {
	$scope.items = [];
	$scope.showingAddForm = false;
	$scope.newItem = "";
	$scope.loading = false;
	
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
		$http.put('https://todo.imrapid.io/item/done', {id:item._id}) //BACKEND: Endpoint for marking an item as done
		.success(function(data, status, headers, config) {
			$scope.loading = false;
			//Change to done
			item.status = 'done';
		})
		.error(function(data, status, headers, config) {
			$scope.loading = false;
			alert("There was an error marking this item as done. We truly apologize");
		});
	};
	
	$scope.addItem = function() {
		var listName = urlParam('list');
		var item = $scope.newItem;
		
		$scope.loading = true;
		$http.post('https://todo.imrapid.io/item', { //BACKEND: Endpoint for creating an item
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
			
			alert("There was an error adding the item. We truly apologize");
		});
	};
	
	//Utility functions
	$scope.getListItems = function(listName) {
		$scope.loading = true;
		$http.get('https://todo.imrapid.io/list?list='+listName) //BACKEND: Endpoint for getting all the items in a list
		.success(function(data, status, headers, config) {
			$scope.loading = false;
			
			console.log(data);
			$scope.items = data;
		})
		.error(function(data, status, headers, config) {
			$scope.loading = false;
			
			alert("There was an error loading the list. We truly apologize");
		});
	};
	
	//Get list items
	$scope.getListItems(urlParam('list'));
	
}]);

listApp.factory('urlParam', [function() {
	return function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};
}]);