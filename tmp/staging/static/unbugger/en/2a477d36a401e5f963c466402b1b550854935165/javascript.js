/* >>>>>>>>>> BEGIN bundle_info.js */
        ;(function() {
          var target_name = 'square' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 
          
          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/ace'],
            styles:   ['/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/stylesheet-packed.css','/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/stylesheet.css'],
            scripts:  ['/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/javascript-packed.js','/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/javascript.js']
          }
        })();

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   Unbugger
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger SComet */

/** @namespace

  A simple console for logging/pinging an external application.
  
  @extends SC.Application
*/
Unbugger = SC.Application.create(
  /** @scope Unbugger.prototype */ {

  NAMESPACE: 'Unbugger',
  VERSION: '0.1.0',

  store: SC.Store.create().from(SComet.Comet),
    
  messagesUrl: '/messages',
  commandsUrl: '/commands'

}) ;

/* >>>>>>>>>> BEGIN source/models/message.js */
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

/* >>>>>>>>>> BEGIN source/models/command.js */
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

/* >>>>>>>>>> BEGIN source/controllers/command.js */
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

/* >>>>>>>>>> BEGIN source/controllers/messages.js */
// ==========================================================================
// Project:   Unbugger.messagesController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Unbugger.messagesController = SC.ArrayController.create(
/** @scope Unbugger.messagesController.prototype */ {

  // TODO: Add your own code here.

}) ;

/* >>>>>>>>>> BEGIN source/responders/ready.js */
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
/* >>>>>>>>>> BEGIN source/views/console_line_item.js */
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

/* >>>>>>>>>> BEGIN source/resources/main_page.js */
// ==========================================================================
// Project:   Unbugger - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

sc_require('views/console_line_item');

// This page describes the main user interface for your application.  
Unbugger.mainPage = SC.Page.design({

  mainPane: SC.MainPane.design({
    childViews: 'header messages console send'.w(),
    defaultResponder: 'Unbugger',
    
    header: SC.ToolbarView.design({
      layout: {height:32},
      childViews: 'logo clear enabled'.w(),
      
      logo: SC.LabelView.design({
        layout: {centerY:2, height:24, left:20, width:80},
        controlSize: SC.LARGE_CONTROL_SIZE,
        value: "Unbugger"
      }),
      
      clear: SC.ButtonView.design({
        layout: {centerY:1, height:24, right:114, width:70},
        action: "clearMessages",
        title: "Clear"
      }),
      
      enabled: SC.ButtonView.design({
        layout: {centerY:1, height:24, right:20, width:80},
        buttonBehavior: SC.TOGGLE_BEHAVIOR,
        title: 'Enabled',
        isSelectedBinding: 'SComet.userDefaults.isEnabled',
        isSelectedBindingDefault: SC.Binding.bool()
      })
    }),
    
    messages: SC.ScrollView.design({
      layout: {bottom:24, top:32},
      
      contentView: SC.ListView.design({
        contentBinding: 'Unbugger.messagesController.arrangedObjects',
        contentValueKey: 'value',
        exampleView: Unbugger.ConsoleLineItem.design(SC.Border, {
          borderStyle: SC.BORDER_BOTTOM
        }),
        isSelectable: NO,
        rowHeight:24
      })
    }),
    
    console: SC.TextFieldView.design({
      layout: {bottom:0, height:24, right:80},
      classNames: 'console',
      hint: "Enter a command...",
      leftAccessoryView: SC.LabelView.design({
        layout: {left:5, top:3, width:30},
        tagName: "span",
        value: ">>>"
      }),
      valueBinding: 'Unbugger.commandController.value'
    }),
    
    send: SC.ButtonView.design({
      layout: {bottom:0, height:24, right:0, width:80},
      action: 'Unbugger.commandController.send',
      isDefault: YES,
      theme: 'square',
      title: 'Send'
    })
  })

});

/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   Unbugger
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Unbugger */

Unbugger.main = function main() {

  Unbugger.getPath('mainPage.mainPane').append() ;

  Unbugger.makeFirstResponder(Unbugger.READY);

} ;

function main() { Unbugger.main(); }

