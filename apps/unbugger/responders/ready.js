// ==========================================================================
// Project:   Unbugger
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

/** @namespace

  This state occurs when the application is ready and the data is loaded.

  @extends SC.Responder
*/
Unbugger.READY = SC.Responder.create(
  /** @scope Unbugger.prototype */ {
  
  didBecomeFirstResponder: function() {
    var query = SC.Query.local(Unbugger.Message, {url: Unbugger.get('messagesUrl'), orderBy:'time'});
    var messages = Unbugger.store.find(query);
    Unbugger.messagesController.set('content', messages);
  },
  
  clearMessages: function() {
    var query = SC.Query.local(Unbugger.Message);
    var messages = Unbugger.store.find(query);
    this.invokeOnce(function() {
      messages.forEach(function(m) {
        m.destroy();
      });
    });
    
    SC.Request
      .deleteUrl(Unbugger.get('messagesUrl'))
      .send();
  },
  
  sendCommand: function(value) {
    var data = {
      message: value,
      type: "command"
    };
    SC.Request
      .postUrl(Unbugger.get('commandsUrl'), data)
      .json()
      .send();
  }
  
});