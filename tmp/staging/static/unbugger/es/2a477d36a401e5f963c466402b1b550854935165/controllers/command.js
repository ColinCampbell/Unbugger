// ==========================================================================
// Project:   Unbugger.commandController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

sc_require('models/command');

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
Unbugger.commandController = SC.ObjectController.create(
/** @scope Unbugger.commandController.prototype */ {

  value: null,
  
  send: function() {
    var value = this.get('value');
    
    if (!SC.empty(value)) {
      // create new message for display in console
      var command = Unbugger.store.createRecord(Unbugger.Command, {
        message: value,
        time: Date.now(),
        type: "command"
      });
      
      Unbugger.sendAction('sendCommand', value);
    }
  }

}) ;
