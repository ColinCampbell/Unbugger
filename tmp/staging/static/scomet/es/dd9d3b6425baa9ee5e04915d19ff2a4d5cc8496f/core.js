// ==========================================================================
// Project:   Unbugger
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals SComet */

/** @namespace
  
  @extends SC.Object
*/
SComet = SC.Object.create(
  /** @scope SComet.prototype */ {

  NAMESPACE: 'SComet',
  VERSION: '0.1.0',
  
  userDefaults: SC.UserDefaults.create({appDomain: "SComet"})

}) ;

SComet.userDefaults.defaults({
  "SComet:isEnabled": true
});