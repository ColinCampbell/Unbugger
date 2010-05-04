/*globals process configure use Static get run */

var sys = require('sys'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    MessageRelay = require('./message_relay').MessageRelay;

var kiwi = require('kiwi');
kiwi.require('express');
require('express/plugins');

configure(function() {
  use(Static);
});


// ..........................................................
// MESSAGING SUPPORT
//

var messages = new MessageRelay('messages');
var commands = new MessageRelay('commands');


// ..........................................................
// STATIC FILE SUPPORT
//

function doLinking() {
  // link up index.html too
  fs.stat('index.html', function(err, data) {
    if (err || !data.isSymbolicLink()) {
      // find the most current build of project
      fs.readdir("static/unbugger/en", function(err, files) {
        if (err) throw err;
        var mostRecent;
        files.forEach(function(file) {
          var data = fs.statSync("static/unbugger/en/" + file);
          if (mostRecent === undefined || (data.isDirectory() && data.mtime > mostRecent.mtime)) {
            mostRecent = file;
          }
        });
        fs.symlink("static/unbugger/en/" + mostRecent + "/index.html", "index.html");
      });
    }
  });

  get('/*', function(file) {
    return this.sendfile(file);
  });
}

// symlink to the build files in the other directory
fs.stat('static', function(err, data) {
  // need to build Unbugger
  if (err) {
    sys.puts("Building Unbugger app...");
    var scbuild = spawn('sc-build', ['--project=../']);
    
    scbuild.stdout.addListener('data', function(data) {
      sys.print('sc-build out: ' + data);
    });
    
    scbuild.stderr.addListener('data', function(data) {
      sys.print('sc-build err: ' + data);
    });
    
    scbuild.addListener('exit', function(code) {
      if (code === 0) doLinking();
    });
  } else {
    doLinking();
  }
});

run();