SComet=SC.Object.create({NAMESPACE:"SComet",VERSION:"0.1.0",userDefaults:SC.UserDefaults.create({appDomain:"SComet"})});
SComet.userDefaults.defaults({"SComet:isEnabled":true});SComet.Comet=SC.DataSource.create({_lastTimeAsked:null,_response:null,_store:null,_query:null,isEnabledDidChange:function(d,b,c,a){if(SComet.userDefaults.get("isEnabled")){this.fetch(this._store,this._query)
}else{if(!SC.none(this._response)){SC.Request.manager.cancel(this._response)}}}.observes("SComet.userDefaults.isEnabled"),fetch:function(a,c){var b=c.get("url");
this._store=a;this._query=c;if(!SC.none(b)){b+=!SC.none(this._lastTimeAsked)?"?since="+this._lastTimeAsked:"";
if(this._response){SC.Request.manager.cancel(this._response)}this._response=SC.Request.getUrl(b).json().notify(this,"didFetch",a,c).send();
return YES}else{return NO}},didFetch:function(b,a,e){if(SC.ok(b)){var d=b.get("body");
var c=a.loadRecords(e.get("recordType"),d.isEnumerable?d:[d]);if(e.get("location")===SC.Query.LOCAL){a.dataSourceDidFetchQuery(e)
}else{if(e.get("location")===SC.Query.REMOTE){a.loadQueryResults(e,c)}}this._lastTimeAsked=Date.now()
}else{if(b.status!==500){a.dataSourceDidErrorQuery(e)}}if(SComet.userDefaults.get("isEnabled")){this.fetch(a,e)
}}});if((typeof SC!=="undefined")&&SC&&SC.bundleDidLoad){SC.bundleDidLoad("scomet")
};