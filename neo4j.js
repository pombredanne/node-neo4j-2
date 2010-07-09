var http = require('http')
var sys = require('sys')

var HOST = 'localhost', PORT = 9999, PROTOCOL = 'http', URL = PROTOCOL + "://" + HOST + ":" + PORT + "/"

exports.host = HOST
exports.port = PORT
exports.protocol = PROTOCOL
exports.baseUrl = URL

var buildRequest = function(method, url, options, callback) {
  var neo = http.createClient(PORT, HOST)
  var headers = {'host' : HOST}
  var requestBody
  if (options) {
    if (typeof options === "object") {
      requestBody = options['body']
      delete options['body']
      if (requestBody) {
        options["content-type"] = "application/json"
      }
      for (attr in options) {
        headers[attr] = options[attr]
      }
    } else if (typeof options === 'function' && !callback) {
      callback = options
    }
  }
  var request = neo.request(method, url, headers)
  if (requestBody) {
    requestBody = JSON.stringify(requestBody)
    request.write(requestBody)
  }
  request.addListener("response", function(response){
    switch (response.statusCode) {
      case 201:
      case 200:
        response.setEncoding('utf8')
        var body = ""
        response.addListener("data", function(chunk){
          if (typeof chunk === Error) {
            callback(chunk)
          } else {
            body += chunk
          }
        })
        response.addListener("end", function() {
          if (response.statusCode === 201) {
            body = response.headers['location']
          }
          callback(null, body)
        })
        break
      case 204:
        callback(null, "")
        break
      case 400: 
        callback(new Error("Invalid data sent"))
        break
      case 404:
        callback(new Error("Entity not found"))
        break
      case 409:
        callback(new Error("Node could not be deleted (still has relationships?)"))
        break
      default:
        callback(new Error('Server error'))
        break
    }
  })
  request.end()
}

var get = exports.get = function(url, options, callback) {
  buildRequest("GET", url, options, callback)
}

var post = exports.post = function(url, options, callback) {
  buildRequest("POST", url, options, callback)
}

var put = exports.put = function(url, options, callback) {
  buildRequest("PUT", url, options, callback)
}

var del = exports.del = function(url, options, callback) {
  buildRequest("DELETE", url, options, callback)
}

exports.getRoot = function(callback) {
  get("/", callback)
}

// Wraps both createEmptyNode and createNodeWithProperties
exports.createNode = function(properties, callback) {
  if (typeof properties === 'function') {
    callback = properties
    properties = null
  }
  var options
  if (properties) {
    options = {body: properties}
  } else {
    options = null
  }
  post("/node", options, callback)
}

exports.getNode = function(id, callback) {
  get("/node/" + id, callback)
}

exports.deleteNode = function(id, callback) {
  del("/node/" + id, callback)
}

exports.setPropertiesOnNode = function(id, properties, callback) {
  var options
  if (properties){
    options = {body: properties}
  } else {
    options = null
  }
  put("/node/" + id + "/properties", options, callback)
}

exports.getPropertiesOnNode = function(id, callback) {
  get("/node/" + id + "/properties", callback)
}

//exports.removePropertiesFromNode = function(id, callback) {
//  var request = del("/node/" + id + "/properties")
//  request.addListener("response", function(response){
//    response.setEncoding('utf8')
//    if (response.statusCode === 204) {
//      callback(true)
//    } else if (response.statusCode === 404) {1
//      callback(new Error('Node not found'))
//    } else callback(new Error('Server error'))
//  })
//  request.end()
//}

//exports.setPropertyOnNode = function(id, key, val, callback) {
//  callback("fails")
//}

//exports.getPropertyOnNode = function(id, key, callback) {
//  var request = del("/node/" + id + "/properties/" + key)
//  request.addListener("response", function(response){
//    var body = ""
//    response.setEncoding('utf8')
//    if (response.statusCode === 200) {
//      response.addListener("data", function(chunk){
//        if (typeof chunk === Error) {
//          callback(chunk)
//        } else {
//          body += chunk
//        }
//      })
//      response.addListener("end", function() {
//        callback(body)
//      })
//    } else if (response.statusCode === 404) {
//      callback(new Error('Node not found'))
//    } else callback(new Error('Server error'))
//  })
//  request.end()
//}

//exports.removePropertyFromNode = function() {}

//exports.createRelationship = function() {}

//exports.setPropertiesOnRelationship = function() {}

//exports.getPropertiesOnRelationship = function() {}

//exports.removePropertiesFromRelationship = function() {}

//exports.setPropertyOnRelationship = function() {}

//exports.getPropertyOnRelationship = function() {}

//exports.removePropertyFromRelationship = function() {}

//exports.deleteRelationship = function() {}

//exports.getRelationshipsOnNode = function() {}

//exports.listIndexes = function() {}

//exports.addToIndex = function() {}

//exports.removeFromIndex = function() {}

//exports.queryIndex = function() {}

//exports.traverse = function() {}

