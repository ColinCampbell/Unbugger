/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project:   CoreTools Strings
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals CoreTools */

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file!
//
SC.stringsFor('English', {
  // "_String Key": "Localized String"
}) ;

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   CoreTools
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals CoreTools */

/** @namespace

  This framework contains common code shared by the SproutCore developer tools
  including the test runner, doc viewer and welcome apps.  It is not generally
  intended for use in your own applications.
  
  @extends SC.Object
*/
CoreTools = SC.Object.create( /** @scope CoreTools.prototype */ {

  NAMESPACE: 'CoreTools',
  VERSION: '1.0.0'
  
}) ;

/* >>>>>>>>>> BEGIN source/data_source.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CoreTools */

/**
  This DataSource connects to the SproutCore sc-server to retrieve targets
  and tests.  Currently this DataSource is read only.
*/
CoreTools.DataSource = SC.DataSource.extend({

  /**
    Fetch a group of records from the data source.  Knows how to fetch 
    a list of targets and tests.
  */
  fetch: function(store, query) {
    var ret = NO;
    switch(query.get('recordType')) {
      case CoreTools.Target:
        ret = this.fetchTargets(store, query);
        break;
      case CoreTools.Test:
        ret = this.fetchTests(store, query);
        break;
    }
    
    return ret;
  },
  
  // ..........................................................
  // FETCHING TARGETS
  // 
  
  /**
    Fetch the actual targets.  Only understands how to handle a remote query.
  */
  fetchTargets: function(store, query) {
    
    if (!query.get('isRemote')) return NO ; 
    
    SC.Request.getUrl('/sc/targets.json')
      .set('isJSON', YES)
      .notify(this, 'fetchTargetsDidComplete', { query: query, store: store })
      .send();
    return YES ;
  },
  
  fetchTargetsDidComplete: function(request, opts) {
    var response = request.get('response'),
        query    = opts.query,
        store    = opts.store,
        storeKeys;
        
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching targets fails");
    } else {
      storeKeys = store.loadRecords(CoreTools.Target, response);
      store.loadQueryResults(query, storeKeys);
    }
  },
  
  // ..........................................................
  // FETCHING TESTS
  // 

  /**
    Load tests for a particular URL.  Only understands local querys with a
    URL.
  */
  fetchTests: function(store, query) {
    var url = query.get('url') ;
        
    if (!query.get('isRemote') || !url) return NO ; // not handled
    
    SC.Request.getUrl(url)
      .set('isJSON', YES)
      .notify(this, 'fetchTestsDidComplete', { query: query, store: store })
      .send();
    return YES ;
  },
  
  fetchTestsDidComplete: function(request, opts) {
    var response = request.get('response'),
        store    = opts.store,
        query    = opts.query,
        storeKeys;
        
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching tests fails");
    } else {
      storeKeys = store.loadRecords(CoreTools.Test, response);
      store.loadQueryResults(query, storeKeys); // notify query loaded
    }
  }
  
});
/* >>>>>>>>>> BEGIN source/models/target.js */
// ==========================================================================
// Project:   CoreTools.Target
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals CoreTools */

/** @class

  Describes a target in the build system.

  @extends SC.Record
*/
CoreTools.Target = SC.Record.extend(
/** @scope CoreTools.Target.prototype */ {

  primaryKey: "name",
  
  /**
    Name of target.  This is also the primary key.
  */
  name: SC.Record.attr(String),
  
  /**
    Parent of target.  Only non-null for nested targets.
  */
  parent: SC.Record.toOne("CoreTools.Target"),

  /**
    URL to use to load tests.
  */
  testsUrl: SC.Record.attr(String, { key: "link_tests" }),
  
  /**  
    URL to use to load the app.  If no an app, returns null
  */
  appUrl: function() {
    return (this.get('kind') === 'app') ? this.get('name') : null;
  }.property('kind', 'name').cacheable(),
  
  /**
    The isExpanded state.  Defaults to NO on load.
  */
  isExpanded: SC.Record.attr(Boolean, { defaultValue: NO }),
  
  /**
    Children of this target.  Computed by getting the loaded targets
  */
  children: function() {
    var store = this.get('store'),
        query = CoreTools.TARGETS_QUERY,
        ret   = store.find(query).filterProperty('parent', this);
        
    if (ret) ret = ret.sortProperty('kind', 'displayName');
    return (ret && ret.get('length')>0) ? ret : null ;
  }.property().cacheable(),
  
  /**
    Display name for this target
  */
  displayName: function() {
    var name = (this.get('name') || '(unknown)').split('/');
    return name[name.length-1];
  }.property('name').cacheable(),
  
  /**
    The icon to display.  Based on the type.
  */
  targetIcon: function() {
    var ret = 'sc-icon-document-16';
    switch(this.get('kind')) {
      case "framework":
        ret = 'sc-icon-folder-16';
        break;
        
      case "app":
        ret = 'sc-icon-options-16';
        break;
    }
    return ret ;
  }.property('kind').cacheable(),
  
  /**
    This is the group key used to display.  Will be the kind unless the item
    belongs to the sproutcore target.
  */
  sortKind: function() {
    if (this.get('name') === '/sproutcore') return null;
    var parent = this.get('parent');
    if (parent && (parent.get('name') === '/sproutcore')) return 'sproutcore';
    else return (this.get('kind') || 'unknown').toLowerCase();
  }.property('kind', 'parent').cacheable(),
  
  
  testsQuery: function() {
    return SC.Query.remote(CoreTools.Test, { url: this.get('testsUrl') });
  }.property('testsUrl').cacheable(),
  
  /**
    Returns all of the tests associated with this target by fetching the
    testsUrl.
  */
  tests: function() {
    return this.get('store').find(this.get('testsQuery'));
  }.property('testsQuery').cacheable()
  
}) ;

CoreTools.TARGETS_QUERY = SC.Query.remote(CoreTools.Target);

/* >>>>>>>>>> BEGIN source/models/test.js */
// ==========================================================================
// Project:   CoreTools.Test
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals CoreTools */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
CoreTools.Test = SC.Record.extend(
/** @scope CoreTools.Test.prototype */ {

  primaryKey: "url",
  
  /**
    The filename for this test.
  */
  filename: SC.Record.attr(String),
  
  /**
    The test URL.
  */
  url: SC.Record.attr(String),

  /**
    Display name to show in the tests UI.  This is computed by removing some
    generic cruft from the filename.
  */
  displayName: function() {
    return (this.get('filename') || '').replace(/^tests\//,'');
  }.property('filename').cacheable(),

  /**
    Test icon.  To be replaced eventually with actual pass|fail icons
  */
  icon: 'sc-icon-document-16',

  /**
    Shows the "branch" at the right of the list.  Eventually this will be
    computed based on whether the test is a summary of other tests or not.
  */
  isRunnable: YES
  
}) ;

/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/core_tools');
