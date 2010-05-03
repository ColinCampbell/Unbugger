// ==========================================================================
// Project:   Greenhouse.target
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/


Greenhouse.targetController = SC.ObjectController.create(
/** @scope Greenhouse.targetController.prototype */ {

  contentBinding: 'Greenhouse.targetsController.selection',
  contentBindingDefault: SC.Binding.single()
}) ;
