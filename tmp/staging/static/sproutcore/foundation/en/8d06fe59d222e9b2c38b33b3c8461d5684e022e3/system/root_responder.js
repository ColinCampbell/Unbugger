// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/ready');

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/** @class

  The RootResponder captures events coming from a web browser and routes them
  to the correct view in the view hierarchy.  Usually you do not work with a
  RootResponder directly.  Instead you will work with Pane objects, which
  register themselves with the RootResponder as needed to receive events.

  h1. RootResponder and Platforms

  RootResponder contains core functionality common among the different web
  platforms. You will likely be working with a subclass of RootResponder that
  implements functionality unique to that platform.

  The correct instance of RootResponder is detected at runtime and loaded
  transparently.

  h1. Event Types

  RootResponders can route four types of events:

  - Direct events, such as mouse and touch events.  These are routed to the
    nearest view managing the target DOM elment. RootResponder also handles
    multitouch events so that they are delegated to the correct views.
  - Keyboard events. These are sent to the keyPane, which will then send the
    event to the current firstResponder and up the responder chain.
  - Resize events. When the viewport resizes, these events will be sent to all
    panes.
  - Keyboard shortcuts. Shortcuts are sent to the keyPane first, which
    will go down its view hierarchy. Then they go to the mainPane, which will
    go down its view hierarchy.
  - Actions. Actions are generic messages that your application can send in
    response to user action or other events. You can either specify an
    explicit target, or allow the action to traverse the hierarchy until a
    view is found that handles it.
*/
SC.RootResponder = SC.Object.extend({

  /**
    Contains a list of all panes currently visible on screen.  Everytime a
    pane attaches or detaches, it will update itself in this array.
  */
  panes: null,

  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.panes = SC.Set.create();
  },

  // .......................................................
  // MAIN PANE
  //

  /** @property
    The main pane.  This pane receives shortcuts and actions if the
    focusedPane does not respond to them.  There can be only one main pane.
    You can swap main panes by calling makeMainPane() here.

    Usually you will not need to edit the main pane directly.  Instead, you
    should use a MainPane subclass, which will automatically make itself main
    when you append it to the document.
  */
  mainPane: null,

  /**
    Swaps the main pane.  If the current main pane is also the key pane, then
    the new main pane will also be made key view automatically.  In addition
    to simply updating the mainPane property, this method will also notify the
    panes themselves that they will lose/gain their mainView status.

    Note that this method does not actually change the Pane's place in the
    document body.  That will be handled by the Pane itself.

    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMainPane: function(pane) {
    var currentMain = this.get('mainPane') ;
    if (currentMain === pane) return this ; // nothing to do

    this.beginPropertyChanges() ;

    // change key focus if needed.
    if (this.get('keyPane') === currentMain) this.makeKeyPane(pane) ;

    // change setting
    this.set('mainPane', pane) ;

    // notify panes.  This will allow them to remove themselves.
    if (currentMain) currentMain.blurMainTo(pane) ;
    if (pane) pane.focusMainFrom(currentMain) ;

    this.endPropertyChanges() ;
    return this ;
  },

  // ..........................................................
  // MENU PANE
  //

  /**
    The current menu pane. This pane receives keyboard events before all other
    panes, but tends to be transient, as it is only set when a pane is open.

    @type SC.MenuPane
  */
  menuPane: null,

  /**
    Sets a pane as the menu pane. All key events will be directed to this
    pane, but the current key pane will not lose focus.

    Usually you would not call this method directly, but allow instances of
    SC.MenuPane to manage the menu pane for you. If your pane does need to
    become menu pane, you should relinquish control by calling this method
    with a null parameter. Otherwise, key events will always be delivered to
    that pane.

    @param {SC.MenuPane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMenuPane: function(pane) {
    // Does the specified pane accept being the menu pane?  If not, there's
    // nothing to do.
    if (pane  &&  !pane.get('acceptsMenuPane')) {
      return this;
    } else {
      var currentMenu = this.get('menuPane');
      if (currentMenu === pane) return this; // nothing to do

      this.set('menuPane', pane);
    }

    return this;
  },

  // .......................................................
  // KEY PANE
  //

  /**
    The current key pane. This pane receives keyboard events, shortcuts, and
    actions first, unless a menu is open. This pane is usually the highest
    ordered pane or the mainPane.

    @type SC.Pane
  */
  keyPane: null,

  /** @property
    A stack of the previous key panes.

    *IMPORTANT: Property is not observable*
  */
  previousKeyPanes: [],

  /**
    Makes the passed pane the new key pane.  If you pass null or if the pane
    does not accept key focus, then key focus will transfer to the previous
    key pane (if it is still attached), and so on down the stack.  This will
    notify both the old pane and the new root View that key focus has changed.

    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeKeyPane: function(pane) {
    // Was a pane specified?
    var newKeyPane, previousKeyPane, previousKeyPanes ;

    if (pane) {
      // Does the specified pane accept being the key pane?  If not, there's
      // nothing to do.
      if (!pane.get('acceptsKeyPane')) {
        return this ;
      }
      else {
        // It does accept key pane status?  Then push the current keyPane to
        // the top of the stack and make the specified pane the new keyPane.
        // First, though, do a sanity-check to make sure it's not already the
        // key pane, in which case we have nothing to do.
        previousKeyPane = this.get('keyPane') ;
        if (previousKeyPane === pane) {
          return this ;
        }
        else {
          if (previousKeyPane) {
            previousKeyPanes = this.get('previousKeyPanes') ;
            previousKeyPanes.push(previousKeyPane) ;
          }

          newKeyPane = pane ;
        }
      }
    }
    else {
      // No pane was specified?  Then pop the previous key pane off the top of
      // the stack and make it the new key pane, assuming that it's still
      // attached and accepts key pane (its value for acceptsKeyPane might
      // have changed in the meantime).  Otherwise, we'll keep going up the
      // stack.
      previousKeyPane = this.get('keyPane') ;
      previousKeyPanes = this.get('previousKeyPanes') ;

      newKeyPane = null ;
      while (previousKeyPanes.length > 0) {
        var candidate = previousKeyPanes.pop();
        if (candidate.get('isPaneAttached')  &&  candidate.get('acceptsKeyPane')) {
          newKeyPane = candidate ;
          break ;
        }
      }
    }


    // If we found an appropriate candidate, make it the new key pane.
    // Otherwise, make the main pane the key pane (if it accepts it).
    if (!newKeyPane) {
      var mainPane = this.get('mainPane') ;
      if (mainPane && mainPane.get('acceptsKeyPane')) newKeyPane = mainPane ;
    }

    // now notify old and new key views of change after edit
    if (previousKeyPane) previousKeyPane.willLoseKeyPaneTo(newKeyPane) ;
    if (newKeyPane) newKeyPane.willBecomeKeyPaneFrom(previousKeyPane) ;

    this.set('keyPane', newKeyPane) ;

    if (newKeyPane) newKeyPane.didBecomeKeyPaneFrom(previousKeyPane) ;
    if (previousKeyPane) previousKeyPane.didLoseKeyPaneTo(newKeyPane) ;

    return this ;
  },

  // ..........................................................
  // VIEWPORT STATE
  //

  /**
    The last known window size.
    @type Rect
    @isReadOnly
  */
  currentWindowSize: null,

  /**
    Computes the window size from the DOM.

    @returns Rect
  */
  computeWindowSize: function() {
    var size ;
    if (window.innerHeight) {
      size = {
        width: window.innerWidth,
        height: window.innerHeight
      } ;

    } else if (document.documentElement && document.documentElement.clientHeight) {
      size = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      } ;

    } else if (document.body) {
      size = {
        width: document.body.clientWidth,
        height: document.body.clientHeight
      } ;
    }
    return size;
  },

  /**
    On window resize, notifies panes of the change.

    @returns {Boolean}
  */
  resize: function() {
    this._resize();
    //this.invokeLater(this._resize, 10);
    return YES; //always allow normal processing to continue.
  },

  _resize: function() {
    // calculate new window size...
    var newSize = this.computeWindowSize(), oldSize = this.get('currentWindowSize');
    this.set('currentWindowSize', newSize); // update size

    if (!SC.rectsEqual(newSize, oldSize)) {
      // notify panes
      if (this.panes) {
        SC.RunLoop.begin() ;
        this.panes.invoke('windowSizeDidChange', oldSize, newSize) ;
        SC.RunLoop.end() ;
      }
    }
  },

  /**
    Indicates whether or not the window currently has focus.  If you need
    to do something based on whether or not the window is in focus, you can
    setup a binding or observer to this property.  Note that the SproutCore
    automatically adds an sc-focus or sc-blur CSS class to the body tag as
    appropriate.  If you only care about changing the appearance of your
    controls, you should use those classes in your CSS rules instead.
  */
  hasFocus: NO,

  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class
    (removing sc-blur).  Also notify panes.
  */
  focus: function() {
    if (!this.get('hasFocus')) {
      SC.$('body').addClass('sc-focus').removeClass('sc-blur');

      SC.RunLoop.begin();
      this.set('hasFocus', YES);
      SC.RunLoop.end();
    }
    return YES ; // allow default
  },

  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class (removing
    sc-blur).  Also notify panes.
  */
  blur: function() {
    if (this.get('hasFocus')) {
      SC.$('body').addClass('sc-blur').removeClass('sc-focus');

      SC.RunLoop.begin();
      this.set('hasFocus', NO);
      SC.RunLoop.end();
    }
    return YES ; // allow default
  },

  dragDidStart: function(drag) {
    this._mouseDownView = drag ;
    this._drag = drag ;
  },

  // .......................................................
  // ACTIONS
  //

  /**
    Set this to a delegate object that can respond to actions as they are sent
    down the responder chain.

    @type SC.Object
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder.  This method will
    walk the responder chain, attempting to find a responder that implements
    the action name you pass to this method.  Set 'target' to null to search
    the responder chain.

    IMPORTANT: This method's API and implementation will likely change
    significantly after SproutCore 1.0 to match the version found in
    SC.ResponderContext.

    You generally should not call or override this method in your own
    applications.

    @param {String} action The action to perform - this is a method name.
    @param {SC.Responder} target object to set method to (can be null)
    @param {Object} sender The sender of the action
    @param {SC.Pane} pane optional pane to start search with
    @param {Object} context optional. only passed to ResponderContexts
    @returns {Boolean} YES if action was performed, NO otherwise
    @test in targetForAction
  */
  sendAction: function( action, target, sender, pane, context, firstResponder) {
    target = this.targetForAction(action, target, sender, pane, firstResponder) ;

    // HACK: If the target is a ResponderContext, forward the action.
    if (target && target.isResponderContext) {
      return !!target.sendAction(action, sender, context, firstResponder);
    } else return target && target.tryToPerform(action, sender);
  },

  _responderFor: function(target, methodName, firstResponder) {
    var defaultResponder = target ? target.get('defaultResponder') : null;

    if (target) {
      target = firstResponder || target.get('firstResponder') || target;
      do {
        if (target.respondsTo(methodName)) return target ;
      } while ((target = target.get('nextResponder'))) ;
    }

    // HACK: Eventually we need to normalize the sendAction() method between
    // this and the ResponderContext, but for the moment just look for a
    // ResponderContext as the defaultResponder and return it if present.
    if (typeof defaultResponder === SC.T_STRING) {
      defaultResponder = SC.objectForPropertyPath(defaultResponder);
    }

    if (!defaultResponder) return null;
    else if (defaultResponder.isResponderContext) return defaultResponder;
    else if (defaultResponder.respondsTo(methodName)) return defaultResponder;
    else return null;
  },

  /**
    Attempts to determine the initial target for a given action/target/sender
    tuple.  This is the method used by sendAction() to try to determine the
    correct target starting point for an action before trickling up the
    responder chain.

    You send actions for user interface events and for menu actions.

    This method returns an object if a starting target was found or null if no
    object could be found that responds to the target action.

    Passing an explicit target or pane constrains the target lookup to just
    them; the defaultResponder and other panes are *not* searched.

    @param {Object|String} target or null if no target is specified
    @param {String} method name for target
    @param {Object} sender optional sender
    @param {SC.Pane} optional pane
    @param {firstResponder} a first responder to use
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender, pane, firstResponder) {

    // 1. no action, no target...
    if (!methodName || (SC.typeOf(methodName) !== SC.T_STRING)) {
      return null ;
    }

    // 2. an explicit target was passed...
    if (target) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
      }

      if (target) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }

      return target ;
    }

    // 3. an explicit pane was passed...
    if (pane) {
      return this._responderFor(pane, methodName, firstResponder) ;
    }

    // 4. no target or pane passed... try to find target in the active panes
    // and the defaultResponder
    var keyPane = this.get('keyPane'), mainPane = this.get('mainPane') ;

    // ...check key and main panes first
    if (keyPane && (keyPane !== pane)) {
      target = this._responderFor(keyPane, methodName) ;
    }
    if (!target && mainPane && (mainPane !== keyPane)) {
      target = this._responderFor(mainPane, methodName) ;
    }

    // ...still no target? check the defaultResponder...
    if (!target && (target = this.get('defaultResponder'))) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
        if (target) this.set('defaultResponder', target) ; // cache if found
      }
      if (target) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }
    }

    return target ;
  },

  /**
    Finds the view that appears to be targeted by the passed event.  This only
    works on events with a valid target property.

    @param {SC.Event} evt
    @returns {SC.View} view instance or null
  */
  targetViewForEvent: function(evt) {
    return evt.target ? SC.$(evt.target).view()[0] : null ;
  },

  /**
    Attempts to send an event down the responder chain.  This method will
    invoke the sendEvent() method on either the keyPane or on the pane owning
    the target view you pass in.  It will also automatically begin and end
    a new run loop.

    If you want to trap additional events, you should use this method to
    send the event down the responder chain.

    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event or null if not handled
  */
  sendEvent: function(action, evt, target) {
    var pane, ret ;

    SC.RunLoop.begin() ;

    // get the target pane
    if (target) pane = target.get('pane') ;
    else pane = this.get('menuPane') || this.get('keyPane') || this.get('mainPane') ;

    // if we found a valid pane, send the event to it
    ret = (pane) ? pane.sendEvent(action, evt, target) : null ;

    SC.RunLoop.end() ;

    return ret ;
  },

  // .......................................................
  // EVENT LISTENER SETUP
  //

  /**
    Default method to add an event listener for the named event.  If you simply
    need to add listeners for a type of event, you can use this method as
    shorthand.  Pass an array of event types to listen for and the element to
    listen in.  A listener will only be added if a handler is actually installed
    on the RootResponder of the same name.

    @param {Array} keyNames
    @param {Element} target
    @returns {SC.RootResponder} receiver
  */
  listenFor: function(keyNames, target) {
    keyNames.forEach( function(keyName) {
      var method = this[keyName] ;
      if (method) SC.Event.add(target, keyName, this, method) ;
    },this) ;
    target = null ;
    return this ;
  },

  /**
    Called when the document is ready to begin handling events.  Setup event
    listeners in this method that you are interested in observing for your
    particular platform.  Be sure to call arguments.callee.base.apply(this,arguments).

    @returns {void}
  */
  setup: function() {
    // handle touch events
    this.listenFor('touchstart touchmove touchend touchcancel'.w(), document);

    // handle basic events
    this.listenFor('keydown keyup beforedeactivate mousedown mouseup click dblclick mouseout mouseover mousemove selectstart contextmenu'.w(), document)
        .listenFor('resize focus blur'.w(), window);

    // handle special case for keypress- you can't use normal listener to block the backspace key on Mozilla
    if (this.keypress) {
      if (SC.CAPTURE_BACKSPACE_KEY && SC.browser.mozilla) {
        var responder = this ;
        document.onkeypress = function(e) {
          e = SC.Event.normalizeEvent(e);
          return responder.keypress.call(responder, e);
        };

        SC.Event.add(window, 'unload', this, function() { document.onkeypress = null; }); // be sure to cleanup memory leaks

      // Otherwise, just add a normal event handler.
      } else SC.Event.add(document, 'keypress', this, this.keypress);
    }

    // handle these two events specially in IE
    'drag selectstart'.w().forEach(function(keyName) {
      var method = this[keyName] ;
      if (method) {
        if (SC.browser.msie) {
          var responder = this ;
          document.body['on' + keyName] = function(e) {
            // return method.call(responder, SC.Event.normalizeEvent(e));
            return method.call(responder, SC.Event.normalizeEvent(event || window.event)); // this is IE :(
          };

          // be sure to cleanup memory leaks
           SC.Event.add(window, 'unload', this, function() {
            document.body['on' + keyName] = null;
          });

        } else {
          SC.Event.add(document, keyName, this, method);
        }
      }
    }, this);

    // handle mousewheel specifically for FireFox
    var mousewheel = SC.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel';
    SC.Event.add(document, mousewheel, this, this.mousewheel);

    // do some initial set
    this.set('currentWindowSize', this.computeWindowSize()) ;
    this.focus(); // assume the window is focused when you load.

    // Monkey patch RunLoop if we're in MobileSafari
    var f = SC.RunLoop.prototype.endRunLoop, patch;

    patch = function() {
      // Call original endRunLoop implementation.
      if (f) f.apply(this, arguments);

      // This is a workaround for a bug in MobileSafari.
      // Specifically, if the target of a touchstart event is removed from the DOM,
      // you will not receive future touchmove or touchend events. What we do is, at the
      // end of every runloop, check to see if the target of any touches has been removed
      // from the DOM. If so, we re-append it to the DOM and hide it. We then mark the target
      // as having been moved, and it is de-allocated in the corresponding touchend event.
      var touches = SC.RootResponder.responder._touches, touch, elem, target, found = NO;
      if (touches) {
        // Iterate through the touches we're currently tracking
        for (touch in touches) {
          target = elem = touches[touch].target;

          // Travel up the hierarchy looking for the document body
          while (elem && (elem = elem.parentElement) && !found) {
            found = (elem === document.body);
          }

          // If we aren't part of the body, move the element back
          // but make sure we hide it from display.
          if (!found && target) {
            // Our target can sometimes be a text node, so get the parent node
            // if that's the case.
            if (target.nodeType === 3) target = target.parentElement;
            target.style.display = 'none';
            document.body.appendChild(target);
          }
        }
      }
    };
    SC.RunLoop.prototype.endRunLoop = patch;
  },
  
  // ................................................................................
  // TOUCH SUPPORT
  //
  /*
    This touch support is written to meet the following specifications. They are actually
    simple, but I decided to write out in great detail all of the rules so there would
    be no confusion.

    There are three events: touchStart, touchEnd, touchDragged. touchStart and End are called
    individually for each touch. touchDragged events are sent to whatever view owns the touch
    event
  */

  /**
    @private
    A map from views to internal touch entries.

    Note: the touch entries themselves also reference the views.
  */
  _touchedViews: {},

  /**
    @private
    A map from internal touch ids to the touch entries themselves.

    The touch entry ids currently come from the touch event's identifier.
  */
  _touches: {},

  /**
    Returns the touches that are registered to the specified view; undefined if none.

    When views receive a touch event, they have the option to subscribe to it.
    They are then mapped to touch events and vice-versa. This returns touches mapped to the view.
  */
  touchesForView: function(view) {
    if (this._touchedViews[SC.guidFor(view)]) {
      return this._touchedViews[SC.guidFor(view)].touches;
    }
  },

  /**
    Computes a hash with x, y, and d (distance) properties, containing the average position
    of all touches, and the average distance of all touches from that average.

    This is useful for implementing scaling.
  */
  averagedTouchesForView: function(view, added) {
    var t = this.touchesForView(view);
    if ((!t || t.length === 0) && !added) return {x: 0, y: 0, d: 0, touchCount: 0};

    // make array of touches
    var touches;
    if (t) touches = t.toArray();
    else touches = [];

    // add added if needed
    if (added) touches.push(added);

    // prepare variables for looping
    var idx, len = touches.length, touch,
        ax = 0, ay = 0, dx, dy, ad = 0;

    // first, add
    for (idx = 0; idx < len; idx++) {
      touch = touches[idx];
      ax += touch.pageX; ay += touch.pageY;
    }

    // now, average
    ax /= len;
    ay /= len;

    // distance
    for (idx = 0; idx < len; idx++) {
      touch = touches[idx];

      // get distance from average
      dx = Math.abs(touch.pageX - ax);
      dy = Math.abs(touch.pageY - ay);

      // Pythagoras was clever...
      ad += Math.pow(dx * dx + dy * dy, 0.5);
    }

    // average
    ad /= len;

    // return
    return {
      x: ax,
      y: ay,
      d: ad,
      touchCount: len
    };
  },

  assignTouch: function(touch, view) {
    // sanity-check
    if (touch.isDoneFor) throw "This touch is done for! Yet something tried to assign it.";
    
    // unassign from old view if necessary
    if (touch.view === view) return;
    if (touch.view) {
      this.unassignTouch(touch);
    }
    
    // create view entry if needed
    if (!this._touchedViews[SC.guidFor(view)]) {
      this._touchedViews[SC.guidFor(view)] = {
        view: view,
        touches: SC.CoreSet.create([]),
        touchCount: 0
      };
      view.set("hasTouch", YES);
    }

    // add touch
    touch.view = view;
    this._touchedViews[SC.guidFor(view)].touches.add(touch);
    this._touchedViews[SC.guidFor(view)].touchCount++;
  },

  unassignTouch: function(touch) {
    // find view entry
    var view, viewEntry;

    // get view
    if (!touch.view) return; // touch.view should===touch.touchResponder eventually :)
    view = touch.view;

    // get view entry
    viewEntry = this._touchedViews[SC.guidFor(view)];
    viewEntry.touches.remove(touch);
    viewEntry.touchCount--;

    // remove view entry if needed
    if (viewEntry.touchCount < 1) {
      view.set("hasTouch", NO);
      viewEntry.view = null;
      delete this._touchedViews[SC.guidFor(view)];
    }

    // clear view
    touch.view = undefined;
  },

  /**
    The touch responder for any given touch is the view which will receive touch events
    for that touch. Quite simple.

    makeTouchResponder takes a potential responder as an argument, and, by calling touchStart on each
    nextResponder, finds the actual responder. As a side-effect of how it does this, touchStart is called
    on the new responder before touchCancelled is called on the old one (touchStart has to accept the touch
    before it can be considered cancelled).

    You usually don't have to think about this at all. However, if you don't want your view to,
    for instance, prevent scrolling in a ScrollView, you need to make sure to transfer control
    back to the previous responder:

    if (Math.abs(touch.pageY - touch.startY) > this.MAX_SWIPE) touch.restoreLastTouchResponder();

    You don't call makeTouchResponder on RootResponder directly. Instead, it gets called for you
    when you return YES to captureTouch or touchStart.

    You do, however, use a form of makeTouchResponder to return to a previous touch responder. Consider
    a button view inside a ScrollView: if the touch moves too much, the button should give control back
    to the scroll view.

    if (Math.abs(touch.pageX - touch.startX) > 4) {
      if (touch.nextTouchResponder) touch.makeTouchResponder(touch.nextTouchResponder);
    }

    This will give control back to the containing view. Maybe you only want to do it if it is a ScrollView?

    if (Math.abs(touch.pageX - touch.startX) > 4 && touch.nextTouchResponder && touch.nextTouchResponder.isScrollable)
      touch.makeTouchResponder(touch.nextTouchResponder);

    Possible gotcha: while you can do touch.nextTouchResponder, the responders are not chained in a linked list like
    normal responders, because each touch has its own responder stack. To navigate through the stack (or, though
    it is not recommended, change it), use touch.touchResponders (the raw stack array).

    makeTouchResponder is called with an event object. However, it usually triggers custom touchStart/touchCancelled
    events on the views. The event object is passed so that functions such as stopPropagation may be called.
  */
  makeTouchResponder: function(touch, responder, shouldStack) {
    var stack = touch.touchResponders, touchesForView;

    // find the actual responder (if any, I suppose)
    // note that the pane's sendEvent function is slightly clever:
    // if the target is already touch responder, it will just return it without calling touchStart
    // we must do the same.
    if (touch.touchResponder === responder) return;

    // send touchStart
    // get the target pane
    var pane;
    if (responder) pane = responder.get('pane') ;
    else pane = this.get('keyPane') || this.get('mainPane') ;

    // if the responder is not already in the stack...
    
    if (stack.indexOf(responder) < 0) {
      // if we found a valid pane, send the event to it
      try {
        responder = (pane) ? pane.sendEvent("touchStart", touch, responder) : null ;
      } catch (e) {
        SC.Logger.error("Error in touchStart: " + e);
        responder = null;
      }
    }

    // and again, now that we have more detail.
    if (touch.touchResponder === responder) return;

    // if the item is in the stack, we will go to it (whether shouldStack is true or not)
    // as it is already stacked
    if (!shouldStack || (stack.indexOf(responder) > -1 && stack[stack.length - 1] !== responder)) {
      // first, we should unassign the touch. Note that we only do this IF WE ARE removing
      // the current touch responder. Otherwise we cause all sorts of headaches; why? Because,
      // if we are not (suppose, for instance, that it is stacked), then the touch does not
      // get passed back to the touch responder-- even while it continues to get events because
      // the touchResponder is still set!
      this.unassignTouch(touch);
      
      // pop all other items
      var idx = stack.length - 1, last = stack[idx];
      while (last && last !== responder) {
        // unassign the touch
        touchesForView = this.touchesForView(last); // won't even exist if there are no touches

        // send touchCancelled (or, don't, if the view doesn't accept multitouch and it is not the last touch)
        if (last.get("acceptsMultitouch") || !touchesForView) {
          last.tryToPerform("touchCancelled", touch);
        }

        // go to next (if < 0, it will be undefined, so lovely)
        idx--;
        last = stack[idx];

        // update responders (for consistency)
        stack.pop();

        touch.touchResponder = stack[idx];
        touch.nextTouchResponder = stack[idx - 1];
      }

    }

    // now that we've popped off, we can push on
    if (responder) {
      this.assignTouch(touch, responder);

      // keep in mind, it could be one we popped off _to_ above...
      if (responder !== touch.touchResponder) {
        stack.push(responder);

        // update responder helpers
        touch.touchResponder = responder;
        touch.nextTouchResponder = stack[stack.length - 2];
      }
    }
  },

  /**
    captureTouch is used to find the view to handle a touch. It starts at the starting point and works down
    to the touch's target, looking for a view which captures the touch. If no view is found, it uses the target
    view.

    Then, it triggers a touchStart event starting at whatever the found view was; this propagates up the view chain
    until a view responds YES. This view becomes the touch's owner.

    You usually do not call captureTouch, and if you do call it, you'd call it on the touch itself:
    touch.captureTouch(startingPoint, shouldStack)

    If shouldStack is YES, the previous responder will be kept so that it may be returned to later.
  */
  captureTouch: function(touch, startingPoint, shouldStack) {
    if (!startingPoint) startingPoint = this;

    var target = touch.targetView, view = target,
        chain = [], idx, len;

    if (SC.LOG_TOUCH_EVENTS) {
      SC.Logger.info('  -- Received one touch on %@'.fmt(target.toString()));
    }
    // work up the chain until we get the root
    while (view && (view !== startingPoint)) {
      chain.unshift(view);
      view = view.get('nextResponder');
    }

    // work down the chain
    for (len = chain.length, idx = 0; idx < len; idx++) {
      view = chain[idx];
      if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('  -- Checking %@ for captureTouch response…'.fmt(view.toString()));

      // see if it captured the touch
      if (view.tryToPerform('captureTouch', touch)) {
        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('   -- Making %@ touch responder because it returns YES to captureTouch'.fmt(view.toString()));

        // if so, make it the touch's responder
        this.makeTouchResponder(touch, view, shouldStack); // triggers touchStart/Cancel/etc. event.
        return; // and that's all we need
      }
    }

    // if we did not capture the touch (obviously we didn't)
    // we need to figure out what view _will_
    // Thankfully, makeTouchResponder does exactly that: starts at the view it is supplied and keeps calling startTouch
    this.makeTouchResponder(touch, target, shouldStack);
  },
  
  
  
  /** @private
    Artificially calls endTouch for any touch which is no longer present. This is necessary because
    _sometimes_, WebKit ends up not sending endtouch.
  */
  endMissingTouches: function(presentTouches) {
    var idx, len = presentTouches.length, map = {}, end = [];
    
    // make a map of what touches _are_ present
    for (idx = 0; idx < len; idx++) {
      map[presentTouches[idx].identifier] = YES;
    }
    
    // check if any of the touches we have recorded are NOT present
    for (idx in this._touches) {
      var id = this._touches[idx].identifier;
      if (!map[id]) end.push(this._touches[idx]);
    }
    
    // end said touches
    for (idx = 0, len = end.length; idx < len; idx++) {
      this.endTouch(end[idx]);
      this.finishTouch(end[idx]);
    }
  },
  
  _touchCount: 0,
  /** @private
    Ends a specific touch (for a bit, at least). This does not "finish" a touch; it merely calls
    touchEnd, touchCancelled, etc. A re-dispatch (through recapture or makeTouchResponder) will terminate
    the process; it would have to be restarted separately, through touch.end().
  */
  endTouch: function(touchEntry, action, evt) {
    if (!action) action = "touchEnd";
    
    var responderIdx, responders, responder, originalResponder;
    
    // unassign
    this.unassignTouch(touchEntry);

    // call end for all items in chain
    if (touchEntry.touchResponder) {
      originalResponder = touchEntry.touchResponder;
      
      responders = touchEntry.touchResponders;
      responderIdx = responders.length - 1;
      responder = responders[responderIdx];
      while (responder) {
        // tell it
        responder.tryToPerform(action, touchEntry, evt);
        
        // check to see if the responder changed, and stop immediately if so.
        if (touchEntry.touchResponder !== originalResponder) break;

        // next
        responderIdx--;
        responder = responders[responderIdx];
        action = "touchCancelled"; // any further ones receive cancelled
      }
    }
  },
  
  /**
    @private
    "Finishes" a touch. That is, it eradicates it from our touch entries and removes all responder, etc. properties.
  */
  finishTouch: function(touch) {
    // ensure the touch is indeed unassigned.
    this.unassignTouch(touch);
    
    // clear responders (just to be thorough)
    touch.touchResponders = null;
    touch.touchResponder = null;
    touch.nextTouchResponder = null;
    touch.isDoneFor = YES;

    // and remove from our set
    if (this._touches[touch.identifier]) delete this._touches[touch.identifier];
  },

  /** @private
    Called when the user touches their finger to the screen. This method
    dispatches the touchstart event to the appropriate view.

    We may receive a touchstart event for each touch, or we may receive a
    single touchstart event with multiple touches, so we may have to dispatch
    events to multiple views.

    @param {Event} evt the event
    @returns {Boolean}
  */
  touchstart: function(evt) {
    SC.RunLoop.begin();
    
    // sometimes WebKit is a bit... iffy:
    this.endMissingTouches(evt.touches);

    // as you were...    
    try {
      // loop through changed touches, calling touchStart, etc.
      var idx, touches = evt.changedTouches, len = touches.length, target, view, touch, touchEntry;

      // prepare event for touch mapping.
      evt.touchContext = this;

      // Loop through each touch we received in this event
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // Create an SC.Touch instance for every touch.
        touchEntry = SC.Touch.create(touch, this);
        touchEntry.timeStamp = evt.timeStamp;

        // Store the SC.Touch object. We use the identifier property (provided
        // by the browser) to disambiguate between touches. These will be used
        // later to determine if the touches have changed.
        this._touches[touch.identifier] = touchEntry;

        // set the event (so default action, etc. can be stopped)
        touch.event = evt; // will be unset momentarily

        // send out event thing: creates a chain, goes up it, then down it, with startTouch and cancelTouch.
        // in this case, only startTouch, as there are no existing touch responders.
        // We send the touchEntry because it is cached (we add the helpers only once)
        this.captureTouch(touchEntry, this);

        // Unset the reference to the original event so we can garbage collect.
        touch.event = null;
      }
    } catch (e) {
      SC.Logger.warn('Exception during touchStart: %@'.fmt(e)) ;
      SC.RunLoop.end();
      return NO ;
    }

    SC.RunLoop.end();
    return NO;
  },

  /**
    @private
    used to keep track of when a specific type of touch event was last handled, to see if it needs to be re-handled
  */
  touchmove: function(evt) {
    SC.RunLoop.begin();
    try {
      // pretty much all we gotta do is update touches, and figure out which views need updating.
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length, view, changedTouches, viewTouches, firstTouch,
          changedViews = {};

      // figure out what views had touches changed, and update our internal touch objects
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // get our touch
        touchEntry = this._touches[touch.identifier];

        // sanity-check
        if (!touchEntry) {
          SC.Logger.log("Received a touchmove for a touch we don't know about. This is bad.");
          continue;
        }

        // update touch
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.event = evt;

        // if the touch entry has a view
        if (touchEntry.touchResponder) {
          view = touchEntry.touchResponder;

          // create a view entry
          if (!changedViews[SC.guidFor(view)]) changedViews[SC.guidFor(view)] = { "view": view, "touches": [] };

          // add touch
          changedViews[SC.guidFor(view)].touches.push(touchEntry);
        }
      }

      // loop through changed views and send events
      for (idx in changedViews) {
        // get info
        view = changedViews[idx].view;
        changedTouches = changedViews[idx].touches;

        // prepare event; note that views often won't use this method anyway (they'll call touchesForView instead)
        evt.viewChangedTouches = changedTouches;

        // the first VIEW touch should be the touch info sent
        viewTouches = this.touchesForView(view);
        firstTouch = viewTouches.firstObject();
        evt.pageX = firstTouch.pageX;
        evt.pageY = firstTouch.pageY;
        evt.touchContext = this; // so it can call touchesForView

        // and go
        view.tryToPerform("touchesDragged", evt, viewTouches);
      }

      // clear references to event
      touches = evt.changedTouches;
      len = touches.length;
      for (idx = 0; idx < len; idx++) {
        // and remove event reference
        touchEntry.event = null;
      }
    } catch (e) {
      SC.Logger.warn('Exception during touchMove: %@'.fmt(e)) ;
    }
    SC.RunLoop.end();
    return NO;
  },
  
  touchend: function(evt) {
    SC.RunLoop.begin();
    try {
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length,
          view,
          action = evt.isCancel ? "touchCancelled" : "touchEnd";

      for (idx = 0; idx < len; idx++) {
        //get touch+entry
        touch = touches[idx];
        touchEntry = this._touches[touch.identifier];
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;

        this.endTouch(touchEntry, action, evt);
        this.finishTouch(touchEntry);
      }
    } catch (e) {
      SC.Logger.warn('Exception during touchEnd: %@'.fmt(e)) ;
      SC.RunLoop.end();
      return NO ;
    }

    SC.RunLoop.end();
    return NO;
  },

  /** @private
    Handle touch cancel event.  Works just like cancelling a touch for any other reason.
    touchend handles it as a special case (sending cancel instead of end if needed).
  */
  touchcancel: function(evt) {
    evt.isCancel = YES;
    this.touchend(evt);
  },

  // ..........................................................
  // KEYBOARD HANDLING
  //


  /**
    Invoked on a keyDown event that is not handled by any actual value.  This
    will get the key equivalent string and then walk down the keyPane, then
    the focusedPane, then the mainPane, looking for someone to handle it.
    Note that this will walk DOWN the view hierarchy, not up it like most.

    @returns {Object} Object that handled evet or null
  */
  attemptKeyEquivalent: function(evt) {
    var ret = null ;

    // keystring is a method name representing the keys pressed (i.e
    // 'alt_shift_escape')
    var keystring = evt.commandCodes()[0];

    // couldn't build a keystring for this key event, nothing to do
    if (!keystring) return NO;

    var keyPane  = this.get('keyPane'), mainPane = this.get('mainPane');

    // Try the keyPane.  If it's modal, then try the equivalent there but on
    // nobody else.
    if (keyPane) {
      ret = keyPane.performKeyEquivalent(keystring, evt) ;
      if (ret || keyPane.get('isModal')) return ret ;
    }

    // if not, then try the main pane
    if (!ret && mainPane && (mainPane!==keyPane)) {
      ret = mainPane.performKeyEquivalent(keystring, evt);
      if (ret || mainPane.get('isModal')) return ret ;
    }

    return ret ;
  },

  _lastModifiers: null,

  /** @private
    Modifier key changes are notified with a keydown event in most browsers.
    We turn this into a flagsChanged keyboard event.  Normally this does not
    stop the normal browser behavior.
  */
  _handleModifierChanges: function(evt) {
    // if the modifier keys have changed, then notify the first responder.
    var m;
    m = this._lastModifiers = (this._lastModifiers || { alt: false, ctrl: false, shift: false });

    var changed = false;
    if (evt.altKey !== m.alt) { m.alt = evt.altKey; changed=true; }
    if (evt.ctrlKey !== m.ctrl) { m.ctrl = evt.ctrlKey; changed=true; }
    if (evt.shiftKey !== m.shift) { m.shift = evt.shiftKey; changed=true;}
    evt.modifiers = m; // save on event

    return (changed) ? (this.sendEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },

  /** @private
    Determines if the keyDown event is a nonprintable or function key. These
    kinds of events are processed as keyboard shortcuts.  If no shortcut
    handles the event, then it will be sent as a regular keyDown event.
  */
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey || ((evt.charCode !== evt.which) && SC.FUNCTION_KEYS[evt.which]));
  },

  /** @private
    Determines if the event simply reflects a modifier key change.  These
    events may generate a flagsChanged event, but are otherwise ignored.
  */
  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.charCode];
  },

  /** @private
    The keydown event occurs whenever the physically depressed key changes.
    This event is used to deliver the flagsChanged event and to with function
    keys and keyboard shortcuts.

    All actions that might cause an actual insertion of text are handled in
    the keypress event.
  */
  keydown: function(evt) {
    if (SC.none(evt)) return YES;

    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (evt.keyCode===229){
      this._IMEInputON = YES;
      return YES;
    }

    // Firefox does NOT handle delete here...
    if (SC.browser.mozilla && (evt.which === 8)) return true ;

    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this
    // is only a modifier change
    var ret = this._handleModifierChanges(evt),
        target = evt.target || evt.srcElement,
        forceBlock = (evt.which === 8) && !SC.allowsBackspaceToPreviousPage && (target === document.body);

    if (this._isModifierKey(evt)) return (forceBlock ? NO : ret);

    // if this is a function or non-printable key, try to use this as a key
    // equivalent.  Otherwise, send as a keyDown event so that the focused
    // responder can do something useful with the event.
    ret = YES ;
    if (this._isFunctionOrNonPrintableKey(evt)) {
      // otherwise, send as keyDown event.  If no one was interested in this
      // keyDown event (probably the case), just let the browser do its own
      // processing.

      // Arrow keys are handled in keypress for firefox
      if (evt.keyCode>=37 && evt.keyCode<=40 && SC.browser.mozilla) return YES;


      ret = this.sendEvent('keyDown', evt) ;

      // attempt key equivalent if key not handled
      if (!ret) {
        ret = !this.attemptKeyEquivalent(evt) ;
      } else {
        ret = evt.hasCustomEventHandling ;
        if (ret) forceBlock = NO ; // code asked explicitly to let delete go
      }
    }

    return forceBlock ? NO : ret ;
  },

  /** @private
    The keypress event occurs after the user has typed something useful that
    the browser would like to insert.  Unlike keydown, the input codes here
    have been processed to reflect that actual text you might want to insert.

    Normally ignore any function or non-printable key events.  Otherwise, just
    trigger a keyDown.
  */
  keypress: function(evt) {
    var ret,
        keyCode   = evt.keyCode,
        isFirefox = !!SC.browser.mozilla;

    // delete is handled in keydown() for most browsers
    if (isFirefox && (evt.which === 8)) {
      //get the keycode and set it for which.
      evt.which = keyCode;
      ret = this.sendEvent('keyDown', evt);
      return ret ? (SC.allowsBackspaceToPreviousPage || evt.hasCustomEventHandling) : YES ;

    // normal processing.  send keyDown for printable keys...
    //there is a special case for arrow key repeating of events in FF.
    } else {
      var isFirefoxArrowKeys = (keyCode >= 37 && keyCode <= 40 && isFirefox),
          charCode           = evt.charCode;
      if ((charCode !== undefined && charCode === 0) && !isFirefoxArrowKeys) return YES;
      if (isFirefoxArrowKeys) evt.which = keyCode;
      return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;
    }
  },

  keyup: function(evt) {
    // to end the simulation of keypress in firefox set the _ffevt to null
    if(this._ffevt) this._ffevt=null;
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (this._IMEInputON && evt.keyCode===13){
      evt.isIMEInput = YES;
      this.sendEvent('keyDown', evt);
      this._IMEInputON = NO;
    }
    return this.sendEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  },

  /**
    We'll listen for the 'beforedeactivate' event in IE because the default
    behavior is for the active element to be deactivated whenever another
    element is clicked, regardless of whether that element belongs to a view
    that has 'acceptsFirstResponder' set to NO.

    If we detect that the active element is “losing out” to an element that
    belongs to a view that does not accept keyPane or firstResponder, then
    cancel the event.  In this way, clients can create elements that behave as
    if they're part of a single user interface element — for example, a text
    field with a drop-down menu.  (Without this, clicking on a menu item
    element would cause the text field to lose focus!)
  */
  beforedeactivate: function(evt) {
    var toElement = evt.toElement;
    if (toElement && toElement.tagName && toElement.tagName!=="IFRAME") {
      var view = SC.$(toElement).view()[0];
      if (view && !view.get('acceptsKeyPane')
        && !view.get('acceptsFirstResponder') ) return NO;
    }

    return YES;
  },

  // ..........................................................
  // MOUSE HANDLING
  //

  mousedown: function(evt) {
    try {
      if(!SC.browser.msie) window.focus();
      else if(evt.target && evt.target.focus) evt.target.focus();
      // First, save the click count. The click count resets if the mouse down
      // event occurs more than 200 ms later than the mouse up event or more
      // than 8 pixels away from the mouse down event.
      this._clickCount += 1 ;
      if (!this._lastMouseUpAt || ((Date.now()-this._lastMouseUpAt) > 200)) {
        this._clickCount = 1 ;
      } else {
        var deltaX = this._lastMouseDownX - evt.clientX,
            deltaY = this._lastMouseDownY - evt.clientY,
            distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY) ;
        if (distance > 8.0) this._clickCount = 1 ;
      }
      evt.clickCount = this._clickCount ;

      this._lastMouseDownX = evt.clientX ;
      this._lastMouseDownY = evt.clientY ;

      var fr, view = this.targetViewForEvent(evt) ;

      // InlineTextField needs to loose firstResponder whenever you click outside
      // the view. This is a special case as textfields are not supposed to loose
      // focus unless you click on a list, another textfield or an special
      // view/control.

      if(view) fr=view.getPath('pane.firstResponder');

      if(fr && fr.kindOf(SC.InlineTextFieldView) && fr!==view){
        fr.resignFirstResponder();
      }

      view = this._mouseDownView = this.sendEvent('mouseDown', evt, view) ;
      if (view && view.respondsTo('mouseDragged')) this._mouseCanDrag = YES ;
    } catch (e) {

      SC.Logger.warn('Exception during mousedown: %@'.fmt(e)) ;
      this._mouseDownView = null ;
      this._mouseCanDrag = NO ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  },

  /**
    mouseUp only gets delivered to the view that handled the mouseDown evt.
    we also handle click and double click notifications through here to
    ensure consistant delivery.  Note that if mouseDownView is not
    implemented, then no mouseUp event will be sent, but a click will be
    sent.
  */
  mouseup: function(evt) {
    this.targetViewForEvent(evt);
    try {
      if (this._drag) {
        this._drag.tryToPerform('mouseUp', evt) ;
        this._drag = null ;
      }

      var handler = null, view = this._mouseDownView,
          targetView = this.targetViewForEvent(evt);
      this._lastMouseUpAt = Date.now() ;

      // record click count.
      evt.clickCount = this._clickCount ;

      // attempt the mouseup call only if there's a target.
      // don't want a mouseup going to anyone unless they handled the mousedown...
      if (view) {
        handler = this.sendEvent('mouseUp', evt, view) ;

        // try doubleClick
        if (!handler && (this._clickCount === 2)) {
          handler = this.sendEvent('doubleClick', evt, view) ;
        }

        // try single click
        if (!handler) {
          handler = this.sendEvent('click', evt, view) ;
        }
      }

      // try whoever's under the mouse if we haven't handle the mouse up yet
      if (!handler) {

        // try doubleClick
        if (this._clickCount === 2) {
          handler = this.sendEvent('doubleClick', evt, targetView);
        }

        // try singleClick
        if (!handler) {
          handler = this.sendEvent('click', evt, targetView) ;
        }
      }

      // cleanup
      this._mouseCanDrag = NO; this._mouseDownView = null ;
    } catch (e) {
      this._drag = null; this._mouseCanDrag = NO; this._mouseDownView = null ;
      throw e;
    }
    return (handler) ? evt.hasCustomEventHandling : YES ;
  },

  dblclick: function(evt){
    if (SC.browser.isIE) {
      this._clickCount = 2;
      // this._onmouseup(evt);
      this.mouseup(evt);
    }
  },

  mousewheel: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ,
          handler = this.sendEvent('mouseWheel', evt, view) ;
    } catch (e) {
      throw e;
    }
    return (handler) ? evt.hasCustomEventHandling : YES ;
  },

  _lastHovered: null,

  /**
   This will send mouseEntered, mouseExited, mousedDragged and mouseMoved
   to the views you hover over.  To receive these events, you must implement
   the method. If any subviews implement them and return true, then you won't
   receive any notices.

   If there is a target mouseDown view, then mouse moved events will also
   trigger calls to mouseDragged.
  */
  mousemove: function(evt) {
    if (SC.browser.msie) {
      if (this._lastMoveX === evt.clientX && this._lastMoveY === evt.clientY) return;
    }

    // We'll record the last positions in all browsers, in case a special pane
    // or some such UI absolutely needs this information.
    this._lastMoveX = evt.clientX;
    this._lastMoveY = evt.clientY;

    SC.RunLoop.begin();
    try {
      // make sure the view gets focus no matter what.  FF is inconsistant
      // about this.
      this.focus();
      // only do mouse[Moved|Entered|Exited|Dragged] if not in a drag session
      // drags send their own events, e.g. drag[Moved|Entered|Exited]
      if (this._drag) {
        //IE triggers mousemove at the same time as mousedown
        if(SC.browser.msie){
          if (this._lastMouseDownX !== evt.clientX || this._lastMouseDownY !== evt.clientY) {
            this._drag.tryToPerform('mouseDragged', evt);
          }
        }
        else {
          this._drag.tryToPerform('mouseDragged', evt);
        }
      } else {
        var lh = this._lastHovered || [] , nh = [] , exited, loc, len,
            view = this.targetViewForEvent(evt) ;

        // work up the view chain.  Notify of mouse entered and
        // mouseMoved if implemented.
        while(view && (view !== this)) {
          if (lh.indexOf(view) !== -1) {
            view.tryToPerform('mouseMoved', evt);
            nh.push(view) ;
          } else {
            view.tryToPerform('mouseEntered', evt);
            nh.push(view) ;
          }

          view = view.get('nextResponder');
        }
        // now find those views last hovered over that were no longer found
        // in this chain and notify of mouseExited.
        for(loc=0, len=lh.length; loc < len; loc++) {
          view = lh[loc] ;
          exited = view.respondsTo('mouseExited') ;
          if (exited && !(nh.indexOf(view) !== -1)) {
            view.tryToPerform('mouseExited',evt);
          }
        }
        this._lastHovered = nh;

        // also, if a mouseDownView exists, call the mouseDragged action, if
        // it exists.
        if (this._mouseDownView) {
          if(SC.browser.msie){
            if (this._lastMouseDownX !== evt.clientX && this._lastMouseDownY !== evt.clientY) {
              this._mouseDownView.tryToPerform('mouseDragged', evt);
            }
          }
          else {
            this._mouseDownView.tryToPerform('mouseDragged', evt);
          }
        }
      }
    } catch (e) {
      throw e;
    }
    SC.RunLoop.end();
  },

  // these methods are used to prevent unnecessary text-selection in IE,
  // there could be some more work to improve this behavior and make it
  // a bit more useful; right now it's just to prevent bugs when dragging
  // and dropping.

  _mouseCanDrag: YES,

  selectstart: function(evt) {
    var targetView = this.targetViewForEvent(evt),
        result = this.sendEvent('selectStart', evt, targetView);

    // If the target view implements mouseDragged, then we want to ignore the
    // 'selectstart' event.
    if (targetView && targetView.respondsTo('mouseDragged')) {
      return (result !==null ? YES: NO) && !this._mouseCanDrag;
    }
    else {
      return (result !==null ? YES: NO);
    }
  },

  drag: function() { return false; },

  contextmenu: function(evt) {
    var view = this.targetViewForEvent(evt) ;
    return this.sendEvent('contextMenu', evt, view);
  }
});

