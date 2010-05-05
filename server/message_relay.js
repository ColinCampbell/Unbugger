
/*globals process JSON get post del run */

var sys = require('sys');

function MessageRelay(address, persist) {
  var messages = [];
  var messageQueue = new process.EventEmitter();
  if (persist === null) persist = true;
  
  var getMessages = function(since) {
    if (!since) {
      return messages;
    }
    // for some reason, messages.filter would JSON.stringify as an object, not an array
    var result = [];
    messages.forEach(function(m) {
      if (m.time > since) result.push(m);
    });
    return result;
  };

  get('/' + address + '/:since?', function() {
    // if persist is true, we want messages notification to stall for new ones
    // this should mean if statement below never hits true
    var since = this.param('since') || (!persist ? Date.now() : null),
        msgs = getMessages(since),
        response = this.response,
        listener, timeout;

    response.writeHeader(200, {'Content-Type': 'text/plain', 'Connection': 'Close'});

    // we have some messages to return
    if (msgs.length) {
      response.write(JSON.stringify(msgs));
      response.end();
    }
    // no messages, wait for some
    else {
      listener = function(e) {
        msgs = getMessages(since);
        response.write(JSON.stringify(msgs));
        response.end();

        clearTimeout(timeout);
        messageQueue.removeListener('newMessage', listener);
      };
      messageQueue.addListener('newMessage', listener);

      timeout = setTimeout(function() {
        response.write(JSON.stringify([]));
        response.end();
        messageQueue.removeListener('newMessage', listener);
      }, 100000);
    }
  });

  post('/' + address, function() {
    var data = JSON.decode(this.body);

    this.response.writeHeader(201, {'Content-Type': 'text/plain', 'Connection': 'Close'});

    var isNewSession = messages.length > 0 ? messages[messages.length-1].sessionStart !== data.sessionStart : true;
    
    messages.push({
      guid: messages.length,
      time: Date.now(),
      message: data.message,
      type: data.type,
      sessionStart: data.sessionStart,
      isNewSession: isNewSession
    });
    messageQueue.emit('newMessage');

    this.response.end();
  });

  del('/' + address, function() {
    messages = [];

    this.response.writeHeader(204);
    this.response.end();
  });

}

exports.MessageRelay = MessageRelay;