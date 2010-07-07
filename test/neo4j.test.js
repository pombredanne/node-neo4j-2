var neo = require('../neo4j')
var sys = require('sys')
var vows = require('vows')
var assert = require ('assert')

function rand(integer) {
  return Math.floor(Math.random()*(integer + 1))
}

var i = rand(1000)
var j = i;
var k = i;

while (i === j || i === k || j === k) {
  j = rand(1000)
  k = rand(1000)
}

exports['test getRoot()'] = function(assert) {
  neo.getRoot(function(data){
    var json = JSON.parse(data)
    var expected = {
      "index" : "http://localhost/index",
      "node" : "http://localhost/node",
      "reference node" : "http://localhost/node/0"
    }
    assert.eql(json, expected)
  })
}

exports['test createNode()'] = function(assert) {
  var locationMatcher = function(url){assert.ok(url.match(/\/node\/\d{1,}$/))}
  neo.createNode(function(data){
    locationMatcher(data)
  })
  neo.createNode({test: "me", out: "please"}, function(data){
    locationMatcher(data)
  })
//  neo.createNode(12, function(e){assert.throws(function(){throw e}, Error, "Invalid data sent: 12")})
}

exports['test getNode()'] = function(assert) {
  neo.getNode(1, function(data){
    var json = JSON.parse(data)
    var expected = {"incoming typed relationships":"http://localhost/node/1/relationships/in/{-list|&|types}",
                    "incoming relationships":"http://localhost/node/1/relationships/in",
                    "all relationships":"http://localhost/node/1/relationships/all",
                    "create relationship":"http://localhost/node/1/relationships",
                    "data":{"out":"please","test":"me"},
                    "traverse":"http://localhost/node/1/traverse/{returnType}",
                    "property":"http://localhost/node/1/properties/{key}",
                    "self":"http://localhost/node/1",
                    "properties":"http://localhost/node/1/properties",
                    "all typed relationships":"http://localhost/node/1/relationships/all/{-list|&|types}",
                    "outgoing typed relationships":"http://localhost/node/1/relationships/out/{-list|&|types}",
                    "outgoing relationships":"http://localhost/node/1/relationships/out"}
    assert.eql(json, expected)
  })
  neo.getNode(123456, function(e){assert.throws(function(){throw e}, Error, "Node not found")})
}

exports['test setPropertiesOnNode()'] = function(assert) {
  neo.setPropertiesOnNode(1, {expresso: "test"}, function(data){
    assert.ok(data)
  })
  neo.setPropertiesOnNode(1, "Test", function(data){
    assert.throws(function(){throw e}, Error, "Invalid data sent")
  })
  neo.setPropertiesOnNode(123412341234, {expresso: "test"}, function(data){
    assert.throws(function(){throw e}, Error, "Node not found")
  })
}

exports['test getPropertiesOnNode()'] = function(assert) {
  neo.getPropertiesOnNode(1, function(data){
    var json = JSON.parse(data)
    var expected = {"out":"please","test":"me"}
    assert.eql(json, expected)
  })
  neo.getPropertiesOnNode(12341234, function(data){
    assert.throws(function(){throw e}, Error, "Node not found")
  })
}

exports['test removePropertiesFromNode()'] = function(assert) {
  neo.removePropertiesFromNode(2, function(data){
    assert.ok(data)
  })
  neo.removePropertiesFromNode(12341234, function(data){
    assert.throws(function(){throw e}, Error, "Node not found")
  })
}

exports['test setPropertyOnNode()'] = function(assert) {
  neo.setPropertyOnNode(2, "test", "me", function(data){
    assert.ok(data)
  })
  neo.setPropertyOnNode(12341234, "test", "me", function(data){
    assert.throws(function(){throw e}, Error, "Node not found")
  })
}

exports['test getPropertyOnNode()'] = function(assert) {
  neo.getPropertyOnNode(1, "test", function(data){
    assert.eql("me", data)
  })
}

exports['test removePropertyFromNode()'] = function(assert) {
  
}

exports['test deleteNode()'] = function(assert) {}

exports['test createRelationship()'] = function(assert) {}

exports['test setPropertiesOnRelationship()'] = function(assert) {}

exports['test getPropertiesOnRelationship()'] = function(assert) {}

exports['test removePropertiesFromRelationship()'] = function(assert) {}

exports['test setPropertyOnRelationship()'] = function(assert) {}

exports['test getPropertyOnRelationship()'] = function(assert) {}

exports['test removePropertyFromRelationship()'] = function(assert) {}

exports['test deleteRelationship()'] = function(assert) {}

exports['test getRelationshipsOnNode()'] = function(assert) {}

exports['test listIndexes()'] = function(assert) {}

exports['test addToIndex()'] = function(assert) {}

exports['test removeFromIndex()'] = function(assert) {}

exports['test queryIndex()'] = function(assert) {}

exports['test traverse()'] = function(assert) {}

