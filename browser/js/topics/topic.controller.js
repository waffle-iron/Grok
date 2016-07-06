app.controller('TopicCtrl', function ($scope, $rootScope, $uibModal, $log, TopicFactory, topic, plans, votes) {
  $scope.topic = topic;
  $scope.topic.plans = plans;
  $scope.topic.votes = votes;

  console.log($scope.topic)

  sortAll();

  // get current user ID - used to determine whether a user has voted
  var userId;
  if($rootScope.user) userId = $rootScope.user.id;
  // isLoggedIn = true is user is logged in; i.e., there is a user on the $rootScope
  $scope.isLoggedIn = userId >= 0;

  // Suggest related topics (i.e., prerequisites or subsequent topics)
  $scope.suggestRelatedTopic = function( options ) {
    if(options.suggestionType === 'prereq') {
      options.formTitle = "Add a prerequisite to " + $scope.topic.title;
    } else if(options.suggestionType === 'subseq') {
      options.formTitle = "Suggest a next topic for " + $scope.topic.title;
    }
    var suggestTopicModal = $uibModal.open({
      animation: true,
      templateUrl: 'js/common/modals/views/suggestTopic.html',
      controller: 'SuggestTopicModalCtrl',
      size: 'sm',
      resolve: {
        options: options,
        topics: TopicFactory.fetchAll()
      }
    });

    suggestTopicModal.result
    .then(function (results) {
      var type = results[0],
          suggestedTopic = results[1];
      // update DOM
      if(type === 'prereq') {
        $scope.topic.prereqTopics.push( suggestedTopic );
      } else if(type === 'subseq'){
        $scope.topic.subseqTopics.push( suggestedTopic );
      }
    });
  }

  // FLAGGING
  $scope.flagTopic = function(id) {
    $uibModal.open({
      animation: true,
      templateUrl: './js/common/modals/views/addFlagModal.html',
      controller: 'AddFlagModalInstanceCtrl',
      resolve: {
        options: { type: 'topic', id: id }
      }
    });
  }

  // ADD NEW RESOURCE
  $scope.addNewResource = function() {
    var addResourceModal = $uibModal.open({
      animation: true,
      templateUrl: './js/common/modals/views/addResource.html',
      controller: 'AddResourceModalCtrl',
      resolve: {
        options: { topicId: $scope.topic.id, topicName: $scope.topic.title }
      }
    });
    addResourceModal.result
    .then(function (newResource) {
      $scope.topic.resources.push(newResource);
    });
  }

  // ADD NEW PLAN
  $scope.addNewPlan = function() {
    var addPlanModal = $uibModal.open({
      animation: true,
      templateUrl: './js/common/modals/views/addPlan.html',
      controller: 'AddPlanModalCtrl',
      resolve: {
        options: { topicId: $scope.topic.id, topicName: $scope.topic.title },
        topics: null
      }
    });
    addPlanModal.result
    .then(function (newPlan) {
      $scope.topic.plans.push(newPlan);
    });
  }

  $rootScope.$on('voted-need-resort', function(event, data) {
    $scope.topic.votes[data.type][data.id] = data.votes;
    sort(data.type);
  })

  // DATA SORTING
  // Sort master routing function
  function sort(type) {
    console.log('sort triggered for ' + type)
    switch(type) {
      case 'resources':
        $scope.topic.resources = TopicFactory.sortData($scope.topic.resources, $scope.topic.votes.resources, 'id');
        break;
      case 'prereq':
        $scope.topic.prereqTopics = TopicFactory.sortData($scope.topic.prereqTopics, $scope.topic.votes.prereq, 'prerequisiteId');
        break;
      case 'subseq':
        $scope.topic.subseqTopics = TopicFactory.sortData($scope.topic.subseqTopics, $scope.topic.votes.subseq, 'topicId');
        break;
    }
  }

  function sortAll() {
    sort('resources');
    sort('prereq');
    sort('subseq');
  }

});
