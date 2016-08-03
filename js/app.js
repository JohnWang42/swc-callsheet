var csApp = angular.module('csApp', ['ngSanitize', 'ngRoute', 'ui.bootstrap']);

csApp.controller('CsController', function($scope, $http, $sce, $route, $timeout){
	$scope.sending = false;
	$scope.done = false;
	$scope.callDate = new Date();
	$scope.logArea = true;
	$scope.printArea = false;
	$scope.emailData = "";
	$scope.buttons = true;

	//Load data for form(make sure to verify json files in a JSON linter)
	$http.get('data/apparatus.json').success(function(data){
		$scope.apparatus = data.apparatus;
		for(var i = 0; i < $scope.apparatus.length; i++){
			$scope.apparatus[i].seatArr = new Array();
			var seatLoop = $scope.apparatus[i].seats;
			if(seatLoop == -1){
				seatLoop = 10;
			}
			for(var x = 0; x < seatLoop; x++){
				$scope.apparatus[i].seatArr.push($scope.apparatus[i].code + "-" + x);
			}
		}
	});
	$http.get('data/callTypes.json').success(function(data){
		$scope.callTypes = data.callTypes;
	});
	$http.get('data/personnel.json').success(function(data){
		$scope.personnel = data.personnel;
	});

	//usedApp stores apparatus that are currently being listed
	$scope.usedApp = new Array();
	//seatData stores the names that are in the input fields
	$scope.seatData = new Array();

	$scope.addApp = function(){
		if($scope.selectApp != undefined){
			$scope.usedApp.push($scope.selectApp);
			var tempApp = $scope.selectApp;
			$scope.selectApp = undefined;
			removeApp($scope.apparatus, tempApp);
		}
	}

	$scope.sendInfo = function(){
		$scope.sending = true;
		if($scope.usedApp.length > 0){
			var appData = new Array();
			for(var i = 0; i < $scope.usedApp.length; i++){
				appData[i] = { 'name': $scope.usedApp[i].name, 'seats': $scope.usedApp[i].seats };
				var appSeatInfo = new Array();
				for(var s = 0; s < $scope.usedApp[i].seatArr.length; s++){
					var tempSeat = $scope.seatData[$scope.usedApp[i].seatArr[s]];
					if(tempSeat == "" || tempSeat == undefined){
						tempSeat = null;
					}
					appSeatInfo.push(tempSeat);
				}
				appData[i].seatInfo = appSeatInfo;
			}
			var tempDate = new Date($scope.callDate);
			var callData = {
				'callType': $scope.callType,
				'callLoc': $scope.callLoc,
				'callComm': $scope.callComm,
				'callDate': tempDate.toDateString(),
				'apps': appData 
			};
			$http.post('sendCallLog.php', callData)
			.success(function(data, status, headers, config){
				if(data){
					if(data.status){
						alert("Call log sent!");
						$scope.done = true;
						$scope.logArea = false;
						$scope.printArea = true;
						$scope.emailData = data.emailData;
					}else{
						$scope.sending = false;
						alert('Error!' + data.msg);
					}
				}else{
					$scope.sending = false;
					alert("Error! Call log not sent. Please contact admin.");
				}
			})
			.error(function(data, status, headers, config){
				$scope.sending = false;
				alert("Error! Call log not sent. Please contact admin.");
			});
		}else{
			$scope.sending = false;
			alert("Add an apparatus first!");
		}
	}

	$scope.newPage = function(){
		window.location.reload();
	}

	$scope.renderHtml = function(htmlCode){
		return $sce.trustAsHtml(htmlCode);
	};

	$scope.print = function(){
		$scope.buttons = false;
		$timeout(function(){window.print(); $scope.buttons = true;}, 500);
	}
});

function removeApp(arr, obj){
	for(var i = 0; i < arr.length; i++){
		if(arr[i].name === obj.name){
			arr.splice(i, 1);
			return true;
		}
	}
	return false;
}