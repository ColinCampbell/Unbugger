// ==========================================================================
// Project:   Unbugger.Command
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

sc_require('models/message');

/** @class

  (Document your Model here)

  @extends Unbugger.Message
  @version 0.1
*/
Unbugger.Command = Unbugger.Message.extend(
/** @scope Unbugger.Command.prototype */ {

  value: function() {
    return '>>>  ' + this.get('message');
  }.property('message').cacheable()

}) ;
