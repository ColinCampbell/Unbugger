// ==========================================================================
// Project:   Unbugger.Message
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Unbugger.Message = SC.Record.extend(
/** @scope Unbugger.Message.prototype */ {

  message: SC.Record.attr(String),
  
  type: SC.Record.attr(String),
  
  time: SC.Record.attr(Number),
  
  dateTime: function() {
    return SC.DateTime.create(this.get('time'));
  }.property('time').cacheable(),
  
  isNewSession: SC.Record.attr(Boolean),
  
  // this is really lazy, will change
  value: function() {
    var message = this.get('message'),
        time = this.get('dateTime');
    return '[' + time.toFormattedString("%I:%M:%S") + ']  ' + message;
  }.property('message', 'dateTime').cacheable()

}) ;
