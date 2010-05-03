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
