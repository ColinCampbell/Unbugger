/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project:   Forms Strings
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Forms */

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file!
//
SC.stringsFor('English', {
  // "_String Key": "Localized String"
}) ;

/* >>>>>>>>>> BEGIN source/mixins/auto_hide.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 
  Handles auto-hiding of views based on emptiness.
  
  A view is empty if all of its children are not visible or are empty. The response to being 
  empty is to become invisible.
  
  Note: as a special case, this also checks isEditing to see if hiding is enabled, since if it
  is editing, it can't really be hidden, can it?
*/
SC.FormsAutoHide = {
  
  /**
  Automatically hides the form, row, or whatever when they are considered "Empty".
  */
  autoHide: NO,
  
  /**
  YES if the form/row is empty, as calculated by relayoutFields.
  */
  isEmpty: NO,
  
  /**
  Called by fields when their emptiness changes.

  Always triggers (at end of run loop) a relayout of fields.
  */
  emptinessDidChangeFor: function(child)
  {
    this.invokeOnce("_calculateEmptiness");
  },

  /**
  Reevaluates emptiness
  */
  _calculateEmptiness: function()
  {
    // in short, we get the display fields, if we come across one that is visible and not empty
    // we cannot be empty.
    var views = this.get("childViews"),
    len = views.length;
    
    var empty = YES;
    for (var i = 0; i < len; i++)
    {
      var field = views[i];
      if (!field.get("isEmpty") && field.get("isVisible"))
      {
        empty = NO;
        break;
      }
    }

    this.setIfChanged("isEmpty", empty);
  }.observes("_displayFields"),

  emptinessDidChange: function()
  {
    var parentView = this.get("parentView");
    if (parentView && parentView.emptinessDidChangeFor) parentView.emptinessDidChangeFor(this);
  }.observes("isEmpty"),


  /**
  Called when emptiness changes, to recalculate hiddenness.
  */
  hiddenCouldChange: function()
  {
    var visible = YES;
    if (!this.get("isEditing") && this.get("autoHide") && this.get("isEmpty")) visible = NO;

    if (visible !== this.get("isVisible"))
    {
      this.set("isVisible", visible);
      this.relayoutFields();
    }
  }.observes("autoHide", "isEmpty")
};
/* >>>>>>>>>> BEGIN source/mixins/edit_mode.js */
/**
  Handles propagation of a property inEditMode to all child views.
*/
SC.FormsEditMode = {
  
  /**
    Walks like a duck.
  */
  hasEditMode: YES,
  
  /**
    Whether we are in edit mode.
  */
  isEditing: NO,
  
  /**
    Handles changes to edit state. Alerts children.
  */
  editModeDidChange: function(){
    this._propagateEditMode();    
  }.observes("isEditing"),
  
  /**
    Ensures that edit mode is passed to all children.
  */
  _scfem_childViewsDidChange: function() {
    this._propagateEditMode();
  }.observes("childViews"),
  
  /**
    Propagates edit mode.
  */
  _propagateEditMode: function() {
    var isEditing = this.get("isEditing");
    var cv = this.get("childViews"), idx, len = cv.length, v;
    for (idx = 0; idx < len; idx++) {
      v = cv[idx];
      if (SC.typeOf(v) === SC.T_STRING || v.isClass) return;
      if (v.get("hasEditMode")) v.set("isEditing", isEditing);
    }
  }
  
};
/* >>>>>>>>>> BEGIN source/renderers/form.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since Quilmes
*/

SC.BaseTheme.renderers.Form = SC.Renderer.extend({
  formFlowSpacing: { left: 5, top: 5, bottom: 5, right: 5 },
  
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
    
  }
});
SC.BaseTheme.renderers.form = SC.BaseTheme.renderers.Form.create();
/* >>>>>>>>>> BEGIN source/renderers/form_row.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since Quilmes
*/

SC.BaseTheme.renderers.FormRow = SC.Renderer.extend({
  rowFlowSpacing: { right: 15, left: 0, top: 0, bottom: 0 },
  rowFlowPadding: { left: 0, right: 0 , bottom: 0, top: 0 },
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
    
  }
});
SC.BaseTheme.renderers.formRow = SC.BaseTheme.renderers.FormRow.create();
/* >>>>>>>>>> BEGIN source/views/form_row.js */
// ==========================================================================
// Project:   Forms.FormRowView
// Copyright: ©2009 Alex Iskander and TPSi.
// ==========================================================================
/*globals Forms */

/** @class
	Represents a single row in a form. Rows have label and any number of other child views.

	
	@extends SC.FormView
	@author Alex Iskander
*/
require("mixins/auto_hide");
require("mixins/edit_mode");
SC.FormRowView = SC.View.extend(SC.FlowedLayout, SC.FormsAutoHide, SC.FormsEditMode,
/** @scope Forms.FormRowView.prototype */ {
  flowSize: { widthPercentage: 1 },

  rowFlowSpacing: SC.FROM_THEME,
  rowFlowSpacingDefault: { right: 15, left: 0, top: 0, bottom: 0 },
  
  rowFlowPadding: SC.FROM_THEME,
  rowFlowPaddingDefault: { right: 0, left: 0, top: 0, bottom: 0 },
  
  defaultFlowSpacing: function() {
    return this.themed("rowFlowSpacing");
  }.property("rowFlowSpacing", "theme"),
  
  flowPadding: function() {
    return this.themed("rowFlowPadding");
  }.property("rowFlowPadding", "theme"),
  
  classNames: ["sc-form-row-view"],
  
  /**
    Walks like a duck.
  */
	isFormRow: YES,
	
	/**
	  The label for the row (string label)
	*/
	label: "",
	
	/**
	  The current size of the labels.
	*/
	rowLabelSize: 0,
	
	/**
	  The current measured size of the label.
	*/
	rowLabelMeasuredSize: 0,
	
	/**
	  A value set so that FormView knows to tell us about the row label size change.
	*/
	hasRowLabel: YES,
	
	/**
	  The label view.
	*/
	labelView: null,
	
	/**
	  Direction of the flow.
	*/
	layoutDirection: SC.LAYOUT_HORIZONTAL,
	
  /**
  Updates keys, content, etc. on fields. Also, handles our "special" field (only-one case)
  */
  createChildViews: function()
  {
    // keep array of keys so we can pass on key to child.
    var cv = SC.clone(this.get("childViews"));
    
    // add label
    if (this.labelView.isClass) {
      this.labelView = this.createChildView(this.labelView, {
        value: this.get("label")
      });
      this.labelView.addObserver("measuredSize", this, "labelSizeDidChange");
      this.get("childViews").unshift(this.labelView);
    }
    
    var content = this.get("content");
    
    arguments.callee.base.apply(this,arguments);
    
    // now, do the actual passing it
    var idx, len = cv.length, key, v;
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      
      // if the view was originally declared as a string, then we have something to give it
      if (SC.typeOf(key) === SC.T_STRING) {
        // try to get the actual view
        v = this.get(key);
        
        // see if it does indeed exist, and if it doesn't have a value already
        if (v && !v.isClass) {
          if (!v.get("contentValueKey")) {
            //
            // NOTE: WE HAVE A SPECIAL CASE
            //       If this is the single field, pass through our contentValueKey
            if (key === "_singleField")  {
              v.set("contentValueKey", this.get("contentValueKey"));
            } else {
              v.set("contentValueKey", key);
            }
          }
          if (!v.get("content")) {
            v.bind('content', '.owner.content') ;
          }
          // Bind the value property of the view to the 'contentValueKey' property of content.
          var vKey = v.get('contentValueKey') ;
          if (vKey && !v.get('value')) {
            v.bind('value', '.content.'+vKey) ;
          }
        }
        
      }
    }
    

  },
  
  labelDidChange: function() {
    this.get("labelView").set("value", this.get("label"));
  }.observes("label"),
  
  labelSizeDidChange: function() {
    var size = this.get("labelView").get("measuredSize");
    this.set("rowLabelMeasuredSize", size.width);
    
    // alert parent view if it is a row delegate
    var pv = this.get("parentView");
    if (pv && pv.get("isRowDelegate")) pv.rowLabelMeasuredSizeDidChange(this, size);
  },
  
  rowLabelSizeDidChange: function() {
    this.get("labelView").adjust({
      "width": this.get("rowLabelSize")
    });
  }.observes("rowLabelSize"),
  
  
  //
  // RENDERING
  //
  createRenderer: function(t) { return t.formRow(); },
  updateRenderer: function(r) {}
  
});

