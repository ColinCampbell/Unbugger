// ==========================================================================
// Project:   TestControls
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals TestControls */
Forms = {};
Forms.FormView = {design:function(){}};
Forms.FormView.row = function(){};
/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
TestControls = SC.Application.create(
  /** @scope TestControls.prototype */ {

  NAMESPACE: 'TestControls',
  VERSION: '0.1.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  store: SC.Store.create().from(SC.Record.fixtures)
  
  // TODO: Add global constants or singleton objects needed by your app here.

}) ;
