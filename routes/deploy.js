var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;
var create, login, deploy, cleanup;

exports.deploy = function(req, res){
  var body = req.body;
  var findAppName = function(target){
    var keys = Object.keys(target);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i][0] !== '.') {
        return keys[i];
      }
    }
    return null;
  };
  var appName = findAppName(body).replace(/\//g, '');
  console.log('appName', appName);

  var buildApp = function(obj){
    console.log('currentPath before', obj['.']);
    var currentPath = obj['.'].replace('/', './');
    console.log('currentPath after', currentPath);
    var unparsedKeys = Object.keys(obj);
    var keys = [];

    // remove dot keys
    for (var i = 0; i < unparsedKeys.length; i++) {
      if (unparsedKeys[i][0] !== '.') {
        keys.push(unparsedKeys[i]);
      }
    }
    console.log("parsed keys", keys);

    // create files out of strings
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (typeof(obj[key]) === 'string') {
        console.log('filePath', currentPath + key);
        fs.writeFile(currentPath + key, obj[key]);
      }
      else {
        console.log('dirPath', currentPath + key);
        fs.mkdir(currentPath + key, function(err){
        });
        if (Object.keys(obj[key]).length > 2) {
          buildApp(obj[key]);
        }
      }
    }
  };

  login = exec("expect ../expect", function (error, stdout, stderr) {
    createWrapper();
  });
  
  var createWrapper = function(){
    create = exec("meteor create " + appName, function(error, stdout, stderr) {
      buildApp(body);
      deployWrapper();
    });
  };

  var deployWrapper = function(){
    deploy = exec("(cd " + appName + " ; meteor deploy " + appName + ".meteor.com)", function (error, stdout, stderr) {
      cleanUpWrapper();
    });
  };

  var cleanUpWrapper = function() {
    cleanUp = exec("rm -rf /home/aria/blog/node/routes/meteor_deploy/" + appName, function(error, stdout, stderr){
      res.send();
    });
  };
};

