var http = require('http')

var HOST = 'localhost', PORT = 9999, PROTOCOL = 'http', URL = PROTOCOL + "://" + HOST + ":" + PORT + "/"

function merge(dest, source) {
  if (dest && typeof dest === "object" && source && typeof source === "object") {
    for (attr in source) {
      dest[attr] = source[attr]
    }
    return dest
  }
}

function client() {
  return http.createClient(PORT, HOST)
}

function get(url, options) {
  var neo = client()
  return neo.request("GET", url, {'host' : HOST})
}

function post(url, options) {
  var neo = client()
  var headers = {'host' : HOST}
  if (options && typeof options === "object") {
    merge(headers, options)
  }
  return neo.request("POST", url, headers)
}

function put(url, options) {
  
}

function del(url, options) {
  
}

exports.getRoot = function(callback) {
  var request = get("/")
  request.addListener("response", function(response){
    var body = ""
    response.setEncoding('utf8')
    if (response.statusCode === 200) {
      response.addListener("data", function(chunk){
        body += chunk
      })
      response.addListener("end", function() {
        callback(body)
      })
    }
    else throw new Error('Server error')
  })
  request.end()
}

// Wraps both createEmptyNode and createNodeWithProperties
exports.createNode = function(properties, callback) {
  if (typeof properties !== 'object') {
    if (typeof properties === 'function') {
      callback = properties
    }
    properties = null
  }
  var request
  if (properties) {
    properties = JSON.stringify(properties)
    request = post("/node", {"content-type": "application/json"})
    request.write(properties)
  } else {
    request = post("/node")
  }
  request.addListener("response", function(response){
    var body = "", location = response.headers['location']
    response.setEncoding('utf8')
    if (response.statusCode === 201 && location) {
      response.addListener("data", function(chunk){
        body += chunk
      })
      response.addListener("end", function() {
        callback(location, body)
      })
    } else if (response.statusCode === 400) {
      throw new Error('Invalid data sent: ' + properties)
    } else throw new Error('Server error')
  })
  request.end()
}

exports.getNode = function(id, callback) {
  var neo = http.createClient(PORT, HOST)
  var request = neo.request("GET", "/node/" + id, {'host' : 'localhost'})
  request.addListener("response", function(response){
    var body = ""
    response.setEncoding('utf8')
    if (response.statusCode === 200) {
      response.addListener("data", function(chunk){
        body += chunk
      })
      response.addListener("end", function() {
        callback(body)
      })
    } else if (response.statusCode === 404) {
      throw new Error('Node not found')
    } else throw new Error('Server error')
  })
  request.end()
}

exports.setPropertiesOnNode = function(id, properties, callback) {
  
}

exports.getPropertiesOnNode = function(id, callback) {
  var neo = http.createClient(PORT, HOST)
  var request = neo.request("GET", "/node/" + id + "/properties", {'host' : 'localhost'})
  request.addListener("response", function(response){
    var body = ""
    response.setEncoding('utf8')
    if (response.statusCode === 200) {
      response.addListener("data", function(chunk){
        body += chunk
      })
      response.addListener("end", function() {
        callback(body)
      })
    } else if (response.statusCode === 404) {
      throw new Error('Node not found')
    } else throw new Error('Server error')
  })
  request.end()
}

exports.removePropertiesFromNode = function() {}

exports.setPropertyOnNode = function() {}

exports.getPropertyOnNode = function() {}

exports.removePropertyFromNode = function() {}

exports.deleteNode = function() {}

exports.createRelationship = function() {}

exports.setPropertiesOnRelationship = function() {}

exports.getPropertiesOnRelationship = function() {}

exports.removePropertiesFromRelationship = function() {}

exports.setPropertyOnRelationship = function() {}

exports.getPropertyOnRelationship = function() {}

exports.removePropertyFromRelationship = function() {}

exports.deleteRelationship = function() {}

exports.getRelationshipsOnNode = function() {}

exports.listIndexes = function() {}

exports.addToIndex = function() {}

exports.removeFromIndex = function() {}

exports.queryIndex = function() {}

exports.traverse = function() {}

