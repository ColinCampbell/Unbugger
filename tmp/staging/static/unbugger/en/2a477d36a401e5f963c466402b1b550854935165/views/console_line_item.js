// ==========================================================================
// Project:   Unbugger.ConsoleLineItem
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

/** @class

  A line in the Unbugger console.

  @extends SC.ListItemView
*/
Unbugger.ConsoleLineItem = SC.ListItemView.extend(
/** @scope Unbugger.ConsoleLineItem.prototype */ {

  render: function(context, firstTime) {
    arguments.callee.base.apply(this,arguments);
    
    var content = this.get('content');
    
    context.addClass(content.get('type'));
    
    if (content.get('isNewSession')) {
      context.addClass('new-session');
    }
  }

});
