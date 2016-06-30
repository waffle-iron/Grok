'use strict';
var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var Resource = require('../../db/').model('resource');
var Topic = require('../../db/').model('topic');
var Plan = require('../../db/').model('plan');
var Auth = require('../configure/auth-middleware');

module.exports = router;

// Sends list of topic titles
router.get('/topics', function(req, res, next){
  Topic.findAll()
  .then(topics => res.json(topics))
  .catch(next);
});

router.post('/resource', Auth.assertAuthenticated, function(req, res, next){
  req.body.userId = req.user.dataValues.id;
  Promise.all([
    Resource.create(req.body),
    Topic.findOrCreate({ where: { title: req.body.topicName }})
  ])
  .spread(function(newResource, topic){
    return newResource.addTopic(topic[0].id);
  })
  .then(() => res.status(201).end());
});

router.get('/plans/user/:userId', function(req, res, next){
	Plan.findAll({ where: {
			userId: req.params.userId
		}, include: [ Resource ]
	})
	.then(plans => res.send(plans));
});
