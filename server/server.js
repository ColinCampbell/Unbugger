/*globals process configure use Static get run */
var sys = require('sys');

var kiwi = require('kiwi');
kiwi.require('express');
require('express/plugins');


configure(function() {
  use(Static);
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