/* >>>>>>>>>> BEGIN bundle_info.js */
        ;(function() {
          var target_name = 'sproutcore/ace' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 
          
          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/empty_theme'],
            styles:   ['/static/sproutcore/ace/en/72f11e2cfc904a03b71e3cbfb76260b2661b3692/stylesheet-packed.css','/static/sproutcore/ace/en/72f11e2cfc904a03b71e3cbfb76260b2661b3692/stylesheet.css'],
            scripts:  ['/static/sproutcore/ace/en/72f11e2cfc904a03b71e3cbfb76260b2661b3692/javascript-packed.js','/static/sproutcore/ace/en/72f11e2cfc904a03b71e3cbfb76260b2661b3692/javascript.js']
          }
        })();

/* >>>>>>>>>> BEGIN source/core.js */
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

/* >>>>>>>>>> BEGIN source/controllers/categories.js */
// ==========================================================================
// Project:   TestControls.categoriesController
// ==========================================================================
/*globals TestControls */

/** @class
  @extends SC.CategoriesController
*/
TestControls.rootCategory = SC.Object.create({
  treeItemIsExpanded: YES,
  treeItemChildren: [
    SC.Object.create({
      treeItemIsExpanded: YES,
      group: true,
      name: "Controls",
      treeItemChildren: [
        SC.Object.create({
          name: "Buttons",
          show: "buttons_page"
        }),
        SC.Object.create({
          name: "Checkboxes",
          show: "checkboxes_page"
        }),
        SC.Object.create({
          name: "Progress",
          show: "progress_page"
        }),
        SC.Object.create({
          name: "Radio",
          show: "radio_page"
        }),
        SC.Object.create({
          name: "Segmented Button",
          show: "segmented_page"
        }),
        SC.Object.create({
          name: "Select Button",
          show: "select_page"
        }),
        SC.Object.create({
          name: "Tabbed View",
          show: "tab_page"
        })
      ]
    }),
    SC.Object.create({
      treeItemIsExpanded: YES,
      group: true,
      name: "Collections",
      treeItemChildren: [
        SC.Object.create({
          name: "List",
          show: "list_page"
        })
      ]
    }),
    
    SC.Object.create({
      treeItemIsExpanded: YES,
      group: true,
      name: "Fields",
      treeItemChildren: [
        SC.Object.create({
          name: "Text Field",
          show: "text_field_page"
        })
      ]
    }),
    
    SC.Object.create({
      treeItemIsExpanded: YES,
      group: true,
      name: "Layout",
      treeItemChildren: [
        SC.Object.create({
          name: "Flow Layout",
          show: "flow_layout_page"
        })
      ]
    }),
    
    SC.Object.create({
      treeItemIsExpanded: YES,
      group: true,
      name: "Scroll",
      treeItemChildren: [
        SC.Object.create({
          name: "Simple",
          show: "scroll_page"
        })
      ]
    })
    
  ]
});

TestControls.categoriesController = SC.TreeController.create(
/** @scope SampleControls.appController.prototype */ {
  treeItemIsGrouped: YES
}) ;

/* >>>>>>>>>> BEGIN source/controllers/category.js */
// ==========================================================================
// Project:   TestControls.categoryController
// ==========================================================================
/*globals TestControls */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
TestControls.categoryController = SC.ObjectController.create(
/** @scope SampleControls.categoryController.prototype */ {
  contentBinding: "TestControls.categoriesController.selection",
  contentBindingDefault: SC.Binding.single(),
  
  nowShowing: "welcome",
  
  delayShow: function() {
    // wait a moment before loading to let things finish...
    this.invokeLater(this.set, 50, "nowShowing", this.get("show") || "welcome");
    this.hideMasterPicker();
  }.observes("show"),
  
  hideMasterPicker: function() {
    TestControls.mainPage.mainPane.split.hideMasterPicker();
  }
}) ;

/* >>>>>>>>>> BEGIN source/resources/strings.js */
// ==========================================================================
// SampleControls English Strings
// ==========================================================================

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file!
//
SC.stringsFor('en',{
  
  "Loc.Title": "Localized Title!",
  "Loc.Label": "Localized Label!",
  
 // Global
  "Class": "Class",
 // TabView
  "Welcome_tab": "Welcome",
  "Collections_tab": "Collections",
  "Collections2_tab": "Collections2",
  "Buttons_tab": "Buttons",
  "Panes_tab": "Panes",
  "Forms_tab": "Forms",
  "Icons_tab": "Icons",

 // Text body.rhtml
  "Title_body": "Sample Controls",
  "Text_body": "SproutCore comes bundled with a wide array of controls that you can use in your own applications. Most of these controls can be created very easily using the built-in view helper functions. Consult the source code of this application for samples code to use in your own application.",

 // Text collections.rhtml

 // Text collections2.rhtml

 // Text forms.rhtml
  "Title_forms": "Forms",
  "Text_forms": "SproutCore has built in support for form validation, and for buffering form input into a controller before it is committed to your backend model. The examples below show the built in validators and variety of controls that are supported.",
  "FName_forms": "First Name",
  "LName_forms": "Last Name",
  "Email_forms": "Email",
  "PNumber_forms": "Phone Number",
  "CCard_forms": "Credit Card",
  "Address_forms": "Address",
  "Crazinnes_forms": "Crazinness",

  // Text Buttons form.rhtml
   "Submit_buttom_forms": "Submit",
   "Cancel_buttom_forms": "Cancel",
   "SChanges_buttom_forms": "Save Changes"
}) ;

/* >>>>>>>>>> BEGIN source/resources/buttons_page.js */
/*globals TestControls Forms*/
TestControls.buttonsPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    delaysContentTouches: NO,
    
    contentView: SC.FormView.design({
      flowPadding: { left: 20, top: 10, bottom: 40, right: 20 },
      classNames: ["sample_controls"],
      childViews: "header small normal huge jumbo smallToggle normalToggle hugeToggle jumboToggle disabledSmall disabledNormal disabledHuge disabledJumbo space disclosureHeader disclosureClosed disclosureOpen".w(),
      header: SC.LabelView.design({
        layout: {width: 200, height: 24 },
        classNames: "header".w(),
        value: "Buttons"
      }),
      normal: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 24, width: 100 },
        title: "Click Me"
      })),

      small: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 18, width: 100 },
        title: "Click Me"
      })),

      huge: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 30, width: 100 },
        title: "Click Me"
      })),

      jumbo: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 44, width: 100 },
        title: "Click Me"
      })),
      
      normalToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 24, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),

      smallToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 18, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),

      hugeToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 30, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),

      jumboToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 44, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),
      
      disabledSmall: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 18, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
      })),
      
      disabledNormal: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 24, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
      })),
      
      disabledHuge: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 30, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
      })),
      
      disabledJumbo: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 44, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
      })),
      
      space: SC.View.design({
        flowSize: { widthPercentage: 1, height: 24 }
      }),
      disclosureHeader: SC.LabelView.design({
        layout: { width: 400, height: 24 },
        classNames: "header".w(),
        value: "Disclosure Buttons"
      }),
      disclosureClosed: SC.FormView.row(SC.DisclosureView.design({
        layout: { height: 24, width: 100 },
        title: "Disclosure Closed",
        value: NO
      })),
      disclosureOpen: SC.FormView.row(SC.DisclosureView.design({
        layout: { height: 24, width: 150 },
        title: "Disclosure Open",
        value: YES
      }))
    })
  })
});
/* >>>>>>>>>> BEGIN source/resources/checkboxes_page.js */
/*globals TestControls Forms*/
TestControls.checkboxesPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header small normal disabled multiple".w(),
    
    header: SC.LabelView.design({
      layout: { width: 200, height: 24 },
      classNames: "header".w(),
      value: "Checkboxes"
    }),
    
    small: SC.FormView.row(SC.CheckboxView.design({
      layout: {width: 150, height: 24},
      title: "Check Me",
      controlSize: SC.SMALL_CONTROL_SIZE
    })),
    
    normal: SC.FormView.row(SC.CheckboxView.design({
      layout: { width: 150, height: 24 },
      title: "Check Me"
    })),
    
    disabled: SC.FormView.row(SC.CheckboxView.design({
      layout: { width: 150, height: 24 },
      isEnabled: NO,
      title: "Don't Check Me"
    })),
    
    multiple: SC.FormView.row(SC.CheckboxView.design({
      layout: { width: 150, height: 24 },
      value: [YES, NO],
      title: "Multiple? Really?"
    }))
  })
});
/* >>>>>>>>>> BEGIN source/resources/flow_layout_page.js */
/*globals TestControls Forms*/
TestControls.flowLayoutPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal vertical".w(),
    header: SC.LabelView.design({
      layout: { width: 300, height: 24 },
      classNames: "header".w(),
      value: "Flow Layout"
    }),
    normal: SC.FormView.row(SC.View.extend(SC.Animatable, SC.FlowedLayout, SC.AutoMixin, {
      isSpacer: YES,
      
      init: function() {
        arguments.callee.base.apply(this,arguments);
        this.style.overflow = "visible";
        SC.Timer.schedule({
          target: this,
          action: "hideOne",
          interval: 1000,
          repeats: YES
        });
      },
      
      hideOne: function() {
        if (this._hasHidden) this.b.set("isVisible", YES);
        else this.b.set("isVisible", NO);
        this._hasHidden = !this._hasHidden;
      },
      
      autoMixins: [SC.Animatable, {
        transitions: { left: 0.25, top: 0.25, width: 0.25 }
      }],
      
      childViews: "a s b s2 c d".w(),
      layout: { width: 600 },
      align: SC.ALIGN_RIGHT,
      layoutDirection: SC.LAYOUT_HORIZONTAL,
      defaultFlowSpacing: {
        left: 10, top: 10, right: 10, bottom: 0
      },
      a: SC.ButtonView.design({ flowSpacing: { top: 5, left: 4, right: 3, bottom: 2 }, layout: {width: 150, height: 24}, title: "a" }),
      s: SC.View.design({ isSpacer: YES, spaceUnits: 2, backgroundColor: "gray", layout: {width: 0, height: 24} }),
      b: SC.ButtonView.design({ layout: {width: 190, height: 24}, title: "b" }),
      s2: SC.View.design({ isSpacer: YES, spaceUnits: 1, backgroundColor: "gray", layout: {width: 0, height: 24} }),
      c: SC.ButtonView.design({ layout: {width: 120, height: 24 }, title: "c" }),
      d: SC.ButtonView.design({ layout: {width: 200, height: 24 }, title: "d" })
    })),
    
    vertical: SC.FormView.row(SC.View.extend(SC.FlowedLayout, {
      layout: { height: 100 },
      childViews: "a s b s2 c d".w(),
      isSpacer: YES,
      
      layoutDirection: SC.LAYOUT_VERTICAL,
      align: SC.ALIGN_CENTER,
      defaultFlowSpacing: {
        left: 10, top: 10, right: 10, bottom: 0
      },
      a: SC.ButtonView.design({ flowSpacing: { top: 5, left: 4, right: 3, bottom: 2 }, layout: {width: 150, height: 24}, title: "a" }),
      s: SC.View.design({ layout: { }, isSpacer: YES, spaceUnits: 2 }),
      b: SC.ButtonView.design({ layout: {width: 190, height: 24}, title: "b" }),
      s2: SC.View.design({ layout: { }, isSpacer: YES, spaceUnits: 1 }),
      c: SC.ButtonView.design({ layout: {width: 120, height: 24 }, title: "c" }),
      d: SC.ButtonView.design({ layout: {width: 200, height: 24 }, title: "d" })
    }))
  })
});
/* >>>>>>>>>> BEGIN source/resources/list_page.js */
/*globals TestControls Forms*/
TestControls.listPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    backgroundColor: "white",
    contentView: SC.ListView.design({
      hasContentIcon: YES,
      hasContentRightIcon: YES,
      contentIconKey: "icon",
      contentRightIconKey: "rightIcon",
      contentCheckboxKey: "isChecked",
      contentUnreadCountKey: "unread",
      
      
      classNames: ['big-list'],
      rowHeight: 44,
      content: function() {
        var idx = 0, ret = [];
        for (idx = 0; idx < 1000; idx++) {
          ret.push(SC.Object.create({
            "title": "Item " + idx,
            "icon": "sc-icon-document-16",
            "unread": idx,
            rightIcon: "sc-icon-info-16",
            isChecked: YES
          }));
        }
        return ret;
      }.property().cacheable(),
      contentValueKey: "title"
    })
  })
});
/* >>>>>>>>>> BEGIN source/resources/progress_page.js */
/*globals TestControls Forms*/
TestControls.progressPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    
    childViews: "header normal disabled".w(),
    
    // Plain Views
    header: SC.LabelView.design({
      layout: { width: 250, height: 18 },
      value: "Progress Bars",
      classNames: "header".w()
    }),
    
    // RAW
    normal: SC.FormRowView.design({
      // rowDelegate: automatically calculated because parent.isRowDelegate
      label: "Normal", // Also, FormView can set this automatically by going over childViews.
      
      childViews: "progress".w(), // this is what makes this rather tedious...
      progress: SC.ProgressView.design({
        layout: { height: 20, width: 200 },
        value: 0.25
      })
    }),
    
    // Helper
    disabled: SC.FormView.row(SC.ProgressView.design({
      layout: { height: 20, width: 200 },
      isEnabled: NO      
    }))
  })
});
/* >>>>>>>>>> BEGIN source/resources/radio_page.js */
/*globals TestControls Forms*/
TestControls.radioPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled multiple".w(),
    header: SC.LabelView.design({
      classNames: "header".w(),
      value: "Radio Views"
    }),
    normal: SC.FormView.row(SC.RadioView.design({
      layout: { width: 150, height: 60},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    })),
    disabled: SC.FormView.row(SC.RadioView.design({
      layout: { width: 150, height: 60},
      isEnabled: NO,
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: "one"
    })),
    multiple: SC.FormView.row(SC.RadioView.design({
      layout: {width: 150, height: 60},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "three"]
    }))
  })
});
/* >>>>>>>>>> BEGIN source/resources/select_page.js */
/*globals TestControls Forms*/
TestControls.selectPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled".w(),
    header: SC.LabelView.design({
      classNames: "header".w(),
      value: "Select Views"
    }),
    normal: SC.FormView.row(SC.SelectView.design({
      layout: { width: 150, height: 24 },
      items: [
        {"name": "Printer A", "value": "printer:a"},
        {"name": "Printer B", "value": "printer:b"},
        {"name": "Printer C", "value": "printer:c"},
        {"separator": YES, name: "none" },
        {"name": "Printer D", "value": "printer:d"},
        {"name": "Printer E", "value": "printer:e"},
        {"name": "Printer F", "value": "printer:f"},
        {"name": "MICR 1", "value": "printer:m1"},
        {"name": "MICR 2", "value": "printer:m2"}
      ],
      itemTitleKey: "name", itemValueKey: "value", itemSeparatorKey: "separator",
      value: null
    })),
    disabled: SC.FormView.row(SC.SelectView.design({
      layout: { width: 150, height: 24 },
      
      controlSize: SC.REGULAR_CONTROL_SIZE,
      isEnabled: NO,
      
      items: [
        {"name": "Printer A", "value": "printer:a"},
        {"name": "Printer B", "value": "printer:b"},
        {"name": "Printer C", "value": "printer:c"},
        {"separator": YES, name: "none" },
        {"name": "Printer D", "value": "printer:d"},
        {"name": "Printer E", "value": "printer:e"},
        {"name": "Printer F", "value": "printer:f"},
        {"name": "MICR 1", "value": "printer:m1"},
        {"name": "MICR 2", "value": "printer:m2"}
      ],
      itemTitleKey: "name", itemValueKey: "value", itemSeparatorKey: "separator",
      value: null
    }))
  })
});
/* >>>>>>>>>> BEGIN source/resources/segmented_page.js */
/*globals TestControls Forms*/
TestControls.segmentedPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled multiple multiple_side_by_side".w(),
    
    header: SC.LabelView.design({
      layout: {width:300, height:24},
      classNames: "header".w(),
      value: "Segmented Views "
    }),
    
    normal: SC.FormView.row(SC.SegmentedView.design({
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    })),
    disabled: SC.FormView.row(SC.SegmentedView.design({
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      isEnabled: NO,
      items: [ { icon: "sc-icon-info-16", title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value", itemIconKey: "icon",
      value: "one"
    })),
    multiple: SC.FormView.row(SC.SegmentedView.design({
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "three"]
    })),
    
    multiple_side_by_side: SC.FormView.row(SC.SegmentedView.design({
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "two"]
    }))
  })
});
/* >>>>>>>>>> BEGIN source/resources/text_field_page.js */
/*globals TestControls Forms*/
TestControls.textFieldPage = SC.View.design({
  childViews: "form".w(),
  form: SC.ScrollView.design({
    
    
    contentView: SC.FormView.design({
      theme: "iphone-form",
    
      classNames: ["sample_controls"],
      layout: { left: 20, top: 40, right: 20, bottom: 40 },
      childViews: "header normal disabled".w(),
    
      header: SC.LabelView.design({
        layout: { width: 200, height: 44 },
        classNames: "header".w(),
        value: "Text Fields"
      }),
    
      normal: SC.FormView.row(SC.TextFieldView.design({
        layout: { left: 0, width: 150, height: 44, centerY: 0},
        value: "Text",
        isSpacer: YES
      }), { classNames: ["first"] }),
    
      disabled: SC.FormView.row(SC.TextFieldView.design({
        layout: { left: 0, width: 150, height: 44, centerY: 0},
        isEnabled: NO,
        value: "Disabled"
      }))
    })
  })
});

/* >>>>>>>>>> BEGIN source/resources/scroll_page.js */
/*globals TestControls Forms*/
TestControls.scrollPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    contentView: SC.FormView.design({
      flowPadding: { top: 0, bottom: 100, right: 0, left: 0},
      classNames: ["sample_controls"],
      layout: { left: 20, top: 40, right: 20, bottom: 40 },
      childViews: "header list incrementalList imageList".w(),
      header: SC.LabelView.design({
        layout: { width: 300, height: 24 },
        classNames: "header".w(),
        value: "Scroll Views"
      }),
      list: SC.FormView.row(SC.ScrollView.design({
        backgroundColor: "white",
        flowSize: { width: 320, height: 460 },
        contentView: SC.ListView.design({
          computeNowShowing: function() {
            return this.get('allContentIndexes');
          },
          classNames: ['big-list'],
          rowHeight: 44,
          content: function() {
            var idx = 0, ret = [];
            for (idx = 0; idx < 100; idx++) {
              ret.push(SC.Object.create({"title": "Item " + idx}));
            }
            return ret;
          }.property().cacheable(),
          contentValueKey: "title"
        })
      })),
      incrementalList: SC.FormView.row(SC.ScrollView.design({
        backgroundColor: "white",
        flowSize: { width: 320, height: 460 },
        contentView: SC.ListView.design({
          classNames: ['big-list'],
          rowHeight: 44,
          content: function() {
            var idx = 0, ret = [];
            for (idx = 0; idx < 1000; idx++) {
              ret.push(SC.Object.create({"title": "Item " + idx}));
            }
            return ret;
          }.property().cacheable(),
          contentValueKey: "title"
        })
      })),
      imageList: SC.FormView.row(SC.ScrollView.design({
        backgroundColor: "gray",
        canScale: YES,
        flowSize: { width: 320, height: 460 },
        contentView: SC.ListView.design({
          classNames: ['big-list'],
          rowHeight: 44,
          content: function() {
            var idx = 0, ret = [];
            for (idx = 0; idx < 1000; idx++) {
              ret.push(SC.Object.create({"title": "Item " + idx}));
            }
            return ret;
          }.property().cacheable(),
          contentValueKey: "title"
        })
      }))
    })
  })
});
/* >>>>>>>>>> BEGIN source/resources/tab_page.js */
/*globals TestControls Forms*/
TestControls.tabPage = SC.View.design({
  childViews: "tabs".w(),
  tabs: SC.TabView.design({
    layout: { left: 100, top: 100, right: 100, bottom: 100 },
    items: ["Item 1", "Item 2", "Item 3"]
  })
});
/* >>>>>>>>>> BEGIN source/resources/main_page.js */
// ==========================================================================
// SampleControls
// copyright 2008 Sprout Systems, Inc.
// ==========================================================================
/*global TestControls tile Forms */

require("resources/progress_page");
require("resources/buttons_page");
require("resources/checkboxes_page");
require("resources/radio_page");
require("resources/select_page");
require("resources/segmented_page");
require("resources/text_field_page");
require("resources/flow_layout_page");
require("resources/scroll_page");
require("resources/list_page");
require("resources/tab_page");

TestControls.mainPage = SC.Page.create({
  
  mainPane: SC.MainPane.design(SC.Animatable, {
    childViews: "split".w(),
    
    split: SC.MasterDetailView.design ({
      classNames: [ window.navigator.standalone ? "round-toolbars" : "normal" ],
      autoHideMaster: YES,
      
      pickerPane: SC.PickerPane.extend(SC.Animatable, {
        transitions: { 
          opacity: { 
            duration: 0.25, 
            timing: SC.Animatable.TRANSITION_EASE_IN_OUT,
            action: function(){ 
              if (this.style.opacity === 0) this._call_when_done();
            } 
          }
        },
        style: { opacity: 1 },
        layout: { width: 250, height: 480 },
        theme: "popover",
        
        remove: function() {
          this._call_when_done = arguments.callee.base;
          this.adjust("opacity", 0);
        }
      }),
      
      masterView: SC.WorkspaceView.design({
        topToolbar: SC.ToolbarView.design({
          layout: { top: 0, left: 0, right: 0, height: 32 },
          childViews: "label".w(),
          label: SC.LabelView.design({
            layout: { left: 10, centerY: 0, height: 21, width: 200 },
            value: "Test Controls",
            classNames: "embossed".w()
          })
        }),
        
        contentView: SC.ScrollView.design({
          classNames: ["sc-source-list-background"],
          contentView: SC.SourceListView.design({
            layout: { left: 0, top: 0, right: 0, bottom: 0 },
            contentValueKey: "name",
            contentBinding: "TestControls.categoriesController.arrangedObjects",
            selectionBinding: "TestControls.categoriesController.selection"
          })
        })
      }),
      detailView: SC.WorkspaceView.design({
        topToolbar: SC.ToolbarView.design({
          layout: { top: 0, left: 0, right: 0, height: 32 },
          childViews: "showMaster label".w(),
          showMaster: SC.ButtonView.design({
            layout: { left: 7, centerY: 0, height: 30, width: 100 },
            controlSize: SC.AUTO_CONTROL_SIZE,
            isVisible: NO,
            isVisibleBinding: ".parentView.masterIsHidden",
            title: "Tests",
            action: "toggleMasterPicker"
          }),
          
          label: SC.LabelView.design({
            layout: { left: 120, centerY: 0, height: 21, width: 200 },
            value: "Test Controls",
            classNames: "embossed".w(),
            isVisible: NO,
            isVisibleBinding: SC.Binding.from(".parentView.masterIsHidden")
          })
        }),
        contentView: SC.ContainerView.design({
          nowShowingBinding: "TestControls.categoryController.nowShowing"
        })
      })
    })
  }),

  welcome: SC.LabelView.design({
    escapeHTML: NO,
    classNames: 'welcome-tab',
    value: "<h1>Test Controls</h1><p>SproutCore comes bundled with a wide array of controls that you can use in your own applications. Most of these controls can be created very easily using the built-in view helper functions. Consult the source code of this application for samples code to use in your own application.</p>"
  }),
  
  progress_page: TestControls.progressPage,
  
  buttons_page: TestControls.buttonsPage,
  
  checkboxes_page: TestControls.checkboxesPage,
  
  radio_page: TestControls.radioPage,
  
  select_page: TestControls.selectPage,
  
  text_field_page: TestControls.textFieldPage,
  
  segmented_page: TestControls.segmentedPage,
  
  flow_layout_page: TestControls.flowLayoutPage,
  
  scroll_page: TestControls.scrollPage,
  
  list_page: TestControls.listPage,
  
  tab_page: TestControls.tabPage
});

/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   TestControls
// ==========================================================================
/*globals TestControls */

TestControls.main = function main() {
  TestControls.getPath('mainPage.mainPane').append() ;
  TestControls.categoriesController.set("content", TestControls.rootCategory);
} ;

function main() { TestControls.main(); }