SC.FormRowView.mixin({
	row: function(label, fieldType, ext)
	{
	  if (label.isClass) {
	    ext = fieldType;
	    fieldType = label;
	    label = null;
	  }
		// now, create a hash (will be used by the parent form's exampleRow)
		if (!ext) ext = {};
		ext.label = label;
		ext.childViews = ["_singleField"];
		ext._singleField = fieldType;
		return ext;
	},
	
	LabelView: SC.LabelView.extend(SC.AutoResize, {
	  shouldAutoResize: NO, // only change the measuredSize so we can update.
	  layout: { left:0, top:0, width: 0, height: 18 },
	  fillHeight: YES,
	  classNames: ["sc-form-label"]
	})
});

SC.FormRowView.prototype.labelView = SC.FormRowView.LabelView.design();

/* >>>>>>>>>> BEGIN source/views/form.js */
// ==========================================================================
// Project:   SC.FormView
// Copyright: ©2009 Alex Iskander and TPSi
// ==========================================================================
/*globals Forms */

/** @class
FormView
FormView is a lot like a normal view. However, in addition to the childViews
collection, it has a fields collection. The items referenced here are NOT
just children; they are explicity stated in the array fields, which works
just like childViews, but marks fields to be laid out automatically.

Usually, you will place rows into the FormView:
{{{
childViews: "fullName gender".w(),
contentBinding: 'MyApp.personController',

fullName: SC.FormView.row("Name:", SC.TextFieldView.extend({
  layout: {height: 20, width: 150}
})),

gender: SC.FormView.row("Gender:", SC.RadioView.design({
  layout: {width: 150, height: 40, centerY: 0},
  items: ["male", "female"]
}))
}}}

The name of the row (ie. 'fullName'), is passed down to the *FieldView, and used as the key
to bind the value property to the content. In this case it will bind content.fullName to the
value property of the textFieldView. Easy!

One important thing about the field collection: It can contain any type of
view, including other FormViews or subclasses of FormView.

This is important, because this is how you make nice rows that have a
label and a field: these rows are actually subclasses of FormView itself.

h2. Editing
The form does not allow editing by default; editing must be started by calling
beginEditing.


@extends SC.View
@implements SC.Editable
*/
require("mixins/auto_hide");
require("mixins/edit_mode");
require("views/form_row");
SC.FormView = SC.View.extend(SC.FlowedLayout, SC.FormsAutoHide, SC.FormsEditMode, /** @scope SC.FormView.prototype */ {
  layoutDirection: SC.LAYOUT_HORIZONTAL, canWrap: YES,
  
  formFlowSpacing: SC.FROM_THEME,
  formFlowSpacingDefault: { left: 5, top: 5, bottom: 5, right: 5 },
  
  defaultFlowSpacing: function() {
    return this.themed("formFlowSpacing");
  }.property("formFlowSpacing", "theme"),
  
  classNames: ["sc-form-view"],

  /**
  Whether to automatically start editing.
  */
  editsByDefault: YES,

  /**
  The input key view (to set previousKeyView for the first row, field, or sub-form).

  For fields, this will likely be the field itself.
  */
  firstKeyView: null,

  /**
  The output key view.
  */
  lastKeyView: null,

  /**
  The content to bind the form to. This content object is passed to all children.
  
  All child views, if added at design time via string-based childViews array, will get their
  contentValueKey set to their string. Note that SC.RowView passes on its contentValueKey to its
  child field if it doesn't have its own, and if its isNested property is YES, uses it to find its
  own content object.
  */
  content: null,
  
  /**
    Rows in the form do not have to be full objects at load time. They can also be simple hashes
    which are then passed to exampleRow.extend.
  */
  exampleRow: SC.FormRowView.extend({
    labelView: SC.FormRowView.LabelView.extend({ textAlign: SC.ALIGN_RIGHT })
  }),

  /**
  Init function.
  */
  init: function()
  {
    if (this.get("editsByDefault")) this.set("isEditing", YES);
    arguments.callee.base.apply(this,arguments);
  },

  /**
  Calls _updateFields to load the fields.
  */
  createChildViews: function()
  {
    // keep array of keys so we can pass on key to child.
    var cv = SC.clone(this.get("childViews"));
    var idx, len = cv.length, key, v, exampleRow = this.get("exampleRow");
    
    // preprocess to handle templated rows (rows that use exampleRow to initialize)
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      if (SC.typeOf(key) === SC.T_STRING) {
        v = this.get(key);
        if (v && !v.isClass && SC.typeOf(v) === SC.T_HASH) {
          this[key] = exampleRow.extend(v);
        }
      }
    }
    
    // We need to add in contentValueKey before we call sc_super
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      if (SC.typeOf(key) === SC.T_STRING) {
        v = this.get(key);
        if (!v.prototype.contentValueKey) {
          v.prototype.contentValueKey = key ;
        }
      }
    }
    
    // get content for further ops
    var content = this.get("content");
    arguments.callee.base.apply(this,arguments);
    
    // now, do the actual passing it
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      
      // if the view was originally declared as a string, then we have something to give it
      if (SC.typeOf(key) === SC.T_STRING) {
        // try to get the actual view
        v = this.get(key);
        
        // see if it does indeed exist, and if it doesn't have a value already
        if (v && !v.isClass) {
          // set content
          if (!v.get("content")) {
            v.bind('content', '.owner.content') ;
          }
          // set label (if possible)
          if (v.get("isFormRow") && SC.none(v.get("label"))) {
            v.set("label", key.humanize().titleize());
          }
        }
      }
    }
    
    // our internal bookeeping to prevent .
    this._hasCreatedRows = YES;
    
  },

  
  /**
    Allows rows to use this to track label width.
  */
  isRowDelegate: YES,
  
  /**
    The current row label width.
  */
  recalculateLabelWidth: function() {
    if (!this._hasCreatedRows) return;
    
    var ret = 0;
    
    // calculate by looping through child views and getting size (if possible)
    var children = this.get("childViews"), idx, len = children.length, child;
    for (idx = 0; idx < len; idx++) {
      child = children[idx];
      
      // if it has a measurable row label
      if (child.get("rowLabelMeasuredSize")) {
        ret = Math.max(child.get("rowLabelMeasuredSize"), ret);
      }
    }
    
    // now set for all children
    if (this._rowLabelSize !== ret) {
      this._rowLabelSize = ret;
      
      // set by looping throuhg child views
      for (idx = 0; idx < len; idx++) {
        child = children[idx];

        // if it has a measurable row label
        if (child.get("hasRowLabel")) {
          child.set("rowLabelSize", ret);
        }
      }
      
    }
  },
  
  /**
    Rows call this when their label width changes.
  */
  rowLabelMeasuredSizeDidChange: function(row, labelSize) {
    this.invokeOnce("recalculateLabelWidth");
  },
  
  
  //
  // RENDERING
  //
  createRenderer: function(t) { return t.form(); },
  updateRenderer: function(r) {}
});

SC.mixin(SC.FormView, {
  /**
  Creates a form row.

  Can be called in two ways: row(optionalClass, properties), which creates
  a field with the properties, and puts it in a new row;
  and row(properties), which creates a new row—and it is up to you to add
  any fields you want in the row.
  
  You can also supply some properties to extend the row itself with.
  */
  row: function(optionalClass, properties, rowExt)
  {
    return SC.FormRowView.row(optionalClass, properties, rowExt);
  },

  /**
  Creates a field.

  Behind the scenes, this wraps the fieldClass in a FormFieldView—usually a
  specialized variant of FormFieldView meant specifically to wrap that class.

  You can add your own special variants of FormFieldView if you want to expose
  special features of your own view by calling FormFieldView.registerWrapper.
  */
  field: function(fieldClass, properties)
  {
    return SC.FormFieldView.field(fieldClass, properties);
  }
});
/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/forms');
