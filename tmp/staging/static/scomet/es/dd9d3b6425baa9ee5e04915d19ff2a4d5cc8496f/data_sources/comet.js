// ==========================================================================
// Project:   Unbugger
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals SComet */

/** @class

  Receives data from a comet server.
  
  @extends SC.DataSource
*/
SComet.Comet = SC.DataSource.create(
  /** @scope SComet.Comet.prototype */ {

  _lastTimeAsked: null,
  
  _response: null,
  
  _store: null,
  
  _query: null,
    
  isEnabledDidChange: function(target, key, value, propertyRevision) {
    if (SComet.userDefaults.get('isEnabled')) {
      this.fetch(this._store, this._query);
    } else if (!SC.none(this._response)) {
      SC.Request.manager.cancel(this._response);
    }
  }.observes('SComet.userDefaults.isEnabled'),
  
  fetch: function(store, query) {
    var url = query.get('url');
    
    // need to save store/query so re-enabling restarts fetch properly
    this._store = store;
    this._query = query;
    
    if (!SC.none(url)) {
      url += !SC.none(this._lastTimeAsked) ? "?since=" + this._lastTimeAsked : "";
      if (this._response) SC.Request.manager.cancel(this._response); 
      this._response = SC.Request.getUrl(url)
        .json()
        .notify(this, 'didFetch', store, query)
        .send();
      return YES;
    } else {
      return NO;
    }
  },
  
  didFetch: function(response, store, query) {
    if (SC.ok(response)) {
      var recs = response.get('body');
      var storeKeys = store.loadRecords(query.get('recordType'), recs.isEnumerable ? recs : [recs]);
      
      if (query.get('location') === SC.Query.LOCAL) {
        store.dataSourceDidFetchQuery(query);
      } else if (query.get('location') === SC.Query.REMOTE) {
        store.loadQueryResults(query, storeKeys);
      }
      
      this._lastTimeAsked = Date.now();
    }
    // sc-server sends a 500 response after 60s, denoting a timeout
    // we don't want to listen to sc-server in that case
    else if (response.status !== 500) {
      store.dataSourceDidErrorQuery(query);
    }
    
    if (SComet.userDefaults.get('isEnabled')) {
      this.fetch(store, query);
    }
  }
}) ;
