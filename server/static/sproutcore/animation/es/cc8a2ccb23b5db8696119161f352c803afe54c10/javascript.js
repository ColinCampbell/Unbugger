SC.Animatable={isAnimatable:YES,transitions:{},concatenatedProperties:["transitions"],style:{},_cssTransitionFor:{left:"left",top:"top",right:"right",bottom:"bottom",width:"width",height:"height",opacity:"opacity",transform:"transform"},_styleProperties:["opacity","display","transform"],_layoutStyles:"width height top bottom marginLeft marginTop left right zIndex minWidth maxWidth minHeight maxHeight centerX centerY".w(),_animationsToStart:{},_animationOrder:["top","left","bottom","right","width","height","centerX","centerY","opacity","display","transform"],initMixin:function(){this._animatable_original_didCreateLayer=this.didCreateLayer||function(){};
this.didCreateLayer=this._animatable_didCreateLayer;this._animatable_original_willDestroyLayer=this.willDestroyLayer||function(){};
this.willDestroyLayer=this._animatable_willDestroyLayer;this._animatable_original_willRemoveFromParent=this.willRemoveFromParent||function(){};
this.willRemoveFromParent=this._animatable_will_remove_from_parent;this._animateTickPixel.displayName="animate-tick";
var b;if(SC.isArray(this.transitions)){var a={};for(b=0;b<this.transitions.length;
b++){SC.mixin(a,this.transitions[b])}this.transitions=a}for(b in this.transitions){if(typeof this.transitions[b]=="number"){this.transitions[b]={duration:this.transitions[b]}
}}this._animatableCurrentStyle=null;this._animators={};this._animatableSetCSS="";
this._last_transition_css="";this._disableAnimation=0;this._transitionCallbacks={};
if(!SC.none(this.get("layer"))){var c=this._animatable_original_didCreateLayer;this._animatable_original_didCreateLayer=function(){};
this.didCreateLayer();this._animatable_original_didCreateLayer=c}},_animatable_didCreateLayer:function(){this.resetAnimation();
SC.Event.add(this.get("layer"),"webkitTransitionEnd",this,this.transitionEnd);SC.Event.add(this.get("layer"),"transitionend",this,this.transitionEnd);
return this._animatable_original_didCreateLayer()},_animatable_willDestroyLayer:function(){SC.Event.remove(this.get("layer"),"webkitTransitionEnd",this,this.transitionEnd);
SC.Event.remove(this.get("layer"),"transitionend",this,this.transitionEnd);return this._animatable_original_willDestroyLayer()
},_animatable_will_remove_from_parent:function(){this.resetAnimation()},disableAnimation:function(){this._disableAnimation++
},enableAnimation:function(){this._disableAnimation--;if(this._disableAnimation<0){this._disableAnimation=0
}},adjust:function(k,l){if(!SC.none(l)){var m=k;k={};k[m]=l}else{k=SC.clone(k)}var a=SC.clone(this.get("style")),c=NO,g=SC.clone(this.get("layout")),b=NO;
var n=this._styleProperties;for(var e in k){var h=NO;var j=(n.indexOf(e)>=0)?a:g;
var d=j[e],f=k[e];if(f!==undefined&&d!==f){if(f===null){if(d!==undefined){h=YES}delete j[e]
}else{j[e]=f;h=YES}}if(h){if(j===a){c=YES}else{b=YES}}}if(c){this.set("style",a)}if(b){this.set("layout",g)
}return this},transitionEnd:function(a){SC.RunLoop.begin();var b=a.originalEvent.propertyName,c=this._transitionCallbacks[b];
if(c){SC.Animatable.runCallback(c)}SC.RunLoop.end()},getCurrentJavaScriptStyles:function(){return this._animatableCurrentStyle
},resetAnimation:function(){this._animatableCurrentStyle=null;this._stopJavaScriptAnimations();
this.disableAnimation();this.updateStyle();this.enableAnimation();this.updateStyle()
},_stopJavaScriptAnimations:function(){for(var a in this._animators){if(this._animators[a]&&this._animators[a].isQueued){SC.Animatable.removeTimer(this._animators[a])
}}},_getStartStyleHash:function(h,g){var e=this.layout;this.layout=h;var d=this.computeParentDimensions();
var c=this.computeFrameWithParentFrame(d);this.layout=e;var a={};for(var b in g){if(c){if(b=="left"){a[b]=c.x;
continue}else{if(b=="top"){a[b]=c.y;continue}else{if(b=="right"){a[b]=d.width-c.x-c.width;
continue}else{if(b=="bottom"){a[b]=d.height-c.y-c.height;continue}else{if(b=="width"){a[b]=c.width;
continue}else{if(b=="height"){a[b]=c.height;continue}else{if(b=="centerX"){a[b]=c.x+(c.width/2)-(d.width/2);
continue}else{if(b=="centerY"){a[b]=c.y+(c.height/2)-(d.height/2);continue}}}}}}}}}if(SC.none(a[b])){if(!SC.none(h[b])){a[b]=h[b]
}else{a[b]=g[b]}}}return a},_TMP_CSS_TRANSITIONS:[],cssTimingStringFor:function(c){var b="linear";
if(c.timing||SC.Animatable.defaultTimingFunction){var a=c.timing||SC.Animatable.defaultTimingFunction;
if(SC.typeOf(a)!=SC.T_STRING){b="cubic-bezier("+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+")"
}else{b=a}}return b},updateStyle:function(){var y=this.get("layer");var o=this.get("style");
var m=NO,e="";if(SC.Animatable.enableCSSTransforms&&this.transitions.left&&this.transitions.top&&this.transitions.left.duration===this.transitions.top.duration&&this.transitions.left.timing===this.transitions.top.timing&&(SC.none(o.right)||o.right==="")&&(SC.none(o.bottom)||o.bottom==="")){m=YES;
this._useSpecialCaseTransform=YES}else{this._useSpecialCaseTransform=NO}var v;if(!this._animatableCurrentStyle||this._disableAnimation>0||!y){this._animatableSetCSS="";
this._animatableCurrentStyle={};for(v in o){if(v[0]!="_"){this._animatableCurrentStyle[v]=o[v]
}}if(y){this._animatableApplyStyles(y,o)}return this}if(!y){return}var n=true;for(v in o){if(v[0]=="_"){continue
}if(o[v]!=this._animatableCurrentStyle[v]){n=false;break}}if(n){return this}var d=this._getStartStyleHash(this._animatableCurrentStyle,o);
var f={};var q;var g=this._TMP_CSS_TRANSITIONS;if(SC.Animatable.enableCSSTransitions){var k;
if(m){m=YES;k=this.cssTimingStringFor(this.transitions.left);g.push("-webkit-transform "+this.transitions.left.duration+"s "+k)
}for(v in this.transitions){if(!this._cssTransitionFor[v]){continue}if(m&&(v=="left"||v=="top")){if(this.transitions.left.action){this._transitionCallbacks["-webkit-transform"]={source:this,target:(this.transitions.left.target||this),action:this.transitions.left.action}
}if(this.transitions.top.action){this._transitionCallbacks["-webkit-transform"]={source:this,target:(this.transitions.right.target||this),action:this.transitions.right.action}
}continue}k=this.cssTimingStringFor(this.transitions[v]);g.push(this._cssTransitionFor[v]+" "+this.transitions[v].duration+"s "+k)
}}for(v in o){if(v[0]=="_"){continue}var c=!this.transitions[v]||o[v]==d[v];if(v=="display"&&o[v]!="none"){c=true
}if(c){d[v]=o[v];var x=this._animators[v];if(x){x.endValue=o[v];x.end=0}continue}if(SC.Animatable.enableCSSTransitions&&this._cssTransitionFor[v]){f[v]=o[v];
if(this.transitions[v].action){this._transitionCallbacks[v]={source:this,target:(this.transitions[v].target||this),action:this.transitions[v].action}
}continue}var u=this._animateTickPixel,b=v,p=d[v],j=o[v];if(b=="centerX"||b=="centerY"){u=this._animateTickCenter
}else{if(b=="opacity"){u=this._animateTickNumber}else{if(b=="display"){u=this._animateTickDisplay
}}}if(!this._animators[v]){this._animators[v]={}}var w=this._animators[v];w.start=null;
w.duration=Math.floor(this.transitions[v].duration*1000);w.startValue=p;w.endValue=j;
w.layer=y;w.property=b;w.action=u;w.style=y.style;w.holder=this;if(this.transitions[v].action){w.callback={source:this,target:(this.transitions[v].target||this),action:this.transitions[v].action}
}q=this.transitions[v].timing||SC.Animatable.defaultTimingFunction;if(q&&SC.typeOf(q)!=SC.T_STRING){w.timingFunction=q
}if(!w.going){this._animationsToStart[v]=w}}var r=this._animationOrder,s=this._animationOrder.length;
for(v=0;v<s;v++){var t=r[v];if(this._animationsToStart[t]){SC.Animatable.addTimer(this._animationsToStart[t]);
delete this._animationsToStart[t]}}var h=g.join(",");g.length="";this._animatableSetCSS=h;
this._animatableApplyStyles(y,d,f);return this}.observes("style"),_style_opacity_helper:function(c,a,b){c.opacity=b.opacity;
c.mozOpacity=b.opacity},_animatableApplyStyles:function(b,c,a){if(!b){return}var e=NO;
if(c.display&&b.style.display!==c.display){b.style.display=c.display;e=YES}if(this._animatableSetCSS!=this._last_transition_css){b.style["-webkit-transition"]=this._animatableSetCSS;
b.style["-moz-transition"]=this._animatableSetCSS;this._last_transition_css=this._animatableSetCSS;
e=YES}if(!this._animators["display-styles"]){this._animators["display-styles"]={}
}var d=this._animators["display-styles"];d.holder=this;d.action=this._animatableApplyNonDisplayStylesFromTimer;
d.inLoopAction=this._animatableApplyNonDisplayStyles;d.layer=b;d.styles=c;d.delayed=a;
this._animatableCurrentStyle=c;if(this._disableAnimation>0){d.inLoopAction()}else{SC.Animatable.addTimer(d)
}},_animatableApplyNonDisplayStylesFromTimer:function(){SC.RunLoop.begin();this.inLoopAction();
SC.RunLoop.end()},_animatableApplyNonDisplayStyles:function(){var g=this.layer,k=this.holder._animatableCurrentStyle;
var d={opacity:this.holder._style_opacity_helper};var h={},l=NO,a=g.style;var b="";
for(var f in k){if(f=="display"){continue}if(this.holder._layoutStyles.indexOf(f)>=0){if(this.holder._useSpecialCaseTransform&&f==="left"){h[f]=0;
b+="translateX("+k[f]+"px) ";l=YES;continue}else{if(this.holder._useSpecialCaseTransform&&f==="top"){h[f]=0;
b+="translateY("+k[f]+"px) ";l=YES;continue}}h[f]=k[f];l=YES;continue}else{if(f=="transform"){b+=" "+k[f]
}else{if(d[f]){d[f](a,f,k)}else{a[f]=k[f]}}}}a.webkitTransform=b;if(l){var c=this.holder.layout;
this.holder.layout=h;this.holder.notifyPropertyChange("layoutStyle");var e=this.holder.get("layoutStyle");
for(var j in e){if(SC.none(e[j])){a[j]=""}else{if(a[j]!=e[j]){a[j]=e[j]}}}this.holder.layout=c
}if(this.delayed){SC.mixin(this.holder._animatableCurrentStyle,this.delayed);this.styles=this.delayed;
this.delayed=undefined;if(this._disableAnimation>0){this.inLoopAction()}else{SC.Animatable.addTimer(this)
}}},updateLayout:function(c,a){var b=SC.clone(this.get("style"));var g=this.get("layout");
var d=0,e=this._layoutStyles,h=e.length,f=NO;for(d=0;d<h;d++){var j=e[d];if(b[j]!==g[j]){if(SC.none(g[j])){b[j]=undefined
}else{b[j]=g[j]}f=YES}}if(f){this.style=b;this.updateStyle()}return this},_solveBezierForT:function(b,p,m,l,f,d,n,e){var o=1/(200*e);
var k,j,h,c,a,g;for(h=n,g=0;g<8;g++){c=((b*h+m)*h+f)*h-n;if(Math.abs(c)<o){return h
}a=(3*b*h+2*m)*h+f;if(Math.abs(a)<Math.pow(10,-6)){break}h=h-c/a}k=0;j=1;h=n;if(h<k){return k
}if(h>j){return j}while(k<j){c=((b*h+m)*h+f)*h;if(Math.abs(c-n)<o){return h}if(n>c){k=h
}else{j=h}h=(j-k)*0.5+k}return h},_solveBezier:function(c,b,j,i,k,e){var f=3*c;var h=3*(j-c)-f;
var a=1-f-h;var d=3*b;var g=3*(i-b)-d;var m=1-d-g;var l=this._solveBezierForT(a,m,h,g,f,d,k,e);
return((m*l+g)*l+d)*l},_animateTickPixel:function(m){if(SC.none(this.start)){this.start=m;
this.end=this.start+this.duration}var n=this.start,g=this.end;var l=this.startValue,j=this.endValue;
var h=g-n;var b=j-l;var i=m-n;var f=Math.min(i/h,1);if(this.timingFunction){var a=this.timingFunction;
f=this.holder._solveBezier(a[0],a[1],a[2],a[3],f,h)}var k=Math.floor(l+(b*f));this.holder._animatableCurrentStyle[this.property]=k;
this.style[this.property]=k+"px";if(m<g){SC.Animatable.addTimer(this)}else{this.going=false;
if(this.callback){SC.Animatable.runCallback(this.callback)}this.styles=null;this.layer=null
}},_animateTickDisplay:function(a){if(SC.none(this.start)){this.start=a;this.end=this.start+this.duration
}var b=this.end;if(a<b){SC.Animatable.addTimer(this);return}this.holder._animatableCurrentStyle[this.property]=this.endValue;
this.style[this.property]=this.endValue;this.going=false;if(this.callback){SC.Animatable.runCallback(this.callback)
}this.styles=null;this.layer=null},_animateTickNumber:function(m){if(SC.none(this.start)){this.start=m;
this.end=this.start+this.duration}var n=this.start,g=this.end;var l=this.startValue,j=this.endValue;
var h=g-n;var b=j-l;var i=m-n;var f=Math.min(i/h,1);if(this.timingFunction){var a=this.timingFunction;
f=this.holder._solveBezier(a[0],a[1],a[2],a[3],f,h)}var k=Math.round((l+(b*f))*100)/100;
this.holder._animatableCurrentStyle[this.property]=k;this.style[this.property]=k;
if(this.property=="opacity"){this.style.zoom=1}if(m<g){SC.Animatable.addTimer(this)
}else{this.going=false;if(this.callback){SC.Animatable.runCallback(this.callback)
}this.styles=null;this.layer=null}},_animateTickCenter:function(o){if(SC.none(this.start)){this.start=o;
this.end=this.start+this.duration}var p=this.start,h=this.end;var n=this.startValue,k=this.endValue;
var i=h-p;var f=k-n;var j=o-p;var g=Math.min(j/i,1);if(this.timingFunction){var b=this.timingFunction;
g=this.holder._solveBezier(b[0],b[1],b[2],b[3],g,i)}var m=n+(f*g);this.holder._animatableCurrentStyle[this.property]=m;
var l,a;if(this.property=="centerX"){l="width";a="marginLeft"}else{l="height";a="marginTop"
}this.style[a]=Math.round(m-(this.holder._animatableCurrentStyle[l]/2))+"px";if(o<h){SC.Animatable.addTimer(this)
}else{this.going=false;if(this.callback){SC.Animatable.runCallback(this.callback)
}this.styles=null;this.layer=null}}};SC.mixin(SC.Animatable,{NAMESPACE:"SC.Animatable",VERSION:"0.1.0",TRANSITION_NONE:"linear",TRANSITION_CSS_EASE:"ease",TRANSITION_CSS_EASE_IN:"ease-in",TRANSITION_CSS_EASE_OUT:"ease-out",TRANSITION_CSS_EASE_IN_OUT:"ease-in-out",TRANSITION_EASE:[0.25,0.1,0.25,1],TRANSITION_LINEAR:[0,0,1,1],TRANSITION_EASE_IN:[0.42,0,1,1],TRANSITION_EASE_OUT:[0,0,0.58,1],TRANSITION_EASE_IN_OUT:[0.42,0,0.58,1],defaultTimingFunction:null,baseTimer:{next:null},going:false,_ticks:0,_timer_start_time:null,interval:10,currentTime:new Date().getTime(),enableCSSTransitions:NO,enableCSSTransforms:NO,stats:SC.Object.create({lastFPS:0}),addTimer:function(a){if(a.isQueued){return
}a.prev=SC.Animatable.baseTimer;a.next=SC.Animatable.baseTimer.next;if(SC.Animatable.baseTimer.next){SC.Animatable.baseTimer.next.prev=a
}SC.Animatable.baseTimer.next=a;a.isQueued=true;if(!SC.Animatable.going){SC.Animatable.start()
}},removeTimer:function(a){if(!a.isQueued){return}if(a.next){a.next.prev=a.prev}a.prev.next=a.next;
a.isQueued=false},start:function(){SC.Animatable._ticks=0;SC.Animatable._timer_start_time=new Date().getTime();
SC.Animatable.going=true;setTimeout(function(){SC.Animatable.timeout()},SC.Animatable.interval)
},timeout:function(){SC.Animatable.currentTime=new Date().getTime();var h=SC.Animatable.currentTime;
var f=SC.Animatable.baseTimer.next;SC.Animatable.baseTimer.next=null;var e=0;while(f){var d=f.next;
f.isQueued=false;f.next=null;f.prev=null;f.action.call(f,h);f=d;e++}if(SC.Animatable._ticks<1000000){SC.Animatable._ticks++
}var c=new Date().getTime();var b=c-h;if(SC.Animatable.baseTimer.next){setTimeout(function(){SC.Animatable.timeout()
},Math.max(0,SC.Animatable.interval-b))}else{SC.Animatable.going=false;var g=c-SC.Animatable._timer_start_time;
var a=SC.RunLoop.begin();SC.Animatable.stats.set("lastFPS",SC.Animatable._ticks/(g/1000));
a.end()}},runCallback:function(f){var a=SC.typeOf(f.action);if(a==SC.T_FUNCTION){f.action.call(f.target,f.source)
}else{if(a===SC.T_STRING){if(f.action.indexOf(".")>=0){var e=f.action.split(".");
var c=e.pop();var d=SC.objectForPropertyPath(e,window);var b=d.get?d.get(c):d[c];
if(b&&SC.typeOf(b)==SC.T_FUNCTION){b.call(d,f.source)}else{throw"SC.Animator could not find a function at %@".fmt(f.action)
}}else{SC.RootResponder.responder.sendAction(f.action,f.target,f.source)}}}}});(function(){var g=NO,h=NO,a=NO;
var e=document.createElement("div");var f=["-moz-","-moz-","-o-","-ms-","-webkit-"];
var b=["moz","Moz","o","ms","webkit"];var d="",c=null;for(c=0;c<f.length;c++){d+=f[c]+"transition:all 1s linear;";
d+=f[c]+"transform: translate(1px, 1px);";d+=f[c]+"perspective: 500px;"}e.style.cssText=d;
for(c=0;c<b.length;c++){if(e.style[b[c]+"TransitionProperty"]!==undefined){h=YES}if(e.style[b[c]+"Transform"]!==undefined){SC.Animatable._cssTransitionFor.transform=f[c]+"transform";
g=YES}if(e.style[b[c]+"Perspective"]!==undefined||e.style[b[c]+"PerspectiveProperty"]!==undefined){a=YES
}}if(window.media&&window.media.matchMedium){if(!window.media.matchMedium("(-webkit-transform-3d)")){a=NO
}}else{if(window.styleMedia&&window.styleMedia.matchMedium){if(!window.styleMedia.matchMedium("(-webkit-transform-3d)")){a=NO
}}}SC.Animatable.enableCSSTransitions=h;SC.Animatable.enableCSSTransforms=g;SC.Animatable.enableCSS3DTransforms=a
})();if((typeof SC!=="undefined")&&SC&&SC.bundleDidLoad){SC.bundleDidLoad("sproutcore/animation")
};