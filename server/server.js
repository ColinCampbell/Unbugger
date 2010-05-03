/*globals process configure use Static get run */
var sys = require('sys'),
    fs = require('fs');

var kiwi = require('kiwi');
kiwi.require('express');
require('express/plugins');


configure(function() {
  use(Static);
});

var directory = "../tmp/build/static";

// symlink to the build files in the other directory
fs.stat('static', function(err, data) {
  if (err || !data.isSymbolicLink()) {
    fs.symlink(directory, "static");
  }
});

// link up index.html too
fs.stat('index.html', function(err, data) {
  if (err || !data.isSymbolicLink()) {
    // find the most current build of project
    fs.readdir(directory + "/unbugger/en", function(err, files) {
      if (err) throw err;
      var mostRecent;
      files.forEach(function(file) {
        var data = fs.statSync(directory + "/unbugger/en/" + file);
        if (mostRecent === undefined || (data.isDirectory() && data.mtime > mostRecent.mtime)) {
          mostRecent = file;
        }
      });
      fs.symlink(directory + "/unbugger/en/" + mostRecent + "/index.html", "index.html");
    });
  }
});

var MessageRelay = require('./message_relay').MessageRelay;

// messages go from the client to the console
var messages = new MessageRelay('messages', 3000);

// commands go from the console to the client
var commands = new MessageRelay('commands', 3001, false);

get('/*', function(file) {
  return this.sendfile(file);
});

run(3002);