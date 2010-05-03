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