/**
  @class SC.Touch
  Represents a touch.

  Views receive touchStart and touchEnd.
*/
SC.Touch = function(touch, touchContext) {
  // get the raw target view (we'll refine later)
  this.touchContext = touchContext;
  this.identifier = touch.identifier; // for now, our internal id is WebKit's id.
  this.targetView = touch.target ? SC.$(touch.target).view()[0] : null;
  this.target = touch.target;

  this.view = undefined;
  this.touchResponder = this.nextTouchResponder = undefined;
  this.touchResponders = [];

  this.startX = this.pageX = touch.pageX;
  this.startY = this.pageY = touch.pageY;
};

SC.Touch.prototype = {
  /**@scope SC.Touch.prototype*/

  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.
  */
  allowDefault: function() {
    this.hasCustomEventHandling = YES ;
  },

  /**
    If the touch is associated with an event, prevents default action on the event.
  */
  preventDefault: function() {
    if (this.event) this.event.preventDefault();
  },

  stopPropagation: function() {
    if (this.event) this.event.stopPropagation();
  },

  stop: function() {
    if (this.event) this.event.stop();
  },
  
  /**
    Removes from and calls touchEnd on the touch responder.
  */
  end: function() {
    this.touchContext.endTouch(this);
  },

  /**
    Changes the touch responder for the touch. If shouldStack === YES,
    the current responder will be saved so that the next responder may
    return to it.
  */
  makeTouchResponder: function(responder, shouldStack) {
    this.touchContext.makeTouchResponder(this, responder, shouldStack);
  },

  /**
    Captures, or recaptures, the touch. This works from the touch's raw target view
    up to the startingPoint, and finds either a view that returns YES to captureTouch() or
    touchStart().
  */
  captureTouch: function(startingPoint, shouldStack) {
    this.touchContext.captureTouch(this, startingPoint, shouldStack);
  },

  /**
    Returns all touches for a specified view. Put as a convenience on the touch itself; this method
    is also available on the event.
  */
  touchesForView: function(view) {
    return this.touchContext.touchesForView(view);
  },

  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the supplied view.

    addSelf adds this touch to the set being considered. This is useful from touchStart. If
    you use it from anywhere else, it will make this touch be used twice--so use caution.
  */
  averagedTouchesForView: function(view, addSelf) {
    return this.touchContext.averagedTouchesForView(view, (addSelf ? this : null));
  }
};

SC.mixin(SC.Touch, {
  create: function(touch, touchContext) {
    return new SC.Touch(touch, touchContext);
  }
});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function() {
  var r;
  r = SC.RootResponder.responder = SC.RootResponder.create() ;
  r.setup() ;
});
