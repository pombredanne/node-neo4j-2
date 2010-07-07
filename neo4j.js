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

function buildRequest(method, url, options) {
  var neo = http.createClient(PORT, HOST)
  var headers = {'host' : HOST}
  if (options && typeof options === "object") {
    merge(headers, options)
  }
  return neo.request(method, url, headers)
}

function get(url, options) {
  return buildRequest("GET", url, options)
}

function post(url, options) {
  return buildRequest("POST", url, options)
}

function put(url, options) {
  return buildRequest("PUT", url, options)
}

function del(url, options) {
  return buildRequest("DELETE", url, options)
}

exports.getRoot = function(callback) {
  var request = get("/")
  request.addListener("response", function(response){
    var body = ""
    response.setEncoding('utf8')
    if (response.statusCode === 200) {
      response.addListener("data", function(chunk){
        if (typeof chunk === Error) {
          callback(chunk)
        } else {
          body += chunk
        }
      })
      response.addListener("end", function() {
        callback(body)
      })
    }
    else callback(new Error('Server error'))
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
        if (typeof chunk === Error) {
          callback(chunk)
        } else {
          body += chunk
        }
      })
      response.addListener("end", function() {
        callback(location, body)
      })
    } else if (response.statusCode === 400) {
      callback(new Error('Invalid data sent: ' + properties))
    } else callback(new Error('Server error'))
  })
  request.end()
}

exports.getNode = function(id, callback) {
  var request = get("/node/" + id, {'host' : 'localhost'})
  request.addListener("response", function(response){
    var body = ""
    response.setEncoding('utf8')
    if (response.statusCode === 200) {
      response.addListener("data", function(chunk){
        if (typeof chunk === Error) {
          callback(chunk)
        } else {
          body += chunk
        }
      })
      response.addListener("end", function() {
        callback(body)
      })
    } else if (response.statusCode === 404) {
      callback(new Error('Node not found'))
    } else callback(new Error('Server error'))
  })
  request.end()
}

exports.setPropertiesOnNode = function(id, properties, callback) {
  var request = post("/node" + id + "/properties")
  request.addListener("response", function(response){
    response.setEncoding('utf8')
    if (response.statusCode === 204) {
      callback(true)
    } else if (response.statusCode === 400) {
      callback(new Error('Invalid data sent'))
    } else if (response.statusCode === 404) {
      callback(new Error('Node not found'))
    } else callback(new Error('Server error'))
  })
  request.end()
}

exports.getPropertiesOnNode = function(id, callback) {
  var request = get("/node/" + id + "/properties")
  request.addListener("response", function(response){
    var body = ""
    response.setEncoding('utf8')
    if (response.statusCode === 200) {
      response.addListener("data", function(chunk){
        if (typeof chunk === Error) {
          callback(chunk)
        } else {
          body += chunk
        }
      })
      response.addListener("end", function() {
        callback(body)
      })
    } else if (response.statusCode === 404) {
      callback(new Error('Node not found'))
    } else callback(new Error('Server error'))
  })
  request.end()
}

exports.removePropertiesFromNode = function(id, callback) {
  var request = del("/node/" + id + "/properties")
  request.addListener("response", function(response){
    response.setEncoding('utf8')
    if (response.statusCode === 204) {
      callback(true)
    } else if (response.statusCode === 404) {
      callback(new Error('Node not found'))
    } else callback(new Error('Server error'))
  })
  request.end()
}

exports.setPropertyOnNode = function(id, key, val, callback) {
  callback("fails")
}

exports.getPropertyOnNode = function(id, key, callback) {
  var request = del("/node/" + id + "/properties/" + key)
  request.addListener("response", function(response){
    var body = ""
    response.setEncoding('utf8')
    if (response.statusCode === 200) {
      response.addListener("data", function(chunk){
        if (typeof chunk === Error) {
          callback(chunk)
        } else {
          body += chunk
        }
      })
      response.addListener("end", function() {
        callback(body)
      })
    } else if (response.statusCode === 404) {
      callback(new Error('Node not found'))
    } else callback(new Error('Server error'))
  })
  request.end()
}

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

