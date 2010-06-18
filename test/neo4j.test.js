var neo = require('../neo4j')
var sys = require('sys')

exports['test getRoot'] = function(assert) {
  neo.getRoot(function(data){
    var json = JSON.parse(data)
    var expected = {
      "index" : "http://localhost/index",
      "node" : "http://localhost/node",
      "reference node" : "http://localhost/node/0"
    }
    assert.deepEqual(json, expected)
  })
}

exports['test createNode'] = function(assert) {
  var locationMatcher = function(url){assert.ok(url.match(/\/node\/\d{1,}$/))}
  neo.createNode(function(data){
    locationMatcher(data)
  })
  neo.createNode({test: "me", out: "please"}, function(data){
    locationMatcher(data)
  })
//  assert.throws(function(){neo.createNode(12, function(){})}, Error, "Invalid data sent: 12")
}

exports['test getNode'] = function(assert) {
  neo.getNode(1, function(data){
    var json = JSON.parse(data)
    var expected = {
      "self": "/node/1",
      "data": { "name": "Thomas Anderson",
        "age": 29
      },
      "create relationship": "/node/1/relationships",
      "all relationships": "/node/1/relationships/all",
      "all typed relationships": "/node/1/relationships/all/{-list|&|types}",
      "incoming relationships": "/node/1/relationships/in",
      "incoming typed relationships": "/node/1/relationships/in/{-list|&|types}",
      "outgoing relationships": "/node/1/relationships/out",
      "outgoing typed relationships": "/node/1/relationships/out/{-list|&|types}",
      "properties": "/node/1/properties",
       "property": "/node/1/property/{key}",
      "traverse": "/node/1/traverse/{returnType}"
    }
    for (attr in expected) {
      var regExp = new RegExp(expected[attr])
      if (attr === "data") {
        break
      } else {
        assert.ok(json[attr].match(regExp))
      }
    }
  })
  assert.throws(function(){neo.getNode(123456, function(data){sys.puts(data)})}, Error, "Node not found")
}

exports['test setPropertiesOnNode'] = function() {
  neo.setPropertiesOnNode(1, {expresso: "test"}, function(data){
    
  })
}

exports['test getPropertiesOnNode'] = function() {
  
}

exports['test removePropertiesFromNode'] = function() {}

exports['test setPropertyOnNode'] = function() {}

exports['test getPropertyOnNode'] = function() {}

exports['test removePropertyFromNode'] = function() {}

exports['test deleteNode'] = function() {}

exports['test createRelationship'] = function() {}

exports['test setPropertiesOnRelationship'] = function() {}

exports['test getPropertiesOnRelationship'] = function() {}

exports['test removePropertiesFromRelationship'] = function() {}

exports['test setPropertyOnRelationship'] = function() {}

exports['test getPropertyOnRelationship'] = function() {}

exports['test removePropertyFromRelationship'] = function() {}

exports['test deleteRelationship'] = function() {}

exports['test getRelationshipsOnNode'] = function() {}

exports['test listIndexes'] = function() {}

exports['test addToIndex'] = function() {}

exports['test removeFromIndex'] = function() {}

exports['test queryIndex'] = function() {}

exports['test traverse'] = function() {}
