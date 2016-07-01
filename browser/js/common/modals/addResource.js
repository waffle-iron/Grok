// New modal controller
app.controller('AddResourceModalCtrl', function ($scope, $uibModalInstance, options, ResourceFactory) {
  $scope.formTitle = 'Add resource to ' + options.topicName;
  var topicId = options.topicId;

  $scope.addResource = function(topicId, resource) {
    console.log(topicId, resource);
    return ResourceFactory.addNewResource(resource.name, resource.url, resource.type, topicId)
    .then(function(newResource) {
      $uibModalInstance.close(newResource);
    });
  }

  $scope.submit = function () {
    $uibModalInstance.close();
  };

  $scope.close = function () {
    $uibModalInstance.dismiss('cancel');
  };

});