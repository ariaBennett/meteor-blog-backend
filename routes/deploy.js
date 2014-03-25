var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;
var login, deploy, cleanup;

exports.deploy = function(req, res){
  var body = req.body;
  var appName = body['.'].replace(/\//g, '');

  var buildApp = function(obj){
    var currentPath = obj['.'].replace('/' + appName, '.');
    var unparsedKeys = Object.keys(obj);
    var keys = [];
    // remove dot keys
    for (var i = 0; i < unparsedKeys.length; i++) {
      if (unparsedKeys[i][0] !== '.') {
        keys.push(unparsedKeys[i]);
      }
    }
    // create files out of strings
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (typeof(obj[key]) === 'string') {
        fs.writeFileSync(currentPath + key, obj[key]);
      }
      else {
        fs.mkdirSync(currentPath + key);
        if (Object.keys(obj[key]).length > 2) {
          buildApp(obj[key]);
        }
      }
    }
  };
  buildApp(body);

  login = exec("expect ../expect", function (error, stdout, stderr) {
      deployWrapper();
    });
  
  var deployWrapper = function(){
    deploy = exec("meteor deploy " + appName + ".meteor.com", function (error, stdout, stderr) {
      cleanUpWrapper();
    });
  };

  var cleanUpWrapper = function() {
    cleanUp = exec("rm -rf /home/aria/blog/node/routes/meteor_deploy/*", function(error, stdout, stderr){
      res.send();
    });
  };
};

