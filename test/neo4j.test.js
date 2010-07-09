var neo = require('../neo4j')
var sys = require('sys')
var vows = require('vows')
var assert = require ('assert')

function reallyHighInteger(){
  return 123412341234
}

function mockNode(location, data) {
  return {"incoming typed relationships":location + "/relationships/in/{-list|&|types}",
          "incoming relationships":location + "/relationships/in",
          "all relationships":location + "/relationships/all",
          "create relationship":location + "/relationships",
          "data":data,
          "traverse":location + "/traverse/{returnType}",
          "property":location + "/properties/{key}",
          "self":location,
          "properties":location + "/properties",
          "all typed relationships":location + "/relationships/all/{-list|&|types}",
          "outgoing typed relationships":location + "/relationships/out/{-list|&|types}",
          "outgoing relationships":location + "/relationships/out"}
}

vows.describe("Neo4j REST Client").addBatch({
  "getRoot()": {
    topic: function(){
      neo.getRoot(this.callback)
    },
    
    "should pass the default root node values to the callback": function(err, data){
      assert.isNull(err)
      var expected = {
        "index" : "http://localhost/index",
        "node" : "http://localhost/node",
        "reference node" : "http://localhost/node/0"
      }
      var json = JSON.parse(data)
      assert.deepEqual(json, expected)
    }
  },
  
  "createNode()": {
    "with no properties": {
      topic: function() {
        neo.createNode(this.callback)
      },
      
      "should pass the location of the new node to the callback": function(err, location){
        assert.isNull(err)
        assert.match(location, new RegExp("/node/\\d+$"))
      },
    
      "should create": {
        topic: function(location){
          neo.get(location, this.callback)
        },
        
        "a new empty node": function(err, data){
          assert.isNull(err)
          var json = JSON.parse(data)
          var location = json['self']
          var expected = mockNode(location, {})
          assert.deepEqual(expected, json)
        }
      }
    },

    "with properties": {
      topic: function(){
        neo.createNode({test: "me", out: "please"}, this.callback)
      },
      
      "should pass the location of the new node to the callback": function(err, location){
        assert.isNull(err)
        assert.match(location, new RegExp("/node/\\d+$"))
      },
      
      "should create": {
        topic: function(location){
          neo.get(location, this.callback)
        },
        
        "a new node with the passed properties": function(err, data){
          assert.isNull(err)
          var json = JSON.parse(data)
          var location = json['self']
          var expected = mockNode(location, {test: "me", out: "please"})
          assert.deepEqual(expected, json)
        }
      }
    },
    
    "with invalid property data": {
      topic: function(){
        neo.createNode("Invalid data", this.callback)
      },
      
      "should pass an 'Invalid data sent' error to the callback": function(err, data){
        assert.instanceOf(err, Error)
        assert.strictEqual(err.message, "Invalid data sent")
      }
    }
  },
  
  "getNode()": {
    "with an existing node id": {
      topic: function(){
        neo.getNode(1, this.callback)
      },
    
      "should pass to the callback the JSON of the node with the given id": function(err, data){
        var json = JSON.parse(data)
        var expected = mockNode("http://localhost/node/1", {test: "me"})
        assert.deepEqual(json, expected)
      }
    },
    
    "with a non-existing node id": {
      topic: function(){
        neo.getNode(reallyHighInteger(), this.callback)
      },
      
      "should pass an 'Entity not found' error to the callback": function(err, data){
        assert.instanceOf(err, Error)
        assert.strictEqual(err.message, "Entity not found")
      }
    }
  },
  
  "deleteNode()": {
    topic: function(){
      neo.createNode(this.callback)
    },
    
    "with an existing node id": {
      topic: function(location){
        var id = location.match(/\/node\/(\d+)/)[1]
        neo.deleteNode(id, this.callback)
      },
    
      "should delete the node": {
        topic: function(data, location){
          var id = location.match(/\/node\/(\d+)/)[1]
          neo.getNode(id, this.callback)
        },
        
        "with the given id": function(err, data){
          assert.instanceOf(err, Error)
          assert.strictEqual(err.message, "Entity not found")
        }
      },
      
      "should pass an empty string to the callback": function(err, data){
        assert.typeOf(data, 'string')
        assert.isEmpty(data)
      }
    },
    
    "with a non-existing node id": {
      topic: function(){
        neo.deleteNode(reallyHighInteger(), this.callback)
      },
      
      "should pass an 'Entity not found' error to the callback": function(err, data){
        assert.instanceOf(err, Error)
        assert.strictEqual(err.message, "Entity not found")
      }
    }
  },
  
  "setPropertiesOnNode()": {
    "with an existing node id": {
      topic: function(){
        return Math.floor(Math.random()*200)
      },
      
      "with valid properties": {
        topic: function(id){
          neo.setPropertiesOnNode(id, {valid: "properties"}, this.callback)
        },
        
        "should set the properties on the node": {
          topic: function(data, id) {
            neo.getNode(id, this.callback)
          },
          
          "with the given id": function(err, data) {
            var json = JSON.parse(data)
            var data = json.data
            assert.deepEqual(data, {valid: "properties"})
          }
        },
        
        "should pass an empty string to the callback": function(err, data){
          assert.typeOf(data, 'string')
          assert.isEmpty(data)
        }
      },
      
      "with invalid properties": {
        topic: function(id){
          neo.setPropertiesOnNode(id, "Invalid data", this.callback)
        },
        
        "should pass an 'Invalid data sent' error to the callback": function(err, data){
          assert.instanceOf(err, Error)
          assert.strictEqual(err.message, "Invalid data sent")
        }
      }
    },
    
    "with a non-existing node id": {
      topic: function(){
        neo.setPropertiesOnNode(reallyHighInteger(), {}, this.callback)
      },
      
      "should pass an 'Entity not found' error to the callback": function(err, data){
        assert.instanceOf(err, Error)
        assert.strictEqual(err.message, "Entity not found")
      }
    }
  },
  
  "getPropertiesOnNode()": {
    "with an existing node id": {
      "for a node with properties": {
        topic: function(){
          neo.getPropertiesOnNode(1, this.callback)
        },
      
        "should pass to the callback the JSON of the node's properties with the given id": function(err, data){
          var json = JSON.parse(data)
          var expected = {test: "me"}
          assert.deepEqual(json, expected)
        }
      },
      
      "for a node with no properties": {
        topic: function(){
          neo.getPropertiesOnNode(2, this.callback)
        },
        
        "should pass an empty string to the callback": function(err, data){
          assert.typeOf(data, 'string')
          assert.isEmpty(data)
        }
      }
    },
    
    "with a non-existing node id": {
      topic: function(){
        neo.getPropertiesOnNode(reallyHighInteger(), this.callback)
      },
      
      "should pass an 'Entity not found' error to the callback": function(err, data){
        assert.instanceOf(err, Error)
        assert.strictEqual(err.message, "Entity not found")
      }
    }
  },
  
//  "removePropertiesFromNode()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "setPropertyOnNode()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "getPropertyOnNode()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "removePropertyFromNode()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "createRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "getRelationshipsOnNode()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "deleteRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "setPropertiesOnRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "getPropertiesOnRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "removePropertiesFromRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "setPropertyOnRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "getPropertyOnRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "removePropertyFromRelationship()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "listIndexes()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "addToIndex()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "removeFromIndex()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "queryIndex()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  },
//  
//  "traverse()": {
//    "should pass the node JSON for the given id to the callback": function(){
//        
//    },
//    
//    "should pass an error to the callback when a node with the given id cannot be found": function(){
//        
//    }
//  }
}).export(module)
