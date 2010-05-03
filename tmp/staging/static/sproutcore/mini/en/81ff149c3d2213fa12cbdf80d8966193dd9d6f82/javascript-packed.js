/* >>>>>>>>>> BEGIN javascript.js */
/* >>>>>>>>>> BEGIN source/license.js */
/*! @license
==========================================================================
SproutCore Costello -- Property Observing Library
Copyright ©2006-2009, Sprout Systems, Inc. and contributors.
Portions copyright ©2008-2009 Apple Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

For more information about SproutCore, visit http://www.sproutcore.com

==========================================================================
@license */

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global NodeList */

// These commands are used by the build tools to control load order.  On the
// client side these are a no-op.
var require = require || function require() { } ;
var sc_require = sc_require || require;
var sc_resource = sc_resource || function sc_resource() {};

sc_require('license') ;

// ........................................
// GLOBAL CONSTANTS
// 
// Most global constants should be defined inside of the SC namespace.  
// However the following two are useful enough and generally benign enough
// to put into the global object.
var YES = true ; 
var NO = false ;

// prevent a console.log from blowing things up if we are on a browser that
// does not support it
if (typeof console === 'undefined') {
  window.console = {} ;
  console.log = console.info = console.warn = console.error = function(){};
}

// ........................................
// BOOTSTRAP
// 
// The root namespace and some common utility methods are defined here. The
// rest of the methods go into the mixin defined below.

/**
  @namespace
  
  The SproutCore namespace.  All SproutCore methods and functions are defined
  inside of this namespace.  You generally should not add new properties to
  this namespace as it may be overwritten by future versions of SproutCore.
  
  You can also use the shorthand "SC" instead of "SproutCore".
  
  SproutCore-Base is a framework that provides core functions for SproutCore
  including cross-platform functions, support for property observing and
  objects.  It's focus is on small size and performance.  You can use this 
  in place of or along-side other cross-platform libraries such as jQuery or
  Prototype.
  
  The core Base framework is based on the jQuery API with a number of 
  performance optimizations.
*/
var SC = SC || {} ; 
var SproutCore = SproutCore || SC ;

/**
  Adds properties to a target object.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.

  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.mixin = function() {
  // copy reference to target object
  var target = arguments[0] || {},
      idx = 1,
      length = arguments.length ,
      options, copy , key;

  // Handle case where we have only one item...extend SC
  if (length === 1) {
    target = this || {};
    idx=0;
  }

  for ( ; idx < length; idx++ ) {
    if (!(options = arguments[idx])) continue ;
    for(key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined) target[key] = copy ;
    }
  }
  
  return target;
} ;

/**
  Adds properties to a target object.  Unlike SC.mixin, however, if the target
  already has a value for a property, it will not be overwritten.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.

  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.supplement = function() {
  // copy reference to target object
  var target = arguments[0] || {};
  var idx = 1;
  var length = arguments.length ;
  var options ;

  // Handle case where we have only one item...extend SC
  if (length === 1) {
    target = this || {};
    idx=0;
  }

  for ( ; idx < length; idx++ ) {
    if (!(options = arguments[idx])) continue ;
    for(var key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      var src = target[key] ;
      var copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined  &&  src === undefined) target[key] = copy ;
    }
  }
  
  return target;
} ;

/** 
  Alternative to mixin.  Provided for compatibility with jQuery.
  @function 
*/
SC.extend = SC.mixin ;

// ..........................................................
// CORE FUNCTIONS
// 
// Enough with the bootstrap code.  Let's define some core functions

SC.mixin(/** @scope SC */ {
  
  // ........................................
  // GLOBAL CONSTANTS
  // 
  T_ERROR:     'error',
  T_OBJECT:    'object',
  T_NULL:      'null',
  T_CLASS:     'class',
  T_HASH:      'hash',
  T_FUNCTION:  'function',
  T_UNDEFINED: 'undefined',
  T_NUMBER:    'number',
  T_BOOL:      'boolean',
  T_ARRAY:     'array',
  T_STRING:    'string',
  
  // ........................................
  // TYPING & ARRAY MESSAGING
  //   

  /**
    Returns a consistant type for the passed item.

    Use this instead of the built-in typeOf() to get the type of an item. 
    It will return the same result across all browsers and includes a bit 
    more detail.  Here is what will be returned:

    | Return Value Constant | Meaning |
    | SC.T_STRING | String primitive |
    | SC.T_NUMBER | Number primitive |
    | SC.T_BOOLEAN | Boolean primitive |
    | SC.T_NULL | Null value |
    | SC.T_UNDEFINED | Undefined value |
    | SC.T_FUNCTION | A function |
    | SC.T_ARRAY | An instance of Array |
    | SC.T_CLASS | A SproutCore class (created using SC.Object.extend()) |
    | SC.T_OBJECT | A SproutCore object instance |
    | SC.T_HASH | A JavaScript object not inheriting from SC.Object |

    @param item {Object} the item to check
    @returns {String} the type
  */  
  typeOf: function(item) {
    if (item === undefined) return SC.T_UNDEFINED ;
    if (item === null) return SC.T_NULL ; 
    var ret = typeof(item) ;
    if (ret == "object") {
      if (item instanceof Array) {
        ret = SC.T_ARRAY ;
      } else if (item instanceof Function) {
        ret = item.isClass ? SC.T_CLASS : SC.T_FUNCTION ;

      // NB: typeOf() may be called before SC.Error has had a chance to load
      // so this code checks for the presence of SC.Error first just to make
      // sure.  No error instance can exist before the class loads anyway so
      // this is safe.
      } else if (SC.Error && (item instanceof SC.Error)) {
        ret = SC.T_ERROR ;        
      } else if (item.isObject === true) {
        ret = SC.T_OBJECT ;
      } else ret = SC.T_HASH ;
    } else if (ret === SC.T_FUNCTION) ret = (item.isClass) ? SC.T_CLASS : SC.T_FUNCTION;
    return ret ;
  },

  /**
    Returns YES if the passed value is null or undefined.  This avoids errors
    from JSLint complaining about use of ==, which can be technically 
    confusing.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  none: function(obj) {
    return obj===null || obj===undefined;  
  },

  /**
    Verifies that a value is either null or an empty string.  Return false if
    the object is not a string.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  empty: function(obj) {
    return obj===null || obj===undefined || obj==='';
  },
  
  /**
    Returns YES if the passed object is an array or array-like. Instances
    of the NodeList class return NO.

    Unlike SC.typeOf this method returns true even if the passed object is 
    not formally array but appears to be array-like (i.e. has a length 
    property, responds to .objectAt, etc.)

    @param obj {Object} the object to test
    @returns {Boolean} 
  */
  isArray: function(obj) {
    if (obj && obj.objectAt) return YES ; // fast path

    var len = (obj ? obj.length : null), type = SC.typeOf(obj);
    return !(SC.none(len) || (type === SC.T_FUNCTION) || (type === SC.T_STRING) || obj.setInterval) ;
  },

  /**
    Makes an object into an Array if it is not array or array-like already.
    Unlike SC.A(), this method will not clone the object if it is already
    an array.
    
    @param {Object} obj object to convert
    @returns {Array} Actual array
  */
  makeArray: function(obj) {
    return SC.isArray(obj) ? obj : SC.A(obj);
  },
  
  /**
    Converts the passed object to an Array.  If the object appears to be 
    array-like, a new array will be cloned from it.  Otherwise, a new array
    will be created with the item itself as the only item in the array.
    
    @param object {Object} any enumerable or array-like object.
    @returns {Array} Array of items
  */
  A: function(obj) {
    // null or undefined -- fast path
    if (SC.none(obj)) return [] ;
    
    // primitive -- fast path
    if (obj.slice instanceof Function) {
      // do we have a string?
      if (typeof(obj) === 'string') return [obj] ;
      else return obj.slice() ;
    }
    
    // enumerable -- fast path
    if (obj.toArray) return obj.toArray() ;
    
    // if not array-like, then just wrap in array.
    if (!SC.isArray(obj)) return [obj];
    
    // when all else fails, do a manual convert...
    var ret = [], len = obj.length;
    while(--len >= 0) ret[len] = obj[len];
    return ret ;
  },
  
  // ..........................................................
  // GUIDS & HASHES
  // 
  
  guidKey: "_sc_guid_" + new Date().getTime(),

  // Used for guid generation...
  _nextGUID: 0, _numberGuids: [], _stringGuids: {}, _keyCache: {},

  /**
    Returns a unique GUID for the object.  If the object does not yet have
    a guid, one will be assigned to it.  You can call this on any object,
    SC.Object-based or not, but be aware that it will add a _guid property.

    You can also use this method on DOM Element objects.

    @param obj {Object} any object, string, number, Element, or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    
    // special cases where we don't want to add a key to object
    if (obj === undefined) return "(undefined)" ;
    if (obj === null) return '(null)' ;
    if (obj === Object) return '(Object)';
    if (obj === Array) return '(Array)';
    
    var guidKey = this.guidKey ;
    if (obj[guidKey]) return obj[guidKey] ;

    switch(typeof obj) {
      case SC.T_NUMBER:
        return (this._numberGuids[obj] = this._numberGuids[obj] || ("nu" + obj));
      case SC.T_STRING:
        return (this._stringGuids[obj] = this._stringGuids[obj] || ("st" + obj));
      case SC.T_BOOL:
        return (obj) ? "(true)" : "(false)" ;
      default:
        return SC.generateGuid(obj);
    }
  },

  /**
    Returns a key name that combines the named key + prefix.  This is more 
    efficient than simply combining strings because it uses a cache  
    internally for performance.
    
    @param {String} prefix the prefix to attach to the key
    @param {String} key key
    @returns {String} result 
  */
  keyFor: function(prefix, key) {
    var ret, pcache = this._keyCache[prefix];
    if (!pcache) pcache = this._keyCache[prefix] = {}; // get cache for prefix
    ret = pcache[key];
    if (!ret) ret = pcache[key] = prefix + '_' + key ;
    return ret ;
  },

  /**
    Generates a new guid, optionally saving the guid to the object that you
    pass in.  You will rarely need to use this method.  Instead you should
    call SC.guidFor(obj), which return an existing guid if available.

    @param {Object} obj the object to assign the guid to
    @returns {String} the guid
  */
  generateGuid: function(obj) { 
    var ret = ("sc" + (this._nextGUID++)); 
    if (obj) obj[this.guidKey] = ret ;
    return ret ;
  },

  /**
    Returns a unique hash code for the object.  If the object implements
    a hash() method, the value of that method will be returned.  Otherwise,
    this will return the same value as guidFor().  

    Unlike guidFor(), this method allows you to implement logic in your 
    code to cause two separate instances of the same object to be treated as
    if they were equal for comparisons and other functions.

    IMPORTANT:  If you implement a hash() method, it MUST NOT return a 
    number or a string that contains only a number.  Typically hash codes 
    are strings that begin with a "%".

    @param obj {Object} the object
    @returns {String} the hash code for this instance.
  */
  hashFor: function(obj) {
    return (obj && obj.hash && (typeof obj.hash === SC.T_FUNCTION)) ? obj.hash() : this.guidFor(obj) ;
  },
    
  /**
    This will compare the two object values using their hash codes.

    @param a {Object} first value to compare
    @param b {Object} the second value to compare
    @returns {Boolean} YES if the two have equal hash code values.

  */
  isEqual: function(a,b) {
    // shortcut a few places.
    if (a === null) {
      return b === null ;
    } else if (a === undefined) {
      return b === undefined ;

    // finally, check their hash-codes
    } else return this.hashFor(a) === this.hashFor(b) ;
  },
  
  
  /**
   This will compare two javascript values of possibly different types.
   It will tell you which one is greater than the other by returning
   -1 if the first is smaller than the second,
    0 if both are equal,
    1 if the first is greater than the second.
  
   The order is calculated based on SC.ORDER_DEFINITION , if types are different.
   In case they have the same type an appropriate comparison for this type is made.

   @param v {Object} first value to compare
   @param w {Object} the second value to compare
   @returns {NUMBER} -1 if v < w, 0 if v = w and 1 if v > w.

  */
  compare: function (v, w) {
    // Doing a '===' check is very cheap, so in the case of equality, checking
    // this up-front is a big win.
    if (v === w) return 0;
    
    var type1 = SC.typeOf(v);
    var type2 = SC.typeOf(w);
    
    // If we haven't yet generated a reverse-mapping of SC.ORDER_DEFINITION,
    // do so now.
    var mapping = SC.ORDER_DEFINITION_MAPPING;
    if (!mapping) {
      var order = SC.ORDER_DEFINITION;
      mapping = SC.ORDER_DEFINITION_MAPPING = {};
      var idx, len;
      for (idx = 0, len = order.length;  idx < len;  ++idx) {
        mapping[order[idx]] = idx;
      }
      
      // We no longer need SC.ORDER_DEFINITION.
      delete SC.ORDER_DEFINITION;
    }
    
    var type1Index = mapping[type1];
    var type2Index = mapping[type2];
    
    if (type1Index < type2Index) return -1;
    if (type1Index > type2Index) return 1;
    
    // ok - types are equal - so we have to check values now
    switch (type1) {
      case SC.T_BOOL:
      case SC.T_NUMBER:
        if (v<w) return -1;
        if (v>w) return 1;
        return 0;

      case SC.T_STRING:
        var comp = v.localeCompare(w);
        if (comp<0) return -1;
        if (comp>0) return 1;
        return 0;

      case SC.T_ARRAY:
        var vLen = v.length;
        var wLen = w.length;
        var l = Math.min(vLen, wLen);
        var r = 0;
        var i = 0;
        var thisFunc = arguments.callee;
        while (r===0 && i < l) {
          r = thisFunc(v[i],w[i]);
          i++;
        }
        if (r !== 0) return r;
      
        // all elements are equal now
        // shorter array should be ordered first
        if (vLen < wLen) return -1;
        if (vLen > wLen) return 1;
        // arrays are equal now
        return 0;
        
      case SC.T_OBJECT:
        if (v.constructor.isComparable === YES) return v.constructor.compare(v, w);
        return 0;

      default:
        return 0;
    }
  },
  
  // ..........................................................
  // OBJECT MANAGEMENT
  // 
  
  /** 
    Empty function.  Useful for some operations. 
    
    @returns {Object}
  */
  K: function() { return this; },

  /** 
    Empty array.  Useful for some optimizations.
  
    @property {Array}
  */
  EMPTY_ARRAY: [],

  /**
    Empty hash.  Useful for some optimizations.
  
    @property {Hash}
  */
  EMPTY_HASH: {},

  /**
    Empty range. Useful for some optimizations.
    
    @property {Range}
  */
  EMPTY_RANGE: {start: 0, length: 0},
  
  /**
    Creates a new object with the passed object as its prototype.

    This method uses JavaScript's native inheritence method to create a new 
    object.    

    You cannot use beget() to create new SC.Object-based objects, but you
    can use it to beget Arrays, Hashes, Sets and objects you build yourself.
    Note that when you beget() a new object, this method will also call the
    didBeget() method on the object you passed in if it is defined.  You can
    use this method to perform any other setup needed.

    In general, you will not use beget() often as SC.Object is much more 
    useful, but for certain rare algorithms, this method can be very useful.

    For more information on using beget(), see the section on beget() in 
    Crockford's JavaScript: The Good Parts.

    @param obj {Object} the object to beget
    @returns {Object} the new object.
  */
  beget: function(obj) {
    if (SC.none(obj)) return null ;
    var K = SC.K; K.prototype = obj ;
    var ret = new K();
    K.prototype = null ; // avoid leaks
    if (SC.typeOf(obj.didBeget) === SC.T_FUNCTION) ret = obj.didBeget(ret); 
    return ret ;
  },

  /**
    Creates a clone of the passed object.  This function can take just about
    any type of object and create a clone of it, including primitive values
    (which are not actually cloned because they are immutable).

    If the passed object implements the clone() method, then this function
    will simply call that method and return the result.

    @param object {Object} the object to clone
    @returns {Object} the cloned object
  */
  copy: function(object) {
    var ret = object ;
    
    // fast path
    if (object && object.isCopyable) return object.copy();
    
    switch (SC.typeOf(object)) {
    case SC.T_ARRAY:
      if (object.clone && SC.typeOf(object.clone) === SC.T_FUNCTION) {
        ret = object.clone() ;
      } else ret = object.slice() ;
      break ;

    case SC.T_HASH:
    case SC.T_OBJECT:
      if (object.clone && SC.typeOf(object.clone) === SC.T_FUNCTION) {
        ret = object.clone() ;
      } else {
        ret = {} ;
        for(var key in object) ret[key] = object[key] ;
      }
    }

    return ret ;
  },

  /**
    Returns a new object combining the values of all passed hashes.

    @param object {Object} one or more objects
    @returns {Object} new Object
  */
  merge: function() {
    var ret = {}, len = arguments.length, idx;
    for(idx=0;idx<len;idx++) SC.mixin(ret, arguments[idx]);
    return ret ;
  },

  /**
    Returns all of the keys defined on an object or hash.  This is useful
    when inspecting objects for debugging.

    @param {Object} obj
    @returns {Array} array of keys
  */
  keys: function(obj) {
    var ret = [];
    for(var key in obj) ret.push(key);
    return ret;
  },

  /**
    Convenience method to inspect an object.  This method will attempt to 
    convert the object into a useful string description.
  */
  inspect: function(obj) {
    var v, ret = [] ;
    for(var key in obj) {
      v = obj[key] ;
      if (v === 'toString') continue ; // ignore useless items
      if (SC.typeOf(v) === SC.T_FUNCTION) v = "function() { ... }" ;
      ret.push(key + ": " + v) ;
    }
    return "{" + ret.join(" , ") + "}" ;
  },

  /**
    Returns a tuple containing the object and key for the specified property 
    path.  If no object could be found to match the property path, then 
    returns null.

    This is the standard method used throughout SproutCore to resolve property
    paths.

    @param path {String} the property path
    @param root {Object} optional parameter specifying the place to start
    @returns {Array} array with [object, property] if found or null
  */
  tupleForPropertyPath: function(path, root) {

    // if the passed path is itself a tuple, return it
    if (SC.typeOf(path) === SC.T_ARRAY) return path ;

    // find the key.  It is the last . or first *
    var key ;
    var stopAt = path.indexOf('*') ;
    if (stopAt < 0) stopAt = path.lastIndexOf('.') ;
    key = (stopAt >= 0) ? path.slice(stopAt+1) : path ;

    // convert path to object.
    var obj = this.objectForPropertyPath(path, root, stopAt) ;
    return (obj && key) ? [obj,key] : null ;
  },

  /** 
    Finds the object for the passed path or array of path components.  This is 
    the standard method used in SproutCore to traverse object paths.

    @param path {String} the path
    @param root {Object} optional root object.  window is used otherwise
    @param stopAt {Integer} optional point to stop searching the path.
    @returns {Object} the found object or undefined.
  */
  objectForPropertyPath: function(path, root, stopAt) {

    var loc, nextDotAt, key, max ;

    if (!root) root = window ;

    // faster method for strings
    if (SC.typeOf(path) === SC.T_STRING) {
      if (stopAt === undefined) stopAt = path.length ;
      loc = 0 ;
      while((root) && (loc < stopAt)) {
        nextDotAt = path.indexOf('.', loc) ;
        if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
        key = path.slice(loc, nextDotAt);
        root = root.get ? root.get(key) : root[key] ;
        loc = nextDotAt+1; 
      }
      if (loc < stopAt) root = undefined; // hit a dead end. :(

    // older method using an array
    } else {

      loc = 0; max = path.length; key = null;
      while((loc < max) && root) {
        key = path[loc++];
        if (key) root = (root.get) ? root.get(key) : root[key] ;
      }
      if (loc < max) root = undefined ;
    }

    return root ;
  },
  
  
  // ..........................................................
  // LOCALIZATION SUPPORT
  // 
  
  /**
    Known loc strings
    
    @property {Hash}
  */
  STRINGS: {},
  
  /**
    This is a simplified handler for installing a bunch of strings.  This
    ignores the language name and simply applies the passed strings hash.
    
    @param {String} lang the language the strings are for
    @param {Hash} strings hash of strings
    @returns {SC} receiver
  */
  stringsFor: function(lang, strings) {
    SC.mixin(SC.STRINGS, strings);
    return this ;
  }
  
  
}); // end mixin

/** @private Aliasn for SC.clone() */
SC.clone = SC.copy ;

/** @private Alias for SC.A() */
SC.$A = SC.A;

/** @private Provided for compatibility with old HTML templates. */
SC.didLoad = SC.K ;

/** @private Used by SC.compare */
SC.ORDER_DEFINITION = [ SC.T_ERROR,
                        SC.T_UNDEFINED,
                        SC.T_NULL,
                        SC.T_BOOL,
                        SC.T_NUMBER,
                        SC.T_STRING,
                        SC.T_ARRAY,
                        SC.T_HASH,
                        SC.T_OBJECT,
                        SC.T_FUNCTION,
                        SC.T_CLASS ];


// ........................................
// FUNCTION ENHANCEMENTS
//

SC.mixin(Function.prototype, 
/** @lends Function.prototype */ {
  
  /**
    Indicates that the function should be treated as a computed property.
    
    Computed properties are methods that you want to treat as if they were
    static properties.  When you use get() or set() on a computed property,
    the object will call the property method and return its value instead of 
    returning the method itself.  This makes it easy to create "virtual 
    properties" that are computed dynamically from other properties.
    
    Consider the following example:
    
    {{{
      contact = SC.Object.create({

        firstName: "Charles",
        lastName: "Jolley",
        
        // This is a computed property!
        fullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }.property('firstName', 'lastName'),
        
        // this is not
        getFullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }
      });

      contact.get('firstName') ;
      --> "Charles"
      
      contact.get('fullName') ;
      --> "Charles Jolley"
      
      contact.get('getFullName') ;
      --> function()
    }}}
    
    Note that when you get the fullName property, SproutCore will call the
    fullName() function and return its value whereas when you get() a property
    that contains a regular method (such as getFullName above), then the 
    function itself will be returned instead.
    
    h2. Using Dependent Keys

    Computed properties are often computed dynamically from other member 
    properties.  Whenever those properties change, you need to notify any
    object that is observing the computed property that the computed property
    has changed also.  We call these properties the computed property is based
    upon "dependent keys".
    
    For example, in the contact object above, the fullName property depends on
    the firstName and lastName property.  If either property value changes,
    any observer watching the fullName property will need to be notified as 
    well.
    
    You inform SproutCore of these dependent keys by passing the key names
    as parameters to the property() function.  Whenever the value of any key
    you name here changes, the computed property will be marked as changed
    also.
    
    You should always register dependent keys for computed properties to 
    ensure they update.
    
    h2. Using Computed Properties as Setters
    
    Computed properties can be used to modify the state of an object as well
    as to return a value.  Unlike many other key-value system, you use the 
    same method to both get and set values on a computed property.  To 
    write a setter, simply declare two extra parameters: key and value.
    
    Whenever your property function is called as a setter, the value 
    parameter will be set.  Whenever your property is called as a getter the
    value parameter will be undefined.
    
    For example, the following object will split any full name that you set
    into a first name and last name components and save them.
    
    {{{
      contact = SC.Object.create({
        
        fullName: function(key, value) {
          if (value !== undefined) {
            var parts = value.split(' ') ;
            this.beginPropertyChanges()
              .set('firstName', parts[0])
              .set('lastName', parts[1])
            .endPropertyChanges() ;
          }
          return this.getEach('firstName', 'lastName').compact().join(' ');
        }.property('firstName','lastName')
        
      }) ;
      
    }}}
    
    h2. Why Use The Same Method for Getters and Setters?
    
    Most property-based frameworks expect you to write two methods for each
    property but SproutCore only uses one. We do this because most of the time
    when you write a setter is is basically a getter plus some extra work.
    There is little added benefit in writing both methods when you can
    conditionally exclude part of it. This helps to keep your code more
    compact and easier to maintain.
    
    @param dependentKeys {String...} optional set of dependent keys
    @returns {Function} the declared function instance
  */
  property: function() {
    this.dependentKeys = SC.$A(arguments) ;
    var guid = SC.guidFor(this) ;
    this.cacheKey = "__cache__" + guid ;
    this.lastSetValueKey = "__lastValue__" + guid ;
    this.isProperty = YES ;
    return this ;
  },
  
  /**
    You can call this method on a computed property to indicate that the 
    property is cacheable (or not cacheable).  By default all computed 
    properties are not cached.  Enabling this feature will allow SproutCore
    to cache the return value of your computed property and to use that
    value until one of your dependent properties changes or until you 
    invoke propertyDidChange() and name the computed property itself.
    
    If you do not specify this option, computed properties are assumed to be
    not cacheable.
    
    @param {Boolean} aFlag optionally indicate cacheable or no, default YES
    @returns {Function} reciever
  */
  cacheable: function(aFlag) {
    this.isProperty = YES ;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isCacheable = (aFlag === undefined) ? YES : aFlag ;
    return this ;
  },
  
  /**
    Indicates that the computed property is volatile.  Normally SproutCore 
    assumes that your computed property is idempotent.  That is, calling 
    set() on your property more than once with the same value has the same
    effect as calling it only once.  
    
    All non-computed properties are idempotent and normally you should make
    your computed properties behave the same way.  However, if you need to
    make your property change its return value everytime your method is
    called, you may chain this to your property to make it volatile.
    
    If you do not specify this option, properties are assumed to be 
    non-volatile. 
    
    @param {Boolean} aFlag optionally indicate state, default to YES
    @returns {Function} receiver
  */
  idempotent: function(aFlag) {
    this.isProperty = YES;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isVolatile = (aFlag === undefined) ? YES : aFlag ;
    return this ;
  },
  
  /**
    Declare that a function should observe an object at the named path.  Note
    that the path is used only to construct the observation one time.
    
    @returns {Function} receiver
  */
  observes: function(propertyPaths) { 
    // sort property paths into local paths (i.e just a property name) and
    // full paths (i.e. those with a . or * in them)
    var loc = arguments.length, local = null, paths = null ;
    while(--loc >= 0) {
      var path = arguments[loc] ;
      // local
      if ((path.indexOf('.')<0) && (path.indexOf('*')<0)) {
        if (!local) local = this.localPropertyPaths = [] ;
        local.push(path);
        
      // regular
      } else {
        if (!paths) paths = this.propertyPaths = [] ;
        paths.push(path) ;
      }
    }
    return this ;
  }
  
});

// ..........................................................
// STRING ENHANCEMENT
// 

// Interpolate string. looks for %@ or %@1; to control the order of params.
/**
  Apply formatting options to the string.  This will look for occurrences
  of %@ in your string and substitute them with the arguments you pass into
  this method.  If you want to control the specific order of replacement, 
  you can add a number after the key as well to indicate which argument 
  you want to insert.  

  Ordered insertions are most useful when building loc strings where values
  you need to insert may appear in different orders.

  h3. Examples
  
  {{{
    "Hello %@ %@".fmt('John', 'Doe') => "Hello John Doe"
    "Hello %@2, %@1".fmt('John', 'Doe') => "Hello Doe, John"
  }}}
  
  @param args {Object...} optional arguments
  @returns {String} formatted string
*/
String.prototype.fmt = function() {
  // first, replace any ORDERED replacements.
  var args = arguments,
      idx  = 0; // the current index for non-numerical replacements
  return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {
    argIndex = (argIndex) ? parseInt(argIndex,0)-1 : idx++ ;
    s =args[argIndex];
    return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString(); 
  }) ;
};

/**
  Localizes the string.  This will look up the reciever string as a key 
  in the current Strings hash.  If the key matches, the loc'd value will be
  used.  The resulting string will also be passed through fmt() to insert
  any variables.
  
  @param args {Object...} optional arguments to interpolate also
  @returns {String} the localized and formatted string.
*/
String.prototype.loc = function() {
  var str = SC.STRINGS[this] || this;
  return str.fmt.apply(str,arguments) ;
};


  
/**
  Splits the string into words, separated by spaces. Empty strings are
  removed from the results.
  
  @returns {Array} an array of non-empty strings
*/
String.prototype.w = function() { 
  var ary = [], ary2 = this.split(' '), len = ary2.length, str, idx=0;
  for (idx=0; idx<len; ++idx) {
    str = ary2[idx] ;
    if (str.length !== 0) ary.push(str) ; // skip empty strings
  }
  return ary ;
};

/* >>>>>>>>>> BEGIN source/private/observer_set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ........................................................................
// ObserverSet
//

/**
  @namespace

  This private class is used to store information about obversers on a 
  particular key.  Note that this object is not observable.  You create new
  instances by calling SC.beget(SC.ObserverSet) ;

  @since SproutCore 1.0
*/
SC.ObserverSet = {

  /**
    the number of targets in the set.
  */
  targets: 0,
  
  _membersCacheIsValid: NO,
  
  /**
    Adds the named target/method observer to the set.  The method must be
    a function, not a string.
    
    Note that in debugging mode only, this method is overridden to also record
    the name of the object and function that resulted in the target/method
    being added.
  */
  add: function(target, method, context) {
    var targetGuid = (target) ? SC.guidFor(target) : "__this__";
    
    // get the set of methods
    var methods = this[targetGuid] ;
    if (!methods) {
      methods = this[targetGuid] = SC.CoreSet.create() ;
      methods.target = target ;
      methods.isTargetSet = YES ; // used for getMembers().
      this.targets++ ;
    }
    methods.add(method) ;
    
    // context is really useful sometimes but not used that often so this
    // implementation is intentionally lazy.
    if (context !== undefined) {
      var contexts = methods.contexts ;
      if (!contexts) context = methods.contexts = {} ;
      contexts[SC.guidFor(method)] = context ;
    }
    
    this._membersCacheIsValid = NO ;
  },
  
  /**
    removes the named target/method observer from the set.  If this is the
    last method for the named target, then the number of targets will also
    be reduced.
  
    returns YES if the items was removed, NO if it was not found.
  */
  remove: function(target, method) {
    var targetGuid = (target) ? SC.guidFor(target) : "__this__";
    
    // get the set of methods
    var methods = this[targetGuid] ;    
    if (!methods) return NO ;
    
    methods.remove(method) ;
    if (methods.length <= 0) {
      methods.target = null;
      methods.isTargetSet = NO ;
      methods.contexts = null ;
      delete this[targetGuid] ;
      this.targets-- ;
      
    } else if (methods.contexts) {
      delete methods.contexts[SC.guidFor(method)];
    }

    this._membersCacheIsValid = NO;
    
    return YES ;
  },
  
  /**
    Invokes the target/method pairs in the receiver.  Used by SC.RunLoop
    Note: does not support context
  */
  invokeMethods: function() {
    var key, value, idx, target, val;
    
    // iterate through the set, look for sets.
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      value = this[key] ;
      if (value && value.isTargetSet) {
        idx = value.length;
        target = value.target ;
        while(--idx>=0) {
          val = value[idx];
          if(val) val.call(target);
        }
      }
    }
  },
  
  /**
    Returns an array of target/method pairs.  This is cached.
  */
  getMembers: function() {
    if (this._membersCacheIsValid) return this._members ;
    
    // need to recache, reset the array...
    if (!this._members) {
      this._members = [] ;
    } else this._members.length = 0 ; // reset
    var ret = this._members ;

    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;
        
        // slightly slower - only do if we have contexts
        var contexts = value.contexts ;
        if (contexts) {
          while(--idx>=0) {
            var method = value[idx] ;
            ret.push([target, method, contexts[SC.guidFor(method)]]) ;
          }
        } else {
          while(--idx>=0) ret.push([target, value[idx]]);
        }
      }
    }

    this._membersCacheIsValid = YES ;
    return ret ;
  },
  
  /**
    Returns a new instance of the set with the contents cloned.
  */
  clone: function() {
    var oldSet, newSet, key, ret = SC.ObserverSet.create() ;
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      oldSet = this[key];
      if (oldSet && oldSet.isTargetSet) {
        newSet = oldSet.clone();
        newSet.target = oldSet.target ;
        if (oldSet.contexts) newSet.contexts = SC.clone(oldSet.contexts);
        ret[key] = newSet ;
      }
    }
    ret.targets = this.targets ;
    ret._membersCacheIsValid = NO ;
    return ret ;
  },
  
  /**
    Creates a new instance of the observer set.
  */
  create: function() { return SC.beget(this); }
  
} ;

SC.ObserverSet.slice = SC.ObserverSet.clone ;



/* >>>>>>>>>> BEGIN source/mixins/observable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('private/observer_set') ;

/*globals logChange */

/**
  Set to YES to have all observing activity logged to the console.  This 
  should be used for debugging only.
  
  @property {Boolean}
*/
SC.LOG_OBSERVERS = NO ;

/**
  @namespace 
  
  Key-Value-Observing (KVO) simply allows one object to observe changes to a 
  property on another object. It is one of the fundamental ways that models, 
  controllers and views communicate with each other in a SproutCore 
  application.  Any object that has this module applied to it can be used in 
  KVO-operations.
  
  This module is applied automatically to all objects that inherit from
  SC.Object, which includes most objects bundled with the SproutCore 
  framework.  You will not generally apply this module to classes yourself,
  but you will use the features provided by this module frequently, so it is
  important to understand how to use it.
  
  h2. Enabling Key Value Observing

  With KVO, you can write functions that will be called automatically whenever 
  a property on a particular object changes.  You can use this feature to
  reduce the amount of "glue code" that you often write to tie the various 
  parts of your application together.
  
  To use KVO, just use the KVO-aware methods get() and set() to access 
  properties instead of accessing properties directly.  Instead of writing:
  
  {{{
    var aName = contact.firstName ;
    contact.firstName = 'Charles' ;
  }}}

  use:

  {{{
    var aName = contact.get('firstName') ;
    contact.set('firstName', 'Charles') ;
  }}}
  
  get() and set() work just like the normal "dot operators" provided by 
  JavaScript but they provide you with much more power, including not only
  observing but computed properties as well.

  h2. Observing Property Changes

  You typically observe property changes simply by adding the observes() 
  call to the end of your method declarations in classes that you write.  For
  example:
  
  {{{
    SC.Object.create({
      valueObserver: function() {
        // Executes whenever the "Value" property changes
      }.observes('value')
    }) ;
  }}}
  
  Although this is the most common way to add an observer, this capability is
  actually built into the SC.Object class on top of two methods defined in
  this mixin called addObserver() and removeObserver().  You can use these two
  methods to add and remove observers yourself if you need to do so at run 
  time.  
  
  To add an observer for a property, just call:
  
  {{{
    object.addObserver('propertyKey', targetObject, targetAction) ;
  }}}
  
  This will call the 'targetAction' method on the targetObject to be called
  whenever the value of the propertyKey changes.
  
  h2. Observer Parameters
  
  An observer function typically does not need to accept any parameters, 
  however you can accept certain arguments when writing generic observers. 
  An observer function can have the following arguments:
  
  {{{
    propertyObserver(target, key, value, revision) ;
  }}}
  
  - *target* - This is the object whose value changed.  Usually this.
  - *key* - The key of the value that changed
  - *value* - this property is no longer used.  It will always be null
  - *revision* - this is the revision of the target object
  
  h2. Implementing Manual Change Notifications
  
  Sometimes you may want to control the rate at which notifications for 
  a property are delivered, for example by checking first to make sure 
  that the value has changed.
  
  To do this, you need to implement a computed property for the property 
  you want to change and override automaticallyNotifiesObserversFor().
  
  The example below will only notify if the "balance" property value actually
  changes:
  
  {{{
    
    automaticallyNotifiesObserversFor: function(key) {
      return (key === 'balance') ? NO : arguments.callee.base.apply(this,arguments) ;
    },
    
    balance: function(key, value) {
      var balance = this._balance ;
      if ((value !== undefined) && (balance !== value)) {
        this.propertyWillChange(key) ;
        balance = this._balance = value ;
        this.propertyDidChange(key) ;
      }
      return balance ;
    }
    
  }}}
  
  h1. Implementation Details
  
  Internally, SproutCore keeps track of observable information by adding a
  number of properties to the object adopting the observable.  All of these
  properties begin with "_kvo_" to separate them from the rest of your object.
  
  @static
  @since SproutCore 1.0
*/
SC.Observable = {

  /** 
    Walk like that ol' duck 
    
    @property {Boolean}
  */
  isObservable: YES,
  
  /**
    Determines whether observers should be automatically notified of changes
    to a key.
    
    If you are manually implementing change notifications for a property, you
    can override this method to return NO for properties you do not want the
    observing system to automatically notify for.
    
    The default implementation always returns YES.
    
    @param key {String} the key that is changing
    @returns {Boolean} YES if automatic notification should occur.
  */
  automaticallyNotifiesObserversFor: function(key) { 
    return YES;
  },

  // ..........................................
  // PROPERTIES
  // 
  // Use these methods to get/set properties.  This will handle observing
  // notifications as well as allowing you to define functions that can be 
  // used as properties.

  /**  
    Retrieves the value of key from the object.
    
    This method is generally very similar to using object[key] or object.key,
    however it supports both computed properties and the unknownProperty
    handler.
    
    *Computed Properties*
    
    Computed properties are methods defined with the property() modifier
    declared at the end, such as:
    
    {{{
      fullName: function() {
        return this.getEach('firstName', 'lastName').compact().join(' ');
      }.property('firstName', 'lastName')
    }}}
    
    When you call get() on a computed property, the property function will be
    called and the return value will be returned instead of the function
    itself.
    
    *Unknown Properties*
    
    Likewise, if you try to call get() on a property whose values is
    undefined, the unknownProperty() method will be called on the object.
    If this method reutrns any value other than undefined, it will be returned
    instead.  This allows you to implement "virtual" properties that are 
    not defined upfront.
    
    @param key {String} the property to retrieve
    @returns {Object} the property value or undefined.
    
  */
  get: function(key) {
    var ret = this[key], cache ;
    if (ret === undefined) {
      return this.unknownProperty(key) ;
    } else if (ret && ret.isProperty) {
      if (ret.isCacheable) {
        cache = this._kvo_cache ;
        if (!cache) cache = this._kvo_cache = {};
        return (cache[ret.cacheKey] !== undefined) ? cache[ret.cacheKey] : (cache[ret.cacheKey] = ret.call(this,key)) ;
      } else return ret.call(this,key);
    } else return ret ;
  },

  /**  
    Sets the key equal to value.
    
    This method is generally very similar to calling object[key] = value or
    object.key = value, except that it provides support for computed 
    properties, the unknownProperty() method and property observers.
    
    *Computed Properties*
    
    If you try to set a value on a key that has a computed property handler
    defined (see the get() method for an example), then set() will call
    that method, passing both the value and key instead of simply changing 
    the value itself.  This is useful for those times when you need to 
    implement a property that is composed of one or more member
    properties.
    
    *Unknown Properties*
    
    If you try to set a value on a key that is undefined in the target 
    object, then the unknownProperty() handler will be called instead.  This
    gives you an opportunity to implement complex "virtual" properties that
    are not predefined on the obejct.  If unknownProperty() returns 
    undefined, then set() will simply set the value on the object.
    
    *Property Observers*
    
    In addition to changing the property, set() will also register a 
    property change with the object.  Unless you have placed this call 
    inside of a beginPropertyChanges() and endPropertyChanges(), any "local"
    observers (i.e. observer methods declared on the same object), will be
    called immediately.  Any "remote" observers (i.e. observer methods 
    declared on another object) will be placed in a queue and called at a
    later time in a coelesced manner.
    
    *Chaining*
    
    In addition to property changes, set() returns the value of the object
    itself so you can do chaining like this:
    
    {{{
      record.set('firstName', 'Charles').set('lastName', 'Jolley');
    }}}
    
    @param key {String} the property to set
    @param value {Object} the value to set or null.
    @returns {SC.Observable}
  */
  set: function(key, value) {
    var func   = this[key], 
        notify = this.automaticallyNotifiesObserversFor(key),
        ret    = value, 
        cachedep, cache, idx, dfunc ;

    // if there are any dependent keys and they use caching, then clear the
    // cache.  (If we're notifying, then propertyDidChange will do this for
    // us.)
    if (!notify && this._kvo_cacheable && (cache = this._kvo_cache)) {
      // lookup the cached dependents for this key.  if undefined, compute.
      // note that if cachdep is set to null is means we figure out it has no
      // cached dependencies already.  this is different from undefined.
      cachedep = this._kvo_cachedep;
      if (!cachedep || (cachedep = cachedep[key])===undefined) {
        cachedep = this._kvo_computeCachedDependentsFor(key);
      }
      
      if (cachedep) {
        idx = cachedep.length;
        while(--idx>=0) {
          dfunc = cachedep[idx];
          cache[dfunc.cacheKey] = cache[dfunc.lastSetValueKey] = undefined;
        }
      }
    }

    // set the value.
    if (func && func.isProperty) {
      cache = this._kvo_cache;
      if (func.isVolatile || !cache || (cache[func.lastSetValueKey] !== value)) {
        if (!cache) cache = this._kvo_cache = {};

        cache[func.lastSetValueKey] = value ;
        if (notify) this.propertyWillChange(key) ;
        ret = func.call(this,key,value) ;

        // update cached value
        if (func.isCacheable) cache[func.cacheKey] = ret ;
        if (notify) this.propertyDidChange(key, ret, YES) ;
      }

    } else if (func === undefined) {
      if (notify) this.propertyWillChange(key) ;
      this.unknownProperty(key,value) ;
      if (notify) this.propertyDidChange(key, ret) ;

    } else {
      if (this[key] !== value) {
        if (notify) this.propertyWillChange(key) ;
        ret = this[key] = value ;
        if (notify) this.propertyDidChange(key, ret) ;
      }
    }

    return this ;
  },

  /**  
    Called whenever you try to get or set an undefined property.
    
    This is a generic property handler.  If you define it, it will be called
    when the named property is not yet set in the object.  The default does
    nothing.
    
    @param key {String} the key that was requested
    @param value {Object} The value if called as a setter, undefined if called as a getter.
    @returns {Object} The new value for key.
  */
  unknownProperty: function(key,value) {
    if (!(value === undefined)) { this[key] = value; }
    return value ;
  },

  /**  
    Begins a grouping of property changes.
    
    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished.  If you plan to make a 
    large number of changes to an object at one time, you should call this 
    method at the beginning of the changes to suspend change notifications.
    When you are done making changes, all endPropertyChanges() to allow 
    notification to resume.
    
    @returns {SC.Observable}
  */
  beginPropertyChanges: function() {
    this._kvo_changeLevel = (this._kvo_changeLevel || 0) + 1; 
    return this;
  },

  /**  
    Ends a grouping of property changes.
    
    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished.  If you plan to make a 
    large number of changes to an object at one time, you should call 
    beginPropertyChanges() at the beginning of the changes to suspend change 
    notifications. When you are done making changes, call this method to allow 
    notification to resume.
    
    @returns {SC.Observable}
  */
  endPropertyChanges: function() {
    this._kvo_changeLevel = (this._kvo_changeLevel || 1) - 1 ;
    var level = this._kvo_changeLevel, changes = this._kvo_changes;
    if ((level<=0) && changes && (changes.length>0) && !SC.Observers.isObservingSuspended) {
      this._notifyPropertyObservers() ;
    } 
    return this ;
  },

  /**  
    Notify the observer system that a property is about to change.

    Sometimes you need to change a value directly or indirectly without 
    actually calling get() or set() on it.  In this case, you can use this 
    method and propertyDidChange() instead.  Calling these two methods 
    together will notify all observers that the property has potentially 
    changed value.
    
    Note that you must always call propertyWillChange and propertyDidChange as 
    a pair.  If you do not, it may get the property change groups out of order 
    and cause notifications to be delivered more often than you would like.
    
    @param key {String} The property key that is about to change.
    @returns {SC.Observable}
  */
  propertyWillChange: function(key) {
    return this ;
  },

  /**  
    Notify the observer system that a property has just changed.

    Sometimes you need to change a value directly or indirectly without 
    actually calling get() or set() on it.  In this case, you can use this 
    method and propertyWillChange() instead.  Calling these two methods 
    together will notify all observers that the property has potentially 
    changed value.
    
    Note that you must always call propertyWillChange and propertyDidChange as 
    a pair. If you do not, it may get the property change groups out of order 
    and cause notifications to be delivered more often than you would like.
    
    @param key {String} The property key that has just changed.
    @param value {Object} The new value of the key.  May be null.
    @returns {SC.Observable}
  */
  propertyDidChange: function(key,value, _keepCache) {

    this._kvo_revision = (this._kvo_revision || 0) + 1; 
    var level = this._kvo_changeLevel || 0,
        cachedep, idx, dfunc, cache, func,
        log = SC.LOG_OBSERVERS && !(this.LOG_OBSERVING===NO);

    if (cache = this._kvo_cache) {

      // clear any cached value
      if (!_keepCache) {
        func = this[key] ;
        if (func && func.isProperty) {
          cache[func.cacheKey] = cache[func.lastSetValueKey] = undefined ;
        }
      }

      if (this._kvo_cacheable) {
        // if there are any dependent keys and they use caching, then clear the
        // cache.  This is the same code as is in set.  It is inlined for perf.
        cachedep = this._kvo_cachedep;
        if (!cachedep || (cachedep = cachedep[key])===undefined) {
          cachedep = this._kvo_computeCachedDependentsFor(key);
        }

        if (cachedep) {
          idx = cachedep.length;
          while(--idx>=0) {
            dfunc = cachedep[idx];
            cache[dfunc.cacheKey] = cache[dfunc.lastSetValueKey] = undefined;
          }
        }
      }
    }

    // save in the change set if queuing changes
    var suspended = SC.Observers.isObservingSuspended;
    if ((level > 0) || suspended) {
      var changes = this._kvo_changes ;
      if (!changes) changes = this._kvo_changes = SC.CoreSet.create() ;
      changes.add(key) ;
      
      if (suspended) {
        if (log) console.log("%@%@: will not notify observers because observing is suspended".fmt(SC.KVO_SPACES,this));
        SC.Observers.objectHasPendingChanges(this) ;
      }
      
    // otherwise notify property observers immediately
    } else this._notifyPropertyObservers(key) ;
    
    return this ;
  },

  // ..........................................
  // DEPENDENT KEYS
  // 

  /**
    Use this to indicate that one key changes if other keys it depends on 
    change.  Pass the key that is dependent and additional keys it depends
    upon.  You can either pass the additional keys inline as arguments or 
    in a single array.
    
    You generally do not call this method, but instead pass dependent keys to
    your property() method when you declare a computed property.
    
    You can call this method during your init to register the keys that should
    trigger a change notification for your computed properties.  
    
    @param {String} key the dependent key
    @param {Array|String} dependentKeys one or more dependent keys 
    @returns {Object} this
  */  
  registerDependentKey: function(key, dependentKeys) {
    var dependents = this._kvo_dependents,
        func       = this[key],
        keys, idx, lim, dep, queue;

    // normalize input.
    if (SC.typeOf(dependentKeys) === SC.T_ARRAY) {
      keys = dependentKeys;
      lim  = 0;
    } else {
      keys = arguments;
      lim  = 1;
    }
    idx  = keys.length;

    // define dependents if not defined already.
    if (!dependents) this._kvo_dependents = dependents = {} ;

    // for each key, build array of dependents, add this key...
    // note that we ignore the first argument since it is the key...
    while(--idx >= lim) {
      dep = keys[idx] ;

      // add dependent key to dependents array of key it depends on
      queue = dependents[dep] ;
      if (!queue) queue = dependents[dep] = [] ;
      queue.push(key) ;
    }
  },

  /** @private 
  
    Helper method used by computeCachedDependents.  Just loops over the 
    array of dependent keys.  If the passed function is cacheable, it will
    be added to the queue.  Also, recursively call on each keys dependent 
    keys.
  
    @param {Array} queue the queue to add functions to
    @param {Array} keys the array of dependent keys for this key
    @param {Hash} dependents the _kvo_dependents cache
    @param {SC.Set} seen already seen keys
    @returns {void}
  */
  _kvo_addCachedDependents: function(queue, keys, dependents, seen) {
    var idx = keys.length,
        func, key, deps ;
        
    while(--idx >= 0) {
      key  = keys[idx];
      seen.add(key);
      
      // if the value for this key is a computed property, then add it to the
      // set if it is cacheable, and process any of its dependent keys also.
      func = this[key];
      if (func && (func instanceof Function) && func.isProperty) {
        if (func.isCacheable) queue.push(func); // handle this func
        if ((deps = dependents[key]) && deps.length>0) { // and any dependents
          this._kvo_addCachedDependents(queue, deps, dependents, seen);
        }
      } 
    }
        
  },
  
  /** @private

    Called by set() whenever it needs to determine which cached dependent
    keys to clear.  Recursively searches dependent keys to determine all 
    cached property direcly or indirectly affected.
    
    The return value is also saved for future reference
    
    @param {String} key the key to compute
    @returns {Array}
  */
  _kvo_computeCachedDependentsFor: function(key) {
    var cached     = this._kvo_cachedep,
        dependents = this._kvo_dependents,
        keys       = dependents ? dependents[key] : null,
        queue, seen ;
    if (!cached) cached = this._kvo_cachedep = {};

    // if there are no dependent keys, then just set and return null to avoid
    // this mess again.
    if (!keys || keys.length===0) return cached[key] = null;

    // there are dependent keys, so we need to do the work to find out if 
    // any of them or their dependent keys are cached.
    queue = cached[key] = [];
    seen  = SC._TMP_SEEN_SET = (SC._TMP_SEEN_SET || SC.CoreSet.create());
    seen.add(key);
    this._kvo_addCachedDependents(queue, keys, dependents, seen);
    seen.clear(); // reset
    
    if (queue.length === 0) queue = cached[key] = null ; // turns out nothing
    return queue ;
  },
  
  // ..........................................
  // OBSERVERS
  // 
  
  _kvo_for: function(kvoKey, type) {
    var ret = this[kvoKey] ;

    if (!this._kvo_cloned) this._kvo_cloned = {} ;
    
    // if the item does not exist, create it.  Unless type is passed, 
    // assume array.
    if (!ret) {
      ret = this[kvoKey] = (type === undefined) ? [] : type.create();
      this._kvo_cloned[kvoKey] = YES ;
      
    // if item does exist but has not been cloned, then clone it.  Note
    // that all types must implement copy().0
    } else if (!this._kvo_cloned[kvoKey]) {
      ret = this[kvoKey] = ret.copy();
      this._kvo_cloned[kvoKey] = YES; 
    }
    
    return ret ;
  },

  /**  
    Adds an observer on a property.
    
    This is the core method used to register an observer for a property.
    
    Once you call this method, anytime the key's value is set, your observer
    will be notified.  Note that the observers are triggered anytime the
    value is set, regardless of whether it has actually changed.  Your
    observer should be prepared to handle that.
    
    You can also pass an optional context parameter to this method.  The 
    context will be passed to your observer method whenever it is triggered.
    Note that if you add the same target/method pair on a key multiple times
    with different context parameters, your observer will only be called once
    with the last context you passed.
    
    h2. Observer Methods
    
    Observer methods you pass should generally have the following signature if
    you do not pass a "context" parameter:
    
    {{{
      fooDidChange: function(sender, key, value, rev);
    }}}
    
    The sender is the object that changed.  The key is the property that
    changes.  The value property is currently reserved and unused.  The rev
    is the last property revision of the object when it changed, which you can
    use to detect if the key value has really changed or not.
    
    If you pass a "context" parameter, the context will be passed before the
    revision like so:
    
    {{{
      fooDidChange: function(sender, key, value, context, rev);
    }}}
    
    Usually you will not need the value, context or revision parameters at 
    the end.  In this case, it is common to write observer methods that take
    only a sender and key value as parameters or, if you aren't interested in
    any of these values, to write an observer that has no parameters at all.
    
    @param key {String} the key to observer
    @param target {Object} the target object to invoke
    @param method {String|Function} the method to invoke.
    @param context {Object} optional context
    @returns {SC.Object} self
  */
  addObserver: function(key, target, method, context) {
    
    var kvoKey, chain, chains, observers;
    
    // normalize.  if a function is passed to target, make it the method.
    if (method === undefined) {
      method = target; target = this ;
    }
    if (!target) target = this ;
    if (SC.typeOf(method) === SC.T_STRING) method = target[method] ;
    if (!method) throw "You must pass a method to addObserver()" ;

    // Normalize key...
    key = key.toString() ;
    if (key.indexOf('.') >= 0) {
      
      // create the chain and save it for later so we can tear it down if 
      // needed.
      chain = SC._ChainObserver.createChain(this, key, target, method, context);
      chain.masterTarget = target;  
      chain.masterMethod = method ;
      
      // Save in set for chain observers.
      this._kvo_for(SC.keyFor('_kvo_chains', key)).push(chain);
      
    // Create observers if needed...
    } else {
      
      // Special case to support reduced properties.  If the property 
      // key begins with '@' and its value is unknown, then try to get its
      // value.  This will configure the dependent keys if needed.
      if ((this[key] === undefined) && (key.indexOf('@') === 0)) {
        this.get(key) ;
      }

      if (target === this) target = null ; // use null for observers only.
      kvoKey = SC.keyFor('_kvo_observers', key);
      this._kvo_for(kvoKey, SC.ObserverSet).add(target, method, context);
      this._kvo_for('_kvo_observed_keys', SC.CoreSet).add(key) ;
    }

    if (this.didAddObserver) this.didAddObserver(key, target, method);
    return this;
  },

  /**
    Remove an observer you have previously registered on this object.  Pass
    the same key, target, and method you passed to addObserver() and your 
    target will no longer receive notifications.
    
    @returns {SC.Observable} reciever
  */
  removeObserver: function(key, target, method) {
    
    var kvoKey, chains, chain, observers, idx ;
    
    // normalize.  if a function is passed to target, make it the method.
    if (method === undefined) {
      method = target; target = this ;
    }
    if (!target) target = this ;
    if (SC.typeOf(method) === SC.T_STRING) method = target[method] ;
    if (!method) throw "You must pass a method to removeObserver()" ;

    // if the key contains a '.', this is a chained observer.
    key = key.toString() ;
    if (key.indexOf('.') >= 0) {
      
      // try to find matching chains
      kvoKey = SC.keyFor('_kvo_chains', key);
      if (chains = this[kvoKey]) {
        
        // if chains have not been cloned yet, do so now.
        chains = this._kvo_for(kvoKey) ;
        
        // remove any chains
        idx = chains.length;
        while(--idx >= 0) {
          chain = chains[idx];
          if (chain && (chain.masterTarget===target) && (chain.masterMethod===method)) {
            chains[idx] = chain.destroyChain() ;
          }
        }
      }
      
    // otherwise, just like a normal observer.
    } else {
      if (target === this) target = null ; // use null for observers only.
      kvoKey = SC.keyFor('_kvo_observers', key) ;
      if (observers = this[kvoKey]) {
        // if observers have not been cloned yet, do so now
        observers = this._kvo_for(kvoKey) ;
        observers.remove(target, method) ;
        if (observers.targets <= 0) {
          this._kvo_for('_kvo_observed_keys', SC.CoreSet).remove(key);
        }
      }
    }

    if (this.didRemoveObserver) this.didRemoveObserver(key, target, method);
    return this;
  },
  
  /**
    Returns YES if the object currently has observers registered for a 
    particular key.  You can use this method to potentially defer performing
    an expensive action until someone begins observing a particular property
    on the object.
    
    @param {String} key key to check
    @returns {Boolean}
  */
  hasObserverFor: function(key) {
    SC.Observers.flush(this) ; // hookup as many observers as possible.
    
    var observers = this[SC.keyFor('_kvo_observers', key)],
        locals    = this[SC.keyFor('_kvo_local', key)],
        members ;

    if (locals && locals.length>0) return YES ;
    if (observers && observers.getMembers().length>0) return YES ;
    return NO ;
  },

  /**
    This method will register any observers and computed properties saved on
    the object.  Normally you do not need to call this method youself.  It
    is invoked automatically just before property notifications are sent and
    from the init() method of SC.Object.  You may choose to call this
    from your own initialization method if you are using SC.Observable in
    a non-SC.Object-based object.
    
    This method looks for several private variables, which you can setup,
    to initialize:
    
      - _observers: this should contain an array of key names for observers
        you need to configure.
        
      - _bindings: this should contain an array of key names that configure
        bindings.
        
      - _properties: this should contain an array of key names for computed
        properties.
        
    @returns {Object} this
  */
  initObservable: function() {
    if (this._observableInited) return ;
    this._observableInited = YES ;
    
    var loc, keys, key, value, observer, propertyPaths, propertyPathsLength,
        len, ploc, path, dotIndex, root, propertyKey, keysLen;
    
    // Loop through observer functions and register them
    if (keys = this._observers) {
      len = keys.length ;
      for(loc=0;loc<len;loc++) {
        key = keys[loc]; observer = this[key] ;
        propertyPaths = observer.propertyPaths ;
        propertyPathsLength = (propertyPaths) ? propertyPaths.length : 0 ;
        for(ploc=0;ploc<propertyPathsLength;ploc++) {
          path = propertyPaths[ploc] ;
          dotIndex = path.indexOf('.') ;
          // handle most common case, observing a local property
          if (dotIndex < 0) {
            this.addObserver(path, this, observer) ;

          // next most common case, use a chained observer
          } else if (path.indexOf('*') === 0) {
            this.addObserver(path.slice(1), this, observer) ;
            
          // otherwise register the observer in the observers queue.  This 
          // will add the observer now or later when the named path becomes
          // available.
          } else {
            root = null ;
            
            // handle special cases for observers that look to the local root
            if (dotIndex === 0) {
              root = this; path = path.slice(1) ;
            } else if (dotIndex===4 && path.slice(0,5) === 'this.') {
              root = this; path = path.slice(5) ;
            } else if (dotIndex<0 && path.length===4 && path === 'this') {
              root = this; path = '';
            }
            
            SC.Observers.addObserver(path, this, observer, root); 
          }
        }
      }
    }

    // Add Bindings
    this.bindings = []; // will be filled in by the bind() method.
    if (keys = this._bindings) {
      for(loc=0, keysLen = keys.length; loc < keysLen;loc++) {
        // get propertyKey
        key = keys[loc] ; value = this[key] ;
        propertyKey = key.slice(0,-7) ; // contentBinding => content
        this[key] = this.bind(propertyKey, value) ;
      }
    }

    // Add Properties
    if (keys = this._properties) {
      for(loc=0, keysLen = keys.length; loc<keysLen;loc++) {
        key = keys[loc];
        if (value = this[key]) {

          // activate cacheable only if needed for perf reasons
          if (value.isCacheable) this._kvo_cacheable = YES; 

          // register dependent keys
          if (value.dependentKeys && (value.dependentKeys.length>0)) {
            this.registerDependentKey(key, value.dependentKeys) ;
          }
        }
      }
    }
    
  },
  
  // ..........................................
  // NOTIFICATION
  // 

  /**
    Returns an array with all of the observers registered for the specified
    key.  This is intended for debugging purposes only.  You generally do not
    want to rely on this method for production code.
    
    @params key {String} the key to evaluate
    @returns {Array} array of Observer objects, describing the observer.
  */
  observersForKey: function(key) {
    var observers = this._kvo_for('_kvo_observers', key) ;
    return observers.getMembers() || [] ;
  },
  
  // this private method actually notifies the observers for any keys in the
  // observer queue.  If you pass a key it will be added to the queue.
  _notifyPropertyObservers: function(key) {

    if (!this._observableInited) this.initObservable() ;
    
    SC.Observers.flush(this) ; // hookup as many observers as possible.

    var log = SC.LOG_OBSERVERS && !(this.LOG_OBSERVING===NO),
        observers, changes, dependents, starObservers, idx, keys, rev,
        members, membersLength, member, memberLoc, target, method, loc, func,
        context, spaces, cache ;

    if (log) {
      spaces = SC.KVO_SPACES = (SC.KVO_SPACES || '') + '  ';
      console.log('%@%@: notifying observers after change to key "%@"'.fmt(spaces, this, key));
    }
    
    // Get any starObservers -- they will be notified of all changes.
    starObservers =  this['_kvo_observers_*'] ;
    
    // prevent notifications from being sent until complete
    this._kvo_changeLevel = (this._kvo_changeLevel || 0) + 1; 

    // keep sending notifications as long as there are changes
    while(((changes = this._kvo_changes) && (changes.length > 0)) || key) {
      
      // increment revision
      rev = ++this.propertyRevision ;
      
      // save the current set of changes and swap out the kvo_changes so that
      // any set() calls by observers will be saved in a new set.
      if (!changes) changes = SC.CoreSet.create() ;
      this._kvo_changes = null ;

      // Add the passed key to the changes set.  If a '*' was passed, then
      // add all keys in the observers to the set...
      // once finished, clear the key so the loop will end.
      if (key === '*') {
        changes.add('*') ;
        changes.addEach(this._kvo_for('_kvo_observed_keys', SC.CoreSet));

      } else if (key) changes.add(key) ;

      // Now go through the set and add all dependent keys...
      if (dependents = this._kvo_dependents) {

        // NOTE: each time we loop, we check the changes length, this
        // way any dependent keys added to the set will also be evaluated...
        for(idx=0;idx<changes.length;idx++) {
          key = changes[idx] ;
          keys = dependents[key] ;
          
          // for each dependent key, add to set of changes.  Also, if key
          // value is a cacheable property, clear the cached value...
          if (keys && (loc = keys.length)) {
            if (log) {
              console.log("%@...including dependent keys for %@: %@".fmt(spaces, key, keys));
            }
            cache = this._kvo_cache;
            if (!cache) cache = this._kvo_cache = {};
            while(--loc >= 0) {
              changes.add(key = keys[loc]);
              if (func = this[key]) {
                this[func.cacheKey] = undefined;
                cache[func.cacheKey] = cache[func.lastSetValueKey] = undefined;
              } // if (func=)
            } // while (--loc)
          } // if (keys && 
        } // for(idx...
      } // if (dependents...)

      // now iterate through all changed keys and notify observers.
      while(changes.length > 0) {
        key = changes.pop() ; // the changed key

        // find any observers and notify them...
        observers = this[SC.keyFor('_kvo_observers', key)];
        if (observers) {
          members = observers.getMembers() ;
          membersLength = members.length ;
          for(memberLoc=0;memberLoc < membersLength; memberLoc++) {
            member = members[memberLoc] ;
            if (member[3] === rev) continue ; // skip notified items.

            target = member[0] || this; 
            method = member[1] ; 
            context = member[2];
            member[3] = rev;
            
            if (log) console.log('%@...firing observer on %@ for key "%@"'.fmt(spaces, target, key));
            if (context !== undefined) {
              method.call(target, this, key, null, context, rev);
            } else {
              method.call(target, this, key, null, rev) ;
            }
          }
        }

        // look for local observers.  Local observers are added by SC.Object
        // as an optimization to avoid having to add observers for every 
        // instance when you are just observing your local object.
        members = this[SC.keyFor('_kvo_local', key)];
        if (members) {
          membersLength = members.length ;
          for(memberLoc=0;memberLoc<membersLength;memberLoc++) {
            member = members[memberLoc];
            method = this[member] ; // try to find observer function
            if (method) {
              if (log) console.log('%@...firing local observer %@.%@ for key "%@"'.fmt(spaces, this, member, key));
              method.call(this, this, key, null, rev);
            }
          }
        }
        
        // if there are starObservers, do the same thing for them
        if (starObservers && key !== '*') {          
          members = starObservers.getMembers() ;
          membersLength = members.length ;
          for(memberLoc=0;memberLoc < membersLength; memberLoc++) {
            member = members[memberLoc] ;
            target = member[0] || this; 
            method = member[1] ;
            context = member[2] ;
            
            if (log) console.log('%@...firing * observer on %@ for key "%@"'.fmt(spaces, target, key));
            if (context !== undefined) {
              method.call(target, this, key, null, context, rev);
            } else {
              method.call(target, this, key, null, rev) ;
            }
          }
        }

        // if there is a default property observer, call that also
        if (this.propertyObserver) {
          if (log) console.log('%@...firing %@.propertyObserver for key "%@"'.fmt(spaces, this, key));
          this.propertyObserver(this, key, null, rev);
        }
      } // while(changes.length>0)

      // changes set should be empty. release it for reuse
      if (changes) changes.destroy() ;
      
      // key is no longer needed; clear it to avoid infinite loops
      key = null ; 
      
    } // while (changes)
    
    // done with loop, reduce change level so that future sets can resume
    this._kvo_changeLevel = (this._kvo_changeLevel || 1) - 1; 
    
    if (log) SC.KVO_SPACES = spaces.slice(0, -2);
    
    return YES ; // finished successfully
  },

  // ..........................................
  // BINDINGS
  // 
    
  /**  
    Manually add a new binding to an object.  This is the same as doing
    the more familiar propertyBinding: 'property.path' approach.
    
    @param {String} toKey the key to bind to
    @param {Object} target target or property path to bind from
    @param {String|Function} method method for target to bind from
    @returns {SC.Binding} new binding instance
  */
  bind: function(toKey, target, method) {

    var binding , pathType;

    // normalize...
    if (method !== undefined) target = [target, method];

    // if a string or array (i.e. tuple) is passed, convert this into a
    // binding.  If a binding default was provided, use that.
    pathType = SC.typeOf(target) ;
    if (pathType === SC.T_STRING || pathType === SC.T_ARRAY) {
      binding = this[toKey + 'BindingDefault'] || SC.Binding;
      binding = binding.beget().from(target) ;
    } else binding = target ;

    // finish configuring the binding and then connect it.
    binding = binding.to(toKey, this).connect() ;
    this.bindings.push(binding) ;
    
    return binding ;
  },
  
  /**  
    didChangeFor makes it easy for you to verify that you haven't seen any
    changed values.  You need to use this if your method observes multiple
    properties.  To use this, call it like this:
  
    if (this.didChangeFor('render','height','width')) {
       // DO SOMETHING HERE IF CHANGED.
    }
  */  
  didChangeFor: function(context) { 
    var valueCache, revisionCache, seenValues, seenRevisions, ret,
        currentRevision, idx, key, value;
    context = SC.hashFor(context) ; // get a hash key we can use in caches.
    
    // setup caches...
    valueCache = this._kvo_didChange_valueCache ;
    if (!valueCache) valueCache = this._kvo_didChange_valueCache = {};
    revisionCache = this._kvo_didChange_revisionCache;
    if (!revisionCache) revisionCache=this._kvo_didChange_revisionCache={};

    // get the cache of values and revisions already seen in this context
    seenValues = valueCache[context] || {} ;
    seenRevisions = revisionCache[context] || {} ;
    
    // prepare too loop!
    ret = false ;
    currentRevision = this._kvo_revision || 0  ;
    idx = arguments.length ;
    while(--idx >= 1) {  // NB: loop only to 1 to ignore context arg.
      key = arguments[idx];
      
      // has the kvo revision changed since the last time we did this?
      if (seenRevisions[key] != currentRevision) {
        // yes, check the value with the last seen value
        value = this.get(key) ;
        if (seenValues[key] !== value) {
          ret = true ; // did change!
          seenValues[key] = value;
        }
      }
      seenRevisions[key] = currentRevision;
    }
    
    valueCache[context] = seenValues ;
    revisionCache[context] = seenRevisions ;
    return ret ;
  },



  /**
    Sets the property only if the passed value is different from the
    current value.  Depending on how expensive a get() is on this property,
    this may be more efficient.
    
    @param key {String} the key to change
    @param value {Object} the value to change
    @returns {SC.Observable}
  */
  setIfChanged: function(key, value) {
    return (this.get(key) !== value) ? this.set(key, value) : this ;
  },
  
  /**  
    Navigates the property path, returning the value at that point.
    
    If any object in the path is undefined, returns undefined.
  */
  getPath: function(path) {
    var tuple = SC.tupleForPropertyPath(path, this) ;
    if (tuple === null || tuple[0] === null) return undefined ;
    return tuple[0].get(tuple[1]) ;
  },
  
  /**
    Navigates the property path, finally setting the value.
    
    @param path {String} the property path to set
    @param value {Object} the value to set
    @returns {SC.Observable}
  */
  setPath: function(path, value) {
    if (path.indexOf('.') >= 0) {
      var tuple = SC.tupleForPropertyPath(path, this) ;
      if (!tuple || !tuple[0]) return null ;
      tuple[0].set(tuple[1], value) ;
    } else this.set(path, value) ; // shortcut
    return this;
  },

  /**
    Navigates the property path, finally setting the value but only if 
    the value does not match the current value.  This will avoid sending
    unecessary change notifications.
    
    @param path {String} the property path to set
    @param value {Object} the value to set
    @returns {Object} this
  */
  setPathIfChanged: function(path, value) {
    if (path.indexOf('.') >= 0) {
      var tuple = SC.tupleForPropertyPath(path, this) ;
      if (!tuple || !tuple[0]) return null ;
      if (tuple[0].get(tuple[1]) !== value) {
        tuple[0].set(tuple[1], value) ;
      }
    } else this.setIfChanged(path, value) ; // shortcut
    return this;
  },
  
  /** 
    Convenience method to get an array of properties.
    
    Pass in multiple property keys or an array of property keys.  This
    method uses getPath() so you can also pass key paths.

    @returns {Array} Values of property keys.
  */
  getEach: function() {
    var keys = SC.A(arguments),
        ret = [], idx, idxLen;
    for(idx=0, idxLen = keys.length; idx < idxLen;idx++) {
      ret[ret.length] = this.getPath(keys[idx]);
    }
    return ret ;
  },
  
  
  /**  
    Increments the value of a property.
    
    @param key {String} property name
    @param increment {Number} the amount to increment (optional)
    @returns {Number} new value of property
  */
  incrementProperty: function(key,increment) {
    if (!increment) increment = 1;
    this.set(key,(this.get(key) || 0)+increment); 
    return this.get(key) ;
  },

  /**  
    Decrements the value of a property.
    
    @param key {String} property name
    @param increment {Number} the amount to decrement (optional)
    @returns {Number} new value of property
  */
  decrementProperty: function(key,increment) {
    if (!increment) increment = 1;
    this.set(key,(this.get(key) || 0) - increment) ;
    return this.get(key) ;
  },

  /**  
    Inverts a property.  Property should be a bool.
    
    @param key {String} property name
    @param value {Object} optional parameter for "true" value
    @param alt {Object} optional parameter for "false" value
    @returns {Object} new value
  */
  toggleProperty: function(key,value,alt) { 
    if (value === undefined) value = true ;
    if (alt === undefined) alt = false ;
    value = (this.get(key) == value) ? alt : value ;
    this.set(key,value);
    return this.get(key) ;
  },

  /**
    Convenience method to call propertyWillChange/propertyDidChange.
    
    Sometimes you need to notify observers that a property has changed value 
    without actually changing this value.  In those cases, you can use this 
    method as a convenience instead of calling propertyWillChange() and 
    propertyDidChange().
    
    @param key {String} The property key that has just changed.
    @param value {Object} The new value of the key.  May be null.
    @returns {SC.Observable}
  */
  notifyPropertyChange: function(key, value) {
    this.propertyWillChange(key) ;
    this.propertyDidChange(key, value) ;
    return this; 
  },
  
  /**  
    Notifies all of observers of a property changes.
    
    Sometimes when you make a major update to your object, it is cheaper to
    simply notify all observers that their property might have changed than
    to figure out specifically which properties actually did change.
    
    In those cases, you can simply call this method to notify all property
    observers immediately.  Note that this ignores property groups.
    
    @returns {SC.Observable}
  */
  allPropertiesDidChange: function() {
    this._kvo_cache = null; //clear cached props
    this._notifyPropertyObservers('*') ;
    return this ;
  },

  addProbe: function(key) { this.addObserver(key,SC.logChange); },
  removeProbe: function(key) { this.removeObserver(key,SC.logChange); },

  /**
    Logs the named properties to the console.
    
    @param {String...} propertyNames one or more property names
  */
  logProperty: function() {
    var props = SC.$A(arguments),
        prop, propsLen, idx;
    for(idx=0, propsLen = props.length; idx<propsLen; idx++) {
      prop = props[idx] ;
      console.log('%@:%@: '.fmt(SC.guidFor(this), prop), this.get(prop)) ;
    }
  },

  propertyRevision: 1
    
} ;

/** @private used by addProbe/removeProbe */
SC.logChange = function logChange(target, key, value) {
  console.log("CHANGE: %@[%@] =>".fmt(target, key), target.get(key));
};

/**
  Retrieves a property from an object, using get() if the
  object implements SC.Observable.

  @param  {Object}  object  the object to query
  @param  {String}  key the property to retrieve
*/
SC.mixin(SC, {
  get: function(object, key) {
    if (!object) return undefined;
    if (key === undefined) return this[object];
    if (object.get) return object.get(key);
    return object[key];
  }
});

// Make all Array's observable
SC.mixin(Array.prototype, SC.Observable) ;

/* >>>>>>>>>> BEGIN source/system/enumerator.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  An object that iterates over all of the values in an object.  
  
  An instance of this object is returned everytime you call the 
  enumerator() method on an object that implements the SC.Enumerable mixin.
  
  Once you create an enumerator instance, you can call nextObject() on it
  until you can iterated through the entire collection.  Once you have
  exhausted the enumerator, you can reuse it if you want by calling reset().
  
  @since SproutCore 1.0
*/
SC.Enumerator = function(enumerableObject) {
  this.enumerable = enumerableObject ;
  this.reset() ;
  return this ;
} ;

SC.Enumerator.prototype = {
  
  /** 
    Returns the next object in the enumeration or undefined when complete.
    
    @returns {Object} the next object or undefined
  */
  nextObject: function() {
    var index = this._index ;
    var len = this._length;
    if (index >= len) return undefined ; // nothing to do
    
    // get the value
    var ret = this.enumerable.nextObject(index, this._previousObject, this._context) ;
    this._previousObject = ret ;
    this._index = index + 1 ;
    
    if (index >= len) {
      this._context = SC.Enumerator._pushContext(this._context); 
    }
    
    return ret ;
  },
  
  /**
    Resets the enumerator to the beginning.  This is a nice way to reuse
    an existing enumerator. 
    
    @returns {Object} this
  */
  reset: function() {
    var e = this.enumerable ;
    if (!e) throw SC.$error("Enumerator has been destroyed");
    this._length = e.get ? e.get('length') : e.length ;
    var len = this._length;
    this._index = 0;
    this._previousObject = null ;
    this._context = (len > 0) ? SC.Enumerator._popContext() : null;
  },
  
  /**
    Releases the enumerators enumerable object.  You cannot use this object
    anymore.  This is not often needed but it is useful when you need to 
    make sure memory gets cleared.
    
    @returns {Object} null 
  */
  destroy: function() {
    this.enumerable = this._length = this._index = this._previousObject = this._context = null;
  }
  
} ;

/**
  Use this method to manually create a new Enumerator object.  Usually you
  will not access this method directly but instead call enumerator() on the
  item you want to enumerate.

  @param {SC.Enumerable}  enumerableObject enumerable object.
  @returns {SC.Enumerator} the enumerator
*/
SC.Enumerator.create = function(enumerableObject) {
  return new SC.Enumerator(enumerableObject) ;
};

// Private context caching methods.  This avoids recreating lots of context
// objects.

SC.Enumerator._popContext = function() {
  var ret = this._contextCache ? this._contextCache.pop() : null ;
  return ret || {} ;
} ;

SC.Enumerator._pushContext = function(context) {
  this._contextCache = this._contextCache || [] ;
  var cache = this._contextCache;
  cache.push(context);
  return null ;
}; 


/* >>>>>>>>>> BEGIN source/mixins/enumerable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('core') ;
require('system/enumerator');

/*globals Prototype */

/**
  @namespace

  This mixin defines the common interface implemented by enumerable objects 
  in SproutCore.  Most of these methods follow the standard Array iteration
  API defined up to JavaScript 1.8 (excluding language-specific features that
  cannot be emulated in older versions of JavaScript).
  
  This mixin is applied automatically to the Array class on page load, so you
  can use any of these methods on simple arrays.  If Array already implements
  one of these methods, the mixin will not override them.
  
  h3. Writing Your Own Enumerable

  To make your own custom class enumerable, you need two items:
  
  1. You must have a length property.  This property should change whenever
     the number of items in your enumerable object changes.  If you using this
     with an SC.Object subclass, you should be sure to change the length 
     property using set().
     
  2. If you must implement nextObject().  See documentation.
    
  Once you have these two methods implement, apply the SC.Enumerable mixin
  to your class and you will be able to enumerate the contents of your object
  like any other collection.
  
  h3. Using SproutCore Enumeration with Other Libraries
  
  Many other libraries provide some kind of iterator or enumeration like
  facility.  This is often where the most common API conflicts occur. 
  SproutCore's API is designed to be as friendly as possible with other 
  libraries by implementing only methods that mostly correspond to the
  JavaScript 1.8 API.  
  
  @since SproutCore 1.0
*/
SC.Enumerable = {

  /** 
    Walk like a duck.
    
    @property {Boolean}
  */
  isEnumerable: YES,
  
  /**
    Implement this method to make your class enumerable.
    
    This method will be call repeatedly during enumeration.  The index value
    will always begin with 0 and increment monotonically.  You don't have to
    rely on the index value to determine what object to return, but you should
    always check the value and start from the beginning when you see the
    requested index is 0.
    
    The previousObject is the object that was returned from the last call
    to nextObject for the current iteration.  This is a useful way to 
    manage iteration if you are tracing a linked list, for example.
    
    Finally the context paramter will always contain a hash you can use as 
    a "scratchpad" to maintain any other state you need in order to iterate
    properly.  The context object is reused and is not reset between 
    iterations so make sure you setup the context with a fresh state whenever
    the index parameter is 0.
    
    Generally iterators will continue to call nextObject until the index
    reaches the your current length-1.  If you run out of data before this 
    time for some reason, you should simply return undefined.
    
    The default impementation of this method simply looks up the index.
    This works great on any Array-like objects.
    
    @param index {Number} the current index of the iteration
    @param previousObject {Object} the value returned by the last call to nextObject.
    @param context {Object} a context object you can use to maintain state.
    @returns {Object} the next object in the iteration or undefined   
  */ 
  nextObject: function(index, previousObject, context) {
    return this.objectAt ? this.objectAt(index) : this[index] ;
  },
  
  /**
    Helper method returns the first object from a collection.  This is usually
    used by bindings and other parts of the framework to extract a single 
    object if the enumerable contains only one item.
    
    If you override this method, you should implement it so that it will 
    always return the same value each time it is called.  If your enumerable
    contains only one object, this method should always return that object.
    If your enumerable is empty, this method should return undefined.
    
    @returns {Object} the object or undefined
  */
  firstObject: function() {
    if (this.get('length')===0) return undefined ;
    if (this.objectAt) return this.objectAt(0); // support arrays out of box
    
    // handle generic enumerables
    var context = SC.Enumerator._popContext(), ret;
    ret = this.nextObject(0, null, context);
    context = SC.Enumerator._pushContext(context);  
    return ret ;
  }.property(),
  
  /**
    Returns a new enumerator for this object.  See SC.Enumerator for
    documentation on how to use this object.  Enumeration is an alternative
    to using one of the other iterators described here.
    
    @returns {SC.Enumerator} an enumerator for the receiver
  */
  enumerator: function() { return SC.Enumerator.create(this); },
  
  /**
    Iterates through the enumerable, calling the passed function on each
    item.  This method corresponds to the forEach() method defined in 
    JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Object} this
  */
  forEach: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      callback.call(target, next, idx, this);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return this ;
  },
  
  /**
    Retrieves the named value on each member object.  This is more efficient
    than using one of the wrapper methods defined here.  Objects that 
    implement SC.Observable will use the get() method, otherwise the property
    will be accessed directly.
    
    @param {String} key the key to retrieve
    @returns {Array} extracted values
  */
  getEach: function(key) {
    return this.map(function(next) {
      return next ? (next.get ? next.get(key) : next[key]) : null;
    }, this);
  },

  /**
    Sets the value on the named property for each member.  This is more
    efficient than using other methods defined on this helper.  If the object
    implements SC.Observable, the value will be changed to set(), otherwise
    it will be set directly.  null objects are skipped.
    
    @param {String} key the key to set
    @param {Object} value the object to set
    @returns {Object} receiver
  */
  setEach: function(key, value) {
    this.forEach(function(next) {
      if (next) {
        if (next.set) next.set(key, value) ;
        else next[key] = value ;
      }
    }, this);
    return this ;
  },
  
  /**
    Maps all of the items in the enumeration to another value, returning 
    a new array.  This method corresponds to map() defined in JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the mapped value.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Array} The mapped array.
  */
  map: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      ret[idx] = callback.call(target, next, idx, this) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Similar to map, this specialized function returns the value of the named
    property on all items in the enumeration.
    
    @params key {String} name of the property
    @returns {Array} The mapped array.
  */
  mapProperty: function(key) {
    return this.map(function(next) { 
      return next ? (next.get ? next.get(key) : next[key]) : null;
    });
  },

  /**
    Returns an array with all of the items in the enumeration that the passed
    function returns YES for. This method corresponds to filter() defined in 
    JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the YES to include the item in the results, NO otherwise.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Array} A filtered array.
  */
  filter: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(callback.call(target, next, idx, this)) ret.push(next) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /** 
    Returns an array sorted by the value of the passed key parameters.
    null objects will be sorted first.  You can pass either an array of keys
    or multiple parameters which will act as key names
    
    @param {String} key one or more key names
    @returns {Array}
  */
  sortProperty: function(key) {
    var keys = (typeof key === SC.T_STRING) ? arguments : key,
        len  = keys.length,
        src;
     
    // get the src array to sort   
    if (this instanceof Array) src = this;
    else {
      src = [];
      this.forEach(function(i) { src.push(i); });
    }
    
    if (!src) return [];
    return src.sort(function(a,b) {
      var idx, key, aValue, bValue, ret = 0;
      
      for(idx=0;ret===0 && idx<len;idx++) {
        key = keys[idx];
        aValue = a ? (a.get ? a.get(key) : a[key]) : null;
        bValue = b ? (b.get ? b.get(key) : b[key]) : null;
        ret = SC.compare(aValue, bValue);
      }
      return ret ;
    });
  },
  

  /**
    Returns an array with just the items with the matched property.  You
    can pass an optional second argument with the target value.  Otherwise
    this will match any property that evaluates to true.
    
    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Array} filtered array
  */
  filterProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      var matched = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      if (matched) ret.push(next) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
    
  /**
    Returns the first item in the array for which the callback returns YES.
    This method works similar to the filter() method defined in JavaScript 1.6
    except that it will stop working on the array once a match is found.

    The callback method you provide should have the following signature (all
    parameters are optional):

    {{{
      function(item, index, enumerable) ;      
    }}}

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the YES to include the item in the results, NO otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Object} Found item or null.
  */
  find: function(callback, target) {
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var last = null, next, found = NO, ret = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len && !found;idx++) {
      next = this.nextObject(idx, last, context) ;
      if (found = callback.call(target, next, idx, this)) ret = next ;
      last = next ;
    }
    next = last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns an the first item with a property matching the passed value.  You
    can pass an optional second argument with the target value.  Otherwise
    this will match any property that evaluates to true.
    
    This method works much like the more generic find() method.
    
    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Object} found item or null
  */
  findProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var found = NO, ret = null, last = null, next, cur ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len && !found;idx++) {
      next = this.nextObject(idx, last, context) ;
      cur = next ? (next.get ? next.get(key) : next[key]) : null;
      found = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      if (found) ret = next ;
      last = next ;
    }
    last = next = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
      
  /**
    Returns YES if the passed function returns YES for every item in the
    enumeration.  This corresponds with the every() method in JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the YES or NO.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    h4. Example Usage
    
    {{{
      if (people.every(isEngineer)) { Paychecks.addBigBonus(); }
    }}}
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Boolean} 
  */
  every: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = YES;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;ret && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(!callback.call(target, next, idx, this)) ret = NO ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns YES if the passed property resolves to true for all items in the
    enumerable.  This method is often simpler/faster than using a callback.

    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Array} filtered array
  */
  everyProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = YES;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;ret && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
  
  
  /**
    Returns YES if the passed function returns true for any item in the 
    enumeration. This corresponds with the every() method in JavaScript 1.6.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(item, index, enumerable) ;      
    }}}
    
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.
    
    It should return the YES to include the item in the results, NO otherwise.
    
    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.
    
    h4. Usage Example
    
    {{{
      if (people.some(isManager)) { Paychecks.addBiggerBonus(); }
    }}}
    
    @params callback {Function} the callback to execute
    @params target {Object} the target object to use
    @returns {Array} A filtered array.
  */
  some: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;
    
    var ret  = NO;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;(!ret) && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(callback.call(target, next, idx, this)) ret = YES ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns YES if the passed property resolves to true for any item in the
    enumerable.  This method is often simpler/faster than using a callback.

    @params key {String} the property to test
    @param value {String} optional value to test against.
    @returns {Boolean} YES 
  */
  someProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = NO;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0; !ret && (idx<len); idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;  // return the invert
  },

  /**
    This will combine the values of the enumerator into a single value. It 
    is a useful way to collect a summary value from an enumeration.  This
    corresponds to the reduce() method defined in JavaScript 1.8.
    
    The callback method you provide should have the following signature (all
    parameters are optional):
    
    {{{
      function(previousValue, item, index, enumerable) ;      
    }}}
    
    - *previousValue* is the value returned by the last call to the iterator.
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    Return the new cumulative value.

    In addition to the callback you can also pass an initialValue.  An error
    will be raised if you do not pass an initial value and the enumerator is
    empty.

    Note that unlike the other methods, this method does not allow you to 
    pass a target object to set as this for the callback.  It's part of the
    spec. Sorry.
    
    @params callback {Function} the callback to execute
    @params initialValue {Object} initial value for the reduce
    @params reducerProperty {String} internal use only.  May not be available.
    @returns {Array} A filtered array.
  */
  reduce: function(callback, initialValue, reducerProperty) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;

    // no value to return if no initial value & empty
    if (len===0 && initialValue === undefined) throw new TypeError();
    
    var ret  = initialValue;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      
      // while ret is still undefined, just set the first value we get as ret.
      // this is not the ideal behavior actually but it matches the FireFox
      // implementation... :(
      if (next !== null) {
        if (ret === undefined) {
          ret = next ;
        } else {
          ret = callback.call(null, ret, next, idx, this, reducerProperty);
        }
      }
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    
    // uh oh...we never found a value!
    if (ret === undefined) throw new TypeError() ;
    return ret ;
  },
  
  /**
    Invokes the named method on every object in the receiver that
    implements it.  This method corresponds to the implementation in
    Prototype 1.6.
    
    @param methodName {String} the name of the method
    @param args {Object...} optional arguments to pass as well.
    @returns {Array} return values from calling invoke.
  */
  invoke: function(methodName) {
    var len = this.get ? this.get('length') : this.length ;
    if (len <= 0) return [] ; // nothing to invoke....
    
    var idx;
    
    // collect the arguments
    var args = [] ;
    var alen = arguments.length ;
    if (alen > 1) {
      for(idx=1;idx<alen;idx++) args.push(arguments[idx]) ;
    }
    
    // call invoke
    var ret = [] ;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var method = next ? next[methodName] : null ;
      if (method) ret[idx] = method.apply(next, args) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Invokes the passed method and optional arguments on the receiver elements
    as long as the methods return value matches the target value.  This is 
    a useful way to attempt to apply changes to a collection of objects unless
    or until one fails.

    @param targetValue {Object} the target return value
    @param methodName {String} the name of the method
    @param args {Object...} optional arguments to pass as well.
    @returns {Array} return values from calling invoke.
  */
  invokeWhile: function(targetValue, methodName) {
    var len = this.get ? this.get('length') : this.length ;
    if (len <= 0) return null; // nothing to invoke....

    var idx;

    // collect the arguments
    var args = [] ;
    var alen = arguments.length ;
    if (alen > 2) {
      for(idx=2;idx<alen;idx++) args.push(arguments[idx]) ;
    }
    
    // call invoke
    var ret = targetValue ;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(idx=0;(ret === targetValue) && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      var method = next ? next[methodName] : null ;
      if (method) ret = method.apply(next, args) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },
  
  /**
    Simply converts the enumerable into a genuine array.  The order, of
    course, is not gauranteed.  Corresponds to the method implemented by 
    Prototype.
        
    @returns {Array} the enumerable as an array.
  */
  toArray: function() {
    var ret = [];
    this.forEach(function(o) { ret.push(o); }, this);
    return ret ;
  },
  
  /**
    Converts an enumerable into a matrix, with inner arrays grouped based 
    on a particular property of the elements of the enumerable.

    @params key {String} the property to test
    @returns {Array} matrix of arrays
  */        
  groupBy: function(key){
    var len = this.get ? this.get('length') : this.length,
        ret = [],
        last = null,
        context = SC.Enumerator._popContext(),
        grouped = [], 
        keyValues = [];          
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      if(SC.none(grouped[cur])){ grouped[cur] = []; keyValues.push(cur); }
      grouped[cur].push(next);
      last = next;
    }
    last = null;
    context = SC.Enumerator._pushContext(context);
    
    for(var idx=0,len2=keyValues.length; idx < len2; idx++){
      ret.push(grouped[keyValues[idx]]);        
    }
    return ret ;
  }
  
} ;

// Build in a separate function to avoid unintential leaks through closures...
SC._buildReducerFor = function(reducerKey, reducerProperty) {
  return function(key, value) {
    var reducer = this[reducerKey] ;
    if (SC.typeOf(reducer) !== SC.T_FUNCTION) {
      return this.unknownProperty ? this.unknownProperty(key, value) : null;
    } else {
      // Invoke the reduce method defined in enumerable instead of using the
      // one implemented in the receiver.  The receiver might be a native 
      // implementation that does not support reducerProperty.
      var ret = SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
      return ret ;
    }
  }.property('[]') ;
};

SC.Reducers = /** @lends SC.Enumerable */ {
  /**
    This property will trigger anytime the enumerable's content changes.
    You can observe this property to be notified of changes to the enumerables
    content.
    
    For plain enumerables, this property is read only.  SC.Array overrides
    this method.
    
    @property {SC.Array}
  */
  '[]': function(key, value) { return this ; }.property(),

  /**
    Invoke this method when the contents of your enumerable has changed.
    This will notify any observers watching for content changes.  If your are
    implementing an ordered enumerable (such as an array), also pass the 
    start and end values where the content changed so that it can be used to
    notify range observers.
    
    @param {Number} start optional start offset for the content change
    @param {Number} length optional length of change
    @returns {Object} receiver 
  */
  enumerableContentDidChange: function(start, length) {
    this.notifyPropertyChange('[]') ;
    return this ;
  },
  
  /**
    Call this method from your unknownProperty() handler to implement 
    automatic reduced properties.  A reduced property is a property that 
    collects its contents dynamically from your array contents.  Reduced 
    properties always begin with "@".  Getting this property will call 
    reduce() on your array with the function matching the key name as the
    processor.
    
    The return value of this will be either the return value from the 
    reduced property or undefined, which means this key is not a reduced 
    property.  You can call this at the top of your unknownProperty handler
    like so:
    
    {{{
      unknownProperty: function(key, value) {
        var ret = this.handleReduceProperty(key, value) ;
        if (ret === undefined) {
          // process like normal
        }
      }
    }}}
     
    @param {String} key
      the reduce property key
    
    @param {Object} value
      a value or undefined.
    
    @param {Boolean} generateProperty
      only set to false if you do not want an optimized computed property 
      handler generated for this.  Not common.
  
    @returns {Object} the reduced property or undefined
  */
  reducedProperty: function(key, value, generateProperty) {
     
    if (!key || key.charAt(0) !== '@') return undefined ; // not a reduced property
    
    // get the reducer key and the reducer
    var matches = key.match(/^@([^(]*)(\(([^)]*)\))?$/) ;
    if (!matches || matches.length < 2) return undefined ; // no match
    
    var reducerKey = matches[1]; // = 'max' if key = '@max(balance)'
    var reducerProperty = matches[3] ; // = 'balance' if key = '@max(balance)'
    reducerKey = "reduce" + reducerKey.slice(0,1).toUpperCase() + reducerKey.slice(1);
    var reducer = this[reducerKey] ;

    // if there is no reduce function defined for this key, then we can't 
    // build a reducer for it.
    if (SC.typeOf(reducer) !== SC.T_FUNCTION) return undefined;
    
    // if we can't generate the property, just run reduce
    if (generateProperty === NO) {
      return SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
    }

    // ok, found the reducer.  Let's build the computed property and install
    var func = SC._buildReducerFor(reducerKey, reducerProperty);
    var p = this.constructor.prototype ;
    
    if (p) {
      p[key] = func ;
      
      // add the function to the properties array so that new instances
      // will have their dependent key registered.
      var props = p._properties || [] ;
      props.push(key) ;
      p._properties = props ;
      this.registerDependentKey(key, '[]') ;
    }
    
    // and reduce anyway...
    return SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
  },
  
  /** 
    Reducer for @max reduced property.
  */
  reduceMax: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    if (previousValue === null) return item ;
    return (item > previousValue) ? item : previousValue ;
  },

  /** 
    Reducer for @maxObject reduced property.
  */
  reduceMaxObject: function(previousItem, item, index, e, reducerProperty) {
    
    // get the value for both the previous and current item.  If no
    // reducerProperty was supplied, use the items themselves.
    var previousValue = previousItem, itemValue = item ;
    if (reducerProperty) {
      if (item) {
        itemValue = item.get ? item.get(reducerProperty) : item[reducerProperty] ;
      }
      
      if (previousItem) {
        previousValue = previousItem.get ? previousItem.get(reducerProperty) : previousItem[reducerProperty] ;
      }
    }
    if (previousValue === null) return item ;
    return (itemValue > previousValue) ? item : previousItem ;
  },

  /** 
    Reducer for @min reduced property.
  */
  reduceMin: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    if (previousValue === null) return item ;
    return (item < previousValue) ? item : previousValue ;
  },

  /** 
    Reducer for @maxObject reduced property.
  */
  reduceMinObject: function(previousItem, item, index, e, reducerProperty) {

    // get the value for both the previous and current item.  If no
    // reducerProperty was supplied, use the items themselves.
    var previousValue = previousItem, itemValue = item ;
    if (reducerProperty) {
      if (item) {
        itemValue = item.get ? item.get(reducerProperty) : item[reducerProperty] ;
      }
      
      if (previousItem) {
        previousValue = previousItem.get ? previousItem.get(reducerProperty) : previousItem[reducerProperty] ;
      }
    }
    if (previousValue === null) return item ;
    return (itemValue < previousValue) ? item : previousItem ;
  },

  /** 
    Reducer for @average reduced property.
  */
  reduceAverage: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    var ret = (previousValue || 0) + item ;
    var len = e.get ? e.get('length') : e.length;
    if (index >= len-1) ret = ret / len; //avg after last item.
    return ret ; 
  },

  /** 
    Reducer for @sum reduced property.
  */
  reduceSum: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    return (previousValue === null) ? item : previousValue + item ;
  }
} ;

// Apply reducers...
SC.mixin(SC.Enumerable, SC.Reducers) ;
SC.mixin(Array.prototype, SC.Reducers) ;
Array.prototype.isEnumerable = YES ;

// ......................................................
// ARRAY SUPPORT
//

// Implement the same enhancements on Array.  We use specialized methods
// because working with arrays are so common.
(function() {
  
  // These methods will be applied even if they already exist b/c we do it
  // better.
  var alwaysMixin = {
    
    // this is supported so you can get an enumerator.  The rest of the
    // methods do not use this just to squeeze every last ounce of perf as
    // possible.
    nextObject: SC.Enumerable.nextObject,
    enumerator: SC.Enumerable.enumerator,
    firstObject: SC.Enumerable.firstObject,
    sortProperty: SC.Enumerable.sortProperty,
    
    // see above...
    mapProperty: function(key) {
      var len = this.length ;
      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret[idx] = next ? (next.get ? next.get(key) : next[key]) : null;
      }
      return ret ;
    },

    filterProperty: function(key, value) {
      var len = this.length ;
      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        var matched = (value === undefined) ? !!cur : SC.isEqual(cur, value);
        if (matched) ret.push(next) ;
      }
      return ret ;
    },    

    //returns a matrix
    groupBy: function(key) {
      var len = this.length,
          ret = [],
          grouped = [], 
          keyValues = [];          
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        if(SC.none(grouped[cur])){ grouped[cur] = []; keyValues.push(cur); }
        grouped[cur].push(next);
      }
      for(var idx=0,len2=keyValues.length; idx < len2; idx++){
        ret.push(grouped[keyValues[idx]]);        
      }
      return ret ;
    },    

    
    find: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var next, ret = null, found = NO;
      for(var idx=0;idx<len && !found;idx++) {
        next = this[idx] ;
        if(found = callback.call(target, next, idx, this)) ret = next ;
      }
      next = null;
      return ret ;
    },

    findProperty: function(key, value) {
      var len = this.length ;
      var next, cur, found=NO, ret=null;
      for(var idx=0;idx<len && !found;idx++) {
        cur = (next=this[idx]) ? (next.get ? next.get(key): next[key]):null;
        found = (value === undefined) ? !!cur : SC.isEqual(cur, value);
        if (found) ret = next ;
      }
      next=null;
      return ret ;
    },    

    everyProperty: function(key, value) {
      var len = this.length ;
      var ret  = YES;
      for(var idx=0;ret && (idx<len);idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      }
      return ret ;
    },
    
    someProperty: function(key, value) {
      var len = this.length ;
      var ret  = NO;
      for(var idx=0; !ret && (idx<len); idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      }
      return ret ;  // return the invert
    },
    
    invoke: function(methodName) {
      var len = this.length ;
      if (len <= 0) return [] ; // nothing to invoke....

      var idx;

      // collect the arguments
      var args = [] ;
      var alen = arguments.length ;
      if (alen > 1) {
        for(idx=1;idx<alen;idx++) args.push(arguments[idx]) ;
      }

      // call invoke
      var ret = [] ;
      for(idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var method = next ? next[methodName] : null ;
        if (method) ret[idx] = method.apply(next, args) ;
      }
      return ret ;
    },

    invokeWhile: function(targetValue, methodName) {
      var len = this.length ;
      if (len <= 0) return null ; // nothing to invoke....

      var idx;

      // collect the arguments
      var args = [] ;
      var alen = arguments.length ;
      if (alen > 2) {
        for(idx=2;idx<alen;idx++) args.push(arguments[idx]) ;
      }

      // call invoke
      var ret = targetValue ;
      for(idx=0;(ret === targetValue) && (idx<len);idx++) {
        var next = this[idx] ;
        var method = next ? next[methodName] : null ;
        if (method) ret = method.apply(next, args) ;
      }
      return ret ;
    },

    toArray: function() {
      var len = this.length ;
      if (len <= 0) return [] ; // nothing to invoke....

      // call invoke
      var ret = [] ;
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret.push(next) ;
      }
      return ret ;
    },
    
    getEach: function(key) {
      var ret = [];
      var len = this.length ;
      for(var idx=0;idx<len;idx++) {
        var obj = this[idx];
        ret[idx] = obj ? (obj.get ? obj.get(key) : obj[key]) : null;
      }
      return ret ;
    },
    
    setEach: function(key, value) {
      var len = this.length;
      for(var idx=0;idx<len;idx++) {
        var obj = this[idx];
        if (obj) {
          if (obj.set) {
            obj.set(key, value);
          } else obj[key] = value ;
        }
      }
      return this ;
    }
    
  }; 
  
  // These methods will only be applied if they are not already defined b/c 
  // the browser is probably getting it.
  var mixinIfMissing = {

    forEach: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        callback.call(target, next, idx, this);
      }
      return this ;
    },

    map: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret[idx] = callback.call(target, next, idx, this) ;
      }
      return ret ;
    },

    filter: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        if(callback.call(target, next, idx, this)) ret.push(next) ;
      }
      return ret ;
    },

    every: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = YES;
      for(var idx=0;ret && (idx<len);idx++) {
        var next = this[idx] ;
        if(!callback.call(target, next, idx, this)) ret = NO ;
      }
      return ret ;
    },

    some: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = NO;
      for(var idx=0;(!ret) && (idx<len);idx++) {
        var next = this[idx] ;
        if(callback.call(target, next, idx, this)) ret = YES ;
      }
      return ret ;
    },

    reduce: function(callback, initialValue, reducerProperty) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;

      // no value to return if no initial value & empty
      if (len===0 && initialValue === undefined) throw new TypeError();

      var ret  = initialValue;
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;

        // while ret is still undefined, just set the first value we get as 
        // ret. this is not the ideal behavior actually but it matches the 
        // FireFox implementation... :(
        if (next !== null) {
          if (ret === undefined) {
            ret = next ;
          } else {
            ret = callback.call(null, ret, next, idx, this, reducerProperty);
          }
        }
      }

      // uh oh...we never found a value!
      if (ret === undefined) throw new TypeError() ;
      return ret ;
    }   
  };
  
  // Apply methods if missing...
  for(var key in mixinIfMissing) {
    if (!mixinIfMissing.hasOwnProperty(key)) continue ;
    
    // The mixinIfMissing methods should be applied if they are not defined.
    // If Prototype 1.6 is included, some of these methods will be defined
    // already, but we want to override them anyway in this special case 
    // because our version is faster and functionally identitical.
    if (!Array.prototype[key] || ((typeof Prototype === 'object') && Prototype.Version.match(/^1\.6/))) {
      Array.prototype[key] = mixinIfMissing[key] ;
    }
  }
  
  // Apply other methods...
  SC.mixin(Array.prototype, alwaysMixin) ;
  
})() ;


/* >>>>>>>>>> BEGIN source/system/range_observer.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class

  A RangeObserver is used by Arrays to automatically observe all of the
  objects in a particular range on the array.  Whenever any property on one 
  of those objects changes, it will notify its delegate.  Likewise, whenever
  the contents of the array itself changes, it will notify its delegate and
  possibly update its own registration.

  This implementation uses only SC.Array methods.  It can be used on any 
  object that complies with SC.Array.  You may, however, choose to subclass
  this object in a way that is more optimized for your particular design.
  
  @since SproutCore 1.0
*/
SC.RangeObserver = {

  /** 
    Walk like a duck.
    
    @property {Boolean}
  */
  isRangeObserver: YES,
  
  /** @private */
  toString: function() { 
    var base = this.indexes ? this.indexes.toString() : "SC.IndexSet<..>";
    return base.replace('IndexSet', 'RangeObserver(%@)'.fmt(SC.guidFor(this)));
  },
  
  /**
    Creates a new range observer owned by the source.  The indexSet you pass
    must identify the indexes you are interested in observing.  The passed
    target/method will be invoked whenever the observed range changes.
    
    Note that changes to a range are buffered until the end of a run loop
    unless a property on the record itself changes.
  
    @param {SC.Array} source the source array
    @param {SC.IndexSet} indexSet set of indexes to observer
    @param {Object} target the target
    @param {Function|String} method the method to invoke
    @param {Object} context optional context to include in callback
    @param {Boolean} isDeep if YES, observe property changes as well
    @returns {SC.RangeObserver} instance
  */
  create: function(source, indexSet, target, method, context, isDeep) {
    var ret = SC.beget(this);
    ret.source = source;
    ret.indexes = indexSet ? indexSet.frozenCopy() : null;
    ret.target = target;
    ret.method = method;
    ret.context = context ;
    ret.isDeep  = isDeep || NO ;
    ret.beginObserving();
    return ret ;
  },

  /**
    Create subclasses for the RangeObserver.  Pass one or more attribute
    hashes.  Use this to create customized RangeObservers if needed for your 
    classes.
    
    @param {Hash} attrs one or more attribute hashes
    @returns {SC.RangeObserver} extended range observer class
  */
  extend: function(attrs) {
    var ret = SC.beget(this), args = arguments, len = args.length, idx;
    for(idx=0;idx<len;idx++) SC.mixin(ret, args[idx]);
    return ret ;
  },

  /**
    Destroys an active ranger observer, cleaning up first.
    
    @param {SC.Array} source the source array
    @returns {SC.RangeObserver} receiver
  */
  destroy: function(source) { 
    this.endObserving(); 
    return this; 
  },

  /**
    Updates the set of indexes the range observer applies to.  This will 
    stop observing the old objects for changes and start observing the 
    new objects instead.
    
    @param {SC.Array} source the source array
    @returns {SC.RangeObserver} receiver
  */
  update: function(source, indexSet) {
    if (this.indexes && this.indexes.isEqual(indexSet)) return this ;
    
    this.indexes = indexSet ? indexSet.frozenCopy() : null ;
    this.endObserving().beginObserving();
    return this;
  },
  
  /**
    Configures observing for each item in the current range.  Should update
    the observing array with the list of observed objects so they can be
    torn down later
    
    @returns {SC.RangeObserver} receiver
  */
  beginObserving: function() {
    if (!this.isDeep) return this; // nothing to do
    
    var observing = this.observing;
    if (!observing) observing = this.observing = SC.CoreSet.create();
    
    // cache iterator function to keep things fast
    var func = this._beginObservingForEach;
    if (!func) {
      func = this._beginObservingForEach = function(idx) {
        var obj = this.source.objectAt(idx);
        if (obj && obj.addObserver) {
          observing.push(obj);
          obj._kvo_needsRangeObserver = YES ;
        }
      };
    }
    this.indexes.forEach(func,this);

    // add to pending range observers queue so that if any of these objects
    // change we will have a chance to setup observing on them.
    this.isObserving = NO ;
    SC.Observers.addPendingRangeObserver(this);

    return this;
  },
  
  /** @private
    Called when an object that appears to need range observers has changed.
    Check to see if the range observer contains this object in its list.  If
    it does, go ahead and setup observers on all objects and remove ourself
    from the queue.
  */
  setupPending: function(object) {
    var observing = this.observing ;

    if (this.isObserving || !observing || (observing.get('length')===0)) {
      return YES ;
    } 
    
    if (observing.contains(object)) {
      this.isObserving = YES ;

      // cache iterator function to keep things fast
      var func = this._setupPendingForEach;
      if (!func) {
        var source = this.source,
            method = this.objectPropertyDidChange;

        func = this._setupPendingForEach = function(idx) {
          var obj = this.source.objectAt(idx),
              guid = SC.guidFor(obj),
              key ;
              
          if (obj && obj.addObserver) {
            observing.push(obj);
            obj.addObserver('*', this, method);
            
            // also save idx of object on range observer itself.  If there is
            // more than one idx, convert to IndexSet.
            key = this[guid];
            if (key === undefined || key === null) {
              this[guid] = idx ;
            } else if (key.isIndexSet) {
              key.add(idx);
            } else {
              key = this[guid] = SC.IndexSet.create(key).add(idx);
            }
            
          }
        };
      }
      this.indexes.forEach(func,this);
      return YES ;
      
    } else return NO ;
  },
  
  /**
    Remove observers for any objects currently begin observed.  This is 
    called whenever the observed range changes due to an array change or 
    due to destroying the observer.
    
    @returns {SC.RangeObserver} receiver
  */
  endObserving: function() {
    if (!this.isDeep) return this; // nothing to do
    
    var observing = this.observing;
    
    if (this.isObserving) {
      var meth      = this.objectPropertyDidChange,
          source    = this.source,
          idx, lim, obj;

      if (observing) {
        lim = observing.length;
        for(idx=0;idx<lim;idx++) {
          obj = observing[idx];
          obj.removeObserver('*', this, meth);
          this[SC.guidFor(obj)] = null;
        }
        observing.length = 0 ; // reset
      } 
      
      this.isObserving = NO ;
    }
    
    if (observing) observing.clear(); // empty set.
    return this ;
  },
  
  /**
    Whenever the actual objects in the range changes, notify the delegate
    then begin observing again.  Usually this method will be passed an 
    IndexSet with the changed indexes.  The range observer will only notify
    its delegate if the changed indexes include some of all of the indexes
    this range observer is monitoring.
    
    @param {SC.IndexSet} changes optional set of changed indexes
    @returns {SC.RangeObserver} receiver
  */
  rangeDidChange: function(changes) {
    var indexes = this.indexes;
    if (!changes || !indexes || indexes.intersects(changes)) {
      this.endObserving(); // remove old observers
      this.method.call(this.target, this.source, null, '[]', changes, this.context);
      this.beginObserving(); // setup new ones
    }
    return this ;
  },

  /**
    Whenever an object changes, notify the delegate
    
    @param {Object} the object that changed
    @param {String} key the property that changed
    @returns {SC.RangeObserver} receiver
  */
  objectPropertyDidChange: function(object, key, value, rev) {
    var context = this.context,
        method  = this.method, 
        guid    = SC.guidFor(object),
        index   = this[guid];
      
    // lazily convert index to IndexSet.  
    if (index && !index.isIndexSet) {
      index = this[guid] = SC.IndexSet.create(index).freeze();
    }
    
    if (context) {
      method.call(this.target, this.source, object, key, index, context, rev);
    } else {
      method.call(this.target, this.source, object, key, index, rev);
    }
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// note: SC.Observable also enhances array.  make sure we are called after
// SC.Observable so our version of unknownProperty wins.
sc_require('mixins/observable');
sc_require('mixins/enumerable');
sc_require('system/range_observer');

SC.OUT_OF_RANGE_EXCEPTION = "Index out of range" ;

/**
  @namespace
  
  This module implements Observer-friendly Array-like behavior.  This mixin is 
  picked up by the Array class as well as other controllers, etc. that want to  
  appear to be arrays.
  
  Unlike SC.Enumerable, this mixin defines methods specifically for 
  collections that provide index-ordered access to their contents.  When you
  are designing code that needs to accept any kind of Array-like object, you
  should use these methods instead of Array primitives because these will 
  properly notify observers of changes to the array. 
  
  Although these methods are efficient, they do add a layer of indirection to
  your application so it is a good idea to use them only when you need the 
  flexibility of using both true JavaScript arrays and "virtual" arrays such
  as controllers and collections.
  
  You can use the methods defined in this module to access and modify array 
  contents in a KVO-friendly way.  You can also be notified whenever the 
  membership if an array changes by changing the syntax of the property to
  .observes('*myProperty.[]') .
  
  To support SC.Array in your own class, you must override two
  primitives to use it: replace() and objectAt().  
  
  Note that the SC.Array mixin also incorporates the SC.Enumerable mixin.  All
  SC.Array-like objects are also enumerable.
  
  @extends SC.Enumerable
  @since SproutCore 0.9.0
*/
SC.Array = {
  
  /**
    Walk like a duck - use isSCArray to avoid conflicts
  */
  isSCArray: YES,
  
  /**
    @field {Number} length
    
    Your array must support the length property.  Your replace methods should
    set this property whenever it changes.
  */
  // length: 0,
  
  /**
    This is one of the primitves you must implement to support SC.Array.  You 
    should replace amt objects started at idx with the objects in the passed 
    array.  You should also call this.enumerableContentDidChange() ;
    
    @param {Number} idx 
      Starting index in the array to replace.  If idx >= length, then append to 
      the end of the array.
      
    @param {Number} amt 
      Number of elements that should be removed from the array, starting at 
      *idx*.
      
    @param {Array} objects 
      An array of zero or more objects that should be inserted into the array at 
      *idx* 
  */
  replace: function(idx, amt, objects) {
    throw "replace() must be implemented to support SC.Array" ;
  },
  
  /**
    This is one of the primitives you must implement to support SC.Array.  
    Returns the object at the named index.  If your object supports retrieving 
    the value of an array item using get() (i.e. myArray.get(0)), then you do
    not need to implement this method yourself.
    
    @param {Number} idx
      The index of the item to return.  If idx exceeds the current length, 
      return null.
  */
  objectAt: function(idx) {
    if (idx < 0) return undefined ;
    if (idx >= this.get('length')) return undefined;
    return this.get(idx);
  },
  
  /**
    @field []
    
    This is the handler for the special array content property.  If you get
    this property, it will return this.  If you set this property it a new 
    array, it will replace the current content.
    
    This property overrides the default property defined in SC.Enumerable.
  */
  '[]': function(key, value) {
    if (value !== undefined) {
      this.replace(0, this.get('length'), value) ;
    }  
    return this ;
  }.property(),
  
  /**
    This will use the primitive replace() method to insert an object at the 
    specified index.
    
    @param {Number} idx index of insert the object at.
    @param {Object} object object to insert
  */
  insertAt: function(idx, object) {
    if (idx > this.get('length')) throw SC.OUT_OF_RANGE_EXCEPTION ;
    this.replace(idx,0,[object]) ;
    return this ;
  },
  
  /**
    Remove an object at the specified index using the replace() primitive 
    method.  You can pass either a single index, a start and a length or an
    index set.
    
    If you pass a single index or a start and length that is beyond the 
    length this method will throw an SC.OUT_OF_RANGE_EXCEPTION
    
    @param {Number|SC.IndexSet} start index, start of range, or index set
    @param {Number} length length of passing range
    @returns {Object} receiver
  */
  removeAt: function(start, length) {
    
    var delta = 0, // used to shift range
        empty = [];
    
    if (typeof start === SC.T_NUMBER) {
      
      if ((start < 0) || (start >= this.get('length'))) {
        throw SC.OUT_OF_RANGE_EXCEPTION;
      }
      
      // fast case
      if (length === undefined) {
        this.replace(start,1,empty);
        return this ;
      } else {
        start = SC.IndexSet.create(start, length);
      }
    }
    
    this.beginPropertyChanges();
    start.forEachRange(function(start, length) {
      start -= delta ;
      delta += length ;
      this.replace(start, length, empty); // remove!
    }, this);
    this.endPropertyChanges();
    
    return this ;
  },
    
  /**
    Search the array of this object, removing any occurrences of it.
    @param {object} obj object to remove
  */
  removeObject: function(obj) {
    var loc = this.get('length') || 0;
    while(--loc >= 0) {
      var curObject = this.objectAt(loc) ;
      if (curObject == obj) this.removeAt(loc) ;
    }
    return this ;
  },
  
  /**
    Search the array for the passed set of objects and remove any occurrences
    of the. 
    
    @param {SC.Enumerable} objects the objects to remove
    @returns {SC.Array} receiver
  */
  removeObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.removeObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },
  
  /**
    Push the object onto the end of the array.  Works just like push() but it 
    is KVO-compliant.
  */
  pushObject: function(obj) {
    this.insertAt(this.get('length'), obj) ;
    return obj ;
  },
  
  
  /**
    Add the objects in the passed numerable to the end of the array.  Defers
    notifying observers of the change until all objects are added.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  pushObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.pushObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },

  /**
    Pop object from array or nil if none are left.  Works just like pop() but 
    it is KVO-compliant.
  */
  popObject: function() {
    var len = this.get('length') ;
    if (len === 0) return null ;
    
    var ret = this.objectAt(len-1) ;
    this.removeAt(len-1) ;
    return ret ;
  },
  
  /**
    Shift an object from start of array or nil if none are left.  Works just 
    like shift() but it is KVO-compliant.
  */
  shiftObject: function() {
    if (this.get('length') === 0) return null ;
    var ret = this.objectAt(0) ;
    this.removeAt(0) ;
    return ret ;
  },
  
  /**
    Unshift an object to start of array.  Works just like unshift() but it is 
    KVO-compliant.
  */
  unshiftObject: function(obj) {
    this.insertAt(0, obj) ;
    return obj ;
  },

  
  /**
    Adds the named objects to the beginning of the array.  Defers notifying
    observers until all objects have been added.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  unshiftObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.unshiftObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },
  
  /**  
    Compares each item in the array.  Returns true if they are equal.
  */
  isEqual: function(ary) {
    if (!ary) return false ;
    if (ary == this) return true;
    
    var loc = ary.get('length') ;
    if (loc != this.get('length')) return false ;

    while(--loc >= 0) {
      if (!SC.isEqual(ary.objectAt(loc), this.objectAt(loc))) return false ;
    }
    return true ;
  },
  
  /**
    Generates a new array with the contents of the old array, sans any null
    values.
    
    @returns {Array}
  */
  compact: function() { return this.without(null); },
  
  /**
    Generates a new array with the contents of the old array, sans the passed
    value.
    
    @param {Object} value
    @returns {Array}
  */
  without: function(value) {
    if (this.indexOf(value)<0) return this; // value not present.
    var ret = [] ;
    this.forEach(function(k) { 
      if (k !== value) ret[ret.length] = k; 
    }) ;
    return ret ;
  },

  /**
    Generates a new array with only unique values from the contents of the
    old array.
    
    @returns {Array}
  */
  uniq: function() {
    var ret = [] ;
    this.forEach(function(k){
      if (ret.indexOf(k)<0) ret[ret.length] = k;
    });
    return ret ;
  },
  
  /**
    Returns the largest Number in an array of Numbers. Make sure the array
    only contains values of type Number to get expected result.
    
    Note: This only works for dense arrays.
    
    @returns {Number}
  */
  max: function() {
    return Math.max.apply(Math, this);
  },
  
  /**
    Returns the smallest Number in an array of Numbers. Make sure the array
    only contains values of type Number to get expected result.
    
    Note: This only works for dense arrays.
    
    @returns {Number}
  */
  min: function() {
    return Math.min.apply(Math, this);
  },
  
  rangeObserverClass: SC.RangeObserver,
  
  /**
    Creates a new range observer on the receiver.  The target/method callback
    you provide will be invoked anytime any property on the objects in the 
    specified range changes.  It will also be invoked if the objects in the
    range itself changes also.
    
    The callback for a range observer should have the signature:
    
    {{{
      function rangePropertyDidChange(array, objects, key, indexes, conext)
    }}}
    
    If the passed key is '[]' it means that the object itself changed.
    
    The return value from this method is an opaque reference to the 
    range observer object.  You can use this reference to destroy the 
    range observer when you are done with it or to update its range.
    
    @param {SC.IndexSet} indexes indexes to observe
    @param {Object} target object to invoke on change
    @param {String|Function} method the method to invoke
    @param {Object} context optional context
    @returns {SC.RangeObserver} range observer
  */
  addRangeObserver: function(indexes, target, method, context) {
    var rangeob = this._array_rangeObservers;
    if (!rangeob) rangeob = this._array_rangeObservers = SC.CoreSet.create() ;

    // The first time a range observer is added, cache the current length so
    // we can properly notify observers the first time through
    if (this._array_oldLength===undefined) {
      this._array_oldLength = this.get('length') ;
    }
    
    var C = this.rangeObserverClass ;
    var isDeep = NO; //disable this feature for now
    var ret = C.create(this, indexes, target, method, context, isDeep) ;
    rangeob.add(ret);
    
    // first time a range observer is added, begin observing the [] property
    if (!this._array_isNotifyingRangeObservers) {
      this._array_isNotifyingRangeObservers = YES ;
      this.addObserver('[]', this, this._array_notifyRangeObservers);
    }
    
    return ret ;
  },
  
  /**
    Moves a range observer so that it observes a new range of objects on the 
    array.  You must have an existing range observer object from a call to
    addRangeObserver().
    
    The return value should replace the old range observer object that you
    pass in.
    
    @param {SC.RangeObserver} rangeObserver the range observer
    @param {SC.IndexSet} indexes new indexes to observe
    @returns {SC.RangeObserver} the range observer (or a new one)
  */
  updateRangeObserver: function(rangeObserver, indexes) {
    return rangeObserver.update(this, indexes);
  },

  /**
    Removes a range observer from the receiver.  The range observer must
    already be active on the array.
    
    The return value should replace the old range observer object.  It will
    usually be null.
    
    @param {SC.RangeObserver} rangeObserver the range observer
    @returns {SC.RangeObserver} updated range observer or null
  */
  removeRangeObserver: function(rangeObserver) {
    var ret = rangeObserver.destroy(this);
    var rangeob = this._array_rangeObservers;
    if (rangeob) rangeob.remove(rangeObserver) ; // clear
    return ret ;
  },
  
  /**
    Updates observers with content change.  To support range observers, 
    you must pass three change parameters to this method.  Otherwise this
    method will assume the entire range has changed.
    
    This also assumes you have already updated the length property.
    @param {Number} start the starting index of the change
    @param {Number} amt the final range of objects changed
    @param {Number} delta if you added or removed objects, the delta change
    @returns {SC.Array} receiver
  */
  enumerableContentDidChange: function(start, amt, delta) {
    var rangeob = this._array_rangeObservers, 
        oldlen  = this._array_oldLength,
        newlen, length, changes ;

    this.beginPropertyChanges();    
    this.notifyPropertyChange('length'); // flush caches

    // schedule info for range observers
    if (rangeob && rangeob.length>0) {

      // if no oldLength has been cached, just assume 0
      if (oldlen === undefined) oldlen = 0;    
      this._array_oldLength = newlen = this.get('length');
      
      // normalize input parameters
      // if delta was not passed, assume it is the different between the 
      // new and old length.
      if (start === undefined) start = 0;
      if (delta === undefined) delta = newlen - oldlen ;
      if (delta !== 0 || amt === undefined) {
        length = newlen - start ;
        if (delta<0) length -= delta; // cover removed range as well
      } else {
        length = amt ;
      }
      
      changes = this._array_rangeChanges;
      if (!changes) changes = this._array_rangeChanges = SC.IndexSet.create();
      changes.add(start, length);
    }
    
    this.notifyPropertyChange('[]') ;
    this.endPropertyChanges();
    
    return this ;
  },
  
  /**  @private
    Observer fires whenever the '[]' property changes.  If there are 
    range observers, will notify observers of change.
  */
  _array_notifyRangeObservers: function() {
    var rangeob = this._array_rangeObservers,
        changes = this._array_rangeChanges,
        len     = rangeob ? rangeob.length : 0, 
        idx, cur;
        
    if (len > 0 && changes && changes.length > 0) {
      for(idx=0;idx<len;idx++) rangeob[idx].rangeDidChange(changes);
      changes.clear(); // reset for later notifications
    }
  }
  
} ;

// Add SC.Array to the built-in array before we add SC.Enumerable to SC.Array
// since built-in Array's are already enumerable.
SC.mixin(Array.prototype, SC.Array) ; 
SC.Array = SC.mixin({}, SC.Enumerable, SC.Array) ;

// Add any extra methods to SC.Array that are native to the built-in Array.
/**
  Returns a new array that is a slice of the receiver.  This implementation
  uses the observable array methods to retrieve the objects for the new 
  slice.
  
  @param beginIndex {Integer} (Optional) index to begin slicing from.     
  @param endIndex {Integer} (Optional) index to end the slice at.
  @returns {Array} New array with specified slice
*/
SC.Array.slice = function(beginIndex, endIndex) {
  var ret = []; 
  var length = this.get('length') ;
  if (SC.none(beginIndex)) beginIndex = 0 ;
  if (SC.none(endIndex) || (endIndex > length)) endIndex = length ;
  while(beginIndex < endIndex) ret[ret.length] = this.objectAt(beginIndex++) ;
  return ret ;
}  ;

/**
  Returns the index for a particular object in the index.
  
  @param {Object} object the item to search for
  @param {NUmber} startAt optional starting location to search, default 0
  @returns {Number} index of -1 if not found
*/
SC.Array.indexOf = function(object, startAt) {
  var idx, len = this.get('length');
  
  if (startAt === undefined) startAt = 0;
  else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
  if (startAt < 0) startAt += len;
  
  for(idx=startAt;idx<len;idx++) {
    if (this.objectAt(idx) === object) return idx ;
  }
  return -1;
};

// Some browsers do not support indexOf natively.  Patch if needed
if (!Array.prototype.indexOf) Array.prototype.indexOf = SC.Array.indexOf;

/**
  Returns the last index for a particular object in the index.
  
  @param {Object} object the item to search for
  @param {NUmber} startAt optional starting location to search, default 0
  @returns {Number} index of -1 if not found
*/
SC.Array.lastIndexOf = function(object, startAt) {
  var idx, len = this.get('length');
  
  if (startAt === undefined) startAt = len-1;
  else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
  if (startAt < 0) startAt += len;
  
  for(idx=startAt;idx>=0;idx--) {
    if (this.objectAt(idx) === object) return idx ;
  }
  return -1;
};

// Some browsers do not support lastIndexOf natively.  Patch if needed
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = SC.Array.lastIndexOf;
}

// ......................................................
// ARRAY SUPPORT
//
// Implement the same enhancements on Array.  We use specialized methods
// because working with arrays are so common.
(function() {
  SC.mixin(Array.prototype, {
    
    // primitive for array support.
    replace: function(idx, amt, objects) {
      if (this.isFrozen) throw SC.FROZEN_ERROR ;
      if (!objects || objects.length === 0) {
        this.splice(idx, amt) ;
      } else {
        var args = [idx, amt].concat(objects) ;
        this.splice.apply(this,args) ;
      }
      
      // if we replaced exactly the same number of items, then pass only the
      // replaced range.  Otherwise, pass the full remaining array length 
      // since everything has shifted
      var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;
      this.enumerableContentDidChange(idx, amt, len - amt) ;
      return this ;
    },
    
    // If you ask for an unknown property, then try to collect the value
    // from member items.
    unknownProperty: function(key, value) {
      var ret = this.reducedProperty(key, value) ;
      if ((value !== undefined) && ret === undefined) {
        ret = this[key] = value;
      }
      return ret ;
    }
    
  });
    
  // If browser did not implement indexOf natively, then override with
  // specialized version
  var indexOf = Array.prototype.indexOf;
  if (!indexOf || (indexOf === SC.Array.indexOf)) {
    Array.prototype.indexOf = function(object, startAt) {
      var idx, len = this.length;
      
      if (startAt === undefined) startAt = 0;
      else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0) startAt += len;
      
      for(idx=startAt;idx<len;idx++) {
        if (this[idx] === object) return idx ;
      }
      return -1;
    } ; 
  }
  
  var lastIndexOf = Array.prototype.lastIndexOf ;
  if (!lastIndexOf || (lastIndexOf === SC.Array.lastIndexOf)) {
    Array.prototype.lastIndexOf = function(object, startAt) {
      var idx, len = this.length;
      
      if (startAt === undefined) startAt = len-1;
      else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0) startAt += len;
      
      for(idx=startAt;idx>=0;idx--) {
        if (this[idx] === object) return idx ;
      }
      return -1;
    };
  }
  
})();

/* >>>>>>>>>> BEGIN source/mixins/comparable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  Implements some standard methods for comparing objects. Add this mixin to
  any class you create that can compare its instances.
  
  You should implement the compare() method.
  
  @since SproutCore 1.0
*/
SC.Comparable = {
  
  /**
    walk like a duck. Indicates that the object can be compared.
    
    @type Boolean
  */
  isComparable: YES,
  
  /**
    Override to return the result of the comparison of the two parameters. The
    compare method should return
      -1 if a < b
       0 if a == b
       1 if a > b
    
    Default implementation raises
    an exception.
    
    @param a {Object} the first object to compare
    @param b {Object} the second object to compare
    @returns {Integer} the result of the comparison
  */
  compare: function(a, b) {
    throw "%@.compare() is not implemented".fmt(this.toString());
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/copyable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  Impelements some standard methods for copying an object.  Add this mixin to
  any object you create that can create a copy of itself.  This mixin is 
  added automatically to the built-in array.
  
  You should generally implement the copy() method to return a copy of the 
  receiver.
  
  Note that frozenCopy() will only work if you also implement SC.Freezable.

  @since SproutCore 1.0
*/
SC.Copyable = {
  
  /**
    Walk like a duck.  Indicates that the object can be copied.
    
    @type Boolean
  */
  isCopyable: YES,
  
  /**
    Override to return a copy of the receiver.  Default implementation raises
    an exception.
    
    @returns {Object} copy of receiver
  */
  copy: function() {
    throw "%@.copy() is not implemented";
  },
  
  /**
    If the object implements SC.Freezable, then this will return a new copy 
    if the object is not frozen and the receiver if the object is frozen.  
    
    Raises an exception if you try to call this method on a object that does
    not support freezing.
    
    You should use this method whenever you want a copy of a freezable object
    since a freezable object can simply return itself without actually 
    consuming more memory.
  
    @returns {Object} copy of receiver or receiver
  */
  frozenCopy: function() {
    var isFrozen = this.get ? this.get('isFrozen') : this.isFrozen;
    if (isFrozen === YES) return this;
    else if (isFrozen === undefined) throw "%@ does not support freezing".fmt(this);
    else return this.copy().freeze();
  }
};

// Make Array copyable
SC.mixin(Array.prototype, SC.Copyable);
Array.prototype.copy = Array.prototype.slice;

/* >>>>>>>>>> BEGIN source/mixins/delegate_support.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  Support methods for the Delegate design pattern.
  
  The Delegate design pattern makes it easy to delegate a portion of your 
  application logic to another object.  This is most often used in views to 
  delegate various application-logic decisions to controllers in order to 
  avoid having to bake application-logic directly into the view itself.
  
  The methods provided by this mixin make it easier to implement this pattern
  but they are not required to support delegates.
  
  h2. The Pattern
  
  The delegate design pattern typically means that you provide a property,
  usually ending in "delegate", that can be set to another object in the 
  system.  
  
  When events occur or logic decisions need to be made that you would prefer
  to delegate, you can call methods on the delegate if it is set.  If the 
  delegate is not set, you should provide some default functionality instead.
  
  Note that typically delegates are not observable, hence it is not necessary
  to use get() to retrieve the value of the delegate.
  
  @since SproutCore 1.0
  
*/
SC.DelegateSupport = {  
  
  /**
    Selects the delegate that implements the specified method name.  Pass one
    or more delegates.  The receiver is automatically included as a default.
    
    This can be more efficient than using invokeDelegateMethod() which has
    to marshall arguments into a delegate call.
    
    @param {String} methodName
    @param {Object...} delegate one or more delegate arguments
    @returns {Object} delegate or null
  */
  delegateFor: function(methodName) {
    var idx = 1,
        len = arguments.length,
        ret ;
        
    while(idx<len) {
      ret = arguments[idx];
      if (ret && ret[methodName] !== undefined) return ret ;
      idx++;      
    }
    
    return (this[methodName] !== undefined) ? this : null;
  },
  
  /**
    Invokes the named method on the delegate that you pass.  If no delegate
    is defined or if the delegate does not implement the method, then a 
    method of the same name on the receiver will be called instead.  
    
    You can pass any arguments you want to pass onto the delegate after the
    delegate and methodName.
    
    @param {Object} delegate a delegate object.  May be null.
    @param {String} methodName a method name
    @param {Object...} args (OPTIONAL) any additional arguments
    
    @returns {Object} value returned by delegate
  */
  invokeDelegateMethod: function(delegate, methodName, args) {
    args = SC.A(arguments); args = args.slice(2, args.length) ;
    if (!delegate || !delegate[methodName]) delegate = this ;
    
    var method = delegate[methodName];
    return method ? method.apply(delegate, args) : null;
  },
  
  /**
    Search the named delegates for the passed property.  If one is found, 
    gets the property value and returns it.  If none of the passed delegates 
    implement the property, search the receiver for the property as well.
    
    @param {String} key the property to get.
    @param {Object} delegate one or more delegate
    @returns {Object} property value or undefined
  */
  getDelegateProperty: function(key, delegate) {
    var idx = 1,
        len = arguments.length,
        ret ;
        
    while(idx<len) {
      ret = arguments[idx++];
      if (ret && ret[key] !== undefined) {
        return ret.get ? ret.get(key) : ret[key] ;
      }
    }
    
    return (this[key] !== undefined) ? this.get(key) : undefined ;
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/freezable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  Standard Error that should be raised when you try to modify a frozen object.
  
  @property {Error}
*/
SC.FROZEN_ERROR = new Error("Cannot modify a frozen object");

/** 
  @namespace
  
  The SC.Freezable mixin implements some basic methods for marking an object
  as frozen.  Once an object is frozen it should be read only.  No changes 
  may be made the internal state of the object.
  
  h2. Enforcement

  To fully support freezing in your subclass, you must include this mixin and
  override any method that might alter any property on the object to instead
  raise an exception.  You can check the state of an object by checking the
  isFrozen property.

  Although future versions of JavaScript may support language-level freezing
  object objects, that is not the case today.  Even if an object is freezable,
  it is still technically possible to modify the object, even though it could
  break other parts of your application that do not expect a frozen object to
  change.  It is, therefore, very important that you always respect the 
  isFrozen property on all freezable objects.
  
  h2. Example

  The example below shows a simple object that implement the SC.Freezable 
  protocol.  
  
  {{{
    Contact = SC.Object.extend(SC.Freezable, {
      
      firstName: null,
      
      lastName: null,
      
      // swaps the names
      swapNames: function() {
        if (this.get('isFrozen')) throw SC.FROZEN_ERROR;
        var tmp = this.get('firstName');
        this.set('firstName', this.get('lastName'));
        this.set('lastName', tmp);
        return this;
      }
      
    });
    
    c = Context.create({ firstName: "John", lastName: "Doe" });
    c.swapNames();  => returns c
    c.freeze();
    c.swapNames();  => EXCEPTION
    
  }}}
  
  h2. Copying
  
  Usually the SC.Freezable protocol is implemented in cooperation with the
  SC.Copyable protocol, which defines a frozenCopy() method that will return
  a frozen object, if the object implements this method as well.
  
*/
SC.Freezable = {
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isFreezable: YES,
  
  /**
    Set to YES when the object is frozen.  Use this property to detect whether
    your object is frozen or not.
    
    @property {Boolean}
  */
  isFrozen: NO,
  
  /**
    Freezes the object.  Once this method has been called the object should
    no longer allow any properties to be edited.
    
    @returns {Object} reciever
  */
  freeze: function() {
    // NOTE: Once someone actually implements Object.freeze() in the browser,
    // add a call to that here also.
    
    if (this.set) this.set('isFrozen', YES);
    else this.isFrozen = YES;
    return this;
  }
    
};


// Add to Array
SC.mixin(Array.prototype, SC.Freezable);

/* >>>>>>>>>> BEGIN source/system/set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/observable') ;
sc_require('mixins/freezable');
sc_require('mixins/copyable');

// IMPORTANT NOTE:  This file actually defines two classes: 
// SC.Set is a fully observable set class documented below. 
// SC._CoreSet is just like SC.Set but is not observable.  This is required
// because SC.Observable is built on using sets and requires sets without 
// observability.
//
// We use pointer swizzling below to swap around the actual definitions so 
// that the documentation will turn out right.  (The docs should only 
// define SC.Set - not SC._CoreSet)

/**
  @class 

  An unordered collection of objects.

  A Set works a bit like an array except that its items are not ordered.  
  You can create a set to efficiently test for membership for an object. You 
  can also iterate through a set just like an array, even accessing objects
  by index, however there is no gaurantee as to their order.

  Note that SC.Set is a primitive object, like an array.  It does implement
  limited key-value observing support but it does not extend from SC.Object
  so you should not subclass it.

  h1. Creating a Set

  You can create a set like you would most objects using SC.Set.create().  
  Most new sets you create will be empty, but you can also initialize the set 
  with some content by passing an array or other enumerable of objects to the 
  constructor.

  Finally, you can pass in an existing set and the set will be copied.  You
  can also create a copy of a set by calling SC.Set#clone().

  {{{
    // creates a new empty set
    var foundNames = SC.Set.create();

    // creates a set with four names in it.
    var names = SC.Set.create(["Charles", "Peter", "Chris", "Erich"]) ;

    // creates a copy of the names set.
    var namesCopy = SC.Set.create(names);

    // same as above.
    var anotherNamesCopy = names.clone();
  }}}

  h1. Adding/Removing Objects

  You generally add or removed objects from a set using add() or remove().
  You can add any type of object including primitives such as numbers,
  strings, and booleans.

  Note that objects can only exist one time in a set.  If you call add() on
  a set with the same object multiple times, the object will only be added 
  once.  Likewise, calling remove() with the same object multiple times will
  remove the object the first time and have no effect on future calls until 
  you add the object to the set again.

  Note that you cannot add/remove null or undefined to a set.  Any attempt to
  do so will be ignored.  

  In addition to add/remove you can also call push()/pop().  Push behaves just
  like add() but pop(), unlike remove() will pick an arbitrary object, remove
  it and return it.  This is a good way to use a set as a job queue when you
  don't care which order the jobs are executed in.

  h1. Testing for an Object

  To test for an object's presence in a set you simply call SC.Set#contains().
  This method tests for the object's hash, which is generally the same as the
  object's _guid but if you implement the hash() method on the object, it will
  use the return value from that method instead.

  @extends SC.Enumerable 
  @extends SC.Observable
  @extends SC.Copyable
  @extends SC.Freezable

  @since SproutCore 1.0
*/
SC.Set = SC.mixin({}, 
  SC.Enumerable, 
  SC.Observable, 
  SC.Freezable, 
/** @scope SC.Set.prototype */ {

  /** 
    Creates a new set, with the optional array of items included in the 
    return set.

    @param {SC.Enumerable} items items to add
    @return {SC.Set}
  */
  create: function(items) {
    var ret, idx, pool = SC.Set._pool, isObservable = this.isObservable;
    if (!isObservable && items===undefined && pool.length>0) ret = pool.pop();
    else {
      ret = SC.beget(this);
      if (isObservable) ret.initObservable();
      
      if (items && items.isEnumerable && items.get('length')>0) {

        ret.isObservable = NO; // suspend change notifications
        
        // arrays and sets get special treatment to make them a bit faster
        if (items.isSCArray) {
          idx = items.get ? items.get('length') : items.length;
          while(--idx>=0) ret.add(items.objectAt(idx));
        
        } else if (items.isSet) {
          idx = items.length;
          while(--idx>=0) ret.add(items[idx]);
          
        // otherwise use standard SC.Enumerable API
        } else items.forEach(function(i) { ret.add(i); }, this);
        
        ret.isObservable = isObservable;
      }
    }
    return ret ;
  },
  
  /**
    Walk like a duck
    
    @property {Boolean}
  */
  isSet: YES,
  
  /**
    This property will change as the number of objects in the set changes.

    @property {Number}
  */
  length: 0,

  /**
    Returns the first object in the set or null if the set is empty
    
    @property {Object}
  */
  firstObject: function() {
    return (this.length>0) ? this[0] : undefined ;
  }.property(),
  
  /**
    Clears the set 
    
    @returns {SC.Set}
  */
  clear: function() { 
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    this.length = 0;
    return this ;
  },

  /**
    Call this method to test for membership.
    
    @returns {Boolean}
  */
  contains: function(obj) {

    // because of the way a set is "reset", the guid for an object may 
    // still be stored as a key, but points to an index that is beyond the
    // length.  Therefore the found idx must both be defined and less than
    // the current length.
    if (obj === null) return NO ;
    var idx = this[SC.hashFor(obj)] ;
    return (!SC.none(idx) && (idx < this.length) && (this[idx]===obj)) ;
  },
  
  /**
    Returns YES if the passed object is also a set that contains the same 
    objects as the receiver.
  
    @param {SC.Set} obj the other object
    @returns {Boolean}
  */
  isEqual: function(obj) {
    // fail fast
    if (!obj || !obj.isSet || (obj.get('length') !== this.get('length'))) {
      return NO ;
    }
    
    var loc = this.get('length');
    while(--loc>=0) {
      if (!obj.contains(this[loc])) return NO ;
    }
    
    return YES;
  },

  /**
    Call this method to add an object. performs a basic add.

    If the object is already in the set it will not be added again.

    @param obj {Object} the object to add
    @returns {SC.Set} receiver
  */
  add: function(obj) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    // cannot add null to a set.
    if (obj===null || obj===undefined) return this; 

    var guid = SC.hashFor(obj) ;
    var idx = this[guid] ;
    var len = this.length ;
    if ((idx===null || idx===undefined) || (idx >= len) || (this[idx]!==obj)){
      this[len] = obj ;
      this[guid] = len ;
      this.length = len+1;
    }
    
    if (this.isObservable) this.enumerableContentDidChange();
    
    return this ;
  },

  /**
    Add all the items in the passed array or enumerable

    @returns {SC.Set} receiver
  */
  addEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (!objects || !objects.isEnumerable) {
      throw "%@.addEach must pass enumerable".fmt(this);
    }

    var idx, isObservable = this.isObservable ;
    
    if (isObservable) this.beginPropertyChanges();
    if (objects.isSCArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.add(objects[idx]);
      
    } else objects.forEach(function(i) { this.add(i); }, this);
    if (isObservable) this.endPropertyChanges();
    
    return this ;
  },  

  /**
    Removes the object from the set if it is found.

    If the object is not in the set, nothing will be changed.

    @param obj {Object} the object to remove
    @returns {SC.Set} receiver
  */  
  remove: function(obj) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    if (SC.none(obj)) return this ;
    var guid = SC.hashFor(obj);
    var idx = this[guid] ;
    var len = this.length;

    // not in set.
    if (SC.none(idx) || (idx >= len) || (this[idx] !== obj)) return this; 

    // clear the guid key
    delete this[guid] ;

    // to clear the index, we will swap the object stored in the last index.
    // if this is the last object, just reduce the length.
    if (idx < (len-1)) {
      obj = this[idx] = this[len-1];
      this[SC.hashFor(obj)] = idx ;
    }

    // reduce the length
    this.length = len-1;
    if (this.isObservable) this.enumerableContentDidChange();
    return this ;
  },

  /**
    Removes an arbitrary object from the set and returns it.

    @returns {Object} an object from the set or null
  */
  pop: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    var obj = (this.length > 0) ? this[this.length-1] : null ;
    if (obj) this.remove(obj) ;
    return obj ;
  },

  /**
    Removes all the items in the passed array.

    @returns {SC.Set} receiver
  */
  removeEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (!objects || !objects.isEnumerable) {
      throw "%@.addEach must pass enumerable".fmt(this);
    }

    var idx, isObservable = this.isObservable ;
    
    if (isObservable) this.beginPropertyChanges();
    if (objects.isSCArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.remove(objects[idx]);
    } else objects.forEach(function(i) { this.remove(i); }, this);
    if (isObservable) this.endPropertyChanges();
    
    return this ;
  },  

  /**
   Clones the set into a new set.  

    @returns {SC.Set} new copy
  */
  copy: function() {
    return this.constructor.create(this);    
  },

  /**
    Return a set to the pool for reallocation.

    @returns {SC.Set} receiver
  */
  destroy: function() {
    this.isFrozen = NO ; // unfreeze to return to pool
    if (!this.isObservable) SC.Set._pool.push(this.clear());
    return this;
  },
  
  // .......................................
  // PRIVATE 
  //

  /** @private - optimized */
  forEach: function(iterator, target) {
    var len = this.length;
    if (!target) target = this ;
    for(var idx=0;idx<len;idx++) iterator.call(target, this[idx], idx, this);
    return this ;
  },

  /** @private */
  toString: function() {
    var len = this.length, idx, ary = [];
    for(idx=0;idx<len;idx++) ary[idx] = this[idx];
    return "SC.Set<%@>".fmt(ary.join(',')) ;
  },
  
  // the pool used for non-observable sets
  _pool: [],

  /** @private */
  isObservable: YES

}) ;

SC.Set.constructor = SC.Set;

// Make SC.Set look a bit more like other enumerables

/** @private */
SC.Set.clone = SC.Set.copy ;

/** @private */
SC.Set.push = SC.Set.unshift = SC.Set.add ;

/** @private */
SC.Set.shift = SC.Set.pop ;

// add generic add/remove enumerable support

/** @private */
SC.Set.addObject = SC.Set.add ;

/** @private */
SC.Set.removeObject = SC.Set.remove;

SC.Set._pool = [];

// ..........................................................
// CORE SET
// 

/** @class

  CoreSet is just like set but not observable.  If you want to use the set 
  as a simple data structure with no observing, CoreSet is slightly faster
  and more memory efficient.
  
  @extends SC.Set
  @since SproutCore 1.0
*/
SC.CoreSet = SC.beget(SC.Set);

/** @private */
SC.CoreSet.isObservable = NO ;

/** @private */
SC.CoreSet.constructor = SC.CoreSet;

/* >>>>>>>>>> BEGIN source/system/object.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('core') ;
sc_require('mixins/observable') ;
sc_require('mixins/array') ;
sc_require('system/set');

/*globals $$sel */

SC.BENCHMARK_OBJECTS = NO;

// ..........................................................
// PRIVATE HELPER METHODS
// 
// Private helper methods.  These are not kept as part of the class
// definition because SC.Object is copied frequently and we want to keep the
// number of class methods to a minimum.

/** @private
  Augments a base object by copying the properties from the extended hash.
  In addition to simply copying properties, this method also performs a 
  number of optimizations that can make init'ing a new object much faster
  including:
  
  - concatenating concatenatedProperties
  - prepping a list of bindings, observers, and dependent keys
  - caching local observers so they don't need to be manually constructed.

  @param {Hash} base hash
  @param {Hash} extension
  @returns {Hash} base hash
*/
SC._object_extend = function _object_extend(base, ext) {
  if (!ext) throw "SC.Object.extend expects a non-null value.  Did you forget to 'sc_require' something?  Or were you passing a Protocol to extend() as if it were a mixin?";

  // set _kvo_cloned for later use
  base._kvo_cloned = null;

  // get some common vars
  var key, idx, len, cur, cprops = base.concatenatedProperties, K = SC.K ;
  var p1,p2;

  // first, save any concat props.  use old or new array or concat
  idx = (cprops) ? cprops.length : 0 ;
  var concats = (idx>0) ? {} : null;
  while(--idx>=0) {
    key = cprops[idx]; p1 = base[key]; p2 = ext[key];

    if (p1) {
      if (!(p1 instanceof Array)) p1 = SC.$A(p1);
      concats[key] = (p2) ? p1.concat(p2) : p2 ;
    } else {
      if (!(p2 instanceof Array)) p2 = SC.$A(p2);
      concats[key] = p2 ;
    }
  }

  // setup arrays for bindings, observers, and properties.  Normally, just
  // save the arrays from the base.  If these need to be changed during 
  // processing, then they will be cloned first.
  var bindings = base._bindings, clonedBindings = NO;
  var observers = base._observers, clonedObservers = NO;
  var properties = base._properties, clonedProperties = NO;
  var paths, pathLoc, local ;

  // outlets are treated a little differently because you can manually 
  // name outlets in the passed in hash. If this is the case, then clone
  // the array first.
  var outlets = base.outlets, clonedOutlets = NO ;
  if (ext.outlets) { 
    outlets = (outlets || SC.EMPTY_ARRAY).concat(ext.outlets);
    clonedOutlets = YES ;
  }

  // now copy properties, add superclass to func.
  for(key in ext) {

    if (key === '_kvo_cloned') continue; // do not copy

    // avoid copying builtin methods
    if (!ext.hasOwnProperty(key)) continue ; 

    // get the value.  use concats if defined
    var value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;

    // Possibly add to a bindings.
    if (key.slice(-7) === "Binding") {
      if (!clonedBindings) {
        bindings = (bindings || SC.EMPTY_ARRAY).slice() ;
        clonedBindings = YES ;
      }

      if (bindings === null) bindings = (base._bindings || SC.EMPTY_ARRAY).slice();
      bindings[bindings.length] = key ;

    // Also add observers, outlets, and properties for functions...
    } else if (value && (value instanceof Function)) {

      // add super to funcs.  Be sure not to set the base of a func to 
      // itself to avoid infinite loops.
      if (!value.superclass && (value !== (cur=base[key]))) {
        value.superclass = value.base = cur || K;
      }

      // handle regular observers
      if (value.propertyPaths) {
        if (!clonedObservers) {
          observers = (observers || SC.EMPTY_ARRAY).slice() ;
          clonedObservers = YES ;
        }
        observers[observers.length] = key ;

      // handle local properties
      } else if (paths = value.localPropertyPaths) {
        pathLoc = paths.length;
        while(--pathLoc >= 0) {
          local = base._kvo_for(SC.keyFor('_kvo_local', paths[pathLoc]), SC.Set);
          local.add(key);
          base._kvo_for('_kvo_observed_keys', SC.CoreSet).add(paths[pathLoc]);
        }

      // handle computed properties
      } else if (value.dependentKeys) {
        if (!clonedProperties) {
          properties = (properties || SC.EMPTY_ARRAY).slice() ;
          clonedProperties = YES ;
        }
        properties[properties.length] = key ;

      // handle outlets
      } else if (value.autoconfiguredOutlet) {
        if (!clonedOutlets) {
          outlets = (outlets || SC.EMPTY_ARRAY).slice();
          clonedOutlets = YES ;
        }
        outlets[outlets.length] = key ;          
      }
    }

    // copy property
    base[key] = value ;
  }
  
  // Manually set base on toString() because some JS engines (such as IE8) do
  // not enumerate it
  if (ext.hasOwnProperty('toString')) {
    key = 'toString';
    // get the value.  use concats if defined
    value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;
    if (!value.superclass && (value !== (cur=base[key]))) {
      value.superclass = value.base = cur || K ;
    }
    // copy property
    base[key] = value ;
  }


  // copy bindings, observers, and properties 
  base._bindings = bindings || [];
  base._observers = observers || [] ;
  base._properties = properties || [] ;
  base.outlets = outlets || [];

  return base ;
} ;

/** @class

  Root object for the SproutCore framework.  SC.Object is the root class for
  most classes defined by SproutCore.  It builds on top of the native object
  support provided by JavaScript to provide support for class-like 
  inheritance, automatic bindings, properties observers, and more.  
  
  Most of the classes you define in your application should inherit from 
  SC.Object or one of its subclasses.  If you are writing objects of your
  own, you should read this documentation to learn some of the details of 
  how SC.Object's behave and how they differ from other frameworks.
  
  h2. About SproutCore Classes
  
  JavaScript is not a class-based language.  Instead it uses a type of 
  inheritence inspired by self called "prototypical" inheritance. 
  ...

  h2. Using SproutCore objects with other JavaScript object.
  
  You can create a SproutCore object just like any other object...
  obj = new SC.Object() ;
  
  @extends SC.Observable 
  @since SproutCore 1.0
*/
SC.Object = function(props) { return this._object_init(props); };

SC.mixin(SC.Object, /** @scope SC.Object */ {

  /**
    Adds the passed properties to the object's class definition.  You can 
    pass as many hashes as you want, including Mixins, and they will be 
    added in the order they are passed.

    This is a shorthand for calling SC.mixin(MyClass, props...);
    
    @params {Hash} props the properties you want to add.
    @returns {Object} receiver
  */
  mixin: function(props) {
    var len = arguments.length, loc ;
    for(loc =0;loc<len;loc++) SC.mixin(this, arguments[loc]);
    return this ;
  },

  // ..........................................
  // CREATING CLASSES AND INSTANCES
  //

  /**
    Points to the superclass for this class.  You can use this to trace a
    class hierarchy.
    
    @property {SC.Object}
  */
  superclass: null,
  
  /**
    Creates a new subclass of the receiver, adding any passed properties to
    the instance definition of the new class.  You should use this method
    when you plan to create several objects based on a class with similar 
    properties.

    h2. Init

    If you define an init() method, it will be called when you create 
    instances of your new class.  Since SproutCore uses the init() method to
    do important setup, you must be sure to always call arguments.callee.base.apply(this,arguments) somewhere
    in your init() to allow the normal setup to proceed.

    @params {Hash} props the methods of properties you want to add
    @returns {Class} A new object class
  */
  extend: function(props) {   
    var bench = SC.BENCHMARK_OBJECTS ;
    if (bench) SC.Benchmark.start('SC.Object.extend') ;

    // build a new constructor and copy class methods.  Do this before 
    // adding any other properties so they are not overwritten by the copy.
    var prop, ret = function(props) { return this._object_init(props); } ;
    for(prop in this) {
      if (!this.hasOwnProperty(prop)) continue ;
      ret[prop] = this[prop];
    }
    
    // manually copy toString() because some JS engines do not enumerate it
    if (this.hasOwnProperty('toString')) ret.toString = this.toString;

    // now setup superclass, guid
    ret.superclass = this ;
    SC.generateGuid(ret); // setup guid

    ret.subclasses = SC.Set.create();
    this.subclasses.add(ret); // now we can walk a class hierarchy

    // setup new prototype and add properties to it
    var base = (ret.prototype = SC.beget(this.prototype));
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) SC._object_extend(base, arguments[idx]) ;
    base.constructor = ret; // save constructor

    if (bench) SC.Benchmark.end('SC.Object.extend') ;
    return ret ;
  },

  /**
    Creates a new instance of the class.

    Unlike most frameworks, you do not pass parameters to the init function
    for an object.  Instead, you pass a hash of additional properties you 
    want to have assigned to the object when it is first created.  This is
    functionally like creating an anonymous subclass of the receiver and then
    instantiating it, but more efficient.

    You can use create() like you would a normal constructor in a 
    class-based system, or you can use it to create highly customized 
    singleton objects such as controllers or app-level objects.  This is 
    often more efficient than creating subclasses and then instantiating 
    them.

    You can pass any hash of properties to this method, including mixins.
    
    @param {Hash} props 
      optional hash of method or properties to add to the instance.
      
    @returns {SC.Object} new instance of the receiver class.
  */
  create: function() {
    var C=this, ret = new C(arguments); 
    if (SC.ObjectDesigner) {
      SC.ObjectDesigner.didCreateObject(ret, SC.$A(arguments));
    }
    return ret ; 
  },
  /**
    Walk like a duck.  You can use this to quickly test classes.
    
    @property {Boolean}
  */
  isClass: YES,

  /**
    Set of subclasses that extend from this class.  You can observe this 
    array if you want to be notified when the object is extended.
    
    @property {SC.Set}
  */
  subclasses: SC.Set.create(),
  
  /** @private */
  toString: function() { return SC._object_className(this); },

  // ..........................................
  // PROPERTY SUPPORT METHODS
  //

  /** 
    Returns YES if the receiver is a subclass of the named class.  If the 
    receiver is the class passed, this will return NO since the class is not
    a subclass of itself.  See also kindOf().

    h2. Example
    
    {{{
      ClassA = SC.Object.extend();
      ClassB = ClassA.extend();

      ClassB.subclassOf(ClassA) => YES
      ClassA.subclassOf(ClassA) => NO
    }}}
    
    @param {Class} scClass class to compare
    @returns {Boolean} 
  */
  subclassOf: function(scClass) {
    if (this === scClass) return NO ;
    var t = this ;
    while(t = t.superclass) if (t === scClass) return YES ;
    return NO ;
  },
  
  /**
    Returns YES if the passed object is a subclass of the receiver.  This is 
    the inverse of subclassOf() which you call on the class you want to test.
    
    @param {Class} scClass class to compare
    @returns {Boolean}
  */
  hasSubclass: function(scClass) {
    return (scClass && scClass.subclassOf) ? scClass.subclassOf(this) : NO;
  },

  /**
    Returns YES if the receiver is the passed class or is a subclass of the 
    passed class.  Unlike subclassOf(), this method will return YES if you
    pass the receiver itself, since class is a kind of itself.  See also 
    subclassOf().

    h2. Example

    {{{
      ClassA = SC.Object.extend();
      ClassB = ClassA.extend();

      ClassB.kindOf(ClassA) => YES
      ClassA.kindOf(ClassA) => YES
    }}}
    
    @param {Class} scClass class to compare
    @returns {Boolean} 
  */
  kindOf: function(scClass) { 
    return (this === scClass) || this.subclassOf(scClass) ;
  },
  
  // ..........................................................
  // Designers
  //   
  /**
    This method works just like extend() except that it will also preserve
    the passed attributes.
    
    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.Object subclass to create
    @function
  */ 
  design: function() {
    if (this.isDesign) return this; // only run design one time
    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES ;
    if (SC.ObjectDesigner) {
      SC.ObjectDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret ;
  }
}) ;

// ..........................................
// DEFAULT OBJECT INSTANCE
// 
SC.Object.prototype = {
  
  _kvo_enabled: YES,
  
  /** @private
    This is the first method invoked on a new instance.  It will first apply
    any added properties to the new instance and then calls the real init()
    method.
    
    @param {Array} extensions an array-like object with hashes to apply.
    @returns {Object} receiver
  */
  _object_init: function(extensions) {
    // apply any new properties
    var idx, len = (extensions) ? extensions.length : 0;
    for(idx=0;idx<len;idx++) SC._object_extend(this, extensions[idx]) ;
    SC.generateGuid(this) ; // add guid
    this.init() ; // call real init
    
    // Call 'initMixin' methods to automatically setup modules.
    var inits = this.initMixin; len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);
    
    return this ; // done!
  },
  
  /**
    You can call this method on an object to mixin one or more hashes of 
    properties on the receiver object.  In addition to simply copying 
    properties, this method will also prepare the properties for use in 
    bindings, computed properties, etc.
    
    If you plan to use this method, you should call it before you call
    the inherited init method from SC.Object or else your instance may not 
    function properly.
    
    h2. Example
    
    {{{
      // dynamically apply a mixin specified in an object property
      var MyClass = SC.Object.extend({
         extraMixin: null,
         
         init: function() {
           this.mixin(this.extraMixin);
           arguments.callee.base.apply(this,arguments);
         }
      });
      
      var ExampleMixin = { foo: "bar" };
      
      var instance = MyClass.create({ extraMixin: ExampleMixin }) ;
      
      instance.get('foo') => "bar"
    }}}

    @param {Hash} ext a hash to copy.  Only one.
    @returns {Object} receiver
  */
  mixin: function() {
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) SC.mixin(this, arguments[idx]) ;

    // call initMixin
    for(idx=0;idx<len;idx++) {
      var init = arguments[idx].initMixin ;
      if (init) init.call(this) ;
    }
    return this ;
  },

  /**
    This method is invoked automatically whenever a new object is 
    instantiated.  You can override this method as you like to setup your
    new object.  

    Within your object, be sure to call arguments.callee.base.apply(this,arguments) to ensure that the 
    built-in init method is also called or your observers and computed 
    properties may not be configured.

    Although the default init() method returns the receiver, the return 
    value is ignored.

    @returns {void}
  */
  init: function() {
    this.initObservable();
    return this ;
  },

  /**
    Set to NO once this object has been destroyed. 
    
    @property {Boolean}
  */
  isDestroyed: NO,

  /**
    Call this method when you are finished with an object to teardown its
    contents.  Because JavaScript is garbage collected, you do not usually 
    need to call this method.  However, you may choose to do so for certain
    objects, especially views, in order to let them reclaim memory they 
    consume immediately.

    If you would like to perform additional cleanup when an object is
    finished, you may override this method.  Be sure to call arguments.callee.base.apply(this,arguments).
    
    @returns {SC.Object} receiver
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
    this.set('isDestroyed', YES);

    // destroy any mixins
    var idx, inits = this.destroyMixin, len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);

    return this ;
  },

  /**
    Walk like a duck. Always YES since this is an object and not a class.
    
    @property {Boolean}
  */
  isObject: true,

  /**
    Returns YES if the named value is an executable function.

    @param methodName {String} the property name to check
    @returns {Boolean}
  */
  respondsTo: function( methodName ) {
    return !!(SC.typeOf(this[methodName]) === SC.T_FUNCTION);
  },
  
  /**
    Attemps to invoke the named method, passing the included two arguments.  
    Returns NO if the method is either not implemented or if the handler 
    returns NO (indicating that it did not handle the event).  This method 
    is invoked to deliver actions from menu items and to deliver events.  
    You can override this method to provide additional handling if you 
    prefer.

    @param {String} methodName
    @param {Object} arg1
    @param {Object} arg2
    @returns {Boolean} YES if handled, NO if not handled
  */
  tryToPerform: function(methodName, arg1, arg2) {
    return this.respondsTo(methodName) && (this[methodName](arg1, arg2) !== NO);
  },

  /**  
    EXPERIMENTAL:  You can use this to invoke a superclass implementation in
    any method.  This does not work in Safari 2 or earlier.  If you need to
    target these methods, you should use one of the alternatives below:

    - *With Build Tools:* arguments.callee.base.apply(this,arguments);
    - *Without Build Tools:* arguments.callee.base.apply(this, arguments);
    
    h2. Example
    
    All of the following methods will call the superclass implementation of
    your method:
    
    {{{
      SC.Object.create({
        
        // DOES NOT WORK IN SAFARI 2 OR EARLIER
        method1: function() {
          this.superclass();
        },
        
        // REQUIRES SC-BUILD TOOLS
        method2: function() {
          arguments.callee.base.apply(this,arguments);
        },
        
        // WORKS ANYTIME
        method3: function() {
          arguments.callee.base.apply(this, arguments);
        }
      });
    }}}

    @params args {*args} any arguments you want to pass along.
    @returns {Object} return value from super
  */
  superclass: function(args) {
    var caller = arguments.callee.caller; 
    if (!caller) throw "superclass cannot determine the caller method" ;
    return caller.superclass ? caller.superclass.apply(this, arguments) : null;
  },

  /**  
    returns YES if the receiver is an instance of the named class.  See also
    kindOf().

    h2. Example
    
    {{{
      var ClassA = SC.Object.extend();
      var ClassB = SC.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.instanceOf(ClassA) => YES
      instB.instanceOf(ClassA) => NO
    }}}
    
    @param {Class} scClass the class
    @returns {Boolean}
  */
  instanceOf: function(scClass) {
    return this.constructor === scClass ;  
  },

  /**  
    Returns true if the receiver is an instance of the named class or any 
    subclass of the named class.  See also instanceOf().

    h2. Example
    
    {{{
      var ClassA = SC.Object.extend();
      var ClassB = SC.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.kindOf(ClassA) => YES
      instB.kindOf(ClassA) => YES
    }}}

    @param scClass {Class} the class
    @returns {Boolean}
  */
  kindOf: function(scClass) { return this.constructor.kindOf(scClass); },

  /** @private */
  toString: function() {
    if (!this._object_toString) {
      // only cache the string if the klass name is available
      var klassName = SC._object_className(this.constructor) ;
      var string = "%@:%@".fmt(klassName, SC.guidFor(this));
      if (klassName) this._object_toString = string ;
      else return string ;
    } 
    return this._object_toString ;
  },

  /**  
    Activates any outlet connections in object and syncs any bindings.  This
    method is called automatically for view classes but may be used for any
    object.
    
    @returns {void}
  */
  awake: function(key) { 
    this.outlets.forEach(function(key) { this.get(key); },this) ;
    this.bindings.invoke('sync'); 
  },

  /**
    Invokes the passed method or method name one time during the runloop.  You
    can use this method to schedule methods that need to execute but may be 
    too expensive to execute more than once, such as methods that update the
    DOM.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Function|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeOnce: function(method) {
    SC.RunLoop.currentRunLoop.invokeOnce(this, method) ;
    return this ;
  },
  
  /**
    Invokes the passed method once at the beginning of the next runloop, 
    before any other methods (including events) are processed. This is useful
    for situations where you know you need to update something, but due to
    the way the run loop works, you can't actually do the update until the
    run loop has completed.
    
    A simple example is setting the selection on a collection controller to a 
    newly created object. Because the collection controller won't have its
    content collection updated until later in the run loop, setting the 
    selection immediately will have no effect. In this situation, you could do
    this instead:
    
    {{{
      // Creates a new MyRecord object and sets the selection of the
      // myRecord collection controller to the new object.
      createObjectAction: function(sender, evt) {
        // create a new record and add it to the store
        var obj = MyRecord.newRecord() ;
        
        // update the collection controller's selection
        MyApp.myRecordCollectionController.invokeLast( function() {
          this.set('selection', [obj]) ;
        });
      }
    }}}
    
    You can call invokeLast as many times as you like and the method will
    only be invoked once.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Function|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeLast: function(method) {
    SC.RunLoop.currentRunLoop.invokeLast(this, method) ;
    return this ;
  },
  
  /**
    The properties named in this array will be concatenated in subclasses
    instead of replaced.  This allows you to name special properties that
    should contain any values you specify plus values specified by parents.

    It is used by SproutCore and is available for your use, though you 
    should limit the number of properties you include in this list as it 
    adds a slight overhead to new class and instance creation.

    @property {Array}
  */
  concatenatedProperties: ['concatenatedProperties', 'initMixin', 'destroyMixin']  

} ;

// bootstrap the constructor for SC.Object.
SC.Object.prototype.constructor = SC.Object;

// Add observable to mixin
SC.mixin(SC.Object.prototype, SC.Observable) ;

// ..........................................................
// CLASS NAME SUPPORT
// 

/** @private
  This is a way of performing brute-force introspection.  This searches 
  through all the top-level properties looking for classes.  When it finds
  one, it saves the class path name.
*/
function findClassNames() {

  if (SC._object_foundObjectClassNames) return ;
  SC._object_foundObjectClassNames = true ;

  var seen = [] ;
  var searchObject = function(root, object, levels) {
    levels-- ;

    // not the fastest, but safe
    if (seen.indexOf(object) >= 0) return ;
    seen.push(object) ;

    for(var key in object) {
      if (key == '__scope__') continue ;
      if (key == 'superclass') continue ;
      if (!key.match(/^[A-Z0-9]/)) continue ;

      var path = (root) ? [root,key].join('.') : key ;
      var value = object[key] ;


      switch(SC.typeOf(value)) {
      case SC.T_CLASS:
        if (!value._object_className) value._object_className = path;
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case SC.T_OBJECT:
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case SC.T_HASH:
        if (((root) || (path==='SC')) && (levels>=0)) searchObject(path, value, levels) ;
        break ;

      default:
        break;
      }
    }
  } ;

  searchObject(null, window, 2) ;

  // Internet Explorer doesn't loop over global variables...
  /*if ( SC.browser.isIE ) {
    searchObject('SC', SC, 2) ; // get names for the SC classes

    // get names for the model classes, including nested namespaces (untested)
    for ( var i = 0; i < SC.Server.servers.length; i++ ) {
      var server = SC.Server.servers[i];
      if (server.prefix) {
        for (var prefixLoc = 0; prefixLoc < server.prefix.length; prefixLoc++) {
          var prefixParts = server.prefix[prefixLoc].split('.');
          var namespace = window;
          var namespaceName;
          for (var prefixPartsLoc = 0; prefixPartsLoc < prefixParts.length; prefixPartsLoc++) {
            namespace = namespace[prefixParts[prefixPartsLoc]] ;
            namespaceName = prefixParts[prefixPartsLoc];
          }
          searchObject(namespaceName, namespace, 2) ;
        }
      }
    }
  }*/
}

/**  
  Same as the instance method, but lets you check instanceOf without
  having to first check if instanceOf exists as a method.
  
  @param {Object} scObject the object to check instance of
  @param {Class} scClass the class
  @returns {Boolean} if object1 is instance of class
*/
SC.instanceOf = function(scObject, scClass) {
  return !!(scObject && scObject.constructor === scClass) ;  
} ; 

/**
  Same as the instance method, but lets you check kindOf without having to 
  first check if kindOf exists as a method.
  
  @param {Object} scObject object to check kind of
  @param {Class} scClass the class to check
  @returns {Boolean} if object is an instance of class or subclass
*/
SC.kindOf = function(scObject, scClass) {
  if (scObject && !scObject.isClass) scObject = scObject.constructor;
  return !!(scObject && scObject.kindOf && scObject.kindOf(scClass));
};

/** @private
  Returns the name of this class.  If the name is not known, triggers
  a search.  This can be expensive the first time it is called.
  
  This method is used to allow classes to determine their own name.
*/
SC._object_className = function(obj) {
  if (!SC.isReady) return ''; // class names are not available until ready
  if (!obj._object_className) findClassNames() ;
  if (obj._object_className) return obj._object_className ;

  // if no direct classname was found, walk up class chain looking for a 
  // match.
  var ret = obj ;
  while(ret && !ret._object_className) ret = ret.superclass; 
  return (ret && ret._object_className) ? ret._object_className : 'Anonymous';
} ;


/* >>>>>>>>>> BEGIN source/private/chain_observer.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/object');

// ........................................................................
// CHAIN OBSERVER
//

// This is a private class used by the observable mixin to support chained
// properties.

// ChainObservers are used to automatically monitor a property several 
// layers deep.
// org.plan.name = SC._ChainObserver.create({
//    target: this, property: 'org',
//    next: SC._ChainObserver.create({
//      property: 'plan',
//      next: SC._ChainObserver.create({
//        property: 'name', func: myFunc
//      })
//    })
//  })
//
SC._ChainObserver = function(property) {
  this.property = property ;
} ;

// This is the primary entry point.  Configures the chain.
SC._ChainObserver.createChain = function(rootObject, path, target, method, context) {

  // First we create the chain.
  var parts = path.split('.'),
      root  = new SC._ChainObserver(parts[0]),
      tail  = root,
      len   = parts.length;

  for(var idx=1;idx<len;idx++) {
    tail = tail.next = new SC._ChainObserver(parts[idx]) ;
  }
  
  // Now root has the first observer and tail has the last one.
  // Feed the rootObject into the front to setup the chain...
  // do this BEFORE we set the target/method so they will not be triggered.
  root.objectDidChange(rootObject);
  
  // Finally, set the target/method on the tail so that future changes will
  // trigger.
  tail.target = target; tail.method = method ; tail.context = context ;
  
  // and return the root to save
  return root ;
};

SC._ChainObserver.prototype = {
  isChainObserver: true,
  
  // the object this instance is observing
  object: null,
  
  // the property on the object this link is observing.
  property: null,
  
  // if not null, this is the next link in the chain.  Whenever the 
  // current property changes, the next observer will be notified.
  next: null,
  
  // if not null, this is the final target observer.
  target: null,
  
  // if not null, this is the final target method
  method: null,
  
  // invoked when the source object changes.  removes observer on old 
  // object, sets up new observer, if needed.
  objectDidChange: function(newObject) {
    if (newObject === this.object) return; // nothing to do.
    
    // if an old object, remove observer on it.
    if (this.object && this.object.removeObserver) {
      this.object.removeObserver(this.property, this, this.propertyDidChange);
    }
    
    // if a new object, add observer on it...
    this.object = newObject ;
    if (this.object && this.object.addObserver) {
      this.object.addObserver(this.property, this, this.propertyDidChange); 
    }
    
    // now, notify myself that my property value has probably changed.
    this.propertyDidChange() ;
  },
  
  // the observer method invoked when the observed property changes.
  propertyDidChange: function() {
    
    // get the new value
    var object = this.object ;
    var property = this.property ;
    var value = (object && object.get) ? object.get(property) : null ;
    
    // if we have a next object in the chain, notify it that its object 
    // did change...
    if (this.next) this.next.objectDidChange(value) ;
    
    // if we have a target/method, call it.
    var target  = this.target,
        method  = this.method,
        context = this.context ;
    if (target && method) {
      var rev = object ? object.propertyRevision : null ;
      if (context) {
        method.call(target, object, property, value, context, rev);
      } else {
        method.call(target, object, property, value, rev) ;
      }
    } 
  },
  
  // teardown the chain...
  destroyChain: function() {
    
    // remove observer
    var obj = this.object ;
    if (obj && obj.removeObserver) {
      obj.removeObserver(this.property, this, this.propertyDidChange) ;
    }  
    
    // destroy next item in chain
    if (this.next) this.next.destroyChain() ;
    
    // and clear left overs...
    this.next = this.target = this.method = this.object = this.context = null;
    return null ;
  }
  
} ;

/* >>>>>>>>>> BEGIN source/private/observer_queue.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/observable');
sc_require('system/set');

// ........................................................................
// OBSERVER QUEUE
//
// This queue is used to hold observers when the object you tried to observe
// does not exist yet.  This queue is flushed just before any property 
// notification is sent.

/**
  @namespace 
  
  The private ObserverQueue is used to maintain a set of pending observers. 
  This allows you to setup an observer on an object before the object exists.
  
  Whenever the observer fires, the queue will be flushed to connect any 
  pending observers.
  
  @since SproutCore 1.0
*/
SC.Observers = {

  queue: [],
  
  /**
   @private 
  
   Attempt to add the named observer.  If the observer cannot be found, put
   it into a queue for later.
  */
  addObserver: function(propertyPath, target, method, pathRoot) {
    var tuple ;

    // try to get the tuple for this.
    if (SC.typeOf(propertyPath) === SC.T_STRING) {
      tuple = SC.tupleForPropertyPath(propertyPath, pathRoot) ;
    } else {
      tuple = propertyPath; 
    }

    // if a tuple was found, add the observer immediately...
    if (tuple) {
      tuple[0].addObserver(tuple[1],target, method) ;
      
    // otherwise, save this in the queue.
    } else {
      this.queue.push([propertyPath, target, method, pathRoot]) ;
    }
  },

  /** 
    @private 
  
    Remove the observer.  If it is already in the queue, remove it.  Also
    if already found on the object, remove that.
  */
  removeObserver: function(propertyPath, target, method, pathRoot) {
    var idx, queue, tuple, item;
    
    tuple = SC.tupleForPropertyPath(propertyPath, pathRoot) ;
    if (tuple) {
      tuple[0].removeObserver(tuple[1], target, method) ;
    } 

    idx = this.queue.length; queue = this.queue ;
    while(--idx >= 0) {
      item = queue[idx] ;
      if ((item[0] === propertyPath) && (item[1] === target) && (item[2] == method) && (item[3] === pathRoot)) queue[idx] = null ;
    }
  },
  
  /**
    @private 
    
    Range Observers register here to indicate that they may potentially 
    need to start observing.
  */
  addPendingRangeObserver: function(observer) {
    var ro = this.rangeObservers;
    if (!ro) ro = this.rangeObservers = SC.CoreSet.create();
    ro.add(observer);
    return this ;
  },
  
  _TMP_OUT: [],
  
  /** 
    Flush the queue.  Attempt to add any saved observers.
  */
  flush: function(object) { 
       
    // flush any observers that we tried to setup but didn't have a path yet
    var oldQueue = this.queue ;
    if (oldQueue && oldQueue.length > 0) {
      var newQueue = (this.queue = []) ; 
      var idx = oldQueue.length ;
      while(--idx >= 0) {
        var item = oldQueue[idx] ;
        if (!item) continue ;

        var tuple = SC.tupleForPropertyPath(item[0], item[3]);
        if (tuple) {
          tuple[0].addObserver(tuple[1], item[1], item[2]) ;
        } else newQueue.push(item) ;
      }
    }
    
    // if this object needsRangeObserver then see if any pending range 
    // observers need it.
    if (object._kvo_needsRangeObserver) {
      var set = this.rangeObservers,
          len = set ? set.get('length') : 0,
          out = this._TMP_OUT,
          ro;
          
      for(idx=0;idx<len;idx++) {
        ro = set[idx]; // get the range observer
        if (ro.setupPending(object)) {
          out.push(ro); // save to remove later
        }
      }
      
      // remove any that have setup
      if (out.length > 0) set.removeEach(out);
      out.length = 0; // reset
      object._kvo_needsRangeObserver = NO ;
    }
    
  },
  
  /** @private */
  isObservingSuspended: 0,

  _pending: SC.CoreSet.create(),

  /** @private */
  objectHasPendingChanges: function(obj) {
    this._pending.add(obj) ; // save for later
  },

  /** @private */
  // temporarily suspends all property change notifications.
  suspendPropertyObserving: function() {
    this.isObservingSuspended++ ;
  },
  
  // resume change notifications.  This will call notifications to be
  // delivered for all pending objects.
  /** @private */
  resumePropertyObserving: function() {
    var pending ;
    if(--this.isObservingSuspended <= 0) {
      pending = this._pending ;
      this._pending = SC.CoreSet.create() ;
      
      var idx, len = pending.length;
      for(idx=0;idx<len;idx++) {
        pending[idx]._notifyPropertyObservers() ;
      }
      pending.clear();
      pending = null ;
    }
  }
  
} ;

/* >>>>>>>>>> BEGIN source/system/binding.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/object') ;

/**
  Debug parameter you can turn on.  This will log all bindings that fire to
  the console.  This should be disabled in production code.  Note that you
  can also enable this from the console or temporarily.
  
  @property {Boolean}
*/
SC.LOG_BINDINGS = NO ;

/**
  Performance paramter.  This will benchmark the time spent firing each 
  binding.
  
  @property {Boolean}
*/
SC.BENCHMARK_BINDING_NOTIFICATIONS = NO ;

/**
  Performance parameter.  This will benchmark the time spend configuring each
  binding.  
  
  @property {Boolean}
*/
SC.BENCHMARK_BINDING_SETUP = NO;
  
/** 
  Default placeholder for multiple values in bindings.
  
  @property {String}
*/
SC.MULTIPLE_PLACEHOLDER = '@@MULT@@' ;

/**
  Default placeholder for null values in bindings.
  
  @property {String}
*/
SC.NULL_PLACEHOLDER = '@@NULL@@' ;

/**
  Default placeholder for empty values in bindings.
  
  @property {String}
*/
SC.EMPTY_PLACEHOLDER = '@@EMPTY@@' ;


/**
  @namespace 
  
  A binding simply connects the properties of two objects so that whenever the
  value of one property changes, the other property will be changed also.  You
  do not usually work with Binding objects directly but instead describe
  bindings in your class definition using something like:
  
  {{{
    valueBinding: "MyApp.someController.title"
  }}}
    
  This will create a binding from "MyApp.someController.title" to the "value"
  property of your object instance automatically.  Now the two values will be
  kept in sync.
  
  h2. Customizing Your Bindings
  
  In addition to synchronizing values, bindings can also perform some basic 
  transforms on values.  These transforms can help to make sure the data fed 
  into one object always meets the expectations of that object regardless of
  what the other object outputs.
  
  To customize a binding, you can use one of the many helper methods defined 
  on SC.Binding like so:
  
  {{{
    valueBinding: SC.Binding.single("MyApp.someController.title") 
  }}}
    
  This will create a binding just like the example above, except that now the
  binding will convert the value of MyApp.someController.title to a single 
  object (removing any arrays) before applying it to the "value" property of
  your object.
  
  You can also chain helper methods to build custom bindings like so:
  
  {{{
    valueBinding: SC.Binding.single("MyApp.someController.title").notEmpty("(EMPTY)")
  }}}
    
  This will force the value of MyApp.someController.title to be a single value
  and then check to see if the value is "empty" (null, undefined, empty array,
  or an empty string).  If it is empty, the value will be set to the string 
  "(EMPTY)".
  
  h2. One Way Bindings
  
  One especially useful binding customization you can use is the oneWay() 
  helper.  This helper tells SproutCore that you are only interested in 
  receiving changes on the object you are binding from.  For example, if you
  are binding to a preference and you want to be notified if the preference 
  has changed, but your object will not be changing the preference itself, you
  could do:
  
  {{{
    bigTitlesBinding: SC.Binding.oneWay("MyApp.preferencesController.bigTitles")
  }}}
    
  This way if the value of MyApp.preferencesController.bigTitles changes the
  "bigTitles" property of your object will change also.  However, if you 
  change the value of your "bigTitles" property, it will not update the 
  preferencesController.
  
  One way bindings are almost twice as fast to setup and twice as fast to 
  execute because the binding only has to worry about changes to one side.
  
  You should consider using one way bindings anytime you have an object that 
  may be created frequently and you do not intend to change a property; only 
  to monitor it for changes. (such as in the example above).
      
  h2. Adding Custom Transforms
  
  In addition to using the standard helpers provided by SproutCore, you can 
  also defined your own custom transform functions which will be used to 
  convert the value.  To do this, just define your transform function and add
  it to the binding with the transform() helper.  The following example will 
  not allow Integers less than ten.  Note that it checks the value of the 
  bindings and allows all other values to pass:
  
  {{{
    valueBinding: SC.Binding.transform(function(value, binding) {
      return ((SC.typeOf(value) === SC.T_NUMBER) && (value < 10)) ? 10 : value;      
    }).from("MyApp.someController.value")
  }}}
  
  If you would like to instead use this transform on a number of bindings,
  you can also optionally add your own helper method to SC.Binding.  This
  method should simply return the value of this.transform(). The example 
  below adds a new helper called notLessThan() which will limit the value to
  be not less than the passed minimum:
  
  {{{
    SC.Binding.notLessThan = function(minValue) {
      return this.transform(function(value, binding) {
        return ((SC.typeOf(value) === SC.T_NUMBER) && (value < minValue)) ? minValue : value ;
      }) ;
    } ;
  }}}
  
  You could specify this in your core.js file, for example.  Then anywhere in 
  your application you can use it to define bindings like so:
  
  {{{
    valueBinding: SC.Binding.from("MyApp.someController.value").notLessThan(10)
  }}}
  
  Also, remember that helpers are chained so you can use your helper along with
  any other helpers.  The example below will create a one way binding that 
  does not allow empty values or values less than 10:
  
  {{{
    valueBinding: SC.Binding.oneWay("MyApp.someController.value").notEmpty().notLessThan(10)
  }}}
  
  Note that the built in helper methods all allow you to pass a "from" 
  property path so you don't have to use the from() helper to set the path.  
  You can do the same thing with your own helper methods if you like, but it 
  is not required.
  
  h2. Creating Custom Binding Templates
  
  Another way you can customize bindings is to create a binding template.  A
  template is simply a binding that is already partially or completely 
  configured.  You can specify this template anywhere in your app and then use 
  it instead of designating your own custom bindings.  This is a bit faster on
  app startup but it is mostly useful in making your code less verbose.
  
  For example, let's say you will be frequently creating one way, not empty 
  bindings that allow values greater than 10 throughout your app.  You could
  create a binding template in your core.js like this:
  
  {{{
    MyApp.LimitBinding = SC.Binding.oneWay().notEmpty().notLessThan(10);
  }}}
  
  Then anywhere you want to use this binding, just refer to the template like 
  so:

  {{{
    valueBinding: MyApp.LimitBinding.beget("MyApp.someController.value")
  }}}
    
  Note that when you use binding templates, it is very important that you 
  always start by using beget() to extend the template.  If you do not do 
  this, you will end up using the same binding instance throughout your app 
  which will lead to erratic behavior.
  
  h2. How to Manually Activate a Binding

  All of the examples above show you how to configure a custom binding, but 
  the result of these customizations will be a binding template, not a fully 
  active binding.  The binding will actually become active only when you 
  instantiate the object the binding belongs to.  It is useful however, to 
  understand what actually happens when the binding is activated.
  
  For a binding to function it must have at least a "from" property and a "to"
  property.  The from property path points to the object/key that you want to
  bind from while the to path points to the object/key you want to bind to.  
  
  When you define a custom binding, you are usually describing the property 
  you want to bind from (such as "MyApp.someController.value" in the examples
  above).  When your object is created, it will automatically assign the value
  you want to bind "to" based on the name of your binding key.  In the 
  examples above, during init, SproutCore objects will effectively call 
  something like this on your binding:
  
  {{{
    binding = this.valueBinding.beget().to("value", this) ;
  }}}
    
  This creates a new binding instance based on the template you provide, and 
  sets the to path to the "value" property of the new object.  Now that the 
  binding is fully configured with a "from" and a "to", it simply needs to be
  connected to become active.  This is done through the connect() method:
  
  {{{
    binding.connect() ;
  }}}
    
  Now that the binding is connected, it will observe both the from and to side 
  and relay changes.
  
  If you ever needed to do so (you almost never will, but it is useful to 
  understand this anyway), you could manually create an active binding by 
  doing the following:
  
  {{{
    SC.Binding.from("MyApp.someController.value")
     .to("MyApp.anotherObject.value")
     .connect();
  }}}
     
  You could also use the bind() helper method provided by SC.Object. (This is 
  the same method used by SC.Object.init() to setup your bindings):
  
  {{{
    MyApp.anotherObject.bind("value", "MyApp.someController.value") ;
  }}}

  Both of these code fragments have the same effect as doing the most friendly
  form of binding creation like so:
  
  {{{
    MyApp.anotherObject = SC.Object.create({
      valueBinding: "MyApp.someController.value",
      
      // OTHER CODE FOR THIS OBJECT...
      
    }) ;
  }}}
  
  SproutCore's built in binding creation method make it easy to automatically
  create bindings for you.  You should always use the highest-level APIs 
  available, even if you understand how to it works underneath.
  
  @since SproutCore 1.0
*/
SC.Binding = {
  
  /**
    This is the core method you use to create a new binding instance.  The
    binding instance will have the receiver instance as its parent which means
    any configuration you have there will be inherited.  
    
    The returned instance will also have its parentBinding property set to the 
    receiver.

    @param fromPath {String} optional from path.
    @returns {SC.Binding} new binding instance
  */
  beget: function(fromPath) {
    var ret = SC.beget(this) ;
    ret.parentBinding = this;
    if (fromPath !== undefined) ret = ret.from(fromPath) ;
    return ret ;
  },
  
  /**
    Returns a builder function for compatibility.  
  */
  builder: function() {
    var binding = this,
        ret = function(fromProperty) { return binding.beget().from(fromProperty); };
    ret.beget = function() { return binding.beget(); } ;
    return ret ;
  },
  
  /**
    This will set "from" property path to the specified value.  It will not
    attempt to resolve this property path to an actual object/property tuple
    until you connect the binding.

    The binding will search for the property path starting at the root level 
    unless you specify an alternate root object as the second paramter to this 
    method.  Alternatively, you can begin your property path with either "." or
    "*", which will use the root object of the to side be default.  This special
    behavior is used to support the high-level API provided by SC.Object.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  from: function(propertyPath, root) {
    
    // if the propertyPath is null/undefined, return this.  This allows the
    // method to be called from other methods when the fromPath might be 
    // optional. (cf single(), multiple())
    if (!propertyPath) return this ;
    
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._fromPropertyPath = propertyPath ;
    binding._fromRoot = root ;
    binding._fromTuple = null ;
    return binding ;
  },
  
  /**
   This will set the "to" property path to the specified value.  It will not 
   attempt to reoslve this property path to an actual object/property tuple
   until you connect the binding.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  to: function(propertyPath, root) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._toPropertyPath = propertyPath ;
    binding._toRoot = root ;
    binding._toTuple = null ; // clear out any existing one.
    return binding ;
  },

  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes.  This method will raise an exception if you have not set the 
    from/to properties yet.
    
    @returns {SC.Binding} this
  */
  connect: function() {
    // If the binding is already connected, do nothing.
    if (this.isConnected) return this ;
    this.isConnected = YES ;
    this._connectionPending = YES ; // its connected but not really...    
    this._syncOnConnect = YES ;
    SC.Binding._connectQueue.add(this) ;
    return this; 
  },
  
  /** @private
    Actually connects the binding.  This is done at the end of the runloop
    to give you time to setup your entire object graph before the bindings 
    try to activate.
  */
  _connect: function() {
    if (!this._connectionPending) return; //nothing to do
    this._connectionPending = NO ;

    var path, root,
        bench = SC.BENCHMARK_BINDING_SETUP;

    if (bench) SC.Benchmark.start("SC.Binding.connect()");
    
    // try to connect the from side.
    // as a special behavior, if the from property path begins with either a 
    // . or * and the fromRoot is null, use the toRoot instead.  This allows 
    // for support for the SC.Object shorthand:
    //
    // contentBinding: "*owner.value"
    //
    path = this._fromPropertyPath; root = this._fromRoot ;
    if (SC.typeOf(path) === SC.T_STRING) {
      
      // if the first character is a '.', this is a static path.  make the 
      // toRoot the default root.
      if (path.indexOf('.') === 0) {
        path = path.slice(1);
        if (!root) root = this._toRoot ;
        
      // if the first character is a '*', then setup a tuple since this is a 
      // chained path.
      } else if (path.indexOf('*') === 0) {
        path = [this._fromRoot || this._toRoot, path.slice(1)] ;
        root = null ;
      }
    }
    SC.Observers.addObserver(path, this, this.fromPropertyDidChange, root) ;
    
    // try to connect the to side
    if (!this._oneWay) {
      path = this._toPropertyPath; root = this._toRoot ;
      SC.Observers.addObserver(path, this, this.toPropertyDidChange, root) ;  
    }

    if (bench) SC.Benchmark.end("SC.Binding.connect()");

    // now try to sync if needed
    if (this._syncOnConnect) {
      this._syncOnConnect = NO ;
      if (bench) SC.Benchmark.start("SC.Binding.connect().sync");
      this.sync();
      if (bench) SC.Benchmark.end("SC.Binding.connect().sync");
    }
  },
  
  /**
    Disconnects the binding instance.  Changes will no longer be relayed.  You
    will not usually need to call this method.
    
    @returns {SC.Binding} this
  */
  disconnect: function() {
    if (!this.isConnected) return this; // nothing to do.
    
    // if connection is still pending, just cancel
    if (this._connectionPending) {
      this._connectionPending = NO ;
      
    // connection is completed, disconnect.
    } else {
      SC.Observers.removeObserver(this._fromPropertyPath, this, this.fromPropertyDidChange, (this._fromRoot || this._toRoot)) ;
      if (!this._oneWay) {
        SC.Observers.removeObserver(this._toPropertyPath, this, this.toPropertyDidChange, this._toRoot) ;
      }
    }
    
    this.isConnected = NO ;
    return this ;  
  },

  /**
    Invoked whenever the value of the "from" property changes.  This will mark
    the binding as dirty if the value has changed.
  */
  fromPropertyDidChange: function(target, key) {
    var v = target ? target.get(key) : null;

    //console.log("fromPropertyDidChange: %@ v = %@".fmt(this, v)) ;
    
    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._bindingValue || key === '[]') {

      this._setBindingValue(target, key) ;
      this._changePending = YES ;
      SC.Binding._changeQueue.add(this) ; // save for later.  
    }
  },

  /**
    Invoked whenever the value of the "to" property changes.  This will mark the
    binding as dirty only if:
    
    - the binding is not one way
    - the value does not match the stored transformedBindingValue
    
    if the value does not match the transformedBindingValue, then it will 
    become the new bindingValue. 
  */
  toPropertyDidChange: function(target, key) {
    if (this._oneWay) return; // nothing to do
    
    var v = target.get(key) ;
    
    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._transformedBindingValue) {
      this._setBindingValue(target, key) ;
      this._changePending = YES ;
      SC.Binding._changeQueue.add(this) ; // save for later.  
    }
  },
  
  /** @private
    Saves the source location for the binding value.  This will be used later
    to actually update the binding value.
  */
  _setBindingValue: function(source, key) {
    this._bindingSource = source;
    this._bindingKey    = key;
  },
  
  /** @private 
    Updates the binding value from the current binding source if needed.  This
    should be called just before using this._bindingValue.
  */
  _computeBindingValue: function() {
    var source = this._bindingSource,
        key    = this._bindingKey,
        v, idx;
    
    this._bindingValue = v = (source ? source.getPath(key) : null);
    
    // apply any transforms to get the to property value also
    var transforms = this._transforms;
    if (transforms) {
      var len = transforms.length,
          transform;
      for(idx=0;idx<len;idx++) {
        transform = transforms[idx] ;
        v = transform(v, this) ;
      }
    }

    // if error objects are not allowed, and the value is an error, then
    // change it to null.
    if (this._noError && SC.typeOf(v) === SC.T_ERROR) v = null ;
    
    this._transformedBindingValue = v;
  },
  
  _connectQueue: SC.CoreSet.create(),
  _alternateConnectQueue: SC.CoreSet.create(),
  _changeQueue: SC.CoreSet.create(),
  _alternateChangeQueue: SC.CoreSet.create(),
  _changePending: NO,

  /**
    Call this method on SC.Binding to flush all bindings with changed pending.
    
    @returns {Boolean} YES if changes were flushed.
  */
  flushPendingChanges: function() {
    
    // don't allow flushing more than one at a time
    if (this._isFlushing) return NO; 
    this._isFlushing = YES ;
    SC.Observers.suspendPropertyObserving();

    var didFlush = NO,
        log = SC.LOG_BINDINGS,
        // connect any bindings
        queue, binding ;
    while((queue = this._connectQueue).length >0) {
      this._connectQueue = this._alternateConnectQueue ;
      this._alternateConnectQueue = queue ;
      while(binding = queue.pop()) binding._connect() ;
    }
    
    // loop through the changed queue...
    while ((queue = this._changeQueue).length > 0) {
      if (log) console.log("Begin: Trigger changed bindings") ;
      
      didFlush = YES ;
      
      // first, swap the change queues.  This way any binding changes that
      // happen while we flush the current queue can be queued up.
      this._changeQueue = this._alternateChangeQueue ;
      this._alternateChangeQueue = queue ;
      
      // next, apply any bindings in the current queue.  This may cause 
      // additional bindings to trigger, which will end up in the new active 
      // queue.
      while(binding = queue.pop()) binding.applyBindingValue() ;
      
      // now loop back and see if there are additional changes pending in the
      // active queue.  Repeat this until all bindings that need to trigger 
      // have triggered.
      if (log) console.log("End: Trigger changed bindings") ;
    }
    
    // clean up
    this._isFlushing = NO ;
    SC.Observers.resumePropertyObserving();

    return didFlush ;
  },
  
  /**
    This method is called at the end of the Run Loop to relay the changed 
    binding value from one side to the other.
  */
  applyBindingValue: function() {
    this._changePending = NO ;

    // compute the binding targets if needed.
    this._computeBindingTargets() ;
    this._computeBindingValue();
    
    var v = this._bindingValue,
        tv = this._transformedBindingValue,
        bench = SC.BENCHMARK_BINDING_NOTIFICATIONS,
        log = SC.LOG_BINDINGS ; 
    
    // the from property value will always be the binding value, update if 
    // needed.
    if (!this._oneWay && this._fromTarget) {
      if (log) console.log("%@: %@ -> %@".fmt(this, v, tv)) ;
      if (bench) SC.Benchmark.start(this.toString() + "->") ;
      this._fromTarget.setPathIfChanged(this._fromPropertyKey, v) ;
      if (bench) SC.Benchmark.end(this.toString() + "->") ;
    }
    
    // update the to value with the transformed value if needed.
    if (this._toTarget) {
      if (log) console.log("%@: %@ <- %@".fmt(this, v, tv)) ;
      if (bench) SC.Benchmark.start(this.toString() + "<-") ;
      this._toTarget.setPathIfChanged(this._toPropertyKey, tv) ;
      if (bench) SC.Benchmark.start(this.toString() + "<-") ;
    }
  },

  /**
    Calling this method on a binding will cause it to check the value of the 
    from side of the binding matches the current expected value of the 
    binding. If not, it will relay the change as if the from side's value has 
    just changed.
    
    This method is useful when you are dynamically connecting bindings to a 
    network of objects that may have already been initialized.
  */
  sync: function() {

    // do nothing if not connected
    if (!this.isConnected) return this;
    
    // connection is pending, just note that we should sync also
    if (this._connectionPending) {
      this._syncOnConnect = YES ;
      
    // we are connected, go ahead and sync
    } else {
      this._computeBindingTargets() ;
      var target = this._fromTarget,
          key = this._fromPropertyKey ;
      if (!target || !key) return this ; // nothing to do

      // get the new value
      var v = target.getPath(key) ;

      // if the new value is different from the current binding value, then 
      // schedule to register an update.
      if (v !== this._bindingValue || key === '[]') {
        this._setBindingValue(target, key) ;
        this._changePending = YES ;
        SC.Binding._changeQueue.add(this) ; // save for later.  
      }
    }
    
    return this ;
  },
  
  // set if you call sync() when the binding connection is still pending.
  _syncOnConnect: NO,
  
  _computeBindingTargets: function() {
    if (!this._fromTarget) {

      var path, root, tuple ;
      
      // if the fromPropertyPath begins with a . or * then we may use the 
      // toRoot as the root object.  Similar code exists in connect() so if 
      // you make a change to one be sure to update the other.
      path = this._fromPropertyPath; root = this._fromRoot ;
      if (SC.typeOf(path) === SC.T_STRING) {
        
        // static path beginning with the toRoot
        if (path.indexOf('.') === 0) {
          path = path.slice(1) ; // remove the .
          if (!root) root = this._toRoot; // use the toRoot optionally
          
        // chained path beginning with toRoot.  Setup a tuple
        } else if (path.indexOf('*') === 0) {
          path = [root || this._toRoot, path.slice(1)];
          root = null ;
        }
      }
      
      tuple = SC.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._fromTarget = tuple[0]; this._fromPropertyKey = tuple[1] ;
      }
    }

    if (!this._toTarget) {
      path = this._toPropertyPath; root = this._toRoot ;
      tuple = SC.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._toTarget = tuple[0]; this._toPropertyKey = tuple[1] ;
      }
    }
  },
  
  /**
    Configures the binding as one way.  A one-way binding will relay changes
    on the "from" side to the "to" side, but not the other way around.  This
    means that if you change the "to" side directly, the "from" side may have 
    a different value.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} Optionally pass NO to set the binding back to two-way
    @returns {SC.Binding} this
  */
  oneWay: function(fromPath, aFlag) {
    
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._oneWay = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds the specified transform function to the array of transform functions.
    
    The function you pass must have the following signature:
    
    {{{
      function(value) {} ;
    }}}
    
    It must return either the transformed value or an error object.  
        
    Transform functions are chained, so they are called in order.  If you are
    extending a binding and want to reset the transforms, you can call
    resetTransform() first.
    
    @param transformFunc {Function} the transform function.
    @returns {SC.Binding} this
  */
  transform: function(transformFunc) {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    var t = binding._transforms ;
    
    // clone the transform array if this comes from the parent
    if (t && (t === binding.parentBinding._transform)) {
      t = binding._transforms = t.slice() ;
    }
    
    // create the transform array if needed.
    if (!t) t = binding._transforms = [] ;
    
    // add the transform function
    t.push(transformFunc) ;
    return binding;
  },
  
  /**
    Resets the transforms for the binding.  After calling this method the 
    binding will no longer transform values.  You can then add new transforms
    as needed.
  
    @returns {SC.Binding} this
  */
  resetTransforms: function() {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._transforms = null ; return binding ;
  },
  
  /**
    Specifies that the binding should not return error objects.  If the value
    of a binding is an Error object, it will be transformed to a null value
    instead.
    
    Note that this is not a transform function since it will be called at the
    end of the transform chain.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} optionally pass NO to allow error objects again.
    @returns {SC.Binding} this
  */
  noError: function(fromPath, aFlag) {
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._noError = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds a transform to the chain that will allow only single values to pass.
    This will allow single values, nulls, and error values to pass through.  If
    you pass an array, it will be mapped as so:
    
    {{{
      [] => null
      [a] => a
      [a,b,c] => Multiple Placeholder
    }}}
    
    You can pass in an optional multiple placeholder or it will use the 
    default.
    
    Note that this transform will only happen on forwarded valued.  Reverse
    values are send unchanged.
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder value.
    @returns {SC.Binding} this
  */
  single: function(fromPath, placeholder) {
    if (placeholder === undefined) {
      placeholder = SC.MULTIPLE_PLACEHOLDER ;
    }
    return this.from(fromPath).transform(function(value, isForward) {
      if (value && value.isEnumerable) {
        var len = value.get('length');
        value = (len>1) ? placeholder : (len<=0) ? null : value.firstObject();
      }
      return value ;
    }) ;
  },
  
  /** 
    Adds a transform that will return the placeholder value if the value is 
    null, undefined, an empty array or an empty string.  See also notNull().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder.
    @returns {SC.Binding} this
  */
  notEmpty: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (SC.none(value) || (value === '') || (SC.isArray(value) && value.length === 0)) {
        value = placeholder ;
      }
      return value ;
    }) ;
  },
  
  /**
    Adds a transform that will return the placeholder value if the value is
    null.  Otherwise it will passthrough untouched.  See also notEmpty().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder;
    @returns {SC.Binding} this
  */
  notNull: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (SC.none(value)) value = placeholder ;
      return value ;
    }) ;
  },

  /** 
    Adds a transform that will convert the passed value to an array.  If 
    the value is null or undefined, it will be converted to an empty array.

    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  multiple: function(fromPath) {
    return this.from(fromPath).transform(function(value) {
      if (!SC.isArray(value)) value = (value == null) ? [] : [value] ;
      return value ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to a bool value.  If the value is
    an array it will return YES if array is not empty.  If the value is a string
    it will return YES if the string is not empty.
  
    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  bool: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = SC.typeOf(v) ;
      if (t === SC.T_ERROR) return v ;
      return (t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v ;
    }) ;
  },

  /**
    Adds a transform that forwards the logical 'AND' of values at 'pathA' and
    'pathB' whenever either source changes.  Note that the transform acts strictly
    as a one-way binding, working only in the direction
    
      'pathA' AND 'pathB' --> value  (value returned is the result of ('pathA' && 'pathB'))

    Usage example where a delete button's 'isEnabled' value is determined by whether
    something is selected in a list and whether the current user is allowed to delete:
    
      deleteButton: SC.ButtonView.design({
        isEnabledBinding: SC.Binding.logicalAnd('MyApp.itemsController.hasSelection', 'MyApp.userController.canDelete')
      })

  */
  and: function(pathA, pathB) {

    // create an object to do the logical computation
    var gate = SC.Object.create({
      valueABinding: pathA,
      valueBBinding: pathB,

      and: function() {
        return (this.get('valueA') && this.get('valueB'));
      }.property('valueA', 'valueB').cacheable()
    });

    // add a transform that depends on the result of that computation.
    return this.from('and', gate).oneWay();
  },

  /**
    Adds a transform that forwards the 'OR' of values at 'pathA' and
    'pathB' whenever either source changes.  Note that the transform acts strictly
    as a one-way binding, working only in the direction

      'pathA' AND 'pathB' --> value  (value returned is the result of ('pathA' || 'pathB'))

  */
  or: function(pathA, pathB) {
    
    // create an object to the logical computation
    var gate = SC.Object.create({
      valueABinding: pathA,
      valueBBinding: pathB,
      
      or: function() {
        return (this.get('valueA') || this.get('valueB'));
      }.property('valueA', 'valueB').cacheable()
    });
    
    return this.from('or', gate).oneWay();
  },
  
  /**
    Adds a transform to convert the value to the inverse of a bool value.  This
    uses the same transform as bool() but inverts it.
    
    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  not: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = SC.typeOf(v) ;
      if (t === SC.T_ERROR) return v ;
      return !((t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v) ;
    }) ;
  },
  
  /**
    Adds a transform that will return YES if the value is null, NO otherwise.
    
    @returns {SC.Binding} this
  */
  isNull: function(fromPath) {
    return this.from(fromPath).transform(function(v) { 
      var t = SC.typeOf(v) ;
      return (t === SC.T_ERROR) ? v : SC.none(v) ;
    });
  },
  
  toString: function() {
    var from = this._fromRoot ? "<%@>:%@".fmt(this._fromRoot,this._fromPropertyPath) : this._fromPropertyPath;

    var to = this._toRoot ? "<%@>:%@".fmt(this._toRoot,this._toPropertyPath) : this._toPropertyPath;
    
    var oneWay = this._oneWay ? '[oneWay]' : '';
    return "SC.Binding%@(%@ -> %@)%@".fmt(SC.guidFor(this), from, to, oneWay);
  }  
} ;

/** 
  Shorthand method to define a binding.  This is the same as calling:
  
  {{{
    SC.binding(path) = SC.Binding.from(path)
  }}}
*/
SC.binding = function(path, root) { return SC.Binding.from(path,root); } ;


/* >>>>>>>>>> BEGIN source/system/cookie.js */
// ==========================================================================
// SC.Cookie
// ==========================================================================

/** @class
  
  Allows for easier handling of the document.cookie object. To create a cookie,
  simply call SC.Cookie.create. To retrieve a cookie, use SC.Cookie.find.
  Cookies are not added to document.cookie, which SC.Cookie.find uses, until you
  have called SC.Cookie#write.
  
  Heavy inspiration from the
  {@link <a href="http://plugins.jquery.com/project/cookie">jQuery cookie plugin</a>}.
  
  @extends SC.Object
  @since Sproutcore 1.0
  @author Colin Campbell
*/

SC.Cookie = SC.Object.extend({
  
  // ..........................................................
  // PROPERTIES
  //   
  
  /**
    The name of the cookie
    
    @property {String}
  */
  name: null,
  
  /**
    The value of the cookie
    
    @property {String}
  */
  value: '',
  
  /**
    Amount of time until the cookie expires. Set to -1 in order to delete the cookie.
    
    @property {Integer|SC.DateTime|Date}
  */
  expires: null,
  
  /**
    The value of the path atribute of the cookie (default: path of page that created the cookie).
    
    @property {String}
  */
  path: null,
  
  /**
    The value of the domain attribute of the cookie (default: domain of page that created the cookie).
    
    @property {String}
  */
  domain: null,
  
  /**
    If true, the secure attribute of the cookie will be set and the cookie transmission will
    require a secure protocol (like HTTPS).
    
    @property {Boolean}
  */
  secure: NO,
  
  /**
    Walk like a duck
    
    @property {Boolean}
    @isReadOnly
  */
  isCookie: YES,
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Sets SC.Cookie#expires to -1, which destroys the cookie.
  */
  destroy: function() {
    this.set('expires', -1);
    this.write();
    
    arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Writes this SC.Cookie to document.cookie and adds it to SC.Cookie collection. To find this
    cookie later, or on reload, use SC.Cookie.find.
    
    @see SC.Cookie.find
  */
  write: function() {
    var name = this.get('name'),
        value = this.get('value'),
        expires = this.get('expires'),
        path = this.get('path'),
        domain = this.get('domain'),
        secure = this.get('secure');
    
    var expiresOutput = '';
    if (expires && (SC.typeOf(expires) === SC.T_NUMBER || (SC.DateTime && expires.get && expires.get('milliseconds')) || SC.typeOf(expires.toUTCString) === SC.T_FUNCTION)) {
      var date;
      if (SC.typeOf(expires) === SC.T_NUMBER) {
        date = new Date();
        date.setTime(date.getTime()+(expires*24*60*60*1000));
      }
      else if (SC.DateTime && expires.get && expires.get('milliseconds')) {
        date = new Date(expires.get('milliseconds'));
      }
      else if (SC.typeOf(expires.toUTCString) === SC.T_FUNCTION) {
        date = expires;
      }
      
      if (date) {
        expiresOutput = '; expires=' + date.toUTCString();
      }
    }
    
    var pathOutput = path ? '; path=' + path : '';
    var domainOutput = domain ? '; domain=' + domain : '';
    var secureOutput = secure ? '; secure' : '';
    
    document.cookie = [name, '=', encodeURIComponent(value), expiresOutput, pathOutput, domainOutput, secureOutput].join('');
    
    return this;
  }
  
});

SC.Cookie.mixin(
  /** @scope SC.Cookie */ {
  
  /**
    Finds a cookie that has been stored
    
    @param {String} name The name of the cookie
    @returns SC.Cookie object containing name and value of cookie
  */
  find: function(name) {
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = String(cookies[i]).trim();
        if (cookie.substring(0, name.length + 1) === (name + "=")) {
          return SC.Cookie.create({
            name: name,
            value: decodeURIComponent(cookie.substring(name.length + 1))
          });
        }
      }
    }
    return null;
  }
  
});
/* >>>>>>>>>> BEGIN source/system/error.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  An error, used to represent an error state.
  
  Many API's within SproutCore will return an instance of this object whenever
  they have an error occur.  An error includes an error code, description,
  and optional human readable label that indicates the item that failed. 
  
  Depending on the error, other properties may also be added to the object
  to help you recover from the failure.
  
  You can pass error objects to various UI elements to display the error in
  the interface. You can easily determine if the value returned by some API is 
  an error or not using the helper SC.ok(value).
  
  h2. Faking Error Objects
  
  You can actually make any object you want to be treated like an Error object
  by simply implementing two properties: isError and errorValue.  If you 
  set isError to YES, then calling SC.ok(obj) on your object will return NO.
  If isError is YES, then SC.val(obj) will return your errorValue property 
  instead of the receiver.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Error = SC.Object.extend(
/** @scope SC.Error.prototype */ {
  
  /**
    error code.  Used to designate the error type.
    
    @property {Number}
  */
  code: -1,
  
  /**
    Human readable description of the error.  This can also be a non-localized
    key.
    
    @property {String}
  */
  message: '',
  
  /**
    The value the error represents.  This is used when wrapping a value inside
    of an error to represent the validation failure.
    
    @property {Object}
  */
  errorValue: null,
  
  /**
    The original error object.  Normally this will return the receiver.  
    However, sometimes another object will masquarade as an error; this gives
    you a way to get at the underyling error.
    
    @property {SC.Error}
  */
  errorObject: function() {
    return this;
  }.property().cacheable(),
  
  /**
    Human readable name of the item with the error.
    
    @property {String}
  */
  label: null,

  /** @private */
  toString: function() {
    return "SC.Error:%@:%@ (%@)".fmt(SC.guidFor(this), this.get('message'), this.get('code'));
  },
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isError: YES
}) ;

/**
  Creates a new SC.Error instance with the passed description, label, and
  code.  All parameters are optional.
  
  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.Error.desc = function(description, label, value, code) {
  var opts = { message: description } ;
  if (label !== undefined) opts.label = label ;
  if (code !== undefined) opts.code = code ;
  if (value !== undefined) opts.errorValue = value ;
  return this.create(opts) ;
} ;

/**
  Shorthand form of the SC.Error.desc method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.$error = function(description, label, value, c) { 
  return SC.Error.desc(description,label, value, c); 
} ;

/**
  Returns YES if the passed value is an error object or false.
  
  @param {Object} ret object value
  @returns {Boolean}
*/
SC.ok = function(ret) {
  return (ret !== false) && !(ret && ret.isError);
};

/** @private */
SC.$ok = SC.ok;

/**
  Returns the value of an object.  If the passed object is an error, returns
  the value associated with the error; otherwise returns the receiver itself.
  
  @param {Object} obj the object
  @returns {Object} value 
*/
SC.val = function(obj) {
  if (obj && obj.isError) {
    return obj.get ? obj.get('errorValue') : null ; // Error has no value
  } else return obj ;
};

/** @private */
SC.$val = SC.val;

// STANDARD ERROR OBJECTS

/**
  Standard error code for errors that do not support multiple values.
  
  @property {Number}
*/
SC.Error.HAS_MULTIPLE_VALUES = -100 ;

/* >>>>>>>>>> BEGIN source/system/index_set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/observable') ;
sc_require('mixins/freezable');
sc_require('mixins/copyable');

/**
  @class 

  A collection of ranges.  You can use an IndexSet to keep track of non-
  continuous ranges of items in a parent array.  IndexSet's are used for 
  selection, for managing invalidation ranges and other data-propogation.

  h2. Examples
  
  {{{
    var set = SC.IndexSet.create(ranges) ;
    set.contains(index);
    set.add(index, length);
    set.remove(index, length);
    
    // uses a backing SC.Array object to return each index
    set.forEach(function(object) { .. })
    
    // returns the index
    set.forEachIndex(function(index) { ... });
    
    // returns ranges
    set.forEachRange(function(start, length) { .. });
  }}}

  h2. Implementation Notes

  An IndexSet stores indices on the object.  A positive value great than the
  index tells you the end of an occupied range.  A negative values tells you
  the end of an empty range.  A value less than the index is a search 
  accelerator.  It tells you the start of the nearest range.

  @extends SC.Enumerable 
  @extends SC.Observable
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/
SC.IndexSet = SC.mixin({}, 
  SC.Enumerable, SC.Observable, SC.Freezable, SC.Copyable,
/** @scope SC.IndexSet.prototype */ {

  /** @private
    Walks a content array and copies its contents to a new array.  For large
    content arrays this is faster than using slice()
  */
  _sc_sliceContent: function(c) {
    if (c.length < 1000) return c.slice(); // use native when faster
    var cur = 0, ret = [], next = c[0];
    while(next !== 0) {
      ret[cur] = next ;
      cur = (next<0) ? (0-next) : next ;
      next = c[cur];
    }
    ret[cur] = 0;
    this._hint(0, cur, ret); // hints are not copied manually - add them
    return ret ;
  },
  
  /**
    To create a set, pass either a start and index or another IndexSet.
    
    @returns {SC.IndexSet}
  */
  create: function(start, length) { 
    var ret = SC.beget(this);
    ret.initObservable();
    ret.registerDependentKey('min', '[]');
    
    // optimized method to clone an index set.
    if (start && start.isIndexSet) {
      ret._content = this._sc_sliceContent(start._content);
      ret.max = start.max;
      ret.length = start.length; 
      ret.source = start.source ;
      
    // otherwise just do a regular add
    } else {
      ret._content = [0];
      if (start !== undefined) ret.add(start, length);
    }
    return ret ;
  },

  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isIndexSet: YES,

  /**  @private 
    Internal setting determines the preferred skip size for hinting sets.
    
    @property {Number}
  */
  HINT_SIZE: 256,
  
  /**
    Total number of indexes contained in the set

    @property {Number}
  */
  length: 0,
  
  /**
    One greater than the largest index currently stored in the set.  This 
    is sometimes useful when determining the total range of items covering
    the index set.
    
    @property {Number}
  */
  max: 0,
  
  /**
    The first index included in the set or -1.
    
    @property {Number}
  */
  min: function() {  
    var content = this._content, 
        cur = content[0];
    return (cur === 0) ? -1 : (cur>0) ? 0 : Math.abs(cur);
    
  }.property('[]').cacheable(),
  
  /**
    Returns the first index in the set .
    
    @property {Number}
  */
  firstObject: function() {
    return (this.get('length')>0) ? this.get('min') : undefined;  
  }.property(),
  
  /** 
    Returns the starting index of the nearest range for the specified 
    index.
    
    @param {Number} index
    @returns {Number} starting index
  */
  rangeStartForIndex: function(index) {    
    var content = this._content,
        max     = this.get('max'),
        ret, next, accel;
    
    // fast cases
    if (index >= max) return max ;
    if (Math.abs(content[index]) > index) return index ; // we hit a border
    
    // use accelerator to find nearest content range
    accel = index - (index % SC.IndexSet.HINT_SIZE);
    ret = content[accel];
    if (ret<0 || ret>index) ret = accel;
    next = Math.abs(content[ret]);

    // now step forward through ranges until we find one that includes the
    // index.
    while (next < index) {
      ret = next ;
      next = Math.abs(content[ret]);
    }
    return ret ;
  },
    
  /**
    Returns YES if the passed index set contains the exact same indexes as 
    the receiver.  If you pass any object other than an index set, returns NO.
    
    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    
    // optimize for some special cases
    if (obj === this) return YES ;
    if (!obj || !obj.isIndexSet || (obj.max !== this.max) || (obj.length !== this.length)) return NO;

    // ok, now we need to actually compare the ranges of the two.
    var lcontent = this._content,
        rcontent = obj._content,
        cur      = 0,
        next     = lcontent[cur];
    
    do {
      if (rcontent[cur] !== next) return NO ;
      cur = Math.abs(next) ;
      next = lcontent[cur];
    } while (cur !== 0);
    return YES ;
  },
  
  /**
    Returns the first index in the set before the passed index or null if 
    there are no previous indexes in the set.
    
    @param {Number} index index to check
    @returns {Number} index or -1
  */
  indexBefore: function(index) {
    
    if (index===0) return -1; // fast path
    index--; // start with previous index
    
    var content = this._content, 
        max     = this.get('max'),
        start   = this.rangeStartForIndex(index);
    if (!content) return null;

    // loop backwards until we find a range that is in the set.
    while((start===max) || (content[start]<0)) {
      if (start === 0) return -1 ; // nothing before; just quit
      index = start -1 ;
      start = this.rangeStartForIndex(index);
    }
    
    return index;
  },

  /**
    Returns the first index in the set after the passed index or null if 
    there are no additional indexes in the set.
    
    @param {Number} index index to check
    @returns {Number} index or -1
  */
  indexAfter: function(index) {
    var content = this._content,
        max     = this.get('max'),
        start, next ;
    if (!content || (index>=max)) return -1; // fast path
    index++; // start with next index
    

    // loop forwards until we find a range that is in the set.
    start = this.rangeStartForIndex(index);
    next  = content[start];
    while(next<0) {
      if (next === 0) return -1 ; //nothing after; just quit
      index = start = Math.abs(next);
      next  = content[start];
    }
    
    return index;
  },
  
  /**
    Returns YES if the index set contains the named index
    
    @param {Number} start index or range
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(start, length) {
    var content, cur, next, rstart, rnext;
    
    // normalize input
    if (length === undefined) { 
      if (start === null || start === undefined) return NO ;
      
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, check each receiver range
      } else if (start && start.isIndexSet) {
        if (start === this) return YES ; // optimization

        content = start._content ;
        cur = 0 ;
        next = content[cur];
        while (next !== 0) {
          if ((next>0) && !this.contains(cur, next-cur)) return NO ;
          cur = Math.abs(next);
          next = content[cur];
        }
        return YES ;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }
    
    rstart = this.rangeStartForIndex(start);
    rnext  = this._content[rstart];
    
    return (rnext>0) && (rstart <= start) && (rnext >= (start+length));
  },

  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.
    
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(start, length) {
    var content, cur, next, lim;
    
    // normalize input
    if (length === undefined) { 
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, check each receiver range
      } else if (start && start.isIndexSet) {
        if (start === this) return YES ; // optimization

        content = start._content ;
        cur = 0 ;
        next = content[cur];
        while (next !== 0) {
          if ((next>0) && this.intersects(cur, next-cur)) return YES ;
          cur = Math.abs(next);
          next = content[cur];
        }
        return NO ;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }
    
    cur     = this.rangeStartForIndex(start);
    content = this._content;
    next    = content[cur];
    lim     = start + length;
    while (cur < lim) {
      if (next === 0) return NO; // no match and at end!
      if ((next > 0) && (next > start)) return YES ; // found a match
      cur = Math.abs(next);
      next = content[cur];
    }
    return NO ; // no match
  },

  /**
    Returns a new IndexSet without the passed range or indexes.   This is a
    convenience over simply cloning and removing.  Does some optimizations.
    
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {SC.IndexSet} new index set
  */
  without: function(start, length) {
    if (start === this) return SC.IndexSet.create(); // just need empty set
    return this.clone().remove(start, length);
  },
  
  /**
    Replace the index set's current content with the passed index set.  This
    is faster than clearing the index set adding the values again.
    
    @param {Number} start index, Range, or another IndexSet
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  replace: function(start, length) {
    
    if (length === undefined) {
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      } else if (start && start.isIndexSet) {
        this._content = this._sc_sliceContent(start._content);
        this.beginPropertyChanges()
          .set('max', start.max)
          .set('length', start.length)
          .set('source', start.source)
          .enumerableContentDidChange()
        .endPropertyChanges();
        return this ;
        
      } else {
        length = start.length;
        start  = start.start;
      }
    }
    
    var oldlen = this.length;
    this._content.length=1;
    this._content[0] = 0;
    this.length = this.max = 0 ; // reset without notifying since add()
    return this.add(start, length);
  },
  
  /**
    Adds the specified range of indexes to the set.  You can also pass another
    IndexSet to union the contents of the index set with the receiver.
    
    @param {Number} start index, Range, or another IndexSet
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  add: function(start, length) {
    
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    var content, cur, next;

    // normalize IndexSet input
    if (start && start.isIndexSet) {
      
      content = start._content;
      
      if (!content) return this; // nothing to do

      cur = 0 ;
      next = content[0];
      while(next !== 0) {
        if (next>0) this.add(cur, next-cur);
        cur = next<0 ? 0-next : next;
        next = content[cur];
      }
      return this ;
      
    } else if (length === undefined) { 
      
      if (start === null || start === undefined) {
        return this; // nothing to do
      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      } else {
        length = start.length; 
        start = start.start;
      }
    } else if (length === null) length = 1 ;

    // if no length - do nothing.
    if (length <= 0) return this;
    
    // special case - appending to end of set
    var max     = this.get('max'),
        oldmax  = max,
        delta, value ;

    content = this._content ;
    
    if (start === max) {

      // if adding to the end and the end is in set, merge.
      if (start > 0) {
        cur = this.rangeStartForIndex(start-1);
        next = content[cur];
        
        // just extend range at end
        if (next > 0) { 
          delete content[max]; // no 0
          content[cur] = max = start + length ;
          start = cur ;
          
        // previous range was not in set, just tack onto the end
        } else {
          content[max] = max = start + length;
        }
      } else {
        content[start] = max = length;
      }
      
      content[max] = 0 ;
      this.set('max', max);
      this.set('length', this.length + length) ;
      length = max - start ;
      
    } else if (start > max) {
      content[max] = 0-start; // empty!
      content[start] = start+length ;
      content[start+length] = 0; // set end
      this.set('max', start + length) ;
      this.set('length', this.length + length) ;
      
      // affected range goes from starting range to end of content.
      length = start + length - max ;
      start = max ;
      
    // otherwise, merge into existing range
    } else {

      // find nearest starting range.  split or join that range
      cur   = this.rangeStartForIndex(start);
      next  = content[cur];
      max   = start + length ;
      delta = 0 ;

      // we are right on a boundary and we had a range or were the end, then
      // go back one more.
      if ((start>0) && (cur === start) && (next <= 0)) {
        cur = this.rangeStartForIndex(start-1);
        next = content[cur] ;
      }
      
      // previous range is not in set.  splice it here
      if (next < 0) { 
        content[cur] = 0-start ;
        
        // if previous range extends beyond this range, splice afterwards also
        if (Math.abs(next) > max) {
          content[start] = 0-max;
          content[max] = next ;
        } else content[start] = next;
        
      // previous range is in set.  merge the ranges
      } else {
        start = cur ;
        if (next > max) {
          // delta -= next - max ;
          max = next ;
        }
      }
      
      // at this point there should be clean starting point for the range.
      // just walk the ranges, adding up the length delta and then removing
      // the range until we find a range that passes last
      cur = start;
      while (cur < max) {
        // get next boundary.  splice if needed - if value is 0, we are at end
        // just skip to last
        value = content[cur];
        if (value === 0) {
          content[max] = 0;
          next = max ;
          delta += max - cur ;
        } else {
          next  = Math.abs(value);
          if (next > max) {
            content[max] = value ;
            next = max ;
          }

          // ok, cur range is entirely inside top range.  
          // add to delta if needed
          if (value < 0) delta += next - cur ;
        }

        delete content[cur] ; // and remove range
        cur = next;
      }
      
      // cur should always === last now.  if the following range is in set,
      // merge in also - don't adjust delta because these aren't new indexes
      if ((cur = content[max]) > 0) {
        delete content[max];     
        max = cur ;
      }

      // finally set my own range.
      content[start] = max ;
      if (max > oldmax) this.set('max', max) ;

      // adjust length
      this.set('length', this.get('length') + delta);
      
      // compute hint range
      length = max - start ;
    }
    
    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },

  /**
    Removes the specified range of indexes from the set
    
    @param {Number} start index, Range, or IndexSet
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  remove: function(start, length) {

    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    // normalize input
    if (length === undefined) { 
      if (start === null || start === undefined) {
        return this; // nothing to do

      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      
      // if passed an index set, just add each range in the index set.
      } else if (start.isIndexSet) {
        start.forEachRange(this.remove, this);
        return this;

      } else {
        length = start.length; 
        start = start.start;
      }
    }

    if (length <= 0) return this; // nothing to do
    
    // special case - appending to end of set
    var max     = this.get('max'),
        oldmax  = max,
        content = this._content,
        cur, next, delta, value, last ;

    // if we're past the end, do nothing.
    if (start >= max) return this;

    // find nearest starting range.  split or join that range
    cur   = this.rangeStartForIndex(start);
    next  = content[cur];
    last  = start + length ;
    delta = 0 ;

    // we are right on a boundary and we had a range or were the end, then
    // go back one more.
    if ((start>0) && (cur === start) && (next > 0)) {
      cur = this.rangeStartForIndex(start-1);
      next = content[cur] ;
    }
    
    // previous range is in set.  splice it here
    if (next > 0) { 
      content[cur] = start ;
      
      // if previous range extends beyond this range, splice afterwards also
      if (next > last) {
        content[start] = last;
        content[last] = next ;
      } else content[start] = next;
      
    // previous range is not in set.  merge the ranges
    } else {
      start = cur ;
      next  = Math.abs(next);
      if (next > last) {
        last = next ;
      }
    }
    
    // at this point there should be clean starting point for the range.
    // just walk the ranges, adding up the length delta and then removing
    // the range until we find a range that passes last
    cur = start;
    while (cur < last) {
      // get next boundary.  splice if needed - if value is 0, we are at end
      // just skip to last
      value = content[cur];
      if (value === 0) {
        content[last] = 0;
        next = last ;

      } else {
        next  = Math.abs(value);
        if (next > last) {
          content[last] = value ;
          next = last ;
        }

        // ok, cur range is entirely inside top range.  
        // add to delta if needed
        if (value > 0) delta += next - cur ;
      }

      delete content[cur] ; // and remove range
      cur = next;
    }
    
    // cur should always === last now.  if the following range is not in set,
    // merge in also - don't adjust delta because these aren't new indexes
    if ((cur = content[last]) < 0) {
      delete content[last];     
      last = Math.abs(cur) ;
    }

    // set my own range - if the next item is 0, then clear it.
    if (content[last] === 0) {
      delete content[last];
      content[start] = 0 ;
      this.set('max', start); //max has changed
      
    } else {
      content[start] = 0-last ;
    }

    // adjust length
    this.set('length', this.get('length') - delta);
    
    // compute hint range
    length = last - start ;
    
    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },
    
  /** @private 
    iterates through a named range, setting hints every HINT_SIZE indexes 
    pointing to the nearest range start.  The passed range must start on a
    range boundary.  It can end anywhere.
  */
  _hint: function(start, length, content) {
    if (content === undefined) content = this._content;
    
    var skip    = SC.IndexSet.HINT_SIZE,
        next    = Math.abs(content[start]), // start of next range
        loc     = start - (start % skip) + skip, // next hint loc
        lim     = start + length ; // stop
        
    while (loc < lim) {
      // make sure we are in current rnage
      while ((next !== 0) && (next <= loc)) {
        start = next ; 
        next  = Math.abs(content[start]) ;
      }
      
      // past end
      if (next === 0) {
        delete content[loc];

      // do not change if on actual boundary
      } else if (loc !== start) {
        content[loc] = start ;  // set hint
      }
      
      loc += skip;
    }
  },

  /**
    Clears the set 
  */
  clear: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
    var oldlen = this.length;
    this._content.length=1;
    this._content[0] = 0;
    this.set('length', 0).set('max', 0);
    if (oldlen > 0) this.enumerableContentDidChange();
  },
  
  /**
    Add all the ranges in the passed array.
  */
  addEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    this.beginPropertyChanges();
    var idx = objects.get('length') ;
    if (objects.isSCArray) {
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else if (objects.isEnumerable) {
      objects.forEach(function(idx) { this.add(idx); }, this);
    }
    this.endPropertyChanges();
    
    return this ;
  },  

  /**
    Removes all the ranges in the passed array.
  */
  removeEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    this.beginPropertyChanges();
    
    var idx = objects.get('length') ;
    if (objects.isSCArray) {
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else if (objects.isEnumerable) {
      objects.forEach(function(idx) { this.remove(idx); }, this); 
    }
    
    this.endPropertyChanges();
    
    return this ;
  },  

  /**
   Clones the set into a new set.  
  */
  clone: function() {
    return SC.IndexSet.create(this);    
  },
  
  /**
    Returns a string describing the internal range structure.  Useful for
    debugging.
    
    @returns {String}
  */
  inspect: function() {
    var content = this._content,
        len     = content.length,
        idx     = 0,
        ret     = [],
        item;
    
    for(idx=0;idx<len;idx++) {
      item = content[idx];
      if (item !== undefined) ret.push("%@:%@".fmt(idx,item));      
    }
    return "SC.IndexSet<%@>".fmt(ret.join(' , '));
  },
  
  /** 
    Invoke the callback, passing each occuppied range instead of each 
    index.  This can be a more efficient way to iterate in some cases.  The
    callback should have the signature:
    
    {{{
      callback(start, length, indexSet, source) { ... }
    }}}
    
    If you pass a target as a second option, the callback will be called in
    the target context.
    
    @param {Function} callback the iterator callback
    @param {Object} target the target
    @returns {SC.IndexSet} receiver
  */
  forEachRange: function(callback, target) {
    var content = this._content,
        cur     = 0,
        next    = content[cur],
        source  = this.source;

    if (target === undefined) target = null ;
    while (next !== 0) {
      if (next > 0) callback.call(target, cur, next - cur, this, source);
      cur  = Math.abs(next);
      next = content[cur];
    }
    
    return this ;
  },    
  
  /**
    Invokes the callback for each index within the passed start/length range.
    Otherwise works just like regular forEach().
    
    @param {Number} start starting index
    @param {Number} length length of range
    @param {Function} callback
    @param {Object} target
    @returns {SC.IndexSet} receiver
  */
  forEachIn: function(start, length, callback, target) {
    var content = this._content,
        cur     = 0,
        idx     = 0,
        lim     = start + length,
        source  = this.source,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      if (cur < start) cur = start ; // skip forward 
      while((cur < next) && (cur < lim)) { 
        callback.call(target, cur++, idx++, this, source); 
      }
      
      if (cur >= lim) {
        cur = next = 0 ;
      } else {
        cur  = Math.abs(next);
        next = content[cur];
      }
    }
    return this ;
  },

  /**
    Total number of indexes within the specified range.
    
    @param {Number|SC.IndexSet} start index, range object or IndexSet
    @param {Number} length optional range length
    @returns {Number} count of indexes
  */
  lengthIn: function(start, length) {

    var ret = 0 ;
    
    // normalize input
    if (length === undefined) { 
      if (start === null || start === undefined) {
        return 0; // nothing to do

      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, just add each range in the index set.
      } else if (start.isIndexSet) {
        start.forEachRange(function(start, length) { 
          ret += this.lengthIn(start, length);
        }, this);
        return ret;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }

    // fast path
    if (this.get('length') === 0) return 0;
    
    var content = this._content,
        cur     = 0,
        next    = content[cur],
        lim     = start + length ;

    while (cur<lim && next !== 0) {
      if (next>0) {
        ret += (next>lim) ? lim-cur : next-cur;
      }
      cur  = Math.abs(next);
      next = content[cur];
    }
    
    return ret ;
  },
  
  // ..........................................................
  // OBJECT API
  // 
  
  /**
    Optionally set the source property on an index set and then you can 
    iterate over the actual object values referenced by the index set.  See
    indexOf(), lastIndexOf(), forEachObject(), addObject() and removeObject().
  */
  source: null,
  
  /**
    Returns the first index in the set that matches the passed object.  You
    must have a source property on the set for this to work.
    
    @param {Object} object the object to check 
    @param {Number} startAt optional starting point
    @returns {Number} found index or -1 if not in set
  */
  indexOf: function(object, startAt) {
    var source  = this.source;
    if (!source) throw "%@.indexOf() requires source".fmt(this);
    
    var len     = source.get('length'),
        
        // start with the first index in the set
        content = this._content,
        cur     = content[0]<0 ? Math.abs(content[0]) : 0,
        idx ;
        
    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx<0) return -1 ; // not found in source
      if (this.contains(idx)) return idx; // found in source and in set.
      cur = idx+1;
    } 
    
    return -1; // not found
  },

  /**
    Returns the last index in the set that matches the passed object.  You
    must have a source property on the set for this to work.
    
    @param {Object} object the object to check 
    @param {Number} startAt optional starting point
    @returns {Number} found index or -1 if not in set
  */
  lastIndexOf: function(object, startAt) {
    var source  = this.source;
    if (!source) throw "%@.lastIndexOf() requires source".fmt(this);
    
    // start with the last index in the set
    var len     = source.get('length'),
        cur     = this.max-1,
        idx ;

    if (cur >= len) cur = len-1;
    while (cur>=0) {
      idx = source.lastIndexOf(object, cur);
      if (idx<0) return -1 ; // not found in source
      if (this.contains(idx)) return idx; // found in source and in set.
      cur = idx+1;
    } 
    
    return -1; // not found
  },
  
  /**
    Iterates through the objects at each index location in the set.  You must
    have a source property on the set for this to work.  The callback you pass
    will be invoked for each object in the set with the following signature:
    
    {{{
      function callback(object, index, source, indexSet) { ... }
    }}}
    
    If you pass a target, it will be used when the callback is called.
    
    @param {Function} callback function to invoke.  
    @param {Object} target optional content. otherwise uses window
    @returns {SC.IndexSet} receiver
  */ 
  forEachObject: function(callback, target) {
    var source  = this.source;
    if (!source) throw "%@.forEachObject() requires source".fmt(this);

    var content = this._content,
        cur     = 0,
        idx     = 0,
        next    = content[cur];
        
    if (target === undefined) target = null ;
    while (next !== 0) {
      
      while(cur < next) { 
        callback.call(target, source.objectAt(cur), cur, source, this); 
        cur++;
      }
      
      cur  = Math.abs(next);
      next = content[cur];
    }
    return this ;
  },
  
  /**
    Adds all indexes where the object appears to the set.  If firstOnly is 
    passed, then it will find only the first index and add it.  If  you know
    the object only appears in the source array one time, firstOnly may make
    this method faster.
    
    Requires source to work.
    
    @param {Object} object the object to add
    @returns {SC.IndexSet} receiver
  */
  addObject: function(object, firstOnly) {
    var source  = this.source;
    if (!source) throw "%@.addObject() requires source".fmt(this);

    var len = source.get('length'),
        cur = 0, idx;
        
    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx >= 0) { 
        this.add(idx);
        if (firstOnly) return this ;
        cur = idx++;
      } else return this ;
    }
    return this ;    
  },

  /**
    Adds any indexes matching the passed objects.  If firstOnly is passed, 
    then only finds the first index for each object.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.IndexSet} receiver
  */
  addObjects: function(objects, firstOnly) {
    objects.forEach(function(object) {
      this.addObject(object, firstOnly);
    }, this);
    return this;
  },
  
  /**
    Removes all indexes where the object appears to the set.  If firstOnly is 
    passed, then it will find only the first index and add it.  If  you know
    the object only appears in the source array one time, firstOnly may make
    this method faster.
    
    Requires source to work.
    
    @param {Object} object the object to add
    @returns {SC.IndexSet} receiver
  */
  removeObject: function(object, firstOnly) {
    var source  = this.source;
    if (!source) throw "%@.removeObject() requires source".fmt(this);

    var len = source.get('length'),
        cur = 0, idx;
        
    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx >= 0) { 
        this.remove(idx);
        if (firstOnly) return this ;
        cur = idx+1;
      } else return this ;
    }
    return this ;    
  },

  /**
    Removes any indexes matching the passed objects.  If firstOnly is passed, 
    then only finds the first index for each object.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.IndexSet} receiver
  */
  removeObjects: function(objects, firstOnly) {
    objects.forEach(function(object) {
      this.removeObject(object, firstOnly);
    }, this);
    return this;
  },
  
  
  // .......................................
  // PRIVATE 
  //

  /** 
    Usually observing notifications from IndexSet are not useful, so 
    supress them by default.
    
    @property {Boolean}
  */
  LOG_OBSERVING: NO,
  
  /** @private - optimized call to forEach() */
  forEach: function(callback, target) {
    var content = this._content,
        cur     = 0,
        idx     = 0,
        source  = this.source,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      while(cur < next) { 
        callback.call(target, cur++, idx++, this, source); 
      }
      cur  = Math.abs(next);
      next = content[cur];
    }
    return this ;
  },
  
  /** @private - support iterators */
  nextObject: function(ignore, idx, context) {
    var content = this._content,
        next    = context.next,
        max     = this.get('max'); // next boundary
    
    // seed.
    if (idx === null) {
      idx = next = 0 ;

    } else if (idx >= max) {
      delete context.next; // cleanup context
      return null ; // nothing left to do

    } else idx++; // look on next index
    
    // look for next non-empty range if needed.
    if (idx === next) {
      do { 
        idx = Math.abs(next);
        next = content[idx];
      } while(next < 0);
      context.next = next;
    }
    
    return idx;
  },
  
  toString: function() {
    var str = [];
    this.forEachRange(function(start, length) {
      str.push(length === 1 ? start : "%@..%@".fmt(start, start + length - 1));
    }, this);
    return "SC.IndexSet<%@>".fmt(str.join(',')) ;
  },
  
  max: 0

}) ;

SC.IndexSet.slice = SC.IndexSet.copy = SC.IndexSet.clone ;
SC.IndexSet.EMPTY = SC.IndexSet.create().freeze();

/* >>>>>>>>>> BEGIN source/system/logger.js */
// ==========================================================================
// SC.Logger
// ==========================================================================


/**
  If {@link SC.Logger.format} is true, this delimiter will be put between arguments.

  @property {String}
*/
SC.LOGGER_LOG_DELIMITER = ", ";

/**
  If {@link SC.Logger.error} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_ERROR = "ERROR: ";

/**
  If {@link SC.Logger.info} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_INFO = "INFO: ";

/**
  If {@link SC.Logger.warn} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_WARN = "WARNING: ";

/**
  If {@link SC.Logger.debug} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_DEBUG = "DEBUG: ";

/** @class

  Object to allow for safe logging actions, such as using the browser console.

  The FireFox plugin Firebug was used as a function reference. Please see
  {@link <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>}
  for further information.

  @author Colin Campbell
  @author Benedikt Böhm
  @extends SC.Object
  @since Sproutcore 1.0
  @see <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>
*/
SC.Logger = SC.Object.create({

  // ..........................................................
  // PROPERTIES
  //

  /**
    Whether or not to enable debug logging.

    @property: {Boolean}
  */
  debugEnabled: NO,

  /**
    Computed property that checks for the existence of the reporter object.

    @property {Boolean}
  */
  exists: function() {
    return typeof(this.get('reporter')) !== 'undefined' && this.get('reporter') != null;
  }.property('reporter').cacheable(),

  /**
    If console.log does not exist, SC.Logger will use window.alert instead.

    This property is only used inside {@link SC.Logger.log}. If fallBackOnLog is
    false and you call a different function, an alert will not be opened.

    @property {Boolean}
  */
  fallBackOnAlert: NO,

  /**
    If some function, such as console.dir, does not exist,
    SC.Logger will try console.log if this is true.

    @property {Boolean}
  */
  fallBackOnLog: YES,

  /**
    Whether or not to format multiple arguments together
    or let the browser deal with that.

    @property {Boolean}
  */
  format: YES,

  /**
    The reporter is the object which implements the actual logging functions.

    @default The browser's console
    @property {Object}
  */
  reporter: console,

  // ..........................................................
  // METHODS
  //

  /**
    Log output to the console, but only if it exists.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if reporter.log exists, false otherwise
  */
  log: function() {
    var reporter = this.get('reporter');

    // log through the reporter
    if (this.get('exists') && typeof(reporter.log) === "function") {
      if (this.get('format')) {
        reporter.log(this._argumentsToString.apply(this, arguments));
      }
      else {
        reporter.log.apply(reporter, arguments);
      }
      return true;
    }

    // log through alert
    else if (this.fallBackOnAlert) {
      var s = this.get('format') ? this._argumentsToString.apply(this, arguments) : arguments;
      // include support for overriding the alert through the reporter
      // if it has come this far, it's likely this will fail
      if (this.get('exists') && typeof(reporter.alert) === "function") {
        reporter.alert(s);
      }
      else {
        alert(s);
      }
      return true;
    }
    return false;
  },

  /**
    Log a debug message to the console.

    Logs the response using {@link SC.Logger.log} if reporter.debug does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  debug: function() {
    var reporter = this.get('reporter');

    if (this.get('debugEnabled') !== YES) {
      return false;
    }

    if (this.get('exists') && (typeof reporter.debug === "function")) {
      reporter.debug.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_DEBUG);
      return this.log.apply(this, a);
    }
    return false;
  },

  /**
    Prints the properties of an object.

    Logs the object using {@link SC.Logger.log} if the reporter.dir function does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {Object}
    @returns {Boolean} true if logged to console, false if not
  */
  dir: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.dir) === "function") {
      // Firebug's console.dir doesn't support multiple objects here
      // but maybe custom reporters will
      reporter.dir.apply(reporter, arguments);
      return true;
    }
    return (this.fallBackOnLog) ? this.log.apply(this, arguments) : false;
  },

  /**
    Prints an XML outline for any HTML or XML object.

    Logs the object using {@link SC.Logger.log} if reporter.dirxml function does not exist and
    {@lnk SC.Logger.fallBackOnLog} is true.

    @param {Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  dirxml: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.dirxml) === "function") {
      // Firebug's console.dirxml doesn't support multiple objects here
      // but maybe custom reporters will
      reporter.dirxml.apply(reporter, arguments);
      return true;
    }
    return (this.fallBackOnLog) ? this.log.apply(this, arguments) : false;
  },

  /**
    Log an error to the console

    Logs the error using {@link SC.Logger.log} if reporter.error does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  error: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.error) === "function") {
      reporter.error.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_ERROR);
      return this.log.apply(this, a);
    }
    return false;
  },

  /**
    Every log after this call until {@link SC.Logger.groupEnd} is called
    will be indented for readability. You can create as many levels
    as you want.

    @param {String} [title] An optional title to display above the group
    @returns {Boolean} true if reporter.group exists, false otherwise
  */
  group: function(s) {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.group) === "function") {
      reporter.group(s);
      return true;
    }
    return false;
  },

  /**
    Ends a group declared with {@link SC.Logger.group}.

    @returns {Boolean} true if the reporter.groupEnd exists, false otherwise
    @see SC.Logger.group
  */
  groupEnd: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.groupEnd) === "function") {
      reporter.groupEnd();
      return true;
    }
    return false;
  },

  /**
    Log an information response to the reporter.

    Logs the response using {@link SC.Logger.log} if reporter.info does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  info: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.info) === "function") {
      reporter.info.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_INFO);
      return this.log.apply(this, a);
    }
    return false;
  },

  /**
    Begins the JavaScript profiler, if it exists. Call {@link SC.Logger.profileEnd}
    to end the profiling process and receive a report.

    @returns {Boolean} true if reporter.profile exists, false otherwise
  */
  profile: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.profile) === "function") {
      reporter.profile();
      return true;
    }
    return false;
  },

  /**
    Ends the JavaScript profiler, if it exists.

    @returns {Boolean} true if reporter.profileEnd exists, false otherwise
    @see SC.Logger.profile
  */
  profileEnd: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.profileEnd) === "function") {
      reporter.profileEnd();
      return true;
    }
    return false;
  },

  /**
    Measure the time between when this function is called and
    {@link SC.Logger.timeEnd} is called.

    @param {String} name The name of the profile to begin
    @returns {Boolean} true if reporter.time exists, false otherwise
    @see SC.Logger.timeEnd
  */
  time: function(name) {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.time) === "function") {
      reporter.time(name);
      return true;
    }
    return false;
  },

  /**
    Ends the profile specified.

    @param {String} name The name of the profile to end
    @returns {Boolean} true if reporter.timeEnd exists, false otherwise
    @see SC.Logger.time
  */
  timeEnd: function(name) {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.timeEnd) === "function") {
      reporter.timeEnd(name);
      return true;
    }
    return false;
  },

  /**
    Prints a stack-trace.

    @returns {Boolean} true if reporter.trace exists, false otherwise
  */
  trace: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.trace) === "function") {
      reporter.trace();
      return true;
    }
    return false;
  },

  /**
    Log a warning to the console.

    Logs the warning using {@link SC.Logger.log} if reporter.warning does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  warn: function() {
    var reporter = this.get('reporter');

    if (this.get('exists') && typeof(reporter.warn) === "function") {
      reporter.warn.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_WARN);
      return this.log.apply(this, a);
    }
    return false;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /**
    @private

    The arguments function property doesn't support Array#unshift. This helper
    copies the elements of arguments to a blank array.

    @param {Array} arguments The arguments property of a function
    @returns {Array} An array containing the elements of arguments parameter
  */
  _argumentsToArray: function(arguments) {
    if (!arguments) return [];
    var a = [];
    for (var i = 0; i < arguments.length; i++) {
      a[i] = arguments[i];
    }
    return a;
  },

  /**
    @private

    Formats the arguments array of a function by creating a string
    with SC.LOGGER_LOG_DELIMITER between the elements.

    @returns {String} A string of formatted arguments
  */
  _argumentsToString: function() {
    var s = "";
    for (var i = 0; i<arguments.length - 1; i++) {
      s += arguments[i] + SC.LOGGER_LOG_DELIMITER;
    }
    s += arguments[arguments.length-1];
    return s;
  }

});

/* >>>>>>>>>> BEGIN source/system/run_loop.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('private/observer_set');

/**
  @class
  
  The run loop provides a universal system for coordinating events within
  your application.  The run loop processes timers as well as pending 
  observer notifications within your application.
  
  To use a RunLoop within your application, you should make sure your event
  handlers always begin and end with SC.RunLoop.begin() and SC.RunLoop.end()
  
  The RunLoop is important because bindings do not fire until the end of 
  your run loop is reached.  This improves the performance of your
  application.
  
  h2. Example
  
  This is how you could write your mouseup handler in jQuery:
  
  {{{
    $('#okButton').on('click', function() {
      SC.RunLoop.begin();
      
      // handle click event...
      
      SC.RunLoop.end(); // allows bindings to trigger...
    });
  }}}
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.RunLoop = SC.Object.extend(/** @scope SC.RunLoop.prototype */ {
  
  /**
    Call this method whenver you begin executing code.  
    
    This is typically invoked automatically for you from event handlers and 
    the timeout handler.  If you call setTimeout() or setInterval() yourself, 
    you may need to invoke this yourself.
    
    @returns {SC.RunLoop} receiver
  */
  beginRunLoop: function() {
    this._start = new Date().getTime() ; // can't use Date.now() in runtime
    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      console.log("-- SC.RunLoop.beginRunLoop at %@".fmt(this._start));
    } 
    return this ; 
  },
  
  /**
    Call this method whenever you are done executing code.
    
    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself
    you may need to invoke this yourself.
    
    @returns {SC.RunLoop} receiver
  */
  endRunLoop: function() {
    // at the end of a runloop, flush all the delayed actions we may have 
    // stored up.  Note that if any of these queues actually run, we will 
    // step through all of them again.  This way any changes get flushed
    // out completely.
    var didChange ;

    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      console.log("-- SC.RunLoop.endRunLoop ~ flushing application queues");
    } 
    
    do {
      didChange = this.flushApplicationQueues() ;
      if (!didChange) didChange = this._flushinvokeLastQueue() ; 
    } while(didChange) ;
    this._start = null ;

    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      console.log("-- SC.RunLoop.endRunLoop ~ End");
    } 
    
    return this ; 
  },
  
  /**
    Invokes the passed target/method pair once at the end of the runloop.
    You can call this method as many times as you like and the method will
    only be invoked once.  
    
    Usually you will not call this method directly but use invokeOnce() 
    defined on SC.Object.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Object} target
    @param {Function} method
    @returns {SC.RunLoop} receiver
  */
  invokeOnce: function(target, method) {
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    if (!this._invokeQueue) this._invokeQueue = SC.ObserverSet.create();
    this._invokeQueue.add(target, method);
    return this ;
  },
  
  /**
    Invokes the passed target/method pair at the very end of the run loop,
    once all other delayed invoke queues have been flushed.  Use this to 
    schedule cleanup methods at the end of the run loop once all other work
    (including rendering) has finished.

    If you call this with the same target/method pair multiple times it will
    only invoke the pair only once at the end of the runloop.
    
    Usually you will not call this method directly but use invokeLast() 
    defined on SC.Object.
    
    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.
    
    @param {Object} target
    @param {Function} method
    @returns {SC.RunLoop} receiver
  */
  invokeLast: function(target, method) {
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    if (!this._invokeLastQueue) this._invokeLastQueue = SC.ObserverSet.create();
    this._invokeLastQueue.add(target, method);
    return this ;
  },
  
  /**
    Executes any pending events at the end of the run loop.  This method is 
    called automatically at the end of a run loop to flush any pending 
    queue changes.
    
    The default method will invoke any one time methods and then sync any 
    bindings that might have changed.  You can override this method in a 
    subclass if you like to handle additional cleanup. 
    
    This method must return YES if it found any items pending in its queues
    to take action on.  endRunLoop will invoke this method repeatedly until
    the method returns NO.  This way if any if your final executing code
    causes additional queues to trigger, then can be flushed again.
    
    @returns {Boolean} YES if items were found in any queue, NO otherwise
  */
  flushApplicationQueues: function() {
    var hadContent = NO,
        // execute any methods in the invokeQueue.
        queue = this._invokeQueue;
    if (queue && queue.targets > 0) {
      this._invokeQueue = null; // reset so that a new queue will be created
      hadContent = YES ; // needs to execute again
      queue.invokeMethods();
    }
    
    // flush any pending changed bindings.  This could actually trigger a 
    // lot of code to execute.
    return SC.Binding.flushPendingChanges() || hadContent ;
  },
  
  _flushinvokeLastQueue: function() {
    var queue = this._invokeLastQueue, hadContent = NO ;
    if (queue && queue.targets > 0) {
      this._invokeLastQueue = null; // reset queue.
      hadContent = YES; // has targets!
      if (hadContent) queue.invokeMethods();
    }
    return hadContent ;
  }
  
});

/** 
  The current run loop.  This is created automatically the first time you
  call begin(). 
  
  @property {SC.RunLoop}
*/
SC.RunLoop.currentRunLoop = null;

/**
  The default RunLoop class.  If you choose to extend the RunLoop, you can
  set this property to make sure your class is used instead.
  
  @property {Class}
*/
SC.RunLoop.runLoopClass = SC.RunLoop;

/** 
  Begins a new run loop on the currentRunLoop.  If you are already in a 
  runloop, this method has no effect.
  
  @returns {SC.RunLoop} receiver
*/
SC.RunLoop.begin = function() {    
  var runLoop = this.currentRunLoop;
  if (!runLoop) runLoop = this.currentRunLoop = this.runLoopClass.create();
  runLoop.beginRunLoop();
  return this ;
};

/**
  Ends the run loop on the currentRunLoop.  This will deliver any final 
  pending notifications and schedule any additional necessary cleanup.
  
  @returns {SC.RunLoop} receiver
*/
SC.RunLoop.end = function() {
  var runLoop = this.currentRunLoop;
  if (!runLoop) {
    throw "SC.RunLoop.end() called outside of a runloop!";
  }
  runLoop.endRunLoop();
  return this ;
} ;

/**
  Helper method executes the passed function inside of a runloop.  Normally
  not needed but useful for testing.
  
  @param {Function} callback callback to execute
  @param {Object} target context for callback
  @returns {SC} receiver
*/
SC.run = function(callback, target) {
  SC.RunLoop.begin();
  callback.call(target);
  SC.RunLoop.end();
};



/* >>>>>>>>>> BEGIN source/system/selection_set.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/object');
sc_require('mixins/enumerable');
sc_require('mixins/copyable');
sc_require('mixins/freezable');

/** @class

  A SelectionSet contains a set of objects that represent the current 
  selection.  You can select objects by either adding them to the set directly
  or indirectly by selecting a range of indexes on a source object.
  
  @extends SC.Object
  @extends SC.Enumerable
  @extends SC.Freezable
  @extends SC.Copyable
  @since SproutCore 1.0
*/
SC.SelectionSet = SC.Object.extend(SC.Enumerable, SC.Freezable, SC.Copyable, 
  /** @scope SC.SelectionSet.prototype */ {
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isSelectionSet: YES,
  
  /**
    Total number of indexes in the selection set
    
    @property {Number}
  */
  length: function() {
    var ret     = 0,
        sets    = this._sets,
        objects = this._objects;
    if (objects) ret += objects.get('length');
    if (sets) sets.forEach(function(s) { ret += s.get('length'); });
    return ret ;
  }.property().cacheable(),

  // ..........................................................
  // INDEX-BASED SELECTION
  // 

  /**
    A set of all the source objects used in the selection set.  This 
    property changes automatically as you add or remove index sets.
    
    @property {SC.Array}
  */
  sources: function() {
    var ret  = [],
        sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set, source;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.get('length')>0 && set.source) ret.push(set.source);
    }
    return ret ;
  }.property().cacheable(),
  
  /**
    Returns the index set for the passed source object or null if no items are
    seleted in the source.
    
    @param {SC.Array} source the source object
    @returns {SC.IndexSet} index set or null
  */
  indexSetForSource: function(source) {
    if (!source || !source.isSCArray) return null; // nothing to do
    
    var cache   = this._indexSetCache,
        objects = this._objects,
        ret, idx;

    // try to find in cache
    if (!cache) cache = this._indexSetCache = {};
    ret = cache[SC.guidFor(source)];
    if (ret && ret._sourceRevision && (ret._sourceRevision !== source.propertyRevision)) {
      ret = null;
    }

    // not in cache.  generate from index sets and any saved objects
    if (!ret) {
      ret = this._indexSetForSource(source, NO);
      if (ret && ret.get('length')===0) ret = null;
    
      if (objects) {
        if (ret) ret = ret.copy();
        objects.forEach(function(o) {
          if ((idx = source.indexOf(o)) >= 0) {
            if (!ret) ret = SC.IndexSet.create();
            ret.add(idx);
          }
        }, this);
      }
      
      if (ret) {
        ret = cache[SC.guidFor(source)] = ret.frozenCopy();
        ret._sourceRevision = source.propertyRevision;
      }
    }
    
    return ret;
  },
    
  /** 
    @private
  
    Internal method gets the index set for the source, ignoring objects
    that have been added directly.
  */
  _indexSetForSource: function(source, canCreate) {
    if (canCreate === undefined) canCreate = YES;

    var guid  = SC.guidFor(source),
        index = this[guid],
        sets  = this._sets,
        len   = sets ? sets.length : 0,
        ret   = null;
                
    if (index >= len) index = null;
    if (SC.none(index)) {
      if (canCreate && !this.isFrozen) {
        this.propertyWillChange('sources');
        if (!sets) sets = this._sets = [];
        ret = sets[len] = SC.IndexSet.create();
        ret.source = source ;
        this[guid] = len;
        this.propertyDidChange('sources');
      }
      
    } else ret = sets ? sets[index] : null;
    return ret ;
  },
  
  /**
    Add the passed index, range of indexSet belonging to the passed source
    object to the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    You can also pass an SC.SelectionSet to this method and all the selected
    sets will be added from their instead.
    
    @param {SC.Array} source source object or object to add.
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  add: function(source, start, length) {
    
    if (this.isFrozen) throw SC.FROZEN_ERROR ;

    var sets, len, idx, set, oldlen, newlen, setlen, objects;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.add()";
      if (source.isIndexSet) return this.add(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.add(set.source, set);
        }
        if (objects) this.addObjects(objects);
        this.endPropertyChanges();
        return this ;
        
      }
    }

    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    setlen = set.get('length');
    newlen = oldlen - setlen;
        
    set.add(start, length);

    this._indexSetCache = null;

    newlen += set.get('length');
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  /**
    Removes the passed index, range of indexSet belonging to the passed source
    object from the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    @param {SC.Array} source source object. must not be null
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  remove: function(source, start, length) {
    
    if (this.isFrozen) throw SC.FROZEN_ERROR ;
    
    var sets, len, idx, set, oldlen, newlen, setlen, objects;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.remove()";
      if (source.isIndexSet) return this.remove(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;
            
        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.remove(set.source, set);
        }
        if (objects) this.removeObjects(objects);
        this.endPropertyChanges();
        return this ;
      }
    }
    
    // save starter info
    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    newlen = oldlen - set.get('length');

    // if we have objects selected, determine if they are in the index 
    // set and remove them as well.
    if (set && (objects = this._objects)) {
      
      // convert start/length to index set so the iterator below will work...
      if (length !== undefined) {
        start = SC.IndexSet.create(start, length);
        length = undefined;
      }
      
      objects.forEach(function(object) {
        idx = source.indexOf(object);
        if (start.contains(idx)) {
          objects.remove(object);
          newlen--;
        }
      }, this);
    }
    
    // remove indexes from source index set
    set.remove(start, length);
    setlen = set.get('length');
    newlen += setlen;

    // update caches; change enumerable...
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  
  /**
    Returns YES if the selection contains the named index, range of indexes.
    
    @param {Object} source source object for range
    @param {Number} start index, start of range, range object, or indexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(source, start, length) {
    if (start === undefined && length === undefined) {
      return this.containsObject(source);
    }
    
    var set = this.indexSetForSource(source);
    if (!set) return NO ;
    return set.contains(start, length);
  },

  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.
    
    @param {Object} source source object for range
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(source, start, length) {
    var set = this.indexSetForSource(source, NO);
    if (!set) return NO ;
    return set.intersects(start, length);
  },
  
  
  // ..........................................................
  // OBJECT-BASED API
  // 

  _TMP_ARY: [],
  
  /**
    Adds the object to the selection set.  Unlike adding an index set, the 
    selection will actually track the object independent of its location in 
    the array.
    
    @param {Object} object 
    @returns {SC.SelectionSet} receiver
  */
  addObject: function(object) {  
    var ary = this._TMP_ARY, ret;
    ary[0] = object;
    
    ret = this.addObjects(ary);
    ary.length = 0;
    
    return ret;
  },
  
  /**
    Adds objects in the passed enumerable to the selection set.  Unlike adding
    an index set, the seleciton will actually track the object independent of
    its location the array.
    
    @param {SC.Enumerable} objects
    @returns {SC.SelectionSet} receiver
  */
  addObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen;
    if (!cur) cur = this._objects = SC.CoreSet.create();
    oldlen = cur.get('length');

    cur.addEach(objects);
    newlen = cur.get('length');
    
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Removes the object from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may 
    still be in the selection set.
    
    @param {Object} object 
    @returns {SC.SelectionSet} receiver
  */
  removeObject: function(object) {  
    var ary = this._TMP_ARY, ret;
    ary[0] = object;
    
    ret = this.removeObjects(ary);
    ary.length = 0;
    
    return ret;
  },
  
  /**
    Removes the objects from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may 
    still be in the selection set.
    
    @param {Object} object 
    @returns {SC.SelectionSet} receiver
  */
  removeObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen, sets;
        
    if (!cur) return this;

    oldlen = cur.get('length');

    cur.removeEach(objects);
    newlen = cur.get('length');
    
    // also remove from index sets, if present
    if (sets = this._sets) {
      sets.forEach(function(set) {
        oldlen += set.get('length');
        set.removeObjects(objects);
        newlen += set.get('length');
      }, this);
    }
    
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Returns YES if the selection contains the passed object.  This will search
    selected ranges in all source objects.
    
    @param {Object} object the object to search for
    @returns {Boolean}
  */
  containsObject: function(object) {
    // fast path
    var objects = this._objects ;
    if (objects && objects.contains(object)) return YES ;
    
    var sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set;
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.indexOf(object)>=0) return YES;
    }
    
    return NO ;
  },
  
  
  // ..........................................................
  // GENERIC HELPER METHODS
  // 
  
  /**
    Constrains the selection set to only objects found in the passed source
    object.  This will remove any indexes selected in other sources, any 
    indexes beyond the length of the content, and any objects not found in the
    set.
    
    @param {Object} source the source to limit
    @returns {SC.SelectionSet} receiver
  */
  constrain: function(source) {
    var set, len, max, objects;
    
    this.beginPropertyChanges();
    
    // remove sources other than this one
    this.get('sources').forEach(function(cur) {
      if (cur === source) return; //skip
      var set = this._indexSetForSource(source, NO);
      if (set) this.remove(source, set);
    },this); 
    
    // remove indexes beyond end of source length
    set = this._indexSetForSource(source, NO);
    if (set && ((max=set.get('max'))>(len=source.get('length')))) {
      this.remove(source, len, max-len);
    }
    
    // remove objects not in source
    if (objects = this._objects) {
      objects.forEach(function(cur) {
        if (source.indexOf(cur)<0) this.removeObject(cur);
      },this);
    }
    
    this.endPropertyChanges();
    return this ;
  },
  
  /**
    Returns YES if the passed index set or selection set contains the exact 
    same source objects and indexes as  the receiver.  If you pass any object 
    other than an IndexSet or SelectionSet, returns NO.
    
    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    var left, right, idx, len, sources, source;
    
    // fast paths
    if (!obj || !obj.isSelectionSet) return NO ;
    if (obj === this) return YES;
    if ((this._sets === obj._sets) && (this._objects === obj._objects)) return YES;
    if (this.get('length') !== obj.get('length')) return NO;
    
    // check objects
    left = this._objects;
    right = obj._objects;
    if (left || right) {
      if ((left ? left.get('length'):0) !== (right ? right.get('length'):0)) {
        return NO;
      }
      if (left && !left.isEqual(right)) return NO ;
    }

    // now go through the sets
    sources = this.get('sources');
    len     = sources.get('length');
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      left = this._indexSetForSource(source, NO);
      right = this._indexSetForSource(source, NO);
      if (!!right !== !!left) return NO ;
      if (left && !left.isEqual(right)) return NO ;
    }
    
    return YES ;
  },

  /**
    Clears the set.  Removes all IndexSets from the object
    
    @returns {SC.SelectionSet}
  */
  clear: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (this._sets) this._sets.length = 0 ; // truncate
    if (this._objects) this._objects = null;
    
    this._indexSetCache = null;
    this.propertyDidChange('length');
    this.enumerableContentDidChange();
    this.notifyPropertyChange('sources');
    
    return this ;
  },
  
  /**
   Clones the set into a new set.  
   
   @returns {SC.SelectionSet}
  */
  copy: function() {
    var ret  = this.constructor.create(),
        sets = this._sets,
        len  = sets ? sets.length : 0 ,
        idx, set;
    
    if (sets && len>0) {
      sets = ret._sets = sets.slice();
      for(idx=0;idx<len;idx++) {
        if (!(set = sets[idx])) continue ;
        set = sets[idx] = set.copy();
        ret[SC.guidFor(set.source)] = idx;
      }
    }
    
    if (this._objects) ret._objects = this._objects.copy();
    return ret ;
  },
  
  /**
    @private 
    
    Freezing a SelectionSet also freezes its internal sets.
  */
  freeze: function() {
    if (this.isFrozen) return this ;
    var sets = this._sets,
        loc  = sets ? sets.length : 0,
        set ;
        
    while(--loc >= 0) {
      if (set = sets[loc]) set.freeze();
    }
    
    if (this._objects) this._objects.freeze();
    return arguments.callee.base.apply(this,arguments);
  },
  
  // ..........................................................
  // ITERATORS
  // 
  
  /** @private */
  toString: function() {
    var sets = this._sets || [];
    sets = sets.map(function(set) { 
      return set.toString().replace("SC.IndexSet", SC.guidFor(set.source)); 
    }, this);
    if (this._objects) sets.push(this._objects.toString());
    return "SC.SelectionSet:%@<%@>".fmt(SC.guidFor(this), sets.join(','));  
  },
  
  /** @private */
  firstObject: function() {
    var sets    = this._sets,
        objects = this._objects;
        
    // if we have sets, get the first one
    if (sets && sets.get('length')>0) {
      var set  = sets ? sets[0] : null,
          src  = set ? set.source : null,
          idx  = set ? set.firstObject() : -1;
      if (src && idx>=0) return src.objectAt(idx);
    }
    
    // otherwise if we have objects, get the first one
    return objects ? objects.firstObject() : undefined;
    
  }.property(),
  
  /** @private
    Implement primitive enumerable support.  Returns each object in the 
    selection.
  */
  nextObject: function(count, lastObject, context) { 
    var objects, ret;
    
    // TODO: Make this more efficient.  Right now it collects all objects
    // first.  
    
    if (count === 0) {
      objects = context.objects = [];
      this.forEach(function(o) { objects.push(o); }, this);
      context.max = objects.length;
    }

    objects = context.objects ;
    ret = objects[count];
    
    if (count+1 >= context.max) {
      context.objects = context.max = null;
    }
    
    return ret ;
  },
  
  /** 
    Iterates over the selection, invoking your callback with each __object__.
    This will actually find the object referenced by each index in the 
    selection, not just the index.

    The callback must have the following signature:
    
    {{{
      function callback(object, index, source, indexSet) { ... }
    }}}
    
    If you pass a target, it will be used when the callback is called.
    
    @param {Function} callback function to invoke.  
    @param {Object} target optional content. otherwise uses window
    @returns {SC.SelectionSet} receiver
  */
  forEach: function(callback, target) {
    var sets = this._sets,
        objects = this._objects,
        len = sets ? sets.length : 0,
        set, idx;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEachObject(callback, target);
    }
    
    if (objects) objects.forEach(callback, target);
    return this ;
  }  
  
});

/** @private */
SC.SelectionSet.prototype.clone = SC.SelectionSet.prototype.copy;

/** 
  Default frozen empty selection set
  
  @property {SC.SelectionSet}
*/
SC.SelectionSet.EMPTY = SC.SelectionSet.create().freeze();


/* >>>>>>>>>> BEGIN source/system/sparse_array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/array') ;
sc_require('mixins/observable') ;
sc_require('mixins/delegate_support') ;

/**
  @class

  A dynamically filled array.  A SparseArray makes it easy for you to create 
  very large arrays of data but then to defer actually populating that array
  until it is actually needed.  This is often much faster than generating an
  array up front and paying the cost to load your data then.
  
  Although technically all arrays in JavaScript are "sparse" (in the sense 
  that you can read and write properties are arbitrary indexes), this array
  keeps track of which elements in the array have been populated already 
  and which ones have not.  If you try to get a value at an index that has 
  not yet been populated, the SparseArray will notify a delegate object first
  giving the delegate a chance to populate the component.
  
  Most of the time, you will use a SparseArray to incrementally load data 
  from the server.  For example, if you have a contact list with 3,000
  contacts in it, you may create a SparseArray with a length of 3,000 and set
  that as the content for a ListView.  As the ListView tries to display the
  visible contacts, it will request them from the SparseArray, which will in
  turn notify your delegate, giving you a chance to load the contact data from
  the server.
  
  @extends SC.Enumerable
  @extends SC.Array
  @extends SC.Observable
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/

SC.SparseArray = SC.Object.extend(SC.Observable, SC.Enumerable, SC.Array, 
  SC.DelegateSupport, /** @scope SC.SparseArray.prototype */ {  

  // ..........................................................
  // LENGTH SUPPORT
  // 

  _requestingLength: 0,  
  _requestingIndex: 0,
   
  /**
    The length of the sparse array.  The delegate for the array should set 
    this length.
    
    @property {Number}
  */
  length: function() {
    var del = this.delegate ;
    if (del && SC.none(this._length) && del.sparseArrayDidRequestLength) {
      this._requestingLength++ ;
      del.sparseArrayDidRequestLength(this);
      this._requestingLength-- ;
    }
    return this._length || 0 ;
  }.property().cacheable(),

  /**
    Call this method from a delegate to provide a length for the sparse array.
    If you pass null for this property, it will essentially "reset" the array
    causing your delegate to be called again the next time another object 
    requests the array length.
  
    @param {Number} length the length or null
    @returns {SC.SparseArray} receiver
  */
  provideLength: function(length) {
    if (SC.none(length)) this._sa_content = null ;
    if (length !== this._length) {
      this._length = length ;
      if (this._requestingLength <= 0) this.enumerableContentDidChange() ;
    }
    return this ;
  },

  // ..........................................................
  // READING CONTENT 
  // 

  /** 
    The minimum range of elements that should be requested from the delegate.
    If this value is set to larger than 1, then the sparse array will always
    fit a requested index into a range of this size and request it.
    
    @property {Number}
  */
  rangeWindowSize: 1,
  
  /*
    This array contains all the start_indexes of ranges requested. This is to 
    avoid calling sparseArrayDidRequestRange to often. Indexes are removed and 
    added as range requests are completed.
  */
  requestedRangeIndex: [],
  
  /** 
    Returns the object at the specified index.  If the value for the index
    is currently undefined, invokes the didRequestIndex() method to notify
    the delegate.
    
    @param  {Number} idx the index to get
    @return {Object} the object
  */
  objectAt: function(idx) {
    var content = this._sa_content, ret ;
    if (!content) content = this._sa_content = [] ;
    if ((ret = content[idx]) === undefined) {
      this.requestIndex(idx);
      ret = content[idx]; // just in case the delegate provided immediately
    }
    return ret ;
  },

  /**
    Returns the set of indexes that are currently defined on the sparse array.
    If you pass an optional index set, the search will be limited to only 
    those indexes.  Otherwise this method will return an index set containing
    all of the defined indexes.  Currently this can be quite expensive if 
    you have a lot of indexes defined.
    
    @param {SC.IndexSet} indexes optional from indexes
    @returns {SC.IndexSet} defined indexes
  */
  definedIndexes: function(indexes) {
    var ret = SC.IndexSet.create(),
        content = this._sa_content,
        idx, len;
        
    if (!content) return ret.freeze(); // nothing to do
    
    if (indexes) {
      indexes.forEach(function(idx) { 
        if (content[idx] !== undefined) ret.add(idx);
      });
    } else {      
      len = content.length;
      for(idx=0;idx<len;idx++) {
        if (content[idx] !== undefined) ret.add(idx);
      }
    }
    
    return ret.freeze();
  },
  
  _TMP_RANGE: {},
  
  /**
    Called by objectAt() whenever you request an index that has not yet been
    loaded.  This will possibly expand the index into a range and then invoke
    an appropriate method on the delegate to request the data.
    
    It will check if the range has been already requested.
    
    @param {Number} idx the index to retrieve
    @returns {SC.SparseArray} receiver
  */
  requestIndex: function(idx) {
    var del = this.delegate;
    if (!del) return this; // nothing to do
    
    // adjust window
    var len = this.get('rangeWindowSize'), start = idx;
    if (len > 1) start = start - Math.floor(start % len);
    if (len < 1) len = 1 ;
    
    // invoke appropriate callback
    this._requestingIndex++;
    if (del.sparseArrayDidRequestRange) {
      var range = this._TMP_RANGE;
      if(this.wasRangeRequested(start)===-1){
        range.start = start;
        range.length = len;
        del.sparseArrayDidRequestRange(this, range);
        this.requestedRangeIndex.push(start);
      }
    } else if (del.sparseArrayDidRequestIndex) {
      while(--len >= 0) del.sparseArrayDidRequestIndex(this, start + len);
    }
    this._requestingIndex--;

    return this ;
  },
  
  /*
    This method is called by requestIndex to check if the range has already 
    been requested. We assume that rangeWindowSize is not changed often.
    
     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  wasRangeRequested: function(rangeStart) {
    var i, ilen;
    for(i=0, ilen=this.requestedRangeIndex.length; i<ilen; i++){
      if(this.requestedRangeIndex[i]===rangeStart) return i;
    }
    return -1;
  },
  
  /*
    This method has to be called after a request for a range has completed.
    To remove the index from the sparseArray to allow future updates on the 
    range.
    
     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  rangeRequestCompleted: function(start) { 
    var i = this.wasRangeRequested(start);
    if(i>=0) { 
      this.requestedRangeIndex.removeAt(i,1);
      return YES;
    }
    return NO;
  },
  
  /**
    This method sets the content for the specified to the objects in the 
    passed array.  If you change the way SparseArray implements its internal
    tracking of objects, you should override this method along with 
    objectAt().
    
    @param {Range} range the range to apply to
    @param {Array} array the array of objects to insert
    @returns {SC.SparseArray} reciever
  */
  provideObjectsInRange: function(range, array) {
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    var start = range.start, len = range.length;
    while(--len >= 0) content[start+len] = array[len];
    if (this._requestingIndex <= 0) this.enumerableContentDidChange() ;
    return this ;
  },

  _TMP_PROVIDE_ARRAY: [],
  _TMP_PROVIDE_RANGE: { length: 1 },
  
  /**
    Convenience method to provide a single object at a specified index.  Under
    the covers this calls provideObjectsInRange() so you can override only 
    that method and this one will still work.
    
    @param {Number} index the index to insert
    @param {Object} the object to insert
    @return {SC.SparseArray} receiver
  */
  provideObjectAtIndex: function(index, object) {
    var array = this._TMP_PROVIDE_ARRAY, range = this._TMP_PROVIDE_RANGE;
    array[0] = object;
    range.start = index;
    return this.provideObjectsInRange(range, array);
  },

  /**
    Invalidates the array content in the specified range.  This is not the 
    same as editing an array.  Rather it will cause the array to reload the
    content from the delegate again when it is requested.
    
    @param {Range} the range
    @returns {SC.SparseArray} receiver
  */
  objectsDidChangeInRange: function(range) {

    // delete cached content
    var content = this._sa_content ;
    if (content) {
      // if range covers entire length of cached content, just reset array
      if (range.start === 0 && SC.maxRange(range)>=content.length) {
        this._sa_content = null ;
        
      // otherwise, step through the changed parts and delete them.
      } else {
        var start = range.start, loc = Math.min(start + range.length, content.length);
        while (--loc>=start) content[loc] = undefined;
      }
    }    
    this.enumerableContentDidChange(range) ; // notify
    return this ;
  },
  
  /**
    Optimized version of indexOf().  Asks the delegate to provide the index 
    of the specified object.  If the delegate does not implement this method
    then it will search the internal array directly.
    
    @param {Object} obj the object to search for
    @returns {Number} the discovered index or -1 if not found
  */
  indexOf: function(obj) {
    var del = this.delegate ;
    if (del && del.sparseArrayDidRequestIndexOf) {
      return del.sparseArrayDidRequestIndexOf(this, obj);
    } else {
      var content = this._sa_content ;
      if (!content) content = this._sa_content = [] ;
      return content.indexOf(obj) ;
    }
  },  
  
  // ..........................................................
  // EDITING
  // 

  /**
    Array primitive edits the objects at the specified index unless the 
    delegate rejects the change.
    
    @param {Number} idx the index to begin to replace
    @param {Number} amt the number of items to replace
    @param {Array} objects the new objects to set instead
    @returns {SC.SparseArray} receiver
  */
  replace: function(idx, amt, objects) {
    objects = objects || [] ;

    // if we have a delegate, get permission to make the replacement.
    var del = this.delegate ;
    if (del) {
      if (!del.sparseArrayShouldReplace || 
          !del.sparseArrayShouldReplace(this, idx, amt, objects)) {
            return this;
      }
    }

    // go ahead and apply to local content.
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    content.replace(idx, amt, objects) ;
    
    // update length
    var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;
    var delta = len - amt ;
    if (!SC.none(this._length)) {
      this.propertyWillChange('length');
      this._length += delta;
      this.propertyDidChange('length');
    }

    this.enumerableContentDidChange(idx, amt, delta) ;
    return this ;
  },

  /** 
    Resets the SparseArray, causing it to reload its content from the 
    delegate again.
    
    @returns {SC.SparseArray} receiver
  */
  reset: function() {
    this._sa_content = null ;
    this._length = null ;
    this.enumerableContentDidChange() ;
    this.invokeDelegateMethod(this.delegate, 'sparseArrayDidReset', this);
    return this ;
  }
      
}) ;

/** 
  Convenience metohd returns a new sparse array with a default length already 
  provided.
  
  @param {Number} len the length of the array
  @returns {SC.SparseArray}
*/
SC.SparseArray.array = function(len) {
  return this.create({ _length: len||0 });
};

/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/runtime');

/* >>>>>>>>>> BEGIN javascript.js */
/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Place any global constants here

/* >>>>>>>>>> BEGIN source/data_sources/data_source.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class

  TODO: Describe
  
  @extend SC.Object
  @since SproutCore 1.0
*/
SC.DataSource = SC.Object.extend( /** @scope SC.DataSource.prototype */ {

  // ..........................................................
  // SC.STORE ENTRY POINTS
  // 
  

  /**
  
    Invoked by the store whenever it needs to retrieve data matching a 
    specific query, triggered by find().  This method is called anytime
    you invoke SC.Store#find() with a query or SC.RecordArray#refresh().  You 
    should override this method to actually retrieve data from the server 
    needed to fulfill the query.  If the query is a remote query, then you 
    will also need to provide the contents of the query as well.
    
    h3. Handling Local Queries
    
    Most queries you create in your application will be local queries.  Local
    queries are populated automatically from whatever data you have in memory.
    When your fetch() method is called on a local queries, all you need to do
    is load any records that might be matched by the query into memory. 
    
    The way you choose which queries to fetch is up to you, though usually it
    can be something fairly straightforward such as loading all records of a
    specified type.
    
    When you finish loading any data that might be required for your query, 
    you should always call SC.Store#dataSourceDidFetchQuery() to put the query 
    back into the READY state.  You should call this method even if you choose
    not to load any new data into the store in order to notify that the store
    that you think it is ready to return results for the query.
    
    h3. Handling Remote Queries
    
    Remote queries are special queries whose results will be populated by the
    server instead of from memory.  Usually you will only need to use this 
    type of query when loading large amounts of data from the server.
    
    Like Local queries, to fetch a remote query you will need to load any data
    you need to fetch from the server and add the records to the store.  Once
    you are finished loading this data, however, you must also call
    SC.Store#loadQueryResults() to actually set an array of storeKeys that
    represent the latest results from the server.  This will implicitly also
    call datasSourceDidFetchQuery() so you don't need to call this method 
    yourself.
    
    If you want to support incremental loading from the server for remote 
    queries, you can do so by passing a SC.SparseArray instance instead of 
    a regular array of storeKeys and then populate the sparse array on demand.
    
    h3. Handling Errors and Cancelations
    
    If you encounter an error while trying to fetch the results for a query 
    you can call SC.Store#dataSourceDidErrorQuery() instead.  This will put
    the query results into an error state.  
    
    If you had to cancel fetching a query before the results were returned, 
    you can instead call SC.Store#dataSourceDidCancelQuery().  This will set 
    the query back into the state it was in previously before it started 
    loading the query.
    
    h3. Return Values
    
    When you return from this method, be sure to return a Boolean.  YES means
    you handled the query, NO means you can't handle the query.  When using
    a cascading data source, returning NO will mean the next data source will
    be asked to fetch the same results as well.
    
    @param {SC.Store} store the requesting store
    @param {SC.Query} query query describing the request
    @returns {Boolean} YES if you can handle fetching the query, NO otherwise
  */
  fetch: function(store, query) {
    return NO ; // do not handle anything!
  },
  
  /**
    Called by the store whenever it needs to load a specific set of store 
    keys.  The default implementation will call retrieveRecord() for each
    storeKey.  
    
    You should implement either retrieveRecord() or retrieveRecords() to 
    actually fetch the records referenced by the storeKeys .
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys
    @param {Array} ids - optional
    @returns {Boolean} YES if handled, NO otherwise
  */
  retrieveRecords: function(store, storeKeys, ids) {
    return this._handleEach(store, storeKeys, this.retrieveRecord, ids);  
  },
  
  /**
    Invoked by the store whenever it has one or more records with pending 
    changes that need to be sent back to the server.  The store keys will be
    separated into three categories:
    
     - createStoreKeys: records that need to be created on server
     - updateStoreKeys: existing records that have been modified
     - destroyStoreKeys: records need to be destroyed on the server
     
    If you do not override this method yourself, this method will actually
    invoke createRecords(), updateRecords(), and destroyRecords() on the 
    dataSource, passing each array of storeKeys.  You can usually implement
    those methods instead of overriding this method.
    
    However, if your server API can sync multiple changes at once, you may
    prefer to override this method instead.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.Store} store the requesting store
    @param {Array} createStoreKeys keys to create
    @param {Array} updateStoreKeys keys to update
    @param {Array} destroyStoreKeys keys to destroy
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if data source can handle keys
  */
  commitRecords: function(store, createStoreKeys, updateStoreKeys, destroyStoreKeys, params) {
    var cret, uret, dret;
    if (createStoreKeys.length>0) {
      cret = this.createRecords.call(this, store, createStoreKeys, params);
    }
        
    if (updateStoreKeys.length>0) {
      uret = this.updateRecords.call(this, store, updateStoreKeys, params); 
    }
       
    if (destroyStoreKeys.length>0) {
      dret = this.destroyRecords.call(this, store, destroyStoreKeys, params);
    }
     
    return ((cret === uret) && (cret === dret)) ? cret : SC.MIXED_STATE;
  },
  
  /**
    Invoked by the store whenever it needs to cancel one or more records that
    are currently in-flight.  If any of the storeKeys match records you are
    currently acting upon, you should cancel the in-progress operation and 
    return YES.
    
    If you implement an in-memory data source that immediately services the
    other requests, then this method will never be called on your data source.
    
    To support cascading data stores, be sure to return NO if you cannot 
    retrieve any of the keys, YES if you can retrieve all of the, or
    SC.MIXED_STATE if you can retrieve some of the.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys array of storeKeys to retrieve
    @returns {Boolean} YES if data source can handle keys
  */
  cancel: function(store, storeKeys) {
    return NO;
  },
  
  // ..........................................................
  // BULK RECORD ACTIONS
  // 
  
  /**
    Called from commitRecords() to commit modified existing records to the 
    store.  You can override this method to actually send the updated 
    records to your store.  The default version will simply call 
    updateRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
    @param {Hash} params 
      to be passed down to data source. originated from the commitRecords() 
      call on the store

    @returns {Boolean} YES, NO, or SC.MIXED_STATE  

  */
  updateRecords: function(store, storeKeys, params) {
    return this._handleEach(store, storeKeys, this.updateRecord, null, params);
  },
  
  /**
    Called from commitRecords() to commit newly created records to the 
    store.  You can override this method to actually send the created 
    records to your store.  The default version will simply call 
    createRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
    
    @param {Hash} params 
      to be passed down to data source. originated from the commitRecords() 
      call on the store
    
    @returns {Boolean} YES, NO, or SC.MIXED_STATE  
  
  */
  createRecords: function(store, storeKeys, params) {
    return this._handleEach(store, storeKeys, this.createRecord, null, params);
  },

  /**
    Called from commitRecords() to commit destroted records to the 
    store.  You can override this method to actually send the destroyed 
    records to your store.  The default version will simply call 
    destroyRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store

    @returns {Boolean} YES, NO, or SC.MIXED_STATE  

  */
  destroyRecords: function(store, storeKeys, params) {
    return this._handleEach(store, storeKeys, this.destroyRecord, null, params);
  },

  /** @private
    invokes the named action for each store key.  returns proper value
  */
  _handleEach: function(store, storeKeys, action, ids, params) {
    var len = storeKeys.length, idx, ret, cur, lastArg;
    if(!ids) ids = [];
    
    for(idx=0;idx<len;idx++) {
      lastArg = ids[idx] ? ids[idx] : params;
      
      cur = action.call(this, store, storeKeys[idx], lastArg, params);
      if (ret === undefined) {
        ret = cur ;
      } else if (ret === YES) {
        ret = (cur === YES) ? YES : SC.MIXED_STATE ;
      } else if (ret === NO) {
        ret = (cur === NO) ? NO : SC.MIXED_STATE ;
      }
    }
    return ret ? ret : null ;
  },
  

  // ..........................................................
  // SINGLE RECORD ACTIONS
  // 
  
  /**
    Called from updatesRecords() to update a single record.  This is the 
    most basic primitive to can implement to support updating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  updateRecord: function(store, storeKey, params) {
    return NO ;
  },

  /**
    Called from retrieveRecords() to retrieve a single record.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to retrieve
    @param {String} id the id to retrieve
    @returns {Boolean} YES if handled
  */
  retrieveRecord: function(store, storeKey, id) {
    return NO ;
  },

  /**
    Called from createdRecords() to created a single record.  This is the 
    most basic primitive to can implement to support creating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  createRecord: function(store, storeKey, params) {
    return NO ;
  },

  /**
    Called from destroyRecords() to destroy a single record.  This is the 
    most basic primitive to can implement to support destroying a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  destroyRecord: function(store, storeKey, params) {
    return NO ;
  }  
    
});

/* >>>>>>>>>> BEGIN source/data_sources/cascade.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('data_sources/data_source');

/** @class

  A cascading data source will actually forward requests onto an array of 
  additional data sources, stopping when one of the data sources returns YES,
  indicating that it handled the request.  
  
  You can use a cascading data source to tie together multiple data sources,
  treating them as a single namespace.
  
  h2. Configuring a Cascade Data Source
  
  You will usually define your cascading data source in your main method after
  all the classes you have are loaded.
  
  {{{
    MyApp.dataSource = SC.CascadeDataSource.create({
      dataSources: "prefs youtube photos".w(),
      
      prefs:   MyApp.PrefsDataSource.create({ root: "/prefs" }),
      youtube: YouTube.YouTubeDataSource.create({ apiKey: "123456" }),
      photos:  MyApp.PhotosDataSource.create({ root: "photos" })
      
    });
    
    MyApp.store.set('dataSource', MyApp.dataSource);
  }}}
  
  Note that the order you define your dataSources property will determine the
  order in which requests will cascade from the store.
  
  Alternatively, you can use a more jQuery-like API for defining your data
  sources:
  
  {{{
    MyApp.dataSource = SC.CascadeDataSource.create()
      .from(MyApp.PrefsDataSource.create({ root: "/prefs" }))
      .from(YouTube.YouTubeDataSource.create({ apiKey: "123456" }))
      .from(MyApp.PhotosDataSource.create({ root: "photos" }));

    MyApp.store.set('dataSource', MyApp.dataSource);
  }}}

  In this case, the order you call from() will determine the order the request
  will cascade.
  
  @extends SC.DataSource
  @since SproutCore 1.0
*/
SC.CascadeDataSource = SC.DataSource.extend( 
  /** @scope SC.CascadeDataSource.prototype */ {

  /**
    The data sources used by the cascade, in the order that they are to be 
    followed.  Usually when you define the cascade, you will define this
    array.
    
    @property {Array}
  */
  dataSources: null,

  /**
    Add a data source to the list of sources to use when cascading.  Used to
    build the data source cascade effect.

    @param {SC.DataSource} dataSource a data source instance to add.
    @returns {SC.CascadeDataSource} receiver
  */
  from: function(dataSource) {
    var dataSources = this.get('dataSources');
    if (!dataSources) this.set('dataSources', dataSources = []);
    dataSources.push(dataSource);
    return this ;
  },
    
  // ..........................................................
  // SC.STORE ENTRY POINTS
  // 
  
  /** @private - just cascades */
  fetch: function(store, query) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = NO,
        cur, source, idx;
    
    for(idx=0; (ret !== YES) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.fetch ? source.fetch.call(source, store, query) : NO;
      ret = this._handleResponse(ret, cur);
    }
    
    return ret ;
  },
  
  
  /** @private - just cascades */
  retrieveRecords: function(store, storeKeys) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = NO,
        cur, source, idx;
    
    for(idx=0; (ret !== YES) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.retrieveRecords.call(source, store, storeKeys);
      ret = this._handleResponse(ret, cur);
    }
    
    return ret ;
  },

  /** @private - just cascades */
  commitRecords: function(store, createStoreKeys, updateStoreKeys, destroyStoreKeys) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = NO,
        cur, source, idx;
    
    for(idx=0; (ret !== YES) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.commitRecords.call(source, store, createStoreKeys, updateStoreKeys, destroyStoreKeys);
      ret = this._handleResponse(ret, cur);
    }
    
    return ret ;
  },

  /** @private - just cascades */
  cancel: function(store, storeKeys) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = NO,
        cur, source, idx;
    
    for(idx=0; (ret !== YES) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.cancel.call(source, store, storeKeys);
      ret = this._handleResponse(ret, cur);
    }
    
    return ret ;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    // if a dataSources array is defined, look for any strings and lookup 
    // the same on the data source.  Replace.
    var sources = this.get('dataSources'),
        idx     = sources ? sources.get('length') : 0,
        source;
    while(--idx>=0) {
      source = sources[idx];
      if (SC.typeOf(source) === SC.T_STRING) sources[idx] = this.get(source);
    }
    
  },

  /** @private - Determine the proper return value. */
  _handleResponse: function(current, response) {
    if (response === YES) return YES ;
    else if (current === NO) return (response === NO) ? NO : SC.MIXED_STATE ;
    else return SC.MIXED_STATE ;
  }
    
});

/* >>>>>>>>>> BEGIN source/models/record.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A Record is the core model class in SproutCore. It is analogous to 
  NSManagedObject in Core Data and EOEnterpriseObject in the Enterprise
  Objects Framework (aka WebObjects), or ActiveRecord::Base in Rails.
  
  To create a new model class, in your SproutCore workspace, do:
  
  {{{
    $ sc-gen model MyApp.MyModel
  }}}
  
  This will create MyApp.MyModel in clients/my_app/models/my_model.js.
  
  The core attributes hash is used to store the values of a record in a 
  format that can be easily passed to/from the server.  The values should 
  generally be stored in their raw string form.  References to external 
  records should be stored as primary keys.
  
  Normally you do not need to work with the attributes hash directly.  
  Instead you should use get/set on normal record properties.  If the 
  property is not defined on the object, then the record will check the 
  attributes hash instead.
  
  You can bulk update attributes from the server using the 
  updateAttributes() method.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Record = SC.Object.extend(
/** @scope SC.Record.prototype */ {
  
  /**  
    Walk like a duck
  
    @property {Boolean}
  */
  isRecord: YES,
  
  // ...............................
  // PROPERTIES
  //
  
  /**
    This is the primary key used to distinguish records.  If the keys
    match, the records are assumed to be identical.
    
    @property {String}
  */
  primaryKey: 'guid',
  
  /**
    Returns the id for the record instance.  The id is used to uniquely 
    identify this record instance from all others of the same type.  If you 
    have a primaryKey set on this class, then the id will be the value of the
    primaryKey property on the underlying JSON hash.
    
    @property {String}
  */
  id: function(key, value) {
    if (value !== undefined) {
      this.writeAttribute(this.get('primaryKey'), value);
      return value;
    } else {
      return SC.Store.idFor(this.storeKey);
    }
  }.property('storeKey').cacheable(),
  
  /**
    All records generally have a life cycle as they are created or loaded into 
    memory, modified, committed and finally destroyed.  This life cycle is 
    managed by the status property on your record. 

    The status of a record is modelled as a finite state machine.  Based on the 
    current state of the record, you can determine which operations are 
    currently allowed on the record and which are not.
    
    In general, a record can be in one of five primary states; SC.Record.EMPTY,
    SC.Record.BUSY, SC.Record.READY, SC.Record.DESTROYED, SC.Record.ERROR. 
    These are all described in more detail in the class mixin (below) where 
    they are defined.
    
    @property {Number}
  */
  status: function() {
    return this.store.readStatus(this.storeKey);
  }.property('storeKey').cacheable(),

  /**
    The store that owns this record.  All changes will be buffered into this
    store and committed to the rest of the store chain through here.
    
    This property is set when the record instance is created and should not be
    changed or else it will break the record behavior.
    
    @property {SC.Store}
  */
  store: null,

  /**
    This is the store key for the record, it is used to link it back to the 
    dataHash. If a record is reused, this value will be replaced.
    
    You should not edit this store key but you may sometimes need to refer to
    this store key when implementing a Server object.
    
    @property {Number}
  */
  storeKey: null,

  /** 
    YES when the record has been destroyed
    
    @property {Boolean}
  */
  isDestroyed: function() {
    return !!(this.get('status') & SC.Record.DESTROYED);  
  }.property('status').cacheable(),
  
  /**
    YES when the record is in an editable state.  You can use this property to
    quickly determine whether attempting to modify the record would raise an 
    exception or not.
    
    This property is both readable and writable.  Note however that if you 
    set this property to YES but the status of the record is anything but
    SC.Record.READY, the return value of this property may remain NO.
    
    @property {Boolean}
  */
  isEditable: function(key, value) {
    if (value !== undefined) this._screc_isEditable = value;
    if (this.get('status') & SC.Record.READY) return this._screc_isEditable;
    else return NO ;
  }.property('status').cacheable(),
  
  _screc_isEditable: YES, // default
  
  /**
    YES when the record's contents have been loaded for the first time.  You 
    can use this to quickly determine if the record is ready to display.
    
    @property {Boolean}
  */
  isLoaded: function() {
    var K = SC.Record, 
        status = this.get('status');
    return !((status===K.EMPTY) || (status===K.BUSY_LOADING) || (status===K.ERROR));
  }.property('status').cacheable(),
  
  /**
    If set, this should be an array of active relationship objects that need
    to be notified whenever the underlying record properties change.  
    Currently this is only used by toMany relationships, but you could 
    possibly patch into this yourself also if you are building your own 
    relationships.
    
    Note this must be a regular Array - NOT any object implmenting SC.Array.
    
    @property {Array}
  */
  relationships: null,

  /**
    This will return the raw attributes that you can edit directly.  If you 
    make changes to this hash, be sure to call beginEditing() before you get
    the attributes and endEditing() afterwards.
  
    @property {Hash}
  **/
  attributes: function() {
    var store    = this.get('store'), 
        storeKey = this.storeKey;
    return store.readEditableDataHash(storeKey);
  }.property(),

  /**
    This will return the raw attributes that you cannot edit directly.  It is
    useful if you want to efficiently look at multiple attributes in bulk.  If
    you would like to edit the attributes, see the @attributes@ property
    instead.
  
    @property {Hash}
  **/
  readOnlyAttributes: function() {
    var store    = this.get('store'), 
        storeKey = this.storeKey;
        ret      = store.readDataHash(storeKey);
    
    if (ret) ret = SC.clone(ret);

    return ret;
  }.property(),
  
  /**
   * The child record cache.
   */
  childRecords: null,
  
  /**
   * The namespace which to retrieve the childRecord Types from
   */
  childRecordNamespace: null,
      
  // ...............................
  // CRUD OPERATIONS
  //

  /**
    Refresh the record from the persistent store.  If the record was loaded 
    from a persistent store, then the store will be asked to reload the 
    record data from the server.  If the record is new and exists only in 
    memory then this call will have no effect.
    
    @returns {SC.Record} receiver
  */
  refresh: function() { 
    this.get('store').refreshRecord(null, null, this.get('storeKey'));
    return this ;
  },
  
  /**
    Deletes the record along with any dependent records.  This will mark the 
    records destroyed in the store as well as changing the isDestroyed 
    property on the record to YES.  If this is a new record, this will avoid 
    creating the record in the first place.
    
    @returns {SC.Record} receiver
  */
  destroy: function() { 
    this.get('store').destroyRecord(null, null, this.get('storeKey'));
    this.propertyDidChange('status');
    return this ;
  },

  /**
    You can invoke this method anytime you need to make the record as dirty.
    This will cause the record to be commited when you commitChanges()
    on the underlying store.
    
    If you use the writeAttribute() primitive, this method will be called for 
    you.
    
    If you pass the key that changed it will ensure that observers are fired
    only once for the changed property instead of allPropertiesDidChange()
    
    @param {String} key that changed (optional)
    @returns {SC.Record} receiver
  */
  recordDidChange: function(key) {
    this.get('store').recordDidChange(null, null, this.get('storeKey'), key);
    this.notifyPropertyChange('status');
    return this ;
  },
  
  // ...............................
  // ATTRIBUTES
  //

  /** @private
    Current edit level.  Used to defer editing changes. 
  */
  _editLevel: 0 ,
  
  /**
    Defers notification of record changes until you call a matching 
    endEditing() method.  This method is called automatically whenever you
    set an attribute, but you can call it yourself to group multiple changes.
    
    Calls to beginEditing() and endEditing() can be nested.
    
    @returns {SC.Record} receiver
  */
  beginEditing: function() {
    this._editLevel++;
    return this ;
  },

  /**
    Notifies the store of record changes if this matches a top level call to
    beginEditing().  This method is called automatically whenever you set an
    attribute, but you can call it yourself to group multiple changes.
    
    Calls to beginEditing() and endEditing() can be nested.
    
    @param {String} key that changed (optional)
    @returns {SC.Record} receiver
  */
  endEditing: function(key) {
    if(--this._editLevel <= 0) {
      this._editLevel = 0; 
      this.recordDidChange(key);
    }
    return this ;
  },
  
  /**
    Reads the raw attribute from the underlying data hash.  This method does
    not transform the underlying attribute at all.
  
    @param {String} key the attribute you want to read
    @returns {Object} the value of the key, or null if it doesn't exist
  */
  readAttribute: function(key) {
    var store = this.get('store'), storeKey = this.storeKey;
    var attrs = store.readDataHash(storeKey);
    return attrs ? attrs[key] : undefined ; 
  },

  /**
    Updates the passed attribute with the new value.  This method does not 
    transform the value at all.  If instead you want to modify an array or 
    hash already defined on the underlying json, you should instead get 
    an editable version of the attribute using editableAttribute()
  
    @param {String} key the attribute you want to read
    @param {Object} value the value you want to write
    @param {Boolean} ignoreDidChange only set if you do NOT want to flag 
      record as dirty
    @returns {SC.Record} receiver
  */
  writeAttribute: function(key, value, ignoreDidChange) {
    var store    = this.get('store'), 
        storeKey = this.storeKey,
        status   = store.peekStatus(storeKey),
        recordAttr = this[key],
        recordType = SC.Store.recordTypeFor(storeKey),
        attrs;
    
    attrs = store.readEditableDataHash(storeKey);
    if (!attrs) throw SC.Record.BAD_STATE_ERROR;

    // if value is the same, do not flag record as dirty
    if (value !== attrs[key]) {
      if(!ignoreDidChange) this.beginEditing();
      attrs[key] = value;
      
      // If the key is the primaryKey of the record, we need to tell the store
      // about the change.
      if (key===this.get('primaryKey')) {
        SC.Store.replaceIdFor(storeKey, value) ;
        this.propertyDidChange('id'); // Reset computed value
      }
      
      if(!ignoreDidChange) this.endEditing(key);
    }
    
    // if any aggregates, propagate the state
    if(!recordType.aggregates || recordType.aggregates.length>0) {
      this.propagateToAggregates();
    }
    
    return this ;  
  },
  
  /**
    This will also ensure that any aggregate records are also marked dirty
    if this record changes.
    
    Should not have to be called manually.
  */
  propagateToAggregates: function() {
    var storeKey = this.get('storeKey'),
        recordType = SC.Store.recordTypeFor(storeKey), 
        idx, len, key, val, recs;
    
    var aggregates = recordType.aggregates;
    
    // if recordType aggregates are not set up yet, make sure to 
    // create the cache first
    if (!aggregates) {
      var dataHash = this.get('store').readDataHash(storeKey);
      aggregates = [];
      for(var k in dataHash) {
        if(this[k] && this[k].get && this[k].get('aggregate')===YES) {
          aggregates.push(k);
        }
      }
      recordType.aggregates = aggregates;
    }
    
    // now loop through all aggregate properties and mark their related
    // record objects as dirty
    var K = SC.Record;
    for(idx=0,len=aggregates.length;idx<len;++idx) {
      key = aggregates[idx];
      val = this.get(key);
      recs = SC.kindOf(val, SC.ManyArray) ? val : [val];
      recs.forEach(function(rec) {
        // If the child is dirty, then make sure the parent gets a dirty
        // status.  (If the child is created or destroyed, there's no need,
        // because the parent will dirty itself when it modifies that
        // relationship.)
        if (rec) { 
          var childStatus = this.get('status');
          if (childStatus & K.DIRTY) {
            var parentStatus = rec.get('status');
            if (parentStatus === K.READY_CLEAN) {
              // Note:  storeDidChangeProperties() won't put it in the
              //        changelog!
              rec.get('store').recordDidChange(rec.constructor, null, rec.get('storeKey'), null, YES);
            }
          }
        }
      }, this);
    }
    
  },
  
  /**
    Called by the store whenever the underlying data hash has changed.  This
    will notify any observers interested in data hash properties that they
    have changed.
    
    @param {Boolean} statusOnly changed
    @param {String} key that changed (optional)
    @returns {SC.Record} receiver
  */
  storeDidChangeProperties: function(statusOnly, keys) {
    if (statusOnly) this.notifyPropertyChange('status');
    else {      
      if (keys) {
        this.beginPropertyChanges();
        keys.forEach(function(k) { this.notifyPropertyChange(k); }, this);
        this.notifyPropertyChange('status'); 
        this.endPropertyChanges();
        
      } else this.allPropertiesDidChange(); 
    
      // also notify manyArrays
      var manyArrays = this.relationships,
          loc        = manyArrays ? manyArrays.length : 0 ;
      while(--loc>=0) manyArrays[loc].recordPropertyDidChange(keys);
    }
  },
  
  /**
    Normalizing a record will ensure that the underlying hash conforms
    to the record attributes such as their types (transforms) and default 
    values. 
    
    This method will write the conforming hash to the store and return
    the materialized record.
    
    By normalizing the record, you can use .attributes() and be
    assured that it will conform to the defined model. For example, this
    can be useful in the case where you need to send a JSON representation
    to some server after you have used .createRecord(), since this method
    will enforce the 'rules' in the model such as their types and default
    values. You can also include null values in the hash with the 
    includeNull argument.
    
    @param {Boolean} includeNull will write empty (null) attributes
    @returns {SC.Record} the normalized record
  */
  
  normalize: function(includeNull) {    
    var primaryKey = this.primaryKey, 
        recordId   = this.get('id'), 
        store      = this.get('store'), 
        storeKey   = this.get('storeKey'), 
        key, valueForKey, typeClass, recHash, attrValue, normChild,  isRecord,
        isChild, defaultVal;
      
    var dataHash = store.readEditableDataHash(storeKey) || {};
    dataHash[primaryKey] = recordId;
    recHash = store.readDataHash(storeKey);
    
    for (key in this) {
      // make sure property is a record attribute.
      valueForKey = this[key];
      if (valueForKey) {
        typeClass = valueForKey.typeClass;
        if (typeClass) {
          isRecord = SC.typeOf(typeClass.call(valueForKey))===SC.T_CLASS;
          isChild  = valueForKey.isChildRecordTransform;
          if (!isRecord && !isChild) {
            attrValue = this.get(key);

            if(attrValue!==undefined || (attrValue===null && includeNull)) {
              dataHash[key] = attrValue;
            }
          }
          else if (isChild) {
            attrValue = this.get(key);
            attrValue.normalize();
          }
          else if (isRecord) {
            attrValue = recHash[key];
            if (attrValue !== undefined) {
              // write value already there
              dataHash[key] = attrValue;
            }
            else {
              // or write default
              defaultVal = valueForKey.get('defaultValue');

              // computed default value
              if (SC.typeOf(defaultVal)===SC.T_FUNCTION) {
                dataHash[key] = defaultVal(this, key, defaultVal);
              }
              else {
                // plain value                
                dataHash[key] = defaultVal;
              }
            }
          }
        }
      }
    }
  
    return this;
  },

  
  
  /**
    If you try to get/set a property not defined by the record, then this 
    method will be called. It will try to get the value from the set of 
    attributes.
    
    This will also check is ignoreUnknownProperties is set on the recordType
    so that they will not be written to dataHash unless explicitly defined
    in the model schema.
  
    @param {String} key the attribute being get/set
    @param {Object} value the value to set the key to, if present
    @returns {Object} the value
  */
  unknownProperty: function(key, value) {
    
    if (value !== undefined) {
      
      // first check if we should ignore unknown properties for this 
      // recordType
      var storeKey = this.get('storeKey'),
        recordType = SC.Store.recordTypeFor(storeKey);
      
      if(recordType.ignoreUnknownProperties===YES) {
        this[key] = value;
        return value;
      }
      
      // if we're modifying the PKEY, then SC.Store needs to relocate where 
      // this record is cached. store the old key, update the value, then let 
      // the store do the housekeeping...
      var primaryKey = this.get('primaryKey');
      this.writeAttribute(key,value);

      // update ID if needed
      if (key === primaryKey) {
        SC.Store.replaceIdFor(storeKey, value);
      }
      
    }
    return this.readAttribute(key);
  },
  
  /**
    Lets you commit this specific record to the store which will trigger
    the appropriate methods in the data source for you.
    
    @param {Hash} params optional additonal params that will passed down
      to the data source
    @returns {SC.Record} receiver
  */
  commitRecord: function(params) {
    var store = this.get('store');
    store.commitRecord(undefined, undefined, this.get('storeKey'), params);
    return this ;
  },
  
  // ..........................................................
  // EMULATE SC.ERROR API
  // 
  
  /**
    Returns YES whenever the status is SC.Record.ERROR.  This will allow you 
    to put the UI into an error state.
    
    @property {Boolean}
  */
  isError: function() {
    return this.get('status') & SC.Record.ERROR;
  }.property('status').cacheable(),

  /**
    Returns the receiver if the record is in an error state.  Returns null
    otherwise.
    
    @property {SC.Record}
  */
  errorValue: function() {
    return this.get('isError') ? SC.val(this.get('errorObject')) : null ;
  }.property('isError').cacheable(),
  
  /**
    Returns the current error object only if the record is in an error state.
    If no explicit error object has been set, returns SC.Record.GENERIC_ERROR.
    
    @property {SC.Error}
  */
  errorObject: function() {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readError(this.get('storeKey')) || SC.Record.GENERIC_ERROR;
    } else return null ;
  }.property('isError').cacheable(),
  
  // ...............................
  // PRIVATE
  //
  
  /** @private
    Creates string representation of record, with status.
    
    @returns {String}
  */
  
  toString: function() {
    // We won't use 'readOnlyAttributes' here because accessing them directly
    // avoids a SC.clone() -- we'll be careful not to edit anything.
    var attrs = this.get('store').readDataHash(this.get('storeKey'));
    return "%@(%@) %@".fmt(this.constructor.toString(), SC.inspect(attrs), this.statusString());
  },
  
  /** @private
    Creates string representation of record, with status.
    
    @returns {String}
  */
  
  statusString: function() {
    var ret = [], status = this.get('status');
    
    for(var prop in SC.Record) {
      if(prop.match(/[A-Z_]$/) && SC.Record[prop]===status) {
        ret.push(prop);
      }
    }
    
    return ret.join(" ");
  },
  
  /**
   * Registers a child record with this parent record.
   *
   * If the parent already knows about the child record, return the cached instance.  If not,
   * create the child record instance and add it to the child record cache.
   *
   * @param {CoreOrion.ChildRecord} recordType The type of the child record to register.
   * @param {Hash} hash The hash of attributes to apply to the child record.
   */
  registerChildRecord: function(recordType, hash) {
    var pm = recordType.primaryKey || 'childRecordKey';
    var childKey = hash[pm];
    var childRecord = null;
    var crManager = this.get('childRecords');
    if (childKey && crManager) {
      childRecord = crManager[childKey];
    }

    if (SC.none(childRecord)) childRecord = this.createChildRecord(recordType, hash);
 
    return childRecord;
  },
  
  /**
   * Creates a new child record instance.
   *
   * @param {CoreOrion.ChildRecord} recordType The type of the child record to create.
   * @param {Hash} hash The hash of attributes to apply to the child record. (may be null)
   */
  createChildRecord: function(childRecordType, hash) {
    SC.RunLoop.begin();
    // Generate the key used by the parent's child record manager.
    var key = SC.Record._generateChildKey();
    hash = hash || {}; // init if needed
    var pm = childRecordType.primaryKey || 'childRecordKey';
    var childKey = hash[pm];
    hash[pm] = key;
    
    var store = this.get('store');
    if (SC.none(store)) throw 'Error: during the creation of a child record: NO STORE ON PARENT!';
    
    var cr = store.createRecord(childRecordType, hash);
    cr._parentRecord = this;
    
    // ID processing if necessary
    if(this.generateIdForChild) this.generateIdForChild(cr);
    
    // Add the child record to the hash.
    var crManager = this.get('childRecords');
    if (SC.none(crManager)) {
      //console.log('Creating Child Record Manager for (%@)'.fmt(SC.guidFor(this)));
      crManager = SC.Object.create();
      this.set('childRecords', crManager);
    }
    
    crManager[key] = cr;
    SC.RunLoop.end();
    
    return cr;
  },
  
  /**
   * Override this function if you want to have a special way of creating 
   * ids for your child records
   */
  generateIdForChild: function(childRecord){}
     
}) ;

// Class Methods
SC.Record.mixin( /** @scope SC.Record */ {

  /**
    Whether to ignore unknown properties when they are being set on the record
    object. This is useful if you want to strictly enforce the model schema
    and not allow dynamically expanding it by setting new unknown properties
    
    @property {Boolean}
  */
  ignoreUnknownProperties: NO,

  // ..........................................................
  // CONSTANTS
  // 

  /** 
    Generic state for records with no local changes.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  CLEAN:            0x0001, // 1

  /** 
    Generic state for records with local changes.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DIRTY:            0x0002, // 2
  
  /** 
    State for records that are still loaded.  
    
    A record instance should never be in this state.  You will only run into 
    it when working with the low-level data hash API on SC.Store. Use a 
    logical AND (single &) to test record status
  
    @property {Number}
  */
  EMPTY:            0x0100, // 256

  /** 
    State for records in an error state.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  ERROR:            0x1000, // 4096
  
  /** 
    Generic state for records that are loaded and ready for use
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY:            0x0200, // 512

  /** 
    State for records that are loaded and ready for use with no local changes
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY_CLEAN:      0x0201, // 513


  /** 
    State for records that are loaded and ready for use with local changes
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY_DIRTY:      0x0202, // 514


  /** 
    State for records that are new - not yet committed to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY_NEW:        0x0203, // 515
  

  /** 
    Generic state for records that have been destroyed
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DESTROYED:        0x0400, // 1024


  /** 
    State for records that have been destroyed and committed to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DESTROYED_CLEAN:  0x0401, // 1025


  /** 
    State for records that have been destroyed but not yet committed to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DESTROYED_DIRTY:  0x0402, // 1026
  

  /** 
    Generic state for records that have been submitted to data source
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY:             0x0800, // 2048


  /** 
    State for records that are still loading data from the server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_LOADING:     0x0804, // 2052


  /** 
    State for new records that were created and submitted to the server; 
    waiting on response from server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_CREATING:    0x0808, // 2056


  /** 
    State for records that have been modified and submitted to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_COMMITTING:  0x0810, // 2064


  /** 
    State for records that have requested a refresh from the server.
    
    Use a logical AND (single &) to test record status.
  
    @property {Number}
  */
  BUSY_REFRESH:     0x0820, // 2080


  /** 
    State for records that have requested a refresh from the server.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_REFRESH_CLEAN:  0x0821, // 2081

  /** 
    State for records that have requested a refresh from the server.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_REFRESH_DIRTY:  0x0822, // 2082

  /** 
    State for records that have been destroyed and submitted to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_DESTROYING:  0x0840, // 2112


  // ..........................................................
  // ERRORS
  // 
  
  /**
    Error for when you try to modify a record while it is in a bad 
    state.
    
    @property {SC.Error}
  */
  BAD_STATE_ERROR:     SC.$error("Internal Inconsistency"),

  /**
    Error for when you try to create a new record that already exists.
    
    @property {SC.Error}
  */
  RECORD_EXISTS_ERROR: SC.$error("Record Exists"),

  /**
    Error for when you attempt to locate a record that is not found
    
    @property {SC.Error}
  */
  NOT_FOUND_ERROR:     SC.$error("Not found "),

  /**
    Error for when you try to modify a record that is currently busy
    
    @property {SC.Error}
  */
  BUSY_ERROR:          SC.$error("Busy"),

  /**
    Generic unknown record error
    
    @property {SC.Error}
  */
  GENERIC_ERROR:       SC.$error("Generic Error"),
  
  /**
   * The next child key to allocate.  A nextChildKey must always be greater than 0.
   */
  _nextChildKey: 0,
  
  // ..........................................................
  // CLASS METHODS
  // 
  
  /**
    Helper method returns a new SC.RecordAttribute instance to map a simple
    value or to-one relationship.  At the very least, you should pass the 
    type class you expect the attribute to have.  You may pass any additional
    options as well.
    
    Use this helper when you define SC.Record subclasses. 
    
    h4. Example
    
    {{{
      MyApp.Contact = SC.Record.extend({
        firstName: SC.Record.attr(String, { isRequired: YES })
      });
    }}}
    
    @param {Class} type the attribute type
    @param {Hash} opts the options for the attribute
    @returns {SC.RecordAttribute} created instance
  */
  attr: function(type, opts) { 
    return SC.RecordAttribute.attr(type, opts); 
  },
  
  /**
    Returns an SC.RecordAttribute that describes a fetched attribute.  When 
    you reference this attribute, it will return an SC.RecordArray that uses
    the type as the fetch key and passes the attribute value as a param.
    
    Use this helper when you define SC.Record subclasses. 
    
    h4. Example
    
    {{{
      MyApp.Group = SC.Record.extend({
        contacts: SC.Record.fetch('MyApp.Contact')
      });
    }}}
    
    @param {SC.Record|String} recordType The type of records to load
    @param {Hash} opts the options for the attribute
    @returns {SC.RecordAttribute} created instance
  */
  fetch: function(recordType, opts) {
    return SC.FetchedAttribute.attr(recordType, opts) ;
  },
  
  /**
    Returns:
    
    1: SC.ManyAttribute that describes a record array backed by an 
    array of guids stored in the underlying JSON.  
    2: SC.ChildrenAttribute that describes a record array backed by a
    array of hashes.
    
    You can edit the contents of this relationship.
    
    For SC.ManyAttribute, If you set the inverse and isMaster: NO key, 
    then editing this array will modify the underlying data, but the 
    inverse key on the matching record will also be edited and that 
    record will be marked as needing a change.
    
    @param {SC.Record|String} recordType The type of record to create
    @param {Hash} opts the options for the attribute
    @returns {SC.ManyAttribute|SC.ChildrenAttribute} created instance
  */
  toMany: function(recordType, opts) {
    opts = opts || {};
    var isNested = opts.nested;
    var attr;
    if(isNested){
      attr = SC.ChildrenAttribute.attr(recordType, opts);
    }
    else {
      attr = SC.ManyAttribute.attr(recordType, opts);
    }
    return attr;
  },
  
  /**
    Returns:
    1. SC.SingleAttribute that converts the underlying ID to a single
    record.  If you modify this property, it will rewrite the underyling ID. 
    It will also modify the inverse of the relationship, if you set it.
    
    2. SC.ChildAttribute that you can edit the contents
    of this relationship.
    
    @param {SC.Record|String} recordType the type of the record to create
    @param {Hash} opts additional options
    @returns {SC.SingleAttribute|SC.ChildAttribute} created instance
  */
  toOne: function(recordType, opts) {
    opts = opts || {};
    var isNested = opts.nested;
    var attr;
    if(isNested){
      attr = SC.ChildAttribute.attr(recordType, opts);
    }
    else {
      attr = SC.SingleAttribute.attr(recordType, opts);
    }
    return attr;
  },
  
  /**
    Returns all storeKeys mapped by Id for this record type.  This method is
    used mostly by the SC.Store and the Record to coordinate.  You will rarely
    need to call this method yourself.
    
    @returns {Hash}
  */
  storeKeysById: function() {
    var key = SC.keyFor('storeKey', SC.guidFor(this)),
        ret = this[key];
    if (!ret) ret = this[key] = {};
    return ret;
  },
  
  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  If the primaryKey has not been assigned a storeKey yet, it 
    will be added.
    
    For the inverse of this method see SC.Store.idFor() and 
    SC.Store.recordTypeFor().
    
    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyFor: function(id) {
    var storeKeys = this.storeKeysById(),
        ret       = storeKeys[id];
    
    if (!ret) {
      ret = SC.Store.generateStoreKey();
      SC.Store.idsByStoreKey[ret] = id ;
      SC.Store.recordTypesByStoreKey[ret] = this ;
      storeKeys[id] = ret ;
    }
    
    return ret ;
  },
  
  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  As opposed to storeKeyFor() however, this method
    will NOT generate a new storeKey but returned undefined.
    
    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyExists: function(id) {
    var storeKeys = this.storeKeysById(),
        ret       = storeKeys[id];
    
    return ret ;
  },

  /** 
    Returns a record with the named ID in store.
    
    @param {SC.Store} store the store
    @param {String} id the record id or a query
    @returns {SC.Record} record instance
  */
  find: function(store, id) {
    return store.find(this, id);
  },
  
  /** @private - enhance extend to notify SC.Query as well. */
  extend: function() {
    var ret = SC.Object.extend.apply(this, arguments);
    SC.Query._scq_didDefineRecordType(ret);
    return ret ;
  },
  
  // ..........................................................
  // PRIVATE METHODS
  // 
  
  _generateChildKey: function() {
    var newIdx = SC.Record._nextChildKey + 1;
    SC.Record._nextChildKey = newIdx;
    return newIdx; 
  }
}) ;

/* >>>>>>>>>> BEGIN source/data_sources/fixtures.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('data_sources/data_source');
sc_require('models/record');

/** @class

  TODO: Describe Class
  
  @extends SC.DataSource
  @since SproutCore 1.0
*/
SC.FixturesDataSource = SC.DataSource.extend(
  /** @scope SC.FixturesDataSource.prototype */ {

  /**
    If YES then the data source will asyncronously respond to data requests
    from the server.  If you plan to replace the fixture data source with a 
    data source that talks to a real remote server (using Ajax for example),
    you should leave this property set to YES so that Fixtures source will
    more accurately simulate your remote data source.

    If you plan to replace this data source with something that works with 
    local storage, for example, then you should set this property to NO to 
    accurately simulate the behavior of your actual data source.
    
    @property {Boolean}
  */
  simulateRemoteResponse: NO,
  
  /**
    If you set simulateRemoteResponse to YES, then the fixtures soure will
    assume a response latency from your server equal to the msec specified
    here.  You should tune this to simulate latency based on the expected 
    performance of your server network.  Here are some good guidelines:
    
    - 500: Simulates a basic server written in PHP, Ruby, or Python (not twisted) without a CDN in front for caching.
    - 250: (Default) simulates the average latency needed to go back to your origin server from anywhere in the world.  assumes your servers itself will respond to requests < 50 msec
    - 100: simulates the latency to a "nearby" server (i.e. same part of the world).  Suitable for simulating locally hosted servers or servers with multiple data centers around the world.
    - 50: simulates the latency to an edge cache node when using a CDN.  Life is really good if you can afford this kind of setup.
    
    @property {Number}
  */
  latency: 50,
  
  // ..........................................................
  // CANCELLING
  // 
  
  /** @private */
  cancel: function(store, storeKeys) {
    return NO;
  },
  
  
  // ..........................................................
  // FETCHING
  // 
  
  /** @private */
  fetch: function(store, query) {
    
    // can only handle local queries out of the box
    if (query.get('location') !== SC.Query.LOCAL) {
      throw SC.$error('SC.Fixture data source can only fetch local queries');
    }

    if (!query.get('recordType') && !query.get('recordTypes')) {
      throw SC.$error('SC.Fixture data source can only fetch queries with one or more record types');
    }
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._fetch, this.get('latency'), store, query);
      
    } else this._fetch(store, query);
  },
  
  /** @private
    Actually performs the fetch.  
  */
  _fetch: function(store, query) {
    
    // NOTE: Assumes recordType or recordTypes is defined.  checked in fetch()
    var recordType = query.get('recordType'),
        recordTypes = query.get('recordTypes') || [recordType];
        
    // load fixtures for each recordType
    recordTypes.forEach(function(recordType) {
      if (SC.typeOf(recordType) === SC.T_STRING) {
        recordType = SC.objectForPropertyPath(recordType);
      }
      
      if (recordType) this.loadFixturesFor(store, recordType);
    }, this);
    
    // notify that query has now loaded - puts it into a READY state
    store.dataSourceDidFetchQuery(query);
  },
  
  // ..........................................................
  // RETRIEVING
  // 
  
  /** @private */
  retrieveRecords: function(store, storeKeys) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._retrieveRecords, latency, store, storeKeys);
    } else this._retrieveRecords(store, storeKeys);
    
    return ret ;
  },
  
  _retrieveRecords: function(store, storeKeys) {
    
    storeKeys.forEach(function(storeKey) {
      var ret        = [], 
          recordType = SC.Store.recordTypeFor(storeKey),
          id         = store.idFor(storeKey),
          hash       = this.fixtureForStoreKey(store, storeKey);
      ret.push(storeKey);
      store.dataSourceDidComplete(storeKey, hash, id);
    }, this);
  },
  
  // ..........................................................
  // UPDATE
  // 
  
  /** @private */
  updateRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._updateRecords, latency, store, storeKeys);
    } else this._updateRecords(store, storeKeys);
    
    return ret ;
  },
  
  _updateRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var hash = store.readDataHash(storeKey);
      this.setFixtureForStoreKey(store, storeKey, hash);
      store.dataSourceDidComplete(storeKey);  
    }, this);
  },


  // ..........................................................
  // CREATE RECORDS
  // 
  
  /** @private */
  createRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency');
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._createRecords, latency, store, storeKeys);
    } else this._createRecords(store, storeKeys);
    
    return YES ;
  },

  _createRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var id         = store.idFor(storeKey),
          recordType = store.recordTypeFor(storeKey),
          dataHash   = store.readDataHash(storeKey), 
          fixtures   = this.fixturesFor(recordType);

      if (!id) id = this.generateIdFor(recordType, dataHash, store, storeKey);
      this._invalidateCachesFor(recordType, storeKey, id);
      fixtures[id] = dataHash;

      store.dataSourceDidComplete(storeKey, null, id);
    }, this);
  },

  // ..........................................................
  // DESTROY RECORDS
  // 
  
  /** @private */
  destroyRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._destroyRecords, latency, store, storeKeys);
    } else this._destroyRecords(store, storeKeys);
    
    return ret ;
  },
  

  _destroyRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var id         = store.idFor(storeKey),
          recordType = store.recordTypeFor(storeKey),
          fixtures   = this.fixturesFor(recordType);

      this._invalidateCachesFor(recordType, storeKey, id);
      if (id) delete fixtures[id];
      store.dataSourceDidDestroy(storeKey);  
    }, this);
  },
  
  // ..........................................................
  // INTERNAL METHODS/PRIMITIVES
  // 

  /**
    Load fixtures for a given fetchKey into the store
    and push it to the ret array.
    
    @param {SC.Store} store the store to load into
    @param {SC.Record} recordType the record type to load
    @param {SC.Array} ret is passed, array to add loaded storeKeys to.
    @returns {SC.Fixture} receiver
  */
  loadFixturesFor: function(store, recordType, ret) {
    var hashes   = [],
        dataHashes, i, storeKey ;
    
    dataHashes = this.fixturesFor(recordType);
    
    for(i in dataHashes){
      storeKey = recordType.storeKeyFor(i);
      if (store.peekStatus(storeKey) === SC.Record.EMPTY) {
        hashes.push(dataHashes[i]);
      }
      if (ret) ret.push(storeKey);
    }

    // only load records that were not already loaded to avoid infinite loops
    if (hashes && hashes.length>0) store.loadRecords(recordType, hashes);
    
    return this ;
  },
  

  /**
    Generates an id for the passed record type.  You can override this if 
    needed.  The default generates a storekey and formats it as a string.
    
    @param {Class} recordType Subclass of SC.Record
    @param {Hash} dataHash the data hash for the record
    @param {SC.Store} store the store 
    @param {Number} storeKey store key for the item
    @returns {String}
  */
  generateIdFor: function(recordType, dataHash, store, storeKey) {
    return "@id%@".fmt(SC.Store.generateStoreKey());
  },
  
  /**
    Based on the storeKey it returns the specified fixtures
    
    @param {SC.Store} store the store 
    @param {Number} storeKey the storeKey
    @returns {Hash} data hash or null
  */
  fixtureForStoreKey: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    return fixtures ? fixtures[id] : null;
  },
  
  /**
    Update the data hash fixture for the named store key.  
    
    @param {SC.Store} store the store 
    @param {Number} storeKey the storeKey
    @param {Hash} dataHash 
    @returns {SC.FixturesDataSource} receiver
  */
  setFixtureForStoreKey: function(store, storeKey, dataHash) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    this._invalidateCachesFor(recordType, storeKey, id);
    fixtures[id] = dataHash;
    return this ;
  },
  
  /** 
    Get the fixtures for the passed record type and prepare them if needed.
    Return cached value when complete.
    
    @param {SC.Record} recordType
    @returns {Hash} data hashes
  */
  fixturesFor: function(recordType) {
    // get basic fixtures hash.
    if (!this._fixtures) this._fixtures = {};
    var fixtures = this._fixtures[SC.guidFor(recordType)];
    if (fixtures) return fixtures ; 
    
    // need to load fixtures.
    var dataHashes = recordType ? recordType.FIXTURES : null,
        len        = dataHashes ? dataHashes.length : 0,
        primaryKey = recordType ? recordType.prototype.primaryKey : 'guid',
        idx, dataHash, id ;

    this._fixtures[SC.guidFor(recordType)] = fixtures = {} ; 
    for(idx=0;idx<len;idx++) {      
      dataHash = dataHashes[idx];
      id = dataHash[primaryKey];
      if (!id) id = this.generateIdFor(recordType, dataHash); 
      fixtures[id] = dataHash;
    }  
    return fixtures;
  },
  
  /**
    Returns YES if fixtures for a given recordType have already been loaded
    
    @param {SC.Record} recordType
    @returns {Boolean} storeKeys
  */
  fixturesLoadedFor: function(recordType) {
    if (!this._fixtures) return NO;
    var ret = [], fixtures = this._fixtures[SC.guidFor(recordType)];
    return fixtures ? YES: NO;
  },
  
  /**
    Returns YES or SC.MIXED_STATE if one or more of the storeKeys can be 
    handled by the fixture data source.
    
    @param {Array} storeKeys the store keys
    @returns {Boolean} YES if all handled, MIXED_STATE if some handled
  */
  hasFixturesFor: function(storeKeys) {
    var ret = NO ;
    storeKeys.forEach(function(storeKey) {
      if (ret !== SC.MIXED_STATE) {
        var recordType = SC.Store.recordTypeFor(storeKey),
            fixtures   = recordType ? recordType.FIXTURES : null ;
        if (fixtures && fixtures.length && fixtures.length>0) {
          if (ret === NO) ret = YES ;
        } else if (ret === YES) ret = SC.MIXED_STATE ;
      }
    }, this);
    
    return ret ;
  },
  
  /** @private
    Invalidates any internal caches based on the recordType and optional 
    other parameters.  Currently this only invalidates the storeKeyCache used
    for fetch, but it could invalidate others later as well.
    
    @param {SC.Record} recordType the type of record modified
    @param {Number} storeKey optional store key
    @param {String} id optional record id
    @returns {SC.FixturesDataSource} receiver
  */
  _invalidateCachesFor: function(recordType, storeKey, id) {
    var cache = this._storeKeyCache;
    if (cache) delete cache[SC.guidFor(recordType)];
    return this ;
  }
  
});

/**
  Default fixtures instance for use in applications.
  
  @property {SC.FixturesDataSource}
*/
SC.Record.fixtures = SC.FixturesDataSource.create();

/* >>>>>>>>>> BEGIN source/system/query.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('core') ;
sc_require('models/record');

/**
  @class

  This permits you to perform queries on your data store,
  written in a SQL-like language. Here is a simple example:
    
  {{{
    q = SC.Query.create({
      conditions: "firstName = 'Jonny' AND lastName = 'Cash'"
    })
  }}}
    
  You can check if a certain record matches the query by calling:

  {{{
    q.contains(record)
  }}}
  
  To find all records of your store, that match query q, use findAll with
  query q as argument:
  
  {{{
    r = MyApp.store.findAll(q)
  }}}
  
  r will be a record array containing all matching records.
  To limit the query to a record type of MyApp.MyModel,
  you can specify the type as a property of the query like this:
  
  {{{
    q = SC.Query.create({ 
      conditions: "firstName = 'Jonny' AND lastName = 'Cash'",
      recordType: MyApp.MyModel 
    })
  }}}
  
  Calling find() like above will now return only records of type t.
  It is recommended to limit your query to a record type, since the query will
  have to look for matching records in the whole store, if no record type
  is given.
  
  You can give an order, which the resulting records should follow, like this:
  
  {{{
    q = SC.Query.create({ 
      conditions: "firstName = 'Jonny' AND lastName = 'Cash'",
      recordType: MyApp.MyModel,
      orderBy: "lastName, year DESC" 
    });
  }}}
  
  The default order direction is ascending. You can change it to descending
  by writing DESC behind the property name like in the example above.
  If no order is given, or records are equal in respect to a given order,
  records will be ordered by guid.

  h2. SproutCore Query Language
  
  Features of the query language:
  
  h4. Primitives:

  - record properties
  - null, undefined
  - true, false
  - numbers (integers and floats)
  - strings (double or single quoted)
  
  h4. Parameters:

  - %@ (wild card)
  - {parameterName} (named parameter)

  Wild cards are used to identify parameters by the order in which they appear 
  in the query string. Named parameters can be used when tracking the order 
  becomes difficult. Both types of parameters can be used by giving the 
  parameters as a property to your query object:
  
  {{{
    yourQuery.parameters = yourParameters
  }}}
  
  where yourParameters should have one of the following formats:

    for wild cards: [firstParam, secondParam, thirdParam]
    for named params: {name1: param1, mane2: parma2}

  You cannot use both types of parameters in a single query!
  
  h4. Operators:
  
  - =
  - !=
  - <
  - <=
  - >
  - >=
  - BEGINS_WITH (checks if a string starts with another one)
  - ENDS_WITH   (checks if a string ends with another one)
  - CONTAINS    (checks if a string contains another one, or if an object is in an array)
  - MATCHES     (checks if a string is matched by a regexp,
                you will have to use a parameter to insert the regexp)
  - ANY         (checks if the thing on its left is contained in the array
                on its right, you will have to use a parameter
                to insert the array)
  - TYPE_IS     (unary operator expecting a string containing the name 
                of a Model class on its right side, only records of this type
                will match)
    
  h4. Boolean Operators:
  
  - AND
  - OR
  - NOT
  
  h4. Parenthesis for grouping:
  
  - ( and )


  h2. Adding Your Own Query Handlers

  You can extend the query language with your own operators by calling:

  {{{
    SC.Query.registerQueryExtension('your_operator', your_operator_definition);
  }}}

  See details below. As well you can provide your own comparison functions
  to control ordering of specific record properties like this:

  {{{
    SC.Query.registerComparison(property_name, comparison_for_this_property);
  }}}
  
  h2. Examples
  
  Some example queries:
  
  TODO add examples

  @extends SC.Object
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/

SC.Query = SC.Object.extend(SC.Copyable, SC.Freezable, 
  /** @scope SC.Query.prototype */ {

  // ..........................................................
  // PROPERTIES
  // 
  
  /** 
    Walk like a duck.
    
    @property {Boolean}
  */
  isQuery: YES,
  
  /**
    Unparsed query conditions.  If you are handling a query yourself, then 
    you will find the base query string here.
    
    @property {String}
  */
  conditions:  null,
  
  /**
    Optional orderBy parameters.  This can be a string of keys, optionally
    beginning with the strings "DESC " or "ASC " to select descending or 
    ascending order.
    
    Alternatively, you can specify a comparison function, in which case the
    two records will be sent to it.  Your comparison function, as with any
    other, is expected to return -1, 0, or 1.
    
    @property {String | Function}
  */
  orderBy:     null,
  
  /**
    The base record type or types for the query.  This must be specified to
    filter the kinds of records this query will work on.  You may either 
    set this to a single record type or to an array or set of record types.
    
    @property {SC.Record}
  */
  recordType:  null,
  
  /**
    Optional array of multiple record types.  If the query accepts multiple 
    record types, this is how you can check for it.
    
    @property {SC.Enumerable}
  */
  recordTypes: null,
  
  /**
    Returns the complete set of recordTypes matched by this query.  Includes
    any named recordTypes plus their subclasses.
    
    @property {SC.Enumerable}
  */
  expandedRecordTypes: function() {
    var ret = SC.CoreSet.create(), rt, q  ;
    
    if (rt = this.get('recordType')) this._scq_expandRecordType(rt, ret);      
    else if (rt = this.get('recordTypes')) {
      rt.forEach(function(t) { this._scq_expandRecordType(t, ret); }, this);
    } else this._scq_expandRecordType(SC.Record, ret);

    // save in queue.  if a new recordtype is defined, we will be notified.
    q = SC.Query._scq_queriesWithExpandedRecordTypes;
    if (!q) {
      q = SC.Query._scq_queriesWithExpandedRecordTypes = SC.CoreSet.create();
    }
    q.add(this);
    
    return ret.freeze() ;
  }.property('recordType', 'recordTypes').cacheable(),

  /** @private 
    expands a single record type into the set. called recursively
  */
  _scq_expandRecordType: function(recordType, set) {
    if (set.contains(recordType)) return; // nothing to do
    set.add(recordType);
    
    if (SC.typeOf(recordType)===SC.T_STRING) {
      recordType = SC.objectForPropertyPath(recordType);
    }
    
    recordType.subclasses.forEach(function(t) { 
      this._scq_expandRecordType(t, set);
    }, this);  
  },
  
  /**
    Optional hash of parameters.  These parameters may be interpolated into 
    the query conditions.  If you are handling the query manually, these 
    parameters will not be used.
    
    @property {Hash}
  */
  parameters:  null,
  
  /**
    Indicates the location where the result set for this query is stored.  
    Currently the available options are:
    
    - SC.Query.LOCAL: indicates that the query results will be automatically computed from the in-memory store.
    - SC.Query.REMOTE: indicates that the query results are kept on a remote server and hence must be loaded from the DataSource.
    
    The default setting for this property is SC.Query.LOCAL.  
    
    Note that even if a query location is LOCAL, your DataSource will still
    have its fetch() method called for the query.  For LOCAL queries, you 
    won't need to explicitly provide the query result set; you can just load
    records into the in-memory store as needed and let the query recompute 
    automatically.
    
    If your query location is REMOTE, then your DataSource will need to 
    provide the actual set of query results manually.  Usually you will only 
    need to use a REMOTE query if you are retrieving a large data set and you
    don't want to pay the cost of computing the result set client side.
    
    @property {String}
  */
  location: 'local', // SC.Query.LOCAL
  
  /**
    Another query that will optionally limit the search of records.  This is 
    usually configured for you when you do find() from another record array.
    
    @property {SC.Query}
  */
  scope: null,
  
  
  /**
    Returns YES if query location is Remote.  This is sometimes more 
    convenient than checking the location.
    
    @property {Boolean}
  */
  isRemote: function() {
    return this.get('location') === SC.Query.REMOTE;
  }.property('location').cacheable(),

  /**
    Returns YES if query location is Local.  This is sometimes more 
    convenient than checking the location.
    
    @property {Boolean}
  */
  isLocal: function() {
    return this.get('location') === SC.Query.LOCAL;
  }.property('location').cacheable(),
  
  /**
    Indicates whether a record is editable or not.  Defaults to NO.  Local
    queries should never be made editable.  Remote queries may be editable or
    not depending on the data source.
  */
  isEditable: NO,
  
  // ..........................................................
  // PRIMITIVE METHODS
  // 
  
  /** 
    Returns YES if record is matched by the query, NO otherwise.  This is 
    used when computing a query locally.  
 
    @param {SC.Record} record the record to check
    @param {Hash} parameters optional override parameters
    @returns {Boolean} YES if record belongs, NO otherwise
  */ 
  contains: function(record, parameters) {

    // check the recordType if specified
    var rtype, ret = YES ;    
    if (rtype = this.get('recordTypes')) { // plural form
      ret = rtype.find(function(t) { return SC.kindOf(record, t); });
    } else if (rtype = this.get('recordType')) { // singular
      ret = SC.kindOf(record, rtype);
    }
    
    if (!ret) return NO ; // if either did not pass, does not contain

    // if we have a scope - check for that as well
    var scope = this.get('scope');
    if (scope && !scope.contains(record)) return NO ;
    
    // now try parsing
    if (!this._isReady) this.parse(); // prepare the query if needed
    if (!this._isReady) return NO ;
    if (parameters === undefined) parameters = this.parameters || this;
    
    // if parsing worked we check if record is contained
    // if parsing failed no record will be contained
    return this._tokenTree.evaluate(record, parameters);
  },
  
  /**
    Returns YES if the query matches one or more of the record types in the
    passed set.
    
    @param {SC.Set} types set of record types
    @returns {Boolean} YES if record types match
  */
  containsRecordTypes: function(types) {
    var rtype = this.get('recordType');
    if (rtype) {
      return !!types.find(function(t) { return SC.kindOf(t, rtype); });
    
    } else if (rtype = this.get('recordTypes')) {
      return !!rtype.find(function(t) { 
        return !!types.find(function(t2) { return SC.kindOf(t2,t); });
      });
      
    } else return YES; // allow anything through
  },
  
  /**
    Returns the sort order of the two passed records, taking into account the
    orderBy property set on this query.  This method does not verify that the
    two records actually belong in the query set or not; this is checked using
    contains().
 
    @param {SC.Record} record1 the first record
    @param {SC.Record} record2 the second record
    @returns {Number} -1 if record1 < record2, 
                      +1 if record1 > record2,
                      0 if equal
  */
  compare: function(record1, record2) {
    // IMPORTANT:  THIS CODE IS ALSO INLINED INSIDE OF THE 'compareStoreKeys'
    //             CLASS METHOD.  IF YOU CHANGE THIS IMPLEMENTATION, BE SURE
    //             TO UPDATE IT THERE, TOO.
    //
    // (Any clients overriding this method will have their version called,
    // however.  That's why we'll keep this here; clients might want to
    // override it and call arguments.callee.base.apply(this,arguments)).

    var result = 0, 
        propertyName, order, len, i;

    // fast cases go here
    if (record1 === record2) return 0;
    
    // if called for the first time we have to build the order array
    if (!this._isReady) this.parse();
    if (!this._isReady) { // can't parse. guid is wrong but consistent
      return SC.compare(record1.get('id'),record2.get('id'));
    }
    
    // For every property specified in orderBy until non-eql result is found.
    // Or, if orderBy is a comparison function, simply invoke it with the
    // records.
    order = this._order;
    if (SC.typeOf(order) === SC.T_FUNCTION) {
      result = order.call(null, record1, record2);
    }
    else {
      len   = order ? order.length : 0;
      for (i=0; result===0 && (i < len); i++) {
        propertyName = order[i].propertyName;
        // if this property has a registered comparison use that
        if (SC.Query.comparisons[propertyName]) {
          result = SC.Query.comparisons[propertyName](
                    record1.get(propertyName),record2.get(propertyName));
                  
        // if not use default SC.compare()
        } else {
          result = SC.compare(
                    record1.get(propertyName), record2.get(propertyName) );
        }
      
        if ((result!==0) && order[i].descending) result = (-1) * result;
      }
    }

    // return result or compare by guid
    if (result !== 0) return result ;
    else return SC.compare(record1.get('id'),record2.get('id'));
  },

  /** @private 
      Becomes YES once the query has been successfully parsed 
  */
  _isReady:     NO,
  
  /**
    This method has to be called before the query object can be used.
    You will normaly not have to do this, it will be called automatically
    if you try to evaluate a query.
    You can however use this function for testing your queries.
 
    @returns {Boolean} true if parsing succeeded, false otherwise
  */
  parse: function() {
    var conditions = this.get('conditions'),
        lang       = this.get('queryLanguage'),
        tokens, tree;
        
    tokens = this._tokenList = this.tokenizeString(conditions, lang);
    tree = this._tokenTree = this.buildTokenTree(tokens, lang);
    this._order = this.buildOrder(this.get('orderBy'));
    
    this._isReady = !!tree && !tree.error;
    if (tree && tree.error) throw tree.error;
    return this._isReady;
  },
  
  /**
    Returns the same query but with the scope set to the passed record array.
    This will copy the receiver.  It also stores these queries in a cache to
    reuse them if possible.
    
    @param {SC.RecordArray} recordArray the scope
    @returns {SC.Query} new query
  */
  queryWithScope: function(recordArray) {
    // look for a cached query on record array.
    var key = SC.keyFor('__query__', SC.guidFor(this)),
        ret = recordArray[key];
        
    if (!ret) {
      recordArray[key] = ret = this.copy();
      ret.set('scope', recordArray);
      ret.freeze();
    }
    
    return ret ;
  },
  
  // ..........................................................
  // PRIVATE SUPPORT
  // 

  /** @private
    Properties that need to be copied when cloning the query.
  */
  copyKeys: 'conditions orderBy recordType recordTypes parameters location scope'.w(),
  
  /** @private */
  concatenatedProperties: 'copyKeys'.w(),

  /** @private 
    Implement the Copyable API to clone a query object once it has been 
    created.
  */
  copy: function() {
    var opts = {}, 
        keys = this.get('copyKeys'),
        loc  = keys ? keys.length : 0,
        key, value, ret;
        
    while(--loc >= 0) {
      key = keys[loc];
      value = this.get(key);
      if (value !== undefined) opts[key] = value ;
    }
    
    ret = this.constructor.create(opts);
    opts = null;
    return ret ;
  },

  // ..........................................................
  // QUERY LANGUAGE DEFINITION
  //
  
  
  /**
    This is the definition of the query language. You can extend it
    by using SC.Query.registerQueryExtension().
  */
  queryLanguage: {
    
    'UNKNOWN': {
      firstCharacter:   /[^\s'"\w\d\(\)\{\}]/,
      notAllowed:       /[\s'"\w\d\(\)\{\}]/
    },

    'PROPERTY': {
      firstCharacter:   /[a-zA-Z_]/,
      notAllowed:       /[^a-zA-Z_0-9]/,
      evalType:         'PRIMITIVE',
      
      /** @ignore */
      evaluate:         function (r,w) { return r.get(this.tokenValue); }
    },

    'NUMBER': {
      firstCharacter:   /[\d\-]/,
      notAllowed:       /[^\d\-\.]/,
      format:           /^-?\d+$|^-?\d+\.\d+$/,
      evalType:         'PRIMITIVE',
      
      /** @ignore */
      evaluate:         function (r,w) { return parseFloat(this.tokenValue); }
    },

    'STRING': {
      firstCharacter:   /['"]/,
      delimeted:        true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return this.tokenValue; }
    },

    'PARAMETER': {
      firstCharacter:   /\{/,
      lastCharacter:    '}',
      delimeted:        true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return w[this.tokenValue]; }
    },

    '%@': {
      rememberCount:    true,
      reservedWord:     true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return w[this.tokenValue]; }
    },

    'OPEN_PAREN': {
      firstCharacter:   /\(/,
      singleCharacter:  true
    },

    'CLOSE_PAREN': {
      firstCharacter:   /\)/,
      singleCharacter:  true
    },

    'AND': {
      reservedWord:     true,
      leftType:         'BOOLEAN',
      rightType:        'BOOLEAN',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left && right;
                        }
    },

    'OR': {
      reservedWord:     true,
      leftType:         'BOOLEAN',
      rightType:        'BOOLEAN',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left || right;
                        }
    },

    'NOT': {
      reservedWord:     true,
      rightType:        'BOOLEAN',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var right = this.rightSide.evaluate(r,w);
                          return !right;
                        }
    },

    '=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return SC.isEqual(left, right); 
                        }
    },

    '!=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return !SC.isEqual(left, right); 
                        }
    },

    '<': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return SC.compare(left, right) == -1; //left < right;
                        }
    },

    '<=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return SC.compare(left, right) != 1; //left <= right;
                        }
    },

    '>': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return SC.compare(left, right) == 1; //left > right;
                        }
    },

    '>=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return SC.compare(left, right) != -1; //left >= right;
                        }
    },

    'BEGINS_WITH': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var all   = this.leftSide.evaluate(r,w);
                          var start = this.rightSide.evaluate(r,w);
                          return ( all && all.indexOf(start) === 0 );
                        }
    },

    'ENDS_WITH': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var all = this.leftSide.evaluate(r,w);
                          var end = this.rightSide.evaluate(r,w);
                          return ( all && all.indexOf(end) === (all.length - end.length) );
                        }
    },

    'CONTAINS': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
        evaluate:       function (r,w) {
                          var all    = this.leftSide.evaluate(r,w) || [];
                          var value = this.rightSide.evaluate(r,w);
                          switch(SC.typeOf(all)) {
                            case SC.T_STRING:
                              return (all.indexOf(value) !== -1); 
                            case SC.T_ARRAY:
                              var found  = false;
                              var i      = 0;
                              while ( found===false && i<all.length ) {
                                if ( value == all[i] ) found = true;
                                i++;
                              }
                              return found;
                            default:
                              //do nothing
                              break;
                          }
                        }
    },

    'ANY': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var prop   = this.leftSide.evaluate(r,w);
                          var values = this.rightSide.evaluate(r,w);
                          var found  = false;
                          var i      = 0;
                          while ( found===false && i<values.length ) {
                            if ( prop == values[i] ) found = true;
                            i++;
                          }
                          return found;
                        }
    },

    'MATCHES': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var toMatch = this.leftSide.evaluate(r,w);
                          var matchWith = this.rightSide.evaluate(r,w);
                          return matchWith.test(toMatch);
                        }
    },

    'TYPE_IS': {
      reservedWord:     true,
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',

      /** @ignore */
      evaluate:         function (r,w) {
                          var actualType = SC.Store.recordTypeFor(r.storeKey);
                          var right      = this.rightSide.evaluate(r,w);
                          var expectType = SC.objectForPropertyPath(right);
                          return actualType == expectType;
                        }
    },

    'null': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return null; }
    },

    'undefined': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return undefined; }
    },

    'false': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return false; }
    },

    'true': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return true; }
    },
    
    'YES': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return true; }
    },
    
    'NO': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',

      /** @ignore */
      evaluate:         function (r,w) { return false; }
    }
    
  },
  

  // ..........................................................
  // TOKENIZER
  //
  
  
  /**
    Takes a string and tokenizes it based on the grammar definition
    provided. Called by parse().
    
    @param {String} inputString the string to tokenize
    @param {Object} grammar the grammar definition (normally queryLanguage)
    @returns {Array} list of tokens
  */
  tokenizeString: function (inputString, grammar) {
	
	
    var tokenList           = [],
        c                   = null,
        t                   = null,
        token               = null,
        tokenType           = null,
        currentToken        = null,
        currentTokenType    = null,
        currentTokenValue   = null,
        currentDelimeter    = null,
        endOfString         = false,
        endOfToken          = false,
        belongsToToken      = false,
        skipThisCharacter   = false,
        rememberCount       = {};
  
  
    // helper function that adds tokens to the tokenList
  
    function addToken (tokenType, tokenValue) {
      t = grammar[tokenType];
      //tokenType = t.tokenType;
      
      // handling of special cases
      // check format
      if (t.format && !t.format.test(tokenValue)) tokenType = "UNKNOWN";
      // delimeted token (e.g. by ")
      if (t.delimeted) skipThisCharacter = true;
      
      // reserved words
      if ( !t.delimeted ) {
        for ( var anotherToken in grammar ) {
          if ( grammar[anotherToken].reservedWord
               && anotherToken == tokenValue ) {
            tokenType = anotherToken;
          }
        }
      }
      
      // reset t
      t = grammar[tokenType];
      // remembering count type
      if ( t && t.rememberCount ) {
        if (!rememberCount[tokenType]) rememberCount[tokenType] = 0;
        tokenValue = rememberCount[tokenType];
        rememberCount[tokenType] += 1;
      }

      // push token to list
      tokenList.push( {tokenType: tokenType, tokenValue: tokenValue} );

      // and clean up currentToken
      currentToken      = null;
      currentTokenType  = null;
      currentTokenValue = null;
    }
  
  
    // stepping through the string:
    
    if (!inputString) return [];
    
    var iStLength = inputString.length;
    
    for (var i=0; i < iStLength; i++) {
      
      // end reached?
      endOfString = (i===iStLength-1);
      
      // current character
      c = inputString.charAt(i);
    
      // set true after end of delimeted token so that
      // final delimeter is not catched again
      skipThisCharacter = false;
        
    
      // if currently inside a token
    
      if ( currentToken ) {
      
        // some helpers
        t = grammar[currentToken];
        endOfToken = t.delimeted ? c===currentDelimeter : t.notAllowed.test(c);
      
        // if still in token
        if ( !endOfToken ) currentTokenValue += c;
      
        // if end of token reached
        if (endOfToken || endOfString) {
          addToken(currentToken, currentTokenValue);
        }
      
        // if end of string don't check again
        if ( endOfString && !endOfToken ) skipThisCharacter = true;
      }
    
      // if not inside a token, look for next one
    
      if ( !currentToken && !skipThisCharacter ) {
        // look for matching tokenType
        for ( token in grammar ) {
          t = grammar[token];
          if (t.firstCharacter && t.firstCharacter.test(c)) {
            currentToken = token;
          }
        }

        // if tokenType found
        if ( currentToken ) {
          t = grammar[currentToken];
          currentTokenValue = c;
          // handling of special cases
          if ( t.delimeted ) {
            currentTokenValue = "";
            if ( t.lastCharacter ) currentDelimeter = t.lastCharacter;
            else currentDelimeter = c;
          }

          if ( t.singleCharacter || endOfString ) {
            addToken(currentToken, currentTokenValue);
          }
        }
      }
    }
    
    return tokenList;
  },
  
  
  
  // ..........................................................
  // BUILD TOKEN TREE
  //
  
  /**
    Takes an array of tokens and returns a tree, depending on the
    specified tree logic. The returned object will have an error property
    if building of the tree failed. Check it to get some information
    about what happend.
    If everything worked the tree can be evaluated by calling:
    
      tree.evaluate(record, parameters)
    
    If tokenList is empty, a single token will be returned which will
    evaluate to true for all records.
    
    @param {Array} tokenList the list of tokens
    @param {Object} treeLogic the logic definition (normally queryLanguage)
    @returns {Object} token tree
  */
  buildTokenTree: function (tokenList, treeLogic) {
  
    var l                    = tokenList.slice();
    var i                    = 0;
    var openParenthesisStack = [];
    var shouldCheckAgain     = false;
    var error                = [];
    
  
    // empty tokenList is a special case
    if (!tokenList || tokenList.length === 0) {
      return { evaluate: function(){ return true; } };
    }
  
  
    // some helper functions
  
    function tokenLogic (position) {
      var p = position;
      if ( p < 0 ) return false;
      
      var tl = treeLogic[l[p].tokenType];
      
      if ( ! tl ) {
        error.push("logic for token '"+l[p].tokenType+"' is not defined");
        return false;
      }

      // save evaluate in token, so that we don't have
      // to look it up again when evaluating the tree
      l[p].evaluate = tl.evaluate;
      return tl;
    }
  
    function expectedType (side, position) {
      var p = position;
      var tl = tokenLogic(p);
      if ( !tl )            return false;
      if (side == 'left')   return tl.leftType;
      if (side == 'right')  return tl.rightType;
    }
  
    function evalType (position) {
      var p = position;
      var tl = tokenLogic(p);
      if ( !tl )  return false;
      else        return tl.evalType;
    }
  
    function removeToken (position) {
      l.splice(position, 1);
      if ( position <= i ) i--;
    }
  
    function preceedingTokenExists (position) {
      var p = position || i;
      if ( p > 0 )  return true;
      else          return false;
    }
  
    function tokenIsMissingChilds (position) {
      var p = position;
      if ( p < 0 )  return true;
      return (expectedType('left',p) && !l[p].leftSide)
          || (expectedType('right',p) && !l[p].rightSide);
    }
  
    function typesAreMatching (parent, child) {
      var side = (child < parent) ? 'left' : 'right';
      if ( parent < 0 || child < 0 )                      return false;
      if ( !expectedType(side,parent) )                   return false;
      if ( !evalType(child) )                             return false;
      if ( expectedType(side,parent) == evalType(child) ) return true;
      else                                                return false;
    }
  
    function preceedingTokenCanBeMadeChild (position) {
      var p = position;
      if ( !tokenIsMissingChilds(p) )   return false;
      if ( !preceedingTokenExists(p) )  return false;
      if ( typesAreMatching(p,p-1) )    return true;
      else                              return false;
    }
  
    function preceedingTokenCanBeMadeParent (position) {
      var p = position;
      if ( tokenIsMissingChilds(p) )    return false;
      if ( !preceedingTokenExists(p) )  return false;
      if ( !tokenIsMissingChilds(p-1) ) return false;
      if ( typesAreMatching(p-1,p) )    return true;
      else                              return false;
    }
  
    function makeChild (position) {
      var p = position;
      if (p<1) return false;
      l[p].leftSide = l[p-1];
      removeToken(p-1);
    }
  
    function makeParent (position) {
      var p = position;
      if (p<1) return false;
      l[p-1].rightSide = l[p];
      removeToken(p);
    }
  
    function removeParenthesesPair (position) {
      removeToken(position);
      removeToken(openParenthesisStack.pop());
    }
  
    // step through the tokenList
  
    for (i=0; i < l.length; i++) {
      shouldCheckAgain = false;
    
      if ( l[i].tokenType == 'UNKNOWN' ) {
        error.push('found unknown token: '+l[i].tokenValue);
      }
      
      if ( l[i].tokenType == 'OPEN_PAREN' ) openParenthesisStack.push(i);
      if ( l[i].tokenType == 'CLOSE_PAREN' ) removeParenthesesPair(i);
      
      if ( preceedingTokenCanBeMadeChild(i) ) makeChild(i);
      
      if ( preceedingTokenCanBeMadeParent(i) ){
        makeParent(i);
        shouldCheckAgain = true;
      } 
      
      if ( shouldCheckAgain ) i--;
    
    }
  
    // error if tokenList l is not a single token now
    if (l.length == 1) l = l[0];
    else error.push('string did not resolve to a single tree');
  
    // error?
    if (error.length > 0) return {error: error.join(',\n'), tree: l};
    // everything fine - token list is now a tree and can be returned
    else return l;
  
  },
  
  
  // ..........................................................
  // ORDERING
  //
  
  /**
    Takes a string containing an order statement and returns an array
    describing this order for easier processing.
    Called by parse().
    
    @param {String | Function} orderOp the string containing the order statement, or a comparison function
    @returns {Array | Function} array of order statement, or a function if a function was specified
  */
  buildOrder: function (orderOp) {
    if (!orderOp) {
      return [];
    }
    else if (SC.typeOf(orderOp) === SC.T_FUNCTION) {
      return orderOp;
    }
    else {
      var o = orderOp.split(',');
      for (var i=0; i < o.length; i++) {
        var p = o[i];
        p = p.replace(/^\s+|\s+$/,'');
        p = p.replace(/\s+/,',');
        p = p.split(',');
        o[i] = {propertyName: p[0]};
        if (p[1] && p[1] == 'DESC') o[i].descending = true;
      }
      
      return o;
    }
    
  }

});


// Class Methods
SC.Query.mixin( /** @scope SC.Query */ {

  /** 
    Constant used for SC.Query#location
  
    @property {String}
  */
  LOCAL: 'local',
  
  /** 
    Constant used for SC.Query#location 
    
    @property {String}
  */
  REMOTE: 'remote',
  
  /**
    Given a query, returns the associated storeKey.  For the inverse of this 
    method see SC.Store.queryFor().
    
    @param {SC.Query} query the query
    @returns {Number} a storeKey.
  */
  storeKeyFor: function(query) {
    return query ? query.get('storeKey') : null;
  },
  
  /**
    Will find which records match a give SC.Query and return an array of 
    store keys. This will also apply the sorting for the query.
    
    @param {SC.Query} query to apply
    @param {SC.RecordArray} records to search within
    @param {SC.Store} store to materialize record from
    @returns {Array} array instance of store keys matching the SC.Query (sorted)
  */
  containsRecords: function(query, records, store) {
    var ret = [];
    for(var idx=0,len=records.get('length');idx<len;idx++) {
      var record = records.objectAt(idx);
      if(record && query.contains(record)) {
        ret.push(record.get('storeKey'));
      }
    }
    
    ret = SC.Query.orderStoreKeys(ret, query, store);
    
    return ret;
  },
  
  /** 
    Sorts a set of store keys according to the orderBy property
    of the SC.Query.
    
    @param {Array} storeKeys to sort
    @param {SC.Query} query to use for sorting
    @param {SC.Store} store to materialize records from
    @returns {Array} sorted store keys.  may be same instance as passed value
  */
  orderStoreKeys: function(storeKeys, query, store) {
    // apply the sort if there is one
    if (storeKeys) {
      
      // Set tmp variable because we can't pass variables to sort function.
      // Do this instead of generating a temporary closure function for perf.
      // We'll use a stack-based approach in case our sort routine ends up
      // calling code that triggers a recursive invocation of orderStoreKeys.
      var K           = SC.Query,
          tempStores  = K._TMP_STORES,
          tempQueries = K._TMP_QUERIES;
      if (!tempStores)  tempStores  = K._TMP_STORES = [];
      if (!tempQueries) tempQueries = K._TMP_QUERIES = [];
      
      tempStores.push(store);
      tempQueries.push(query);
        
      var res = storeKeys.sort(SC.Query.compareStoreKeys);
      
      K._TMP_STORES.pop();
      K._TMP_QUERIES.pop();
    }

    return storeKeys;
  },
  
  /** 
    Default sort method that is used when calling containsStoreKeys()
    or containsRecords() on this query. Simply materializes two records based 
    on storekeys before passing on to compare() .
 
    @param {Number} storeKey1 a store key
    @param {Number} storeKey2 a store key
    @returns {Number} -1 if record1 < record2,  +1 if record1 > record2, 0 if equal
  */
  compareStoreKeys: function(storeKey1, storeKey2) {
    var K           = SC.Query,
        tempStores  = K._TMP_STORES,
        tempQueries = K._TMP_QUERIES,
        store       = tempStores[tempStores.length - 1],
        query       = tempQueries[tempQueries.length - 1],
        compareFunc = query.compare,
        record1     = store.materializeRecord(storeKey1),
        record2     = store.materializeRecord(storeKey2);

    // If the query implements a custom 'compare' function, then use it.
    // Otherwise, we have the logic from the standard version inlined here.
    if (compareFunc !== K.prototype.compare) {
      return compareFunc.call(query, record1, record2);
    }
    else {
      // THIS CODE IS THE SAME AS THE 'compare' METHOD, EXCEPT THAT 'this' HAS
      // BEEN CHANGED TO 'query'.
      //
      // It is inlined here to avoid the extra method invocation in the
      // typical case where the client does not supply a custom 'compare'
      // function.
      
      var result = 0, 
          propertyName, order, len, i;

      // fast cases go here
      if (record1 === record2) return 0;
    
      // if called for the first time we have to build the order array
      if (!query._isReady) query.parse();
      if (!query._isReady) { // can't parse. guid is wrong but consistent
        return SC.compare(record1.get('id'),record2.get('id'));
      }
    
      // For every property specified in orderBy until non-eql result is found.
      // Or, if orderBy is a comparison function, simply invoke it with the
      // records.
      order = query._order;
      if (SC.typeOf(order) === SC.T_FUNCTION) {
        result = order.call(null, record1, record2);
      }
      else {
        len   = order ? order.length : 0;
        for (i=0; result===0 && (i < len); i++) {
          propertyName = order[i].propertyName;
          // if query property has a registered comparison use that
          if (SC.Query.comparisons[propertyName]) {
            result = SC.Query.comparisons[propertyName](
                      record1.get(propertyName),record2.get(propertyName));
                  
          // if not use default SC.compare()
          } else {
            result = SC.compare(
                      record1.get(propertyName), record2.get(propertyName) );
          }
      
          if ((result!==0) && order[i].descending) result = (-1) * result;
        }
      }

      // return result or compare by guid
      if (result !== 0) return result ;
      else return SC.compare(record1.get('id'),record2.get('id'));
    }
  },
  
  /**
    Returns a SC.Query instance reflecting the passed properties.  Where 
    possible this method will return cached query instances so that multiple 
    calls to this method will return the same instance.  This is not possible 
    however, when you pass custom parameters or set ordering. All returned 
    queries are frozen.
    
    Usually you will not call this method directly.  Instead use the more
    convenient SC.Query.local() and SC.Query.remote().
    
    h2. Examples
    
    There are a number of different ways you can call this method.  
    
    The following return local queries selecting all records of a particular 
    type or types, including any subclasses:
    
    {{{
      var people = SC.Query.local(Ab.Person);
      var peopleAndCompanies = SC.Query.local([Ab.Person, Ab.Company]);
      
      var people = SC.Query.local('Ab.Person');
      var peopleAndCompanies = SC.Query.local('Ab.Person Ab.Company'.w());
      
      var allRecords = SC.Query.local(SC.Record);
    }}} 
    
    The following will match a particular type of condition:
    
    {{{
      var married = SC.Query.local(Ab.Person, "isMarried=YES");
      var married = SC.Query.local(Ab.Person, "isMarried=%@", [YES]);
      var married = SC.Query.local(Ab.Person, "isMarried={married}", {
        married: YES
      });
    }}}
    
    You can also pass a hash of options as the second parameter.  This is 
    how you specify an order, for example:
    
    {{{
      var orderedPeople = SC.Query.local(Ab.Person, { orderBy: "firstName" });
    }}}
    
    @param {String} location the query location.
    @param {SC.Record|Array} recordType the record type or types.
    @param {String} conditions optional conditions
    @param {Hash} params optional params. or pass multiple args.
    @returns {SC.Query}
  */
  build: function(location, recordType, conditions, params) {
    
    var opts = null,
        ret, cache, key, tmp;
    
    // fast case for query objects.
    if (recordType && recordType.isQuery) { 
      if (recordType.get('location') === location) return recordType;
      else return recordType.copy().set('location', location).freeze();
    }
    
    // normalize recordType
    if (typeof recordType === SC.T_STRING) {
      ret = SC.objectForPropertyPath(recordType);
      if (!ret) throw "%@ did not resolve to a class".fmt(recordType);
      recordType = ret ;
    } else if (recordType && recordType.isEnumerable) {
      ret = [];
      recordType.forEach(function(t) {
        if (typeof t === SC.T_STRING) t = SC.objectForPropertyPath(t);
        if (!t) throw "cannot resolve record types: %@".fmt(recordType);
        ret.push(t);
      }, this);
      recordType = ret ;
    } else if (!recordType) recordType = SC.Record; // find all records
    
    if (params === undefined) params = null;
    if (conditions === undefined) conditions = null;

    // normalize other params. if conditions is just a hash, treat as opts
    if (!params && (typeof conditions !== SC.T_STRING)) {
      opts = conditions;
      conditions = null ;
    }
    
    // special case - easy to cache.
    if (!params && !opts) {

      tmp = SC.Query._scq_recordTypeCache;
      if (!tmp) tmp = SC.Query._scq_recordTypeCache = {};
      cache = tmp[location];
      if (!cache) cache = tmp[location] = {}; 
      
      if (recordType.isEnumerable) {
        key = recordType.map(function(k) { return SC.guidFor(k); });
        key = key.sort().join(':');
      } else key = SC.guidFor(recordType);
      
      if (conditions) key = [key, conditions].join('::');
      
      ret = cache[key];
      if (!ret) {
        if (recordType.isEnumerable) {
          opts = { recordTypes: recordType.copy() };
        } else opts = { recordType: recordType };
        
        opts.location = location ;
        opts.conditions = conditions ;
        ret = cache[key] = SC.Query.create(opts).freeze();
      }
    // otherwise parse extra conditions and handle them
    } else {

      if (!opts) opts = {};
      if (!opts.location) opts.location = location ; // allow override

      // pass one or more recordTypes.
      if (recordType && recordType.isEnumerable) {
        opts.recordsTypes = recordType;
      } else opts.recordType = recordType;

      // set conditions and params if needed
      if (conditions) opts.conditions = conditions;
      if (params) opts.parameters = params;

      ret = SC.Query.create(opts).freeze();
    }
    
    return ret ;
  },
  
  /**
    Returns a LOCAL query with the passed options.  For a full description of
    the parameters you can pass to this method, see SC.Query.build().
  
    @param {SC.Record|Array} recordType the record type or types.
    @param {String} conditions optional conditions
    @param {Hash} params optional params. or pass multiple args.
    @returns {SC.Query}
  */
  local: function(recordType, conditions, params) {
    return this.build(SC.Query.LOCAL, recordType, conditions, params);
  },
  
  /**
    Returns a REMOTE query with the passed options.  For a full description of
    the parameters you can pass to this method, see SC.Query.build().
    
    @param {SC.Record|Array} recordType the record type or types.
    @param {String} conditions optional conditions
    @param {Hash} params optional params. or pass multiple args.
    @returns {SC.Query}
  */
  remote: function(recordType, conditions, params) {
    return this.build(SC.Query.REMOTE, recordType, conditions, params);
  },
  
  /** @private 
    called by SC.Record.extend(). invalided expandedRecordTypes
  */
  _scq_didDefineRecordType: function() {
    var q = SC.Query._scq_queriesWithExpandedRecordTypes;
    if (q) {
      q.forEach(function(query) { 
        query.notifyPropertyChange('expandedRecordTypes');
      }, this);
      q.clear();
    }
  }
  
});


/** @private
  Hash of registered comparisons by propery name. 
*/
SC.Query.comparisons = {};

/**
  Call to register a comparison for a specific property name.
  The function you pass should accept two values of this property
  and return -1 if the first is smaller than the second,
  0 if they are equal and 1 if the first is greater than the second.
  
  @param {String} name of the record property
  @param {Function} custom comparison function
  @returns {SC.Query} receiver
*/
SC.Query.registerComparison = function(propertyName, comparison) {
  SC.Query.comparisons[propertyName] = comparison;
};


/**
  Call to register an extension for the query language.
  You shoud provide a name for your extension and a definition
  specifying how it should be parsed and evaluated.
  
  Have a look at queryLanguage for examples of definitions.
  
  TODO add better documentation here
  
  @param {String} tokenName name of the operator
  @param {Object} token extension definition
  @returns {SC.Query} receiver
*/
SC.Query.registerQueryExtension = function(tokenName, token) {
  SC.Query.prototype.queryLanguage[tokenName] = token;
};

// shorthand
SC.Q = SC.Query.from ;


/* >>>>>>>>>> BEGIN source/models/child_record.js */
// ..........................................................
// SC.ChildRecord
// 

sc_require('core');
sc_require('models/record');
sc_require('system/query'); // FIXME: [EG] some wonky build order crap here...

/**
 * An extension of SC.Record. We use this as the superclass for child record types 
 *
 * @extends SC.Record
 * @author Evin Grano
 * @author Sean Eidemiller
 *
 * @version Sproutcore 1.0
 * @since Sproutcore 1.0
 */
 
SC.ChildRecord = SC.Record.extend(
  /** @scope SC.ChildRecord.prototype */ {
  
  /**
   * This is a check to see if this is a ChildRecord
   */
  isChildRecord: YES,
  
  /**
   * The type of the child record.
   *
   * This will be set by subclasses that require a type attribute.
   */
  type: null,
  
  /**
   *
   */
  primaryKey: 'childRecordKey',
  
  /**
   * The immediate parent of the child record.
   */
  _parentRecord: null,
  
  /**
    All child records will have a life cycle that mirrors as they are created or 
    loaded into memory, modified, committed and finally destroyed.  This life 
    cycle is managed by the status property on your record. 

    The status of a record is modelled as a finite state machine.  Based on the 
    current state of the record, you can determine which operations are 
    currently allowed on the record and which are not.
    
    In general, a record can be in one of five primary states; SC.Record.EMPTY,
    SC.Record.BUSY, SC.Record.READY, SC.Record.DESTROYED, SC.Record.ERROR. 
    These are all described in more detail in the class mixin (in record.js) where 
    they are defined.
    
    @property {Number}
  */
  status: function() {
    var pStatus = SC.Record.EMPTY;
    if (this._parentRecord) {
      pStatus = this._parentRecord.get('status');
      this.store.writeStatus(this.storeKey, pStatus);
      this.store.dataHashDidChange(this.storeKey);
    } else {
      pStatus = this.store.readStatus(this.storeKey);
    }
    return pStatus;
  }.property('storeKey').cacheable(),
  
  
  /**
   * Marks the record as dirty.
   *
   * Invokes the parent's recordDidChange() function until it gets to an SC.Record instance, at
   * which point the record is marked as dirty in the store.
   */
  recordDidChange: function() {
    if (this._parentRecord && this._parentRecord.recordDidChange) {
      this._parentRecord.recordDidChange();
    }
    else{
      arguments.callee.base.apply(this,arguments);
    }
  },
  
  /**
   * Creates a new child record using the parent of *this* child record.
   * all the way up to the base parent record.  This is to give access to 
   * all the children in a root parent tree  
   */
  createChildRecord: function(recordType, hash) {
    var ret, myParent = this._parentRecord;
  
    if (myParent) {
      ret = myParent.createChildRecord(recordType, hash);
    } else {
      ret = arguments.callee.base.apply(this,arguments);
    }
  
    return ret;
  }  
});

/* >>>>>>>>>> BEGIN source/models/record_attribute.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/child_record');

/** @class

  A RecordAttribute describes a single attribute on a record.  It is used to
  generate computed properties on records that can automatically convert data
  types and verify data.
  
  When defining an attribute on an SC.Record, you can configure it this way: 
  
  {{{
    title: SC.Record.attr(String, { 
      defaultValue: 'Untitled',
      isRequired: YES|NO
    })
  }}}
  
  In addition to having predefined transform types, there is also a way to 
  set a computed relationship on an attribute. A typical example of this would
  be if you have record with a parentGuid attribute, but are not able to 
  determine which record type to map to before looking at the guid (or any
  other attributes). To set up such a computed property, you can attach a 
  function in the attribute definition of the SC.Record subclass:
  
  {{{
    relatedToComputed: SC.Record.toOne(function() {
      return (this.readAttribute('relatedToComputed').indexOf("foo")==0) ? MyApp.Foo : MyApp.Bar;
    })
  }}}
  
  Notice that we are not using .get() to avoid another transform which would 
  trigger an infinite loop.
  
  You usually will not work with RecordAttribute objects directly, though you
  may extend the class in any way that you like to create a custom attribute.

  A number of default RecordAttribute types are defined on the SC.Record.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.RecordAttribute = SC.Object.extend(
  /** @scope SC.RecordAttribute.prototype */ {

  /**
    The default value.  If attribute is null or undefined, this default value
    will be substituted instead.  Note that defaultValues are not converted
    so the value should be in the output type expected by the attribute.
    
    If you use a defaultValue function, the arguments given to it is the
    record instance and the key.
    
    @property {Object|function}
  */
  defaultValue: null,
  
  /**
    The attribute type.  Must be either an object class or a property path
    naming a class.  The built in handler allows all native types to pass 
    through, converts records to ids and dates to UTF strings.
    
    If you use the attr() helper method to create a RecordAttribute instance,
    it will set this property to the first parameter you pass.
    
    @property {Object|String}
  */
  type: String,
  
  /**
    The underlying attribute key name this attribute should manage.  If this
    property is left empty, then the key will be whatever property name this
    attribute assigned to on the record.  If you need to provide some kind
    of alternate mapping, this provides you a way to override it.
    
    @property {String}
  */
  key: null,
  
  /**
    If YES, then the attribute is required and will fail validation unless
    the property is set to a non-null or undefined value.
    
    @property {Boolean}
  */
  isRequired: NO,
  
  /**
    If NO then attempts to edit the attribute will be ignored.
    
    @property {Boolean}
  */
  isEditable: YES,  
  
  /**
    If set when using the Date format, expect the ISO8601 date format.  
    This is the default.
    
    @property {Boolean}
  */
  useIsoDate: YES,
  
  /**
    Can only be used for toOne or toMany relationship attributes. If YES,
    this flag will ensure that any related objects will also be marked
    dirty when this record dirtied. 
    
    Useful when you might have multiple related objects that you want to 
    consider in an 'aggregated' state. For instance, by changing a child
    object (image) you might also want to automatically mark the parent 
    (album) dirty as well.
    
    @property {Boolean}
  */
  aggregate: NO,
  
  // ..........................................................
  // HELPER PROPERTIES
  // 
  
  /**
    Returns the type, resolved to a class.  If the type property is a regular
    class, returns the type unchanged.  Otherwise attempts to lookup the 
    type as a property path.
    
    @property {Object}
  */
  typeClass: function() {
    var ret = this.get('type');
    if (SC.typeOf(ret) === SC.T_STRING) ret = SC.objectForPropertyPath(ret);
    return ret ;
  }.property('type').cacheable(),
  
  /**
    Finds the transform handler. 
    
    @property {Function}
  */
  transform: function() {
    var klass      = this.get('typeClass') || String,
        transforms = SC.RecordAttribute.transforms,
        ret ;
        
    // walk up class hierarchy looking for a transform handler
    while(klass && !(ret = transforms[SC.guidFor(klass)])) {
      // check if super has create property to detect SC.Object's
      if(klass.superclass.hasOwnProperty('create')) klass = klass.superclass ;
      // otherwise return the function transform handler
      else klass = SC.T_FUNCTION ;
    }
    
    return ret ;
  }.property('typeClass').cacheable(),
  
  // ..........................................................
  // LOW-LEVEL METHODS
  // 
  
  /** 
    Converts the passed value into the core attribute value.  This will apply 
    any format transforms.  You can install standard transforms by adding to
    the SC.RecordAttribute.transforms hash.  See 
    SC.RecordAttribute.registerTransform() for more.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  toType: function(record, key, value) {
    var transform = this.get('transform'),
        type      = this.get('typeClass');
    
    if (transform && transform.to) {
      value = transform.to(value, this, type, record, key) ;
    }
    return value ;
  },

  /** 
    Converts the passed value from the core attribute value.  This will apply 
    any format transforms.  You can install standard transforms by adding to
    the SC.RecordAttribute.transforms hash.  See 
    SC.RecordAttribute.registerTransform() for more.

    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  fromType: function(record, key, value) {
    var transform = this.get('transform'),
        type      = this.get('typeClass');
    
    if (transform && transform.from) {
      value = transform.from(value, this, type, record, key);
    }
    return value;
  },

  /**
    The core handler.  Called from the property.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key, nvalue;
    
    if ((value !== undefined) && this.get('isEditable')) {
      // careful: don't overwrite value here.  we want the return value to 
      // cache.
      nvalue = this.fromType(record, key, value) ; // convert to attribute.
      record.writeAttribute(attrKey, nvalue); 
    } 

    nvalue = value = record.readAttribute(attrKey);
    if (SC.none(value) && (value = this.get('defaultValue'))) {
       if (typeof value === SC.T_FUNCTION) {
        nvalue = this.defaultValue(record, key, this);
        // write default value so it doesn't have to be executed again
        if ((nvalue !== value)  &&  record.get('store').readDataHash(record.get('storeKey'))) {
          value = nvalue;
          record.writeAttribute(attrKey, value, true);
        }
      }
    } else value = this.toType(record, key, value);
    
    return value ;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private - Make this look like a property so that get() will call it. */
  isProperty: YES,
  
  /** @private - Make this look cacheable */
  isCacheable: YES,
  
  /** @private - needed for KVO property() support */
  dependentKeys: [],
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    // setup some internal properties needed for KVO - faking 'cacheable'
    this.cacheKey = "__cache__" + SC.guidFor(this) ;
    this.lastSetValueKey = "__lastValue__" + SC.guidFor(this) ;
  }
  
}) ;

// ..........................................................
// CLASS METHODS
// 

/**
  The default method used to create a record attribute instance.  Unlike 
  create(), takes an attributeType as the first parameter which will be set 
  on the attribute itself.  You can pass a string naming a class or a class
  itself.
  
  @param {Object|String} attributeType the assumed attribute type
  @param {Hash} opts optional additional config options
  @returns {SC.RecordAttribute} new instance
*/
SC.RecordAttribute.attr = function(attributeType, opts) {
  if (!opts) opts = {} ;
  if (!opts.type) opts.type = attributeType || String ;
  return this.create(opts);
};

/** @private
  Hash of registered transforms by class guid. 
*/
SC.RecordAttribute.transforms = {};

/**
  Call to register a transform handler for a specific type of object.  The
  object you pass can be of any type as long as it responds to the following
  methods:

  | *to(value, attr, klass, record, key)* | converts the passed value (which will be of the class expected by the attribute) into the underlying attribute value |
  | *from(value, attr, klass, record, key)* | converts the underyling attribute value into a value of the class |
  
  @param {Object} klass the type of object you convert
  @param {Object} transform the transform object
  @returns {SC.RecordAttribute} receiver
*/
SC.RecordAttribute.registerTransform = function(klass, transform) {
  SC.RecordAttribute.transforms[SC.guidFor(klass)] = transform;
};

// ..........................................................
// STANDARD ATTRIBUTE TRANSFORMS
// 

// Object, String, Number just pass through.

/** @private - generic converter for Boolean records */
SC.RecordAttribute.registerTransform(Boolean, {
  /** @private - convert an arbitrary object value to a boolean */
  to: function(obj) {
    return SC.none(obj) ? null : !!obj;
  }
});

/** @private - generic converter for Numbers */
SC.RecordAttribute.registerTransform(Number, {
  /** @private - convert an arbitrary object value to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
});

/** @private - generic converter for Strings */
SC.RecordAttribute.registerTransform(String, {
  /** @private - 
    convert an arbitrary object value to a String 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
});

/** @private - generic converter for Array */
SC.RecordAttribute.registerTransform(Array, {
  /** @private - check if obj is an array
  */
  to: function(obj) {
    if (!SC.isArray(obj) && !SC.none(obj)) {
      obj = [];
    }
    return obj;
  }
});

/** @private - generic converter for Object */
SC.RecordAttribute.registerTransform(Object, {
  /** @private - check if obj is an object */
  to: function(obj) {
    if (!(typeof obj === 'object') && !SC.none(obj)) {
      obj = {};
    }
    return obj;
  }
});

/** @private - generic converter for SC.Record-type records */
SC.RecordAttribute.registerTransform(SC.Record, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    var store = parentRecord.get('store');
    if (SC.none(id) || (id==="")) return null;
    else return store.find(recordType, id);
  },
  
  /** @private - convert a record instance to a record id */
  from: function(record) { return record ? record.get('id') : null; }
});

/** @private - generic converter for transforming computed record attributes */
SC.RecordAttribute.registerTransform(SC.T_FUNCTION, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    recordType = recordType.apply(parentRecord);
    var store = parentRecord.get('store');
    return store.find(recordType, id);
  },
  
  /** @private - convert a record instance to a record id */
  from: function(record) { return record.get('id'); }
});

/** @private - generic converter for Date records */
SC.RecordAttribute.registerTransform(Date, {

  /** @private - convert a string to a Date */
  to: function(str, attr) {
    if (str === null)
      return null;

    var ret ;
    str = str.toString() || '';
    
    if (attr.get('useIsoDate')) {
      var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
             "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
             "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?",
          d      = str.match(new RegExp(regexp)),
          offset = 0,
          date   = new Date(d[1], 0, 1),
          time ;

      if (d[3]) { date.setMonth(d[3] - 1); }
      if (d[5]) { date.setDate(d[5]); }
      if (d[7]) { date.setHours(d[7]); }
      if (d[8]) { date.setMinutes(d[8]); }
      if (d[10]) { date.setSeconds(d[10]); }
      if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
      if (d[14]) {
         offset = (Number(d[16]) * 60) + Number(d[17]);
         offset *= ((d[15] == '-') ? 1 : -1);
      }

      offset -= date.getTimezoneOffset();
      time = (Number(date) + (offset * 60 * 1000));
      
      ret = new Date();
      ret.setTime(Number(time));
    } else ret = new Date(Date.parse(str));
    return ret ;
  },
  
  _dates: {},

  _zeropad: function(num) { 
    return ((num<0) ? '-' : '') + ((num<10) ? '0' : '') + Math.abs(num); 
  },
  
  /** @private - convert a date to a string */
  from: function(date) { 
    var ret = this._dates[date.getTime()];
    if (ret) return ret ; 
    
    // figure timezone
    var zp = this._zeropad,
        tz = 0-date.getTimezoneOffset()/60;
        
    tz = (tz === 0) ? 'Z' : '%@:00'.fmt(zp(tz));
    
    this._dates[date.getTime()] = ret = "%@-%@-%@T%@:%@:%@%@".fmt(
      zp(date.getFullYear()),
      zp(date.getMonth()+1),
      zp(date.getDate()),
      zp(date.getHours()),
      zp(date.getMinutes()),
      zp(date.getSeconds()),
      tz) ;
    
    return ret ;
  }
});

if (SC.DateTime && !SC.RecordAttribute.transforms[SC.guidFor(SC.DateTime)]) {
  /**
    Registers a transform to allow SC.DateTime to be used as a record attribute,
    ie SC.Record.attr(SC.DateTime);
  
    Because SC.RecordAttribute is in the datastore framework and SC.DateTime in
    the foundation framework, and we don't know which framework is being loaded
    first, this chunck of code is duplicated in both frameworks.
  
    IF YOU EDIT THIS CODE MAKE SURE YOU COPY YOUR CHANGES to record_attribute.js. 
  */

  SC.RecordAttribute.registerTransform(SC.DateTime, {
  
    /** @private
      Convert a String to a DateTime
    */
    to: function(str, attr) {
      if (SC.none(str) || SC.instanceOf(str, SC.DateTime)) return str;
      var format = attr.get('format');
      return SC.DateTime.parse(str, format ? format : SC.DateTime.recordFormat);
    },
  
    /** @private
      Convert a DateTime to a String
    */
    from: function(dt, attr) {
      if (SC.none(dt)) return dt;
      var format = attr.get('format');
      return dt.toFormattedString(format ? format : SC.DateTime.recordFormat);
    }
  });
  
}

/* >>>>>>>>>> BEGIN source/models/child_attribute.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class
  
  ChildAttribute is a subclass of RecordAttribute and handles to-one 
  relationship for child record
  
  When setting ( .set() ) the value of a toMany attribute, make sure
  to pass in an array of SC.Record objects.
  
  There are many ways you can configure a ManyAttribute:
  
  {{{
    contacts: SC.ChildAttribute.attr('SC.Child');
  }}}
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ChildAttribute = SC.RecordAttribute.extend(
  /** @scope SC.ChildAttribute.prototype */ {
    
  isChildRecordTransform: YES,
      
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to many relationship */
  toType: function(parentRecord, key, hash) {
    var ret   = null,
        cacheKey  = SC.keyFor('__kid__', SC.guidFor(this)),
        recordType  = this.get('typeClass');
    
    if (parentRecord[cacheKey]) return parentRecord[cacheKey];
    
    if (!parentRecord) {
      throw 'SC.Child: Error during transform: Unable to retrieve parent record.';
    }

    // If no hash, return null.
    if (hash){
      // Get the record type.
      var childNS = parentRecord.get('childRecordNamespace');
      if (hash.type && !SC.none(childNS)) {
        recordType = childNS[hash.type];
      }

      if (!recordType || SC.typeOf(recordType) !== SC.T_CLASS) {
        throw 'SC.Child: Error during transform: Invalid record type.';
      }
      // Create an instance of the record by registering it with the parent and return.
      ret = parentRecord[cacheKey] = parentRecord.registerChildRecord(recordType, hash);
    }
    return ret;
  },
  
  // Default fromType is just returning itself
  fromType: function(record, key, value){
    return value;
  },
    
  /**
    The core handler.  Called from the property.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key,
        cacheKey = SC.keyFor('__kid__', SC.guidFor(this)), 
        nvalue;
    if (value !== undefined) {
      // careful: don't overwrite value here.  we want the return value to 
      // cache.
      this.orphan(record);
      nvalue = this.fromType(record, key, value) ; // convert to attribute.
      record[cacheKey] = null;
      record.writeAttribute(attrKey, nvalue);
      value = this.toType(record, key, value); // need to convert to the child record for caching
    } else {
      value = record.readAttribute(attrKey);
      if (SC.none(value) && (value = this.get('defaultValue'))) {
        if (typeof value === SC.T_FUNCTION) {
          value = this.defaultValue(record, key, this);
          // write default value so it doesn't have to be executed again
          if(record.attributes()) record.writeAttribute(attrKey, value, true);
        }
      } else value = this.toType(record, key, value);
    }

    return value ;
  },
  
  orphan: function(parentRecord){
    var cacheKey = SC.keyFor('__kid__', SC.guidFor(this)),
        store, storeKey, attrs, key, param, cRef;
    cRef = parentRecord ? parentRecord[cacheKey] : null;
    if (cRef) {
      attrs = cRef.get('readOnlyAttributes');
      for(key in attrs) {
        param = cRef[key];
        // Orphan all the child record and child records in a tree to clean up the store
        if(param && param.isChildRecordTransform) param.orphan(parentRecord);
      }
      store = cRef.get('store');
      if(store) storeKey = cRef.storeKey;
      if(storeKey) store.unloadRecord(undefined, undefined, storeKey);
    }
  }
});



/* >>>>>>>>>> BEGIN source/models/children_attribute.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');
sc_require('models/child_attribute');

/** @class
  
  ChildrenAttribute is a subclass of ChildAttribute and handles to-many 
  relationships for child records
  
  When setting ( .set() ) the value of a toMany attribute, make sure
  to pass in an array of SC.Record objects.
  
  There are many ways you can configure a ChildrenAttribute:
  
  {{{
    contacts: SC.ChildrenAttribute.attr('SC.Child');
  }}}
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ChildrenAttribute = SC.ChildAttribute.extend(
  /** @scope SC.ChildrenAttribute.prototype */ {
    
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to many relationship */
  toType: function(record, key, value) {
    var attrKey   = this.get('key') || key,
        arrayKey  = SC.keyFor('__kidsArray__', SC.guidFor(this)),
        ret       = record[arrayKey],
        recordType  = this.get('typeClass'), rel;

    // lazily create a ManyArray one time.  after that always return the 
    // same object.
    if (!ret) {
      ret = SC.ChildArray.create({ 
        record:         record,
        propertyName:   attrKey,
        defaultRecordType: recordType
      });

      record[arrayKey] = this._cachedRef = ret ; // save on record
      rel = record.get('relationships');
      if (!rel) record.set('relationships', rel = []);
      rel.push(ret); // make sure we get notified of changes...
    }

    return ret;
  },
      
  orphan: function(parentRecord){
    var cArray = this._cachedRef,
        store, storeKey, attrs, key, 
        len, param, cr;
    
    if (cArray) {
      cArray.forEach( function(cr){
        attrs = cr.get('readOnlyAttributes');
        for(key in attrs) {
          param = cr[key];
          // Orphan all the child record and child records in a tree to clean up the store
          if(param && param.isChildRecordTransform) param.orphan(parentRecord);
        }
        store = cr.get('store');
        if(store) storeKey = cr.storeKey;
        if(storeKey) store.unloadRecord(undefined, undefined, storeKey);
      }, this);
    }
  }
});



/* >>>>>>>>>> BEGIN source/models/fetched_attribute.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class

  Describes a single attribute that is fetched dynamically from the server
  when you request it.  Normally getting a property value with this attribute
  applied will cause call the find() method on the record store passing
  the attribute record type as the query key along with the property value,
  owner record, and property key name as parameters. 
  
  The DataSource you hook up to your store must know how to load this kind 
  of relationship for this fetched property to work properly.
  
  The return value is usually an SC.RecordArray that will populate with the
  record data so that you can display it.
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.FetchedAttribute = SC.RecordAttribute.extend(
  /** @scope SC.FetchedAttribute.prototype */ {

  /**
    Define the param key that will be passed to the findAll method on the
    store.  If null, the param will not be send.  Defaults to 'link'
    
    @property {String}
  */
  paramValueKey: 'link',

  /**
    Define the param key used to send the parent record.  If null the param
    will not be sent.  Defaults to 'owner'.
    
    @property {String}
  */
  paramOwnerKey: 'owner',
  
  /**
    Define the param key used to send the key name used to reference this 
    attribute.  If null, the param will not be sent.  Defaults to "rel"
    
    @property {String}
  */
  paramRelKey: 'rel',
  
  /**
    Optional query key to pass to findAll.  Otherwise type class will be 
    passed.
    
    @property {String}
  */
  queryKey: null,

  /** 
    Fetched attributes are not editable 
    
    @property {Boolean}
  */
  isEditable: NO,  
  
  // ..........................................................
  // LOW-LEVEL METHODS
  // 
  
  /**  @private - adapted for fetching. do findAll */
  toType: function(record, key, value) {
    var store = record.get('store');
    if (!store) return null ; // nothing to do
    
    var paramValueKey = this.get('paramValueKey'),
        paramOwnerKey = this.get('paramOwnerKey'),
        paramRelKey   = this.get('paramRelKey'),
        queryKey      = this.get('queryKey') || this.get('typeClass'),
        params        = {};

    // setup params for query
    if (paramValueKey) params[paramValueKey] = value ;
    if (paramOwnerKey) params[paramOwnerKey] = record ;
    if (paramRelKey)   params[paramRelKey]   = this.get('key') || key ;
    
    // make request - should return SC.RecordArray instance
    return store.findAll(queryKey, params);
  },

  /** @private - fetched attributes are read only. */
  fromType: function(record, key, value) {
    return value;
  }
  
}) ;


/* >>>>>>>>>> BEGIN source/models/many_attribute.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class
  
  ManyAttribute is a subclass of RecordAttribute and handles to-many 
  relationships.
  
  When setting ( .set() ) the value of a toMany attribute, make sure
  to pass in an array of SC.Record objects.
  
  There are many ways you can configure a ManyAttribute:
  
  {{{
    contacts: SC.Record.toMany('MyApp.Contact', { 
      inverse: 'group', // set the key used to represent the inverse 
      isMaster: YES|NO, // indicate whether changing this should dirty
      transform: function(), // transforms value <=> storeKey,
      isEditable: YES|NO, make editable or not,
      through: 'taggings' // set a relationship this goes through
    });
  }}}
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ManyAttribute = SC.RecordAttribute.extend(
  /** @scope SC.ManyAttribute.prototype */ {
  
  /**
    Set the foreign key on content objects that represent the inversion of
    this relationship.  The inverse property should be a toOne() or toMany()
    relationship as well.  Modifying this many array will modify the inverse
    property as well.
    
    @property {String}
  */
  inverse: null,
  
  /**
    If YES then modifying this relationships will mark the owner record 
    dirty.    If set ot NO, then modifying this relationship will not alter
    this record.  You should use this property only if you have an inverse 
    property also set.  Only one of the inverse relationships should be marked
    as master so you can control which record should be committed.
    
    @property {Boolean}
  */
  isMaster: YES,
  
  /**
    If set and you have an inverse relationship, will be used to determine the
    order of an object when it is added to an array.  You can pass a function
    or an array of property keys.
    
    @property {Function|Array}
  */
  orderBy: null,
  
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to many relationship */
  toType: function(record, key, value) {
    var type      = this.get('typeClass'),
        attrKey   = this.get('key') || key,
        arrayKey  = SC.keyFor('__manyArray__', SC.guidFor(this)),
        ret       = record[arrayKey],
        rel;

    // lazily create a ManyArray one time.  after that always return the 
    // same object.
    if (!ret) {
      ret = SC.ManyArray.create({ 
        recordType:    type,
        record:        record,
        propertyName:  attrKey,
        manyAttribute: this
      });

      record[arrayKey] = ret ; // save on record
      rel = record.get('relationships');
      if (!rel) record.set('relationships', rel = []);
      rel.push(ret); // make sure we get notified of changes...

    }

    return ret;
  },
  
  /** @private - adapted for to many relationship */
  fromType: function(record, key, value) {
    var ret = [];
    
    if(!SC.isArray(value)) throw "Expects toMany attribute to be an array";
    
    var len = value.get('length');
    for(var i=0;i<len;i++) {
      ret[i] = value.objectAt(i).get('id');
    }
    
    return ret;
  },
  
  /**
    Called by an inverse relationship whenever the receiver is no longer part
    of the relationship.  If this matches the inverse setting of the attribute
    then it will update itself accordingly.

    You should never call this directly.
    
    @param {SC.Record} the record owning this attribute
    @param {String} key the key for this attribute
    @param {SC.Record} inverseRecord record that was removed from inverse
    @param {String} key key on inverse that was modified
    @returns {void}
  */
  inverseDidRemoveRecord: function(record, key, inverseRecord, inverseKey) {
    var manyArray = record.get(key);
    if (manyArray) {
      manyArray.removeInverseRecord(inverseRecord);
    }
  },
  
  /**
    Called by an inverse relationship whenever the receiver is added to the 
    inverse relationship.  This will set the value of this inverse record to 
    the new record.
    
    You should never call this directly.
    
    @param {SC.Record} the record owning this attribute
    @param {String} key the key for this attribute
    @param {SC.Record} inverseRecord record that was added to inverse
    @param {String} key key on inverse that was modified
    @returns {void}
  */
  inverseDidAddRecord: function(record, key, inverseRecord, inverseKey) {
    var manyArray = record.get(key);
    if (manyArray) {
      manyArray.addInverseRecord(inverseRecord);
    }
  }
  
});

/* >>>>>>>>>> BEGIN source/models/single_attribute.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class
  
  SingleAttribute is a subclass of RecordAttribute and handles to-one
  relationships.

  There are many ways you can configure a SingleAttribute:
  
  {{{
    group: SC.Record.toOne('MyApp.Group', { 
      inverse: 'contacts', // set the key used to represent the inverse 
      isMaster: YES|NO, // indicate whether changing this should dirty
      transform: function(), // transforms value <=> storeKey,
      isEditable: YES|NO, make editable or not
    });
  }}}
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.SingleAttribute = SC.RecordAttribute.extend(
  /** @scope SC.SingleAttribute.prototype */ {

  /**
    Specifies the property on the member record that represents the inverse
    of the current relationship.  If set, then modifying this relationship
    will also alter the opposite side of the relationship.
    
    @property {String}
  */
  inverse: null,
  
  /**
    If set, determines that when an inverse relationship changes whether this
    record should become dirty also or not.
    
    @property {Boolean}
  */
  isMaster: YES,
  
  
  /**
    @private - implements support for handling inverse relationships.
  */
  call: function(record, key, newRec) {
    var attrKey = this.get('key') || key,
        inverseKey, isMaster, oldRec, attr, ret, nvalue;
    
    // WRITE
    if (newRec !== undefined) {

      // can only take other records or null
      if (newRec && !SC.kindOf(newRec, SC.Record)) {
        throw "%@ is not an instance of SC.Record".fmt(newRec);
      }

      inverseKey = this.get('inverse');
      if (inverseKey) oldRec = this._scsa_call(record, key);

      // careful: don't overwrite value here.  we want the return value to 
      // cache.
      nvalue = this.fromType(record, key, newRec) ; // convert to attribute.
      record.writeAttribute(attrKey, nvalue, !this.get('isMaster')); 
      ret = newRec ;

      // ok, now if we have an inverse relationship, get the inverse 
      // relationship and notify it of what is happening.  This will allow it
      // to update itself as needed.  The callbacks implemented here are 
      // supported by both SingleAttribute and ManyAttribute.
      //
      if (inverseKey && (oldRec !== newRec)) {
        if (oldRec && (attr = oldRec[inverseKey])) {
          attr.inverseDidRemoveRecord(oldRec, inverseKey, record, key);
        }

        if (newRec && (attr = newRec[inverseKey])) {
          attr.inverseDidAddRecord(newRec, inverseKey, record, key);
        }
      }
      
    // READ 
    } else ret = this._scsa_call(record, key, newRec);

    return ret ;
  },
  
  /** @private - save original call() impl */
  _scsa_call: SC.RecordAttribute.prototype.call,
  
  /**
    Called by an inverse relationship whenever the receiver is no longer part
    of the relationship.  If this matches the inverse setting of the attribute
    then it will update itself accordingly.
    
    @param {SC.Record} the record owning this attribute
    @param {String} key the key for this attribute
    @param {SC.Record} inverseRecord record that was removed from inverse
    @param {String} key key on inverse that was modified
    @returns {void}
  */
  inverseDidRemoveRecord: function(record, key, inverseRecord, inverseKey) {

    var myInverseKey  = this.get('inverse'),
        curRec   = this._scsa_call(record, key),
        isMaster = this.get('isMaster'), attr;

    // ok, you removed me, I'll remove you...  if isMaster, notify change.
    record.writeAttribute(key, null, !isMaster);
    record.notifyPropertyChange(key);

    // if we have another value, notify them as well...
    if ((curRec !== inverseRecord) || (inverseKey !== myInverseKey)) {
      if (curRec && (attr = curRec[myInverseKey])) {
        attr.inverseDidRemoveRecord(curRec, myInverseKey, record, key);
      }
    }
  },
  
  /**
    Called by an inverse relationship whenever the receiver is added to the 
    inverse relationship.  This will set the value of this inverse record to 
    the new record.
    
    @param {SC.Record} the record owning this attribute
    @param {String} key the key for this attribute
    @param {SC.Record} inverseRecord record that was added to inverse
    @param {String} key key on inverse that was modified
    @returns {void}
  */
  inverseDidAddRecord: function(record, key, inverseRecord, inverseKey) {
    
    var myInverseKey  = this.get('inverse'),
        curRec   = this._scsa_call(record, key),
        isMaster = this.get('isMaster'), 
        attr, nvalue; 

    // ok, replace myself with the new value...
    nvalue = this.fromType(record, key, inverseRecord); // convert to attr.
    record.writeAttribute(key, nvalue, !isMaster);
    record.notifyPropertyChange(key);

    // if we have another value, notify them as well...
    if ((curRec !== inverseRecord) || (inverseKey !== myInverseKey)) {
      if (curRec && (attr = curRec[myInverseKey])) {
        attr.inverseDidRemoveRecord(curRec, myInverseKey, record, key);
      }
    }
  }

});

/* >>>>>>>>>> BEGIN source/system/child_array.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ChildArray is used to map an array of ChildRecord
  
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.ChildArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.ManyArray.prototype */ {
    
  /**
    If set, it is the default record recordType
  
    @property {SC.Record}
  */
  defaultRecordType: null,
  
  /**
    If set, the parent record will be notified whenever the array changes so that 
    it can change its own state
    
    @property {SC.Record}
  */
  record: null,
  
  /**
    If set will be used by the many array to get an editable version of the
    storeIds from the owner.
    
    @property {String}
  */
  propertyName: null,
  
  /**
    Actual references to the hashes
  */
  children: null,
  
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property {SC.Store}
  */
  store: function() {
    return this.get('record').get('store');
  }.property('record').cacheable(),
  
  /**
    The storeKey for the parent record of this many array.  Editing this 
    array will place the parent record into a READY_DIRTY state.

    @property {Number}
  */
  storeKey: function() {
    return this.get('record').get('storeKey');
  }.property('record').cacheable(),
  
  /**
    Returns the storeIds in read only mode.  Avoids modifying the record 
    unnecessarily.
    
    @property {SC.Array}
  */
  readOnlyChildren: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),
  
  /**
    Returns an editable array of child hashes.  Marks the owner records as 
    modified. 
    
    @property {SC.Array}
  */
  editableChildren: function() {
    var store    = this.get('store'),
        storeKey = this.get('storeKey'),
        pname    = this.get('propertyName'),
        ret, hash;
        
    ret = store.readEditableProperty(storeKey, pname);    
    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];      
    }
    
    if (ret !== this._prevChildren) this.recordPropertyDidChange();
    return ret ;
  }.property(),
    
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /** @private
    Returned length is a pass-through to the storeIds array.
    
    @property {Number}
  */
  length: function() {
    var children = this.get('readOnlyChildren');
    return children ? children.length : 0;
  }.property('readOnlyChildren'),

  /** @private
    Looks up the store id in the store ids array and materializes a
    records.
  */
  objectAt: function(idx) {
    var recs      = this._records, 
        children = this.get('readOnlyChildren'),
        hash, ret;
    var len = children ? children.length : 0;
    
    if (!children) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    if (!recs) this._records = recs = [] ; // create cache
    
    // If not a good index return undefined
    if (idx >= len) return undefined;
    hash = children.objectAt(idx);
    if (!hash) return undefined;
    
    // not in cache, materialize
    recs[idx] = ret = this._materializeChild(hash);
    
    return ret;
  },

  /** @private
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeIds.
  */
  replace: function(idx, amt, recs) {
    var children = this.get('editableChildren'), 
        len      = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        record   = this.get('record'),
        
        pname    = this.get('propertyName'),
        cr, recordType;  
    children.replace(idx, amt, recs);
    for(var i = idx; i <= idx+amt; i+=1){
      this.objectAt(i);
    }
    // notify that the record did change...
    record.recordDidChange(pname);
    
    return this;
  },
  
  /*
  calls normalize on each object in the array
  */
  normalize: function(){
    this.forEach(function(child,id){
      if(child.normalize) child.normalize();
    });
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  //  
  
  /** @private
    Call to create an object from a hash
  */
  _materializeChild: function(hash){
    var store = this.get('store'),
        parentRecord = this.get('record'), 
        recordType = this.get('defaultRecordType'),
        id, ret, storeKey, pm;
        
    // Find the record type
    if (!parentRecord) return undefined;
    var nspace = parentRecord.get('childRecordNamespace');
    // Get the record type.
    if (hash.type && !SC.none(nspace)) {
      recordType = nspace[hash.type];
    }

    if (!recordType || SC.typeOf(recordType) !== SC.T_CLASS) {
      throw 'ChildrenArray: Error during transform: Invalid record type.';
    }
    
    pm = recordType.prototype.primaryKey || 'childRecordKey';
    id = hash[pm];
    storeKey = store.storeKeyExists(recordType, id);
    if (storeKey){
      ret = store.materializeRecord(storeKey);
    } 
    else {
      ret = parentRecord.registerChildRecord(recordType, hash);
    }
    return ret;
  },

  /** @private 
    Invoked whenever the children array changes.  Observes changes.
  */
  recordPropertyDidChange: function(keys) {
    
    if (keys && !keys.contains(this.get('propertyName'))) return this;
    
    var children = this.get('readOnlyChildren');
    var prev = this._prevChildren, f = this._childrenContentDidChange;
    
    if (children === prev) return this; // nothing to do
    
    if (prev) prev.removeObserver('[]', this, f);
    this._prevChildren = children;
    if (children) children.addObserver('[]', this, f);
    
    var rev = (children) ? children.propertyRevision : -1 ;
    this._childrenContentDidChange(children, '[]', children, rev);
  },

  /** @private
    Invoked whenever the content of the children array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _childrenContentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache
    this.enumerableContentDidChange();
  },
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.recordPropertyDidChange();
  }
  
}) ;
/* >>>>>>>>>> BEGIN source/system/many_array.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ManyArray is used to map an array of record ids back to their 
  record objects which will be materialized from the owner store on demand.
  
  Whenever you create a toMany() relationship, the value returned from the 
  property will be an instance of ManyArray.  You can generally customize the
  behavior of ManyArray by passing settings to the toMany() helper.
  
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.ManyArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.ManyArray.prototype */ {

  /**
    recordType will tell what type to transform the record to when
    materializing the record.

    @property {String}
  */
  recordType: null,
  
  /**
    If set, the record will be notified whenever the array changes so that 
    it can change its own state
    
    @property {SC.Record}
  */
  record: null,
  
  /**
    If set will be used by the many array to get an editable version of the
    storeIds from the owner.
    
    @property {String}
  */
  propertyName: null,
  
  
  /**
    The ManyAttribute that created this array.
  
    @property {SC.ManyAttribute}
  */
  manyAttribute: null,
  
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property {SC.Store}
  */
  store: function() {
    return this.get('record').get('store');
  }.property('record').cacheable(),
  
  /**
    The storeKey for the parent record of this many array.  Editing this 
    array will place the parent record into a READY_DIRTY state.

    @property {Number}
  */
  storeKey: function() {
    return this.get('record').get('storeKey');
  }.property('record').cacheable(),


  /**
    Returns the storeIds in read only mode.  Avoids modifying the record 
    unnecessarily.
    
    @property {SC.Array}
  */
  readOnlyStoreIds: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),
  
  
  /**
    Returns an editable array of storeIds.  Marks the owner records as 
    modified. 
    
    @property {SC.Array}
  */
  editableStoreIds: function() {
    var store    = this.get('store'),
        storeKey = this.get('storeKey'),
        pname    = this.get('propertyName'),
        ret, hash;
        
    ret = store.readEditableProperty(storeKey, pname);    
    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];      
    }
    
    if (ret !== this._prevStoreIds) this.recordPropertyDidChange();
    return ret ;
  }.property(),
  
  
  // ..........................................................
  // COMPUTED FROM OWNER
  // 
  
  /**
    Computed from owner many attribute
    
    @property {Boolean}
  */
  isEditable: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('isEditable') : NO;
  }.property('manyAttribute').cacheable(),
  
  /**
    Computed from owner many attribute
    
    @property {String}
  */
  inverse: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('inverse') : null;
  }.property('manyAttribute').cacheable(),
  
  /**
    Computed from owner many attribute
    
    @property {Boolean}
  */
  isMaster: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('isMaster') : null;
  }.property("manyAttribute").cacheable(),

  /**
    Computed from owner many attribute
    
    @property {Array}
  */
  orderBy: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('orderBy') : null;
  }.property("manyAttribute").cacheable(),
  
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /** @private
    Returned length is a pass-through to the storeIds array.
    
    @property {Number}
  */
  length: function() {
    var storeIds = this.get('readOnlyStoreIds');
    return storeIds ? storeIds.get('length') : 0;
  }.property('readOnlyStoreIds'),

  /** @private
    Looks up the store id in the store ids array and materializes a
    records.
  */
  objectAt: function(idx) {
    var recs      = this._records, 
        storeIds  = this.get('readOnlyStoreIds'),
        store     = this.get('store'),
        recordType = this.get('recordType'),
        storeKey, ret, storeId ;
        
    if (!storeIds || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached

    // not in cache, materialize
    if (!recs) this._records = recs = [] ; // create cache
    storeId = storeIds.objectAt(idx);
    if (storeId) {

      // if record is not loaded already, then ask the data source to 
      // retrieve it
      storeKey = store.storeKeyFor(recordType, storeId);
      
      if (store.readStatus(storeKey) === SC.Record.EMPTY) {
        store.retrieveRecord(recordType, null, storeKey);
      }
      
      recs[idx] = ret = store.materializeRecord(storeKey);
    }
    return ret ;
  },

  /** @private
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeIds.
  */
  replace: function(idx, amt, recs) {
    
    if (!this.get('isEditable')) {
      throw "%@.%@[] is not editable".fmt(this.get('record'), this.get('propertyName'));
    }
    
    var storeIds = this.get('editableStoreIds'), 
        len      = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        record   = this.get('record'),
        pname    = this.get('propertyName'),
        i, keys, ids, toRemove, inverse, attr, inverseRecord;

    // map to store keys
    ids = [] ;
    for(i=0;i<len;i++) ids[i] = recs.objectAt(i).get('id');

    // if we have an inverse - collect the list of records we are about to 
    // remove
    inverse = this.get('inverse');
    if (inverse && amt>0) {
      toRemove = SC.ManyArray._toRemove;
      if (toRemove) SC.ManyArray._toRemove = null; // reuse if possible
      else toRemove = [];
      
      for(i=0;i<amt;i++) toRemove[i] = this.objectAt(i);
    }
    
    // pass along - if allowed, this should trigger the content observer 
    storeIds.replace(idx, amt, ids);

    // ok, notify records that were removed then added; this way reordered
    // objects are added and removed
    if (inverse) {
      
      // notive removals
      for(i=0;i<amt;i++) {
        inverseRecord = toRemove[i];
        attr = inverseRecord ? inverseRecord[inverse] : null;
        if (attr && attr.inverseDidRemoveRecord) {
          attr.inverseDidRemoveRecord(inverseRecord, inverse, record, pname);
        }
      }

      if (toRemove) {
        toRemove.length = 0; // cleanup
        if (!SC.ManyArray._toRemove) SC.ManyArray._toRemove = toRemove;
      }

      // notify additions
      for(i=0;i<len;i++) {
        inverseRecord = recs.objectAt(i);
        attr = inverseRecord ? inverseRecord[inverse] : null;
        if (attr && attr.inverseDidAddRecord) {
          attr.inverseDidAddRecord(inverseRecord, inverse, record, pname);
        }
      }
      
    }

    // only mark record dirty if there is no inverse or we are master
    if (record && (!inverse || this.get('isMaster'))) {
      record.recordDidChange(pname);
    } 
    
    return this;
  },
  
  // ..........................................................
  // INVERSE SUPPORT
  // 
  
  /**
    Called by the ManyAttribute whenever a record is removed on the inverse
    of the relationship.
    
    @param {SC.Record} inverseRecord the record that was removed
    @returns {SC.ManyArray} receiver
  */
  removeInverseRecord: function(inverseRecord) {
    
    if (!inverseRecord) return this; // nothing to do
    var id = inverseRecord.get('id'),
        storeIds = this.get('editableStoreIds'),
        idx      = (storeIds && id) ? storeIds.indexOf(id) : -1,
        record;
    
    if (idx >= 0) {
      storeIds.removeAt(idx);
      if (this.get('isMaster') && (record = this.get('record'))) {
        record.recordDidChange(this.get('propertyName'));
      }
    }
    
    return this;
  },

  /**
    Called by the ManyAttribute whenever a record is added on the inverse
    of the relationship.
    
    @param {SC.Record} record the record this array is a part of
    @param {String} key the key this array represents
    @param {SC.Record} inverseRecord the record that was removed
    @param {String} inverseKey the name of inverse that was changed
    @returns {SC.ManyArray} receiver
  */
  addInverseRecord: function(inverseRecord) {
    
    if (!inverseRecord) return this;
    var id = inverseRecord.get('id'),
        storeIds = this.get('editableStoreIds'),
        orderBy  = this.get('orderBy'),
        len      = storeIds.get('length'),
        idx, record;
        
    // find idx to insert at.
    if (orderBy) {
      idx = this._findInsertionLocation(inverseRecord, 0, len, orderBy);
    } else idx = len;
    
    storeIds.insertAt(idx, inverseRecord.get('id'));
    if (this.get('isMaster') && (record = this.get('record'))) {
      record.recordDidChange(this.get('propertyName'));
    }
    
    return this;
  },
  
  // binary search to find insertion location
  _findInsertionLocation: function(rec, min, max, orderBy) {
    var idx   = min+Math.floor((max-min)/2),
        cur   = this.objectAt(idx),
        order = this._compare(rec, cur, orderBy);
    if (order < 0) {
      if (idx===0) return idx;
      else return this._findInsertionLocation(rec, 0, idx, orderBy);
    } else if (order > 0) {
      if (idx >= max) return idx;
      else return this._findInsertionLocation(rec, idx, max, orderBy);
    } else return idx;
  },

  _compare: function(a, b, orderBy) {
    var t = SC.typeOf(orderBy),
        ret, idx, len;
        
    if (t === SC.T_FUNCTION) ret = orderBy(a, b);
    else if (t === SC.T_STRING) ret = SC.compare(a,b);
    else {
      len = orderBy.get('length');
      ret = 0;
      for(idx=0;(ret===0) && (idx<len);idx++) ret = SC.compare(a,b);
    }

    return ret ;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  //  

  /** @private 
    Invoked whenever the storeIds array changes.  Observes changes.
  */
  recordPropertyDidChange: function(keys) {
    
    if (keys && !keys.contains(this.get('propertyName'))) return this;
    
    var storeIds = this.get('readOnlyStoreIds');
    var prev = this._prevStoreIds, f = this._storeIdsContentDidChange;

    if (storeIds === prev) return this; // nothing to do

    if (prev) prev.removeObserver('[]', this, f);
    this._prevStoreIds = storeIds;
    if (storeIds) storeIds.addObserver('[]', this, f);

    var rev = (storeIds) ? storeIds.propertyRevision : -1 ;
    this._storeIdsContentDidChange(storeIds, '[]', storeIds, rev);
    
  },

  /** @private
    Invoked whenever the content of the storeIds array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _storeIdsContentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache
    this.enumerableContentDidChange();
  },
  
  /** @private */
  unknownProperty: function(key, value) {
    var ret = this.reducedProperty(key, value);
    return ret === undefined ? arguments.callee.base.apply(this,arguments) : ret;
  },

  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.recordPropertyDidChange();
  }
  
}) ;
/* >>>>>>>>>> BEGIN source/system/store.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');

/**
  @class


  The Store is where you can find all of your dataHashes. Stores can be 
  chained for editing purposes and committed back one chain level at a time 
  all the way back to a persistent data source.
  
  Every application you create should generally have its own store objects.
  Once you create the store, you will rarely need to work with the store
  directly except to retrieve records and collections.  
  
  Internally, the store will keep track of changes to your json data hashes
  and manage syncing those changes with your data source.  A data source may
  be a server, local storage, or any other persistent code.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Store = SC.Object.extend( /** @scope SC.Store.prototype */ {
  
  /**
    An (optional) name of the store, which can be useful during debugging,
    especially if you have multiple nested stores.
    
    @property {String}
  */
  name: null,

  /**
    An array of all the chained stores that current rely on the receiver 
    store.
    
    @property {Array}
  */
  nestedStores: null,

  /**
    The data source is the persistent storage that will provide data to the
    store and save changes.  You normally will set your data source when you
    first create your store in your application.
    
    @property {SC.DataSource}
  */
  dataSource: null,
  
  /**
    This type of store is not nested.
    
    @property {Boolean}
  */
  isNested: NO,
  
  /**
    This type of store is not nested.
    
    @property {Boolean}
  */
  commitRecordsAutomatically: NO,
  
  // ..........................................................
  // DATA SOURCE SUPPORT
  // 
  
  /**
    Convenience method.  Sets the current data source to the passed property.
    This will also set the store property on the dataSource to the receiver.
    
    If you are using this from the core.js method of your app, you may need to
    just pass a string naming your data source class.  If this is the case,
    then your data source will be instantiated the first time it is requested.
    
    @param {SC.DataSource|String} dataSource the data source
    @returns {SC.Store} receiver
  */
  from: function(dataSource) {
    this.set('dataSource', dataSource);
    return this ;
  },
  
  // lazily convert data source to real object
  _getDataSource: function() {
    var ret = this.get('dataSource');
    if (typeof ret === SC.T_STRING) {
      ret = SC.objectForPropertyPath(ret);
      if (ret) ret = ret.create();
      if (ret) this.set('dataSource', ret);
    }
    return ret;
  },
  
  /**
    Convenience method.  Creates a CascadeDataSource with the passed 
    data source arguments and sets the CascadeDataSource as the data source 
    for the receiver.
    
    @param {SC.DataSource...} dataSource one or more data source arguments
    @returns {SC.Store} reciever
  */
  cascade: function(dataSource) {
    var dataSources = SC.A(arguments) ;
    dataSource = SC.CascadeDataSource.create({
      dataSources: dataSources 
    });
    return this.from(dataSource);
  },
  
  // ..........................................................
  // STORE CHAINING
  // 
  
  /**  
    Returns a new nested store instance that can be used to buffer changes
    until you are ready to commit them.  When you are ready to commit your 
    changes, call commitChanges() or destroyChanges() and then destroy() when
    you are finished with the chained store altogether.
    
    {{{
      store = MyApp.store.chain();
      .. edit edit edit
      store.commitChanges().destroy();
    }}}
    
    @param {Hash} attrs optional attributes to set on new store
    @param {Class} newStoreClass optional the class of the newly-created nested store (defaults to SC.NestedStore)
    @returns {SC.NestedStore} new nested store chained to receiver
  */
  chain: function(attrs, newStoreClass) {
    if (!attrs) attrs = {};
    attrs.parentStore = this;
    
    if (newStoreClass) {
      // Ensure the passed-in class is a type of nested store.
      if (SC.typeOf(newStoreClass) !== 'class') throw new Error("%@ is not a valid class".fmt(newStoreClass));
      if (!SC.kindOf(newStoreClass, SC.NestedStore)) throw new Error("%@ is not a type of SC.NestedStore".fmt(newStoreClass));
    }
    else {
      newStoreClass = SC.NestedStore;
    }
    
    var ret    = newStoreClass.create(attrs),
        nested = this.nestedStores;
        
    if (!nested) nested = this.nestedStores = [];
    nested.push(ret);
    return ret ;
  },
  
  /** @private
  
    Called by a nested store just before it is destroyed so that the parent
    can remove the store from its list of nested stores.
    
    @returns {SC.Store} receiver
  */
  willDestroyNestedStore: function(nestedStore) {
    if (this.nestedStores) {
      this.nestedStores.removeObject(nestedStore);
    }
    return this ;
  },

  /**
    Used to determine if a nested store belongs directly or indirectly to the
    receiver.
    
    @param {SC.Store} store store instance
    @returns {Boolean} YES if belongs
  */
  hasNestedStore: function(store) {
    while(store && (store !== this)) store = store.get('parentStore');
    return store === this ;
  },

  // ..........................................................
  // SHARED DATA STRUCTURES 
  // 
  
  /** @private
    JSON data hashes indexed by store key.  
    
    *IMPORTANT: Property is not observable*

    Shared by a store and its child stores until you make edits to it.
    
    @property {Hash}
  */
  dataHashes: null,

  /** @private
    The current status of a data hash indexed by store key.
    
    *IMPORTANT: Property is not observable*

    Shared by a store and its child stores until you make edits to it.
    
    @property {Hash}
  */
  statuses: null,
    
  /** @private
    This array contains the revisions for the attributes indexed by the 
    storeKey.  
    
    *IMPORTANT: Property is not observable*
    
    Revisions are used to keep track of when an attribute hash has been 
    changed. A store shares the revisions data with its parent until it 
    starts to make changes to it.
    
    @property {Hash}
  */
  revisions: null,

  /**
    Array indicates whether a data hash is possibly in use by an external 
    record for editing.  If a data hash is editable then it may be modified
    at any time and therefore chained stores may need to clone the 
    attributes before keeping a copy of them.
  
    Note that this is kept as an array because it will be stored as a dense 
    array on some browsers, making it faster.
    
    @property {Array}
  */
  editables: null,
    
  /**
    A set of storeKeys that need to be committed back to the data source. If
    you call commitRecords() without passing any other parameters, the keys
    in this set will be committed instead.
  
    @property {Array}
  */
  changelog: null,
  
  /**
    A set of SC.RecordArray that have been returned from findAll with an 
    SC.Query. These will all be notified with _notifyRecordArraysWithQuery() 
    whenever the store changes.
  
    @property {Array}
  */
  recordArraysWithQuery: null,
  
  /**
    An array of SC.Error objects associated with individual records in the
    store (indexed by store keys).
    
    Errors passed form the data source in the call to dataSourceDidError() are
    stored here.
    
    @property {Array}
  */
  recordErrors: null,
  
  /**
    A hash of SC.Error objects associated with queries (indexed by the GUID
    of the query).
    
    Errors passed from the data source in the call to dataSourceDidErrorQuery()
    are stored here.
    
    @property {Hash}
  */
  queryErrors: null,
  
  // ..........................................................
  // CORE ATTRIBUTE API
  // 
  // The methods in this layer work on data hashes in the store.  They do not
  // perform any changes that can impact records.  Usually you will not need 
  // to use these methods.
  
  /**
    Returns the current edit status of a storekey.  May be one of EDITABLE or
    LOCKED.  Used mostly for unit testing.
    
    @param {Number} storeKey the store key
    @returns {Number} edit status
  */
  storeKeyEditState: function(storeKey) {
    var editables = this.editables, locks = this.locks;
    return (editables && editables[storeKey]) ? SC.Store.EDITABLE : SC.Store.LOCKED ;
  },
   
  /** 
    Returns the data hash for the given storeKey.  This will also 'lock'
    the hash so that further edits to the parent store will no 
    longer be reflected in this store until you reset.
    
    @param {Number} storeKey key to retrieve
    @returns {Hash} data hash or null
  */
  readDataHash: function(storeKey) {
    return this.dataHashes[storeKey];
  },
  
  /** 
    Returns the data hash for the storeKey, cloned so that you can edit
    the contents of the attributes if you like.  This will do the extra work
    to make sure that you only clone the attributes one time.  
    
    If you use this method to modify data hash, be sure to call 
    dataHashDidChange() when you make edits to record the change.
    
    @param {Number} storeKey the store key to retrieve
    @returns {Hash} the attributes hash
  */
  readEditableDataHash: function(storeKey) {
    // read the value - if there is no hash just return; nothing to do
    var ret = this.dataHashes[storeKey];
    if (!ret) return ret ; // nothing to do.

    // clone data hash if not editable
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    if (!editables[storeKey]) {
      editables[storeKey] = 1 ; // use number to store as dense array
      ret = this.dataHashes[storeKey] = SC.clone(ret);
    }
    return ret;
  },
  
  /**
    Reads a property from the hash - cloning it if needed so you can modify 
    it independently of any parent store.  This method is really only well
    tested for use with toMany relationships.  Although it is public you 
    generally should not call it directly.
    
    @param {Number} storeKey storeKey of data hash 
    @param {String} propertyName property to read
    @returns {Object} editable property value
  */
  readEditableProperty: function(storeKey, propertyName) {
    var hash      = this.readEditableDataHash(storeKey), 
        editables = this.editables[storeKey], // get editable info...
        ret       = hash[propertyName];
        
    // editables must be made into a hash so that we can keep track of which
    // properties have already been made editable
    if (editables === 1) editables = this.editables[storeKey] = {};
    
    // clone if needed
    if (!editables[propertyName]) {
      ret = hash[propertyName];
      if (ret && ret.isCopyable) ret = hash[propertyName] = ret.copy();
      editables[propertyName] = YES ;
    }
    
    return ret ;
  },
  
  /**
    Replaces the data hash for the storeKey.  This will lock the data hash and
    mark them as cloned.  This will also call dataHashDidChange() for you.
    
    Note that the hash you set here must be a different object from the 
    original data hash.  Once you make a change here, you must also call
    dataHashDidChange() to register the changes.

    If the data hash does not yet exist in the store, this method will add it.
    Pass the optional status to edit the status as well.
    
    @param {Number} storeKey the store key to write
    @param {Hash} hash the new hash
    @param {String} status the new hash status
    @returns {SC.Store} receiver
  */
  writeDataHash: function(storeKey, hash, status) {

    // update dataHashes and optionally status.
    if (hash) this.dataHashes[storeKey] = hash;
    if (status) this.statuses[storeKey] = status ;
    
    // also note that this hash is now editable
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    editables[storeKey] = 1 ; // use number for dense array support
    
    return this ;
  },

  /**
    Removes the data hash from the store.  This does not imply a deletion of
    the record.  You could be simply unloading the record.  Eitherway, 
    removing the dataHash will be synced back to the parent store but not to 
    the server.
    
    Note that you can optionally pass a new status to go along with this. If
    you do not pass a status, it will change the status to SC.RECORD_EMPTY
    (assuming you just unloaded the record).  If you are deleting the record
    you may set it to SC.Record.DESTROYED_CLEAN.
    
    Be sure to also call dataHashDidChange() to register this change.
    
    @param {Number} storeKey
    @param {String} status optional new status
    @returns {SC.Store} reciever
  */
  removeDataHash: function(storeKey, status) {
    var rev ;
    
     // don't use delete -- that will allow parent dataHash to come through
    this.dataHashes[storeKey] = null;  
    this.statuses[storeKey] = status || SC.Record.EMPTY;
    rev = this.revisions[storeKey] = this.revisions[storeKey]; // copy ref
    
    // hash is gone and therefore no longer editable
    var editables = this.editables;
    if (editables) editables[storeKey] = 0 ;
    
    return this ;    
  },
  
  /**
    Reads the current status for a storeKey.  This will also lock the data 
    hash.  If no status is found, returns SC.RECORD_EMPTY.
    
    @param {Number} storeKey the store key
    @returns {Number} status
  */
  readStatus: function(storeKey) {
    // use readDataHash to handle optimistic locking.  this could be inlined
    // but for now this minimized copy-and-paste code.
    this.readDataHash(storeKey);
    return this.statuses[storeKey] || SC.Record.EMPTY;
  },
  
  /**
    Reads the current status for the storeKey without actually locking the 
    record.  Usually you won't need to use this method.  It is mostly used
    internally.
    
    @param {Number} storeKey the store key
    @returns {Number} status
  */
  peekStatus: function(storeKey) {
    return this.statuses[storeKey] || SC.Record.EMPTY;  
  },
  
  /**
    Writes the current status for a storeKey.  If the new status is 
    SC.Record.ERROR, you may also pass an optional error object.  Otherwise 
    this param is ignored.
    
    @param {Number} storeKey the store key
    @param {String} newStatus the new status
    @param {SC.Error} error optional error object
    @returns {SC.Store} receiver
  */
  writeStatus: function(storeKey, newStatus) {
    // use writeDataHash for now to handle optimistic lock.  maximize code 
    // reuse.
    return this.writeDataHash(storeKey, null, newStatus);
  },
  
  /**
    Call this method whenever you modify some editable data hash to register
    with the Store that the attribute values have actually changed.  This will
    do the book-keeping necessary to track the change across stores including 
    managing locks.
    
    @param {Number|Array} storeKeys one or more store keys that changed
    @param {Number} rev optional new revision number. normally leave null
    @param {Boolean} statusOnly (optional) YES if only status changed
    @param {String} key that changed (optional)
    @returns {SC.Store} receiver
  */
  dataHashDidChange: function(storeKeys, rev, statusOnly, key) {
    
    // update the revision for storeKey.  Use generateStoreKey() because that
    // gaurantees a universally (to this store hierarchy anyway) unique 
    // key value.
    if (!rev) rev = SC.Store.generateStoreKey();
    var isArray, len, idx, storeKey;
    
    isArray = SC.typeOf(storeKeys) === SC.T_ARRAY;
    if (isArray) {
      len = storeKeys.length;
    } else {
      len = 1;
      storeKey = storeKeys;
    }
    
    for(idx=0;idx<len;idx++) {
      if (isArray) storeKey = storeKeys[idx];
      this.revisions[storeKey] = rev;
      this._notifyRecordPropertyChange(storeKey, statusOnly, key);
    }
    
    return this ;
  },

  /** @private 
    Will push all changes to a the recordPropertyChanges property
    and execute flush() once at the end of the runloop.
  */
  _notifyRecordPropertyChange: function(storeKey, statusOnly, key) {
    
    var records      = this.records, 
        nestedStores = this.get('nestedStores'),
        K            = SC.Store,
        rec, editState, len, idx, store, status, keys;
    
    // pass along to nested stores
    len = nestedStores ? nestedStores.length : 0 ;
    for(idx=0;idx<len;idx++) {
      store = nestedStores[idx];
      status = store.peekStatus(storeKey); // important: peek avoids read-lock
      editState = store.storeKeyEditState(storeKey);
      
      // when store needs to propagate out changes in the parent store
      // to nested stores
      if (editState === K.INHERITED) {
        store._notifyRecordPropertyChange(storeKey, statusOnly, key);

      } else if (status & SC.Record.BUSY) {
        // make sure nested store does not have any changes before resetting
        if(store.get('hasChanges')) throw K.CHAIN_CONFLICT_ERROR;
        store.reset();
      }
    }
    
    // store info in changes hash and schedule notification if needed.
    var changes = this.recordPropertyChanges;
    if (!changes) {
      changes = this.recordPropertyChanges = 
        { storeKeys:      SC.CoreSet.create(),
          records:        SC.CoreSet.create(),
          hasDataChanges: SC.CoreSet.create(),
          propertyForStoreKeys: {} };
    }
    
    changes.storeKeys.add(storeKey);

    if (records && (rec=records[storeKey])) {
      changes.records.push(storeKey);
      
      // If there are changes other than just the status we need to record
      // that information so we do the right thing during the next flush.
      // Note that if we're called multiple times before flush and one call
      // has statusOnly=true and another has statusOnly=false, the flush will
      // (correctly) operate in statusOnly=false mode.
      if (!statusOnly) changes.hasDataChanges.push(storeKey);
      
      // If this is a key specific change, make sure that only those
      // properties/keys are notified.  However, if a previous invocation of
      // _notifyRecordPropertyChange specified that all keys have changed, we
      // need to respect that.
      if (key) {
        if (!(keys = changes.propertyForStoreKeys[storeKey])) {
          keys = changes.propertyForStoreKeys[storeKey] = SC.CoreSet.create();
        }
        
        // If it's '*' instead of a set, then that means there was a previous
        // invocation that said all keys have changed.
        if (keys !== '*') {
          keys.add(key);
        }
      }
      else {
        // Mark that all properties have changed.
        changes.propertyForStoreKeys[storeKey] = '*';
      }
    }
    
    this.invokeOnce(this.flush);
    return this;
  },

  /**
    Delivers any pending changes to materialized records.  Normally this 
    happens once, automatically, at the end of the RunLoop.  If you have
    updated some records and need to update records immediately, however, 
    you may call this manually.

    @returns {SC.Store} receiver
  */
  flush: function() {
    if (!this.recordPropertyChanges) return this;
    
    var changes              = this.recordPropertyChanges,
        storeKeys            = changes.storeKeys,
        hasDataChanges       = changes.hasDataChanges,
        records              = changes.records,
        propertyForStoreKeys = changes.propertyForStoreKeys,
        recordTypes = SC.CoreSet.create(),
        rec, recordType, statusOnly, idx, len, storeKey, keys;
    
    storeKeys.forEach(function(storeKey) {
      if (records.contains(storeKey)) {
        statusOnly = hasDataChanges.contains(storeKey) ? NO : YES;
        rec = this.records[storeKey];
        keys = propertyForStoreKeys ? propertyForStoreKeys[storeKey] : null;
        
        // Are we invalidating all keys?  If so, don't pass any to
        // storeDidChangeProperties.
        if (keys === '*') keys = null;
        
        // remove it so we don't trigger this twice
        records.remove(storeKey);
        
        if (rec) rec.storeDidChangeProperties(statusOnly, keys);
      }
      
      recordType = SC.Store.recordTypeFor(storeKey);
      recordTypes.add(recordType);
      
    }, this);

    if (storeKeys.get('length') > 0) this._notifyRecordArrays(storeKeys, recordTypes);

    storeKeys.clear();
    hasDataChanges.clear();
    records.clear();
    // Provide full reference to overwrite
    this.recordPropertyChanges.propertyForStoreKeys = {};
    
    return this;
  },
  
  /**
    Resets the store content.  This will clear all internal data for all
    records, resetting them to an EMPTY state.  You generally do not want
    to call this method yourself, though you may override it.
    
    @returns {SC.Store} receiver
  */
  reset: function() {
    
    // create a new empty data store
    this.dataHashes = {} ;
    this.revisions  = {} ;
    this.statuses   = {} ;

    // also reset temporary objects and errors
    this.chainedChanges = this.locks = this.editables = null;
    this.changelog = null ;
    this.recordErrors = null;
    this.queryErrors = null;

    var records = this.records, storeKey;
    if (records) {
      for(storeKey in records) {
        if (!records.hasOwnProperty(storeKey)) continue ;
        this._notifyRecordPropertyChange(parseInt(storeKey, 10), NO);
      }
    }
    
    this.set('hasChanges', NO);
  },
  
  /** @private
    Called by a nested store on a parent store to commit any changes from the
    store.  This will copy any changed dataHashes as well as any persistant 
    change logs.
    
    If the parentStore detects a conflict with the optimistic locking, it will
    raise an exception before it makes any changes.  If you pass the 
    force flag then this detection phase will be skipped and the changes will
    be applied even if another resource has modified the store in the mean
    time.
  
    @param {SC.Store} nestedStore the child store
    @param {Array} changes the array of changed store keys
    @param {Boolean} force
    @returns {SC.Store} receiver
  */
  commitChangesFromNestedStore: function(nestedStore, changes, force) {
    // first, check for optimistic locking problems
    if (!force) this._verifyLockRevisions(changes, nestedStore.locks);
    
    // OK, no locking issues.  So let's just copy them changes. 
    // get local reference to values.
    var len = changes.length, i, storeKey, myDataHashes, myStatuses, 
      myEditables, myRevisions, chDataHashes, chStatuses, chRevisions;
    
    myRevisions  = this.revisions ;
    myDataHashes = this.dataHashes;
    myStatuses   = this.statuses;
    myEditables  = this.editables ;
    
    // setup some arrays if needed
    if (!myEditables) myEditables = this.editables = [] ;
    
    chDataHashes = nestedStore.dataHashes;
    chRevisions  = nestedStore.revisions ;
    chStatuses   = nestedStore.statuses;
    
    for(i=0;i<len;i++) {
      storeKey = changes[i];

      // now copy changes
      myDataHashes[storeKey] = chDataHashes[storeKey];
      myStatuses[storeKey]   = chStatuses[storeKey];
      myRevisions[storeKey]  = chRevisions[storeKey];
      
      myEditables[storeKey] = 0 ; // always make dataHash no longer editable
      
      this._notifyRecordPropertyChange(storeKey, NO);
    }
    
    // add any records to the changelog for commit handling
    var myChangelog = this.changelog, chChangelog = nestedStore.changelog;
    if (chChangelog) {
      if (!myChangelog) myChangelog = this.changelog = SC.CoreSet.create();
      myChangelog.addEach(chChangelog);
    }  
    this.changelog = myChangelog;
    
    // immediately flush changes to notify records - nested stores will flush
    // later on.
    if (!this.get('parentStore')) this.flush();
    
    return this ;
  },

  /** @private
    Verifies that the passed lock revisions match the current revisions 
    in the receiver store.  If the lock revisions do not match, then the 
    store is in a conflict and an exception will be raised.
    
    @param {Array}  changes set of changes we are trying to apply
    @param {SC.Set} locks the locks to verify
    @returns {SC.Store} receiver
  */
  _verifyLockRevisions: function(changes, locks) {
    var len = changes.length, revs = this.revisions, i, storeKey, lock, rev ;
    if (locks && revs) {
      for(i=0;i<len;i++) {
        storeKey = changes[i];
        lock = locks[storeKey] || 1;
        rev  = revs[storeKey] || 1;

        // if the save revision for the item does not match the current rev
        // the someone has changed the data hash in this store and we have
        // a conflict. 
        if (lock < rev) throw SC.Store.CHAIN_CONFLICT_ERROR;
      }   
    }
    return this ;
  },
  
  // ..........................................................
  // HIGH-LEVEL RECORD API
  // 
  
  /**
    Finds a single record instance with the specified recordType and id or an 
    array of records matching some query conditions.
    
    h2. Finding a Single Record
    
    If you pass a single recordType and id, this method will return an actual
    record instance.  If the record has not been loaded into the store yet,
    this method will ask the data source to retrieve it.  If no data source
    indicates that it can retrieve the record, then this method will return
    null.
    
    Note that if the record needs to be retrieved from the server, then the
    record instance returned from this method will not have any data yet. 
    Instead it will have a status of SC.Record.READY_LOADING.  You can monitor
    the status property to be notified when the record data is available for 
    you to use it.
    
    h2. Find a Collection of Records
    
    If you pass only a record type or a query object, you can instead find 
    all records matching a specified set of conditions.  When you call find()
    in this way, it will create a query if needed and pass it to the data
    source to fetch the results.
    
    If this is the first time you have fetched the query, then the store will
    automatically ask the data source to fetch any records related to it as 
    well.  Otherwise you can refresh the query results at anytime by calling
    refresh() on the returned RecordArray.

    You can detect whether a RecordArray is fetching from the server by 
    checking its status.
    
    h2. Examples
    
    Finding a single record:
    
    {{{
      MyApp.store.find(MyApp.Contact, "23"); // returns MyApp.Contact
    }}}
    
    Finding all records of a particular type:
    
    {{{
      MyApp.store.find(MyApp.Contact); // returns SC.RecordArray of contacts
    }}}
    
    Finding all contacts with first name John:
    
    {{{
      var query = SC.Query.local(MyApp.Contact, "firstName = %@", "John");
      MyApp.store.find(query); // returns SC.RecordArray of contacts
    }}}
    
    Finding all contacts using a remote query:
    
    {{{
      var query = SC.Query.remote(MyApp.Contact);
      MyApp.store.find(query); // returns SC.RecordArray filled by server
    }}}
    
    @param {SC.Record|String} recordType the expected record type
    @param {String} id the id to load
    @returns {SC.Record} record instance or null
  */
  find: function(recordType, id) {
    
    // if recordType is passed as string, find object
    if (SC.typeOf(recordType)===SC.T_STRING) {
      recordType = SC.objectForPropertyPath(recordType);
    }
    
    // handle passing a query...
    if ((arguments.length === 1) && !(recordType && recordType.get && recordType.get('isRecord'))) {
      if (!recordType) throw new Error("SC.Store#find() must pass recordType or query");
      if (!recordType.isQuery) {
        recordType = SC.Query.local(recordType);
      }
      return this._findQuery(recordType, YES, YES);
      
    // handle finding a single record
    } else {
      return this._findRecord(recordType, id);
    }
  },

  /** @private
    DEPRECATED used find() instead.
    
    This method will accept a record type or query and return a record array
    matching the results.  This method was commonly used prior to SproutCore 
    1.0.  It has been deprecated in favor of a single find() method instead.
    
    For compatibility, this method will continue to work in SproutCore 1.0 but
    it will raise a warning.  It will be removed in a future version of 
    SproutCore.
  */
  findAll: function(recordType, conditions, params) {
    console.warn("SC.Store#findAll() will be removed in a future version of SproutCore.  Use SC.Store#find() instead");
    

    if (!recordType || !recordType.isQuery) {
      recordType = SC.Query.local(recordType, conditions, params);
    }
    
    return this._findQuery(recordType, YES, YES);
  },
  
  
  _findQuery: function(query, createIfNeeded, refreshIfNew) {

    // lookup the local RecordArray for this query.
    var cache = this._scst_recordArraysByQuery, 
        key   = SC.guidFor(query),
        ret, ra ;
    if (!cache) cache = this._scst_recordArraysByQuery = {};
    ret = cache[key];
    
    // if a RecordArray was not found, then create one and also add it to the
    // list of record arrays to update.
    if (!ret && createIfNeeded) {
      cache[key] = ret = SC.RecordArray.create({ store: this, query: query });

      ra = this.get('recordArrays');
      if (!ra) this.set('recordArrays', ra = SC.Set.create());
      ra.add(ret);

      if (refreshIfNew) this.refreshQuery(query);
    }
    
    this.flush();
    return ret ;
  },
  
  _findRecord: function(recordType, id) {

    var storeKey ; 
    
    // if a record instance is passed, simply use the storeKey.  This allows 
    // you to pass a record from a chained store to get the same record in the
    // current store.
    if (recordType && recordType.get && recordType.get('isRecord')) {
      storeKey = recordType.get('storeKey');
      
    // otherwise, lookup the storeKey for the passed id.  look in subclasses 
    // as well.
    } else storeKey = id ? recordType.storeKeyFor(id) : null;
    
    if (storeKey && (this.readStatus(storeKey) === SC.Record.EMPTY)) {
      storeKey = this.retrieveRecord(recordType, id);
    }
    
    // now we have the storeKey, materialize the record and return it.
    return storeKey ? this.materializeRecord(storeKey) : null ;
  },

  // ..........................................................
  // RECORD ARRAY OPERATIONS
  // 

  /**
    Called by the record array just before it is destroyed.  This will 
    de-register it from receiving future notifications.

    You should never call this method yourself.  Instead call destroy() on the
    RecordArray directly.
    
    @param {SC.RecordArray} recordArray the record array
    @returns {SC.Store} receiver
  */
  recordArrayWillDestroy: function(recordArray) {
    var cache = this._scst_recordArraysByQuery,
        set   = this.get('recordArrays');
        
    if (cache) delete cache[SC.guidFor(recordArray.get('query'))];
    if (set) set.remove(recordArray);
    return this ;
  },

  /**
    Called by the record array whenever it needs the data source to refresh
    its contents.  Nested stores will actually just pass this along to the
    parent store.  The parent store will call fetch() on the data source.

    You should never call this method yourself.  Instead call refresh() on the
    RecordArray directly.
    
    @param {SC.Query} query the record array query to refresh
    @returns {SC.Store} receiver
  */
  refreshQuery: function(query) {
    if (!query) throw new Error("refreshQuery() requires a query");

    var cache    = this._scst_recordArraysByQuery,
        recArray = cache ? cache[SC.guidFor(query)] : null, 
        source   = this._getDataSource();
        
    if (source && source.fetch) {
      if (recArray) recArray.storeWillFetchQuery(query);
      source.fetch.call(source, this, query);
    }
    
    return this ;      
  },
  
  /** @private 
    Will ask all record arrays that have been returned from findAll
    with an SC.Query to check their arrays with the new storeKeys
    
    @param {SC.IndexSet} storeKeys set of storeKeys that changed
    @param {SC.Set} recordTypes
    @returns {SC.Store} receiver
  */
  _notifyRecordArrays: function(storeKeys, recordTypes) {
    var recordArrays = this.get('recordArrays');
    if (!recordArrays) return this;

    recordArrays.forEach(function(recArray) {
      if (recArray) recArray.storeDidChangeStoreKeys(storeKeys, recordTypes);
    }, this);
    
    return this ;
  },
  
  
  // ..........................................................
  // LOW-LEVEL HELPERS
  // 
  
  /**
    Array of all records currently in the store with the specified
    type.  This method only reflects the actual records loaded into memory and
    therefore is not usually needed at runtime.  However you will often use
    this method for testing.
    
    @param {SC.Record} recordType the record type
    @returns {SC.Array} array instance - usually SC.RecordArray
  */
  recordsFor: function(recordType) {
    var storeKeys     = [], 
        storeKeysById = recordType.storeKeysById(),
        id, storeKey, ret;
    
    // collect all non-empty store keys
    for(id in storeKeysById) {
      storeKey = storeKeysById[id]; // get the storeKey
      if (this.readStatus(storeKey) !== SC.RECORD_EMPTY) {
        storeKeys.push(storeKey);
      }
    }
    
    if (storeKeys.length>0) {
      ret = SC.RecordArray.create({ store: this, storeKeys: storeKeys });
    } else ret = storeKeys; // empty array
    return ret ;
  },
  
  _TMP_REC_ATTRS: {},
  
  /** 
    Given a storeKey, return a materialized record.  You will not usually
    call this method yourself.  Instead it will used by other methods when
    you find records by id or perform other searches.

    If a recordType has been mapped to the storeKey, then a record instance
    will be returned even if the data hash has not been requested yet.
    
    Each Store instance returns unique record instances for each storeKey.

    @param {Number} storeKey The storeKey for the dataHash.
    @returns {SC.Record} Returns a record instance.
  */
  materializeRecord: function(storeKey) {
    var records = this.records, ret, recordType, attrs;
    
    // look up in cached records
    if (!records) records = this.records = {}; // load cached records
    ret = records[storeKey];
    if (ret) return ret;
    
    // not found -- OK, create one then.
    recordType = SC.Store.recordTypeFor(storeKey);
    if (!recordType) return null; // not recordType registered, nothing to do
    
    attrs = this._TMP_REC_ATTRS ;
    attrs.storeKey = storeKey ;
    attrs.store    = this ;
    ret = records[storeKey] = recordType.create(attrs);
    
    return ret ;
  },

  // ..........................................................
  // CORE RECORDS API
  // 
  // The methods in this section can be used to manipulate records without 
  // actually creating record instances.
  
  /**
    Creates a new record instance with the passed recordType and dataHash.
    You can also optionally specify an id or else it will be pulled from the 
    data hash.

    Note that the record will not yet be saved back to the server.  To save
    a record to the server, call commitChanges() on the store.

    @param {SC.Record} recordType the record class to use on creation
    @param {Hash} dataHash the JSON attributes to assign to the hash.
    @param {String} id (optional) id to assign to record

    @returns {SC.Record} Returns the created record
  */
  createRecord: function(recordType, dataHash, id) {
    var primaryKey, storeKey, status, K = SC.Record, changelog, defaultVal;
    
    // First, try to get an id.  If no id is passed, look it up in the 
    // dataHash.
    if (!id && (primaryKey = recordType.prototype.primaryKey)) {
      id = dataHash[primaryKey];
      // if still no id, check if there is a defaultValue function for
      // the primaryKey attribute and assign that
      defaultVal = recordType.prototype[primaryKey] ? recordType.prototype[primaryKey].defaultValue : null;
      if(!id && SC.typeOf(defaultVal)===SC.T_FUNCTION) {
        id = dataHash[primaryKey] = defaultVal();
      }
    }
    
    // Next get the storeKey - base on id if available
    storeKey = id ? recordType.storeKeyFor(id) : SC.Store.generateStoreKey();
    
    // now, check the state and do the right thing.
    status = this.readStatus(storeKey);
    
    // check state
    // any busy or ready state or destroyed dirty state is not allowed
    if ((status & K.BUSY)  || 
        (status & K.READY) || 
        (status == K.DESTROYED_DIRTY)) { 
      throw id ? K.RECORD_EXISTS_ERROR : K.BAD_STATE_ERROR;
      
    // allow error or destroyed state only with id
    } else if (!id && (status==SC.DESTROYED_CLEAN || status==SC.ERROR)) {
      throw K.BAD_STATE_ERROR;
    }
    
    // add dataHash and setup initial status -- also save recordType
    this.writeDataHash(storeKey, (dataHash ? dataHash : {}), K.READY_NEW);
    
    SC.Store.replaceRecordTypeFor(storeKey, recordType);
    this.dataHashDidChange(storeKey);
    
    // Record is now in a committable state -- add storeKey to changelog
    changelog = this.changelog;
    if (!changelog) changelog = SC.Set.create();
    changelog.add(storeKey);
    this.changelog = changelog;
    
    // if commit records is enabled
    if(this.get('commitRecordsAutomatically')){
      this.invokeLast(this.commitRecords);
    }
    
    // finally return materialized record
    return this.materializeRecord(storeKey) ;
  },
  
  /**
    Creates an array of new records.  You must pass an array of dataHashes 
    plus a recordType and, optionally, an array of ids.  This will create an
    array of record instances with the same record type.
    
    If you need to instead create a bunch of records with different data types
    you can instead pass an array of recordTypes, one for each data hash.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} dataHashes array of data hashes
    @param {Array} ids (optional) ids to assign to records
    @returns {Array} array of materialized record instances.
  */
  createRecords: function(recordTypes, dataHashes, ids) {
    var ret = [], recordType, id, isArray, len = dataHashes.length, idx ;
    isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
    if (!isArray) recordType = recordTypes;
    for(idx=0;idx<len;idx++) {
      if (isArray) recordType = recordTypes[idx] || SC.Record;
      id = ids ? ids[idx] : undefined ;
      ret.push(this.createRecord(recordType, dataHashes[idx], id));
    }
    return ret ;
  },
  
  
  /**
    Unloads a record, removing the data hash from the store.  If you try to 
    unload a record that is already destroyed then this method will have no effect.  
    If you unload a record that does not exist or an error then an exception 
    will be raised.
    
    @param {SC.Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {SC.Store} receiver
  */
  unloadRecord: function(recordType, id, storeKey, newStatus) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), K = SC.Record;
    newStatus = newStatus || K.EMPTY;
    // handle status - ignore if destroying or destroyed
    if ((status === K.BUSY_DESTROYING) || (status & K.DESTROYED)) {
      return this; // nothing to do
      
    // error out if empty
    } else if (status & K.BUSY) {
      throw K.BUSY_ERROR ;
           
    // otherwise, destroy in dirty state
    } else status = newStatus ;
    
    // remove the data hash, set new status
    this.removeDataHash(storeKey, status);
    this.dataHashDidChange(storeKey);
            
    return this ;
  },
  
  /**
    Unloads a group of records.  If you have a set of record ids, unloading
    them this way can be faster than retrieving each record and unloading 
    it individually.
    
    You can pass either a single recordType or an array of recordTypes.  If
    you pass a single recordType, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record 
    type in the array.

    You can optionally pass an array of storeKeys instead of the recordType
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.  You will not usually
    unload records this way.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to unload
    @param {Array} storeKeys (optional) store keys to unload
    @returns {SC.Store} receiver
  */
  unloadRecords: function(recordTypes, ids, storeKeys, newStatus) {
    var len, isArray, idx, id, recordType, storeKey;
    if(storeKeys===undefined){
      len = ids.length;
      isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
      if (!isArray) recordType = recordTypes;
      for(idx=0;idx<len;idx++) {
        if (isArray) recordType = recordTypes[idx] || SC.Record;
        id = ids ? ids[idx] : undefined ;
        this.unloadRecord(recordType, id, undefined, newStatus);
      }
    }else{
      len = storeKeys.length;
      for(idx=0;idx<len;idx++) {
        storeKey = storeKeys ? storeKeys[idx] : undefined ;
        this.unloadRecord(undefined, undefined, storeKey, newStatus);
      }
    }
    return this ;
  },
  
  /**
    Destroys a record, removing the data hash from the store and adding the
    record to the destroyed changelog.  If you try to destroy a record that is 
    already destroyed then this method will have no effect.  If you destroy a 
    record that does not exist or an error then an exception will be raised.
    
    @param {SC.Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {SC.Store} receiver
  */
  destroyRecord: function(recordType, id, storeKey) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), changelog, K = SC.Record;

    // handle status - ignore if destroying or destroyed
    if ((status === K.BUSY_DESTROYING) || (status & K.DESTROYED)) {
      return this; // nothing to do
      
    // error out if empty
    } else if (status == K.EMPTY) {
      throw K.NOT_FOUND_ERROR ;
      
    // error out if busy
    } else if (status & K.BUSY) {
      throw K.BUSY_ERROR ;
      
    // if new status, destroy but leave in clean state
    } else if (status == K.READY_NEW) {
      status = K.DESTROYED_CLEAN ;
      
    // otherwise, destroy in dirty state
    } else status = K.DESTROYED_DIRTY ;
    
    // remove the data hash, set new status
    this.writeStatus(storeKey, status);
    this.dataHashDidChange(storeKey);

    // add/remove change log
    changelog = this.changelog;
    if (!changelog) changelog = this.changelog = SC.Set.create();

    ((status & K.DIRTY) ? changelog.add(storeKey) : changelog.remove(storeKey));
    this.changelog=changelog;

    // if commit records is enabled
    if(this.get('commitRecordsAutomatically')){
      this.invokeLast(this.commitRecords);
    }
        
    return this ;
  },
  
  /**
    Destroys a group of records.  If you have a set of record ids, destroying
    them this way can be faster than retrieving each record and destroying 
    it individually.
    
    You can pass either a single recordType or an array of recordTypes.  If
    you pass a single recordType, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record 
    type in the array.

    You can optionally pass an array of storeKeys instead of the recordType
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.  You will not usually
    destroy records this way.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} receiver
  */
  destroyRecords: function(recordTypes, ids, storeKeys) {
    var len, isArray, idx, id, recordType, storeKey;
    if(storeKeys===undefined){
      len = ids.length;
      isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
      if (!isArray) recordType = recordTypes;
      for(idx=0;idx<len;idx++) {
        if (isArray) recordType = recordTypes[idx] || SC.Record;
        id = ids ? ids[idx] : undefined ;
        this.destroyRecord(recordType, id, undefined);
      }
    }else{
      len = storeKeys.length;
      for(idx=0;idx<len;idx++) {
        storeKey = storeKeys ? storeKeys[idx] : undefined ;
        this.destroyRecord(undefined, undefined, storeKey);
      }
    }
    return this ;
  },
  
  /**
    Notes that the data for the given record id has changed.  The record will
    be committed to the server the next time you commit the root store.  Only
    call this method on a record in a READY state of some type.
    
    @param {SC.Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @param {String} key that changed (optional)
    @param {Boolean} if the change is to statusOnly (optional)
    @returns {SC.Store} receiver
  */
  recordDidChange: function(recordType, id, storeKey, key, statusOnly) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), changelog, K = SC.Record;
    
    // BUSY_LOADING, BUSY_CREATING, BUSY_COMMITTING, BUSY_REFRESH_CLEAN
    // BUSY_REFRESH_DIRTY, BUSY_DESTROYING
    if (status & K.BUSY) {
      throw K.BUSY_ERROR ;
      
    // if record is not in ready state, then it is not found.
    // ERROR, EMPTY, DESTROYED_CLEAN, DESTROYED_DIRTY
    } else if (!(status & K.READY)) {
      throw K.NOT_FOUND_ERROR ;
      
    // otherwise, make new status READY_DIRTY unless new.
    // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
    } else {
      if (status != K.READY_NEW) this.writeStatus(storeKey, K.READY_DIRTY);
    }
    
    // record data hash change
    this.dataHashDidChange(storeKey, null, statusOnly, key);
    
    // record in changelog
    changelog = this.changelog ;
    if (!changelog) changelog = this.changelog = SC.Set.create() ;
    changelog.add(storeKey);
    this.changelog = changelog;
    
    // if commit records is enabled
    if(this.get('commitRecordsAutomatically')){
      this.invokeLast(this.commitRecords);
    }
    
    return this ;
  },

  /**
    Mark a group of records as dirty.  The records will be committed to the
    server the next time you commit changes on the root store.  If you have a 
    set of record ids, marking them dirty this way can be faster than 
    retrieving each record and destroying it individually.
    
    You can pass either a single recordType or an array of recordTypes.  If
    you pass a single recordType, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record 
    type in the array.

    You can optionally pass an array of storeKeys instead of the recordType
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.  
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} receiver
  */
  recordsDidChange: function(recordTypes, ids, storeKeys) {
     var len, isArray, idx, id, recordType, storeKey;
      if(storeKeys===undefined){
        len = ids.length;
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
        if (!isArray) recordType = recordTypes;
        for(idx=0;idx<len;idx++) {
          if (isArray) recordType = recordTypes[idx] || SC.Record;
          id = ids ? ids[idx] : undefined ;
          storeKey = storeKeys ? storeKeys[idx] : undefined ;
          this.recordDidChange(recordType, id, storeKey);
        }
      }else{
        len = storeKeys.length;
        for(idx=0;idx<len;idx++) {
          storeKey = storeKeys ? storeKeys[idx] : undefined ;
          this.recordDidChange(undefined, undefined, storeKey);
        }
      }
      return this ;  
  },

  /**
    Retrieves a set of records from the server.  If the records has 
    already been loaded in the store, then this method will simply return.  
    Otherwise if your store has a dataSource, this will call the 
    dataSource to retrieve the record.  Generally you will not need to 
    call this method yourself. Instead you can just use find().
    
    This will not actually create a record instance but it will initiate a 
    load of the record from the server.  You can subsequently get a record 
    instance itself using materializeRecord()
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to retrieve
    @param {Array} storeKeys (optional) store keys to retrieve
    @param {Boolean} isRefresh
    @returns {Array} storeKeys to be retrieved
  */
  retrieveRecords: function(recordTypes, ids, storeKeys, isRefresh) {
    
    var source  = this._getDataSource(),
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        len     = (!storeKeys) ? ids.length : storeKeys.length,
        ret     = [],
        rev     = SC.Store.generateStoreKey(),
        K       = SC.Record,
        recordType, idx, storeKey, status, ok;
        
    if (!isArray) recordType = recordTypes;
    
    // if no storeKeys were passed, map recordTypes + ids
    for(idx=0;idx<len;idx++) {
      
      // collect store key
      if (storeKeys) {
        storeKey = storeKeys[idx];
      } else {
        if (isArray) recordType = recordTypes[idx];
        storeKey = recordType.storeKeyFor(ids[idx]);
      }
      
      // collect status and process
      status = this.readStatus(storeKey);
      
      // K.EMPTY, K.ERROR, K.DESTROYED_CLEAN - initial retrieval
      if ((status == K.EMPTY) || (status == K.ERROR) || (status == K.DESTROYED_CLEAN)) {
        this.writeStatus(storeKey, K.BUSY_LOADING);
        this.dataHashDidChange(storeKey, rev, YES);
        ret.push(storeKey);

      // otherwise, ignore record unless isRefresh is YES.
      } else if (isRefresh) {
        // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
        if (status & K.READY) {
          this.writeStatus(storeKey, K.BUSY_REFRESH | (status & 0x03)) ;
          this.dataHashDidChange(storeKey, rev, YES);
          ret.push(storeKey);

        // K.BUSY_DESTROYING, K.BUSY_COMMITTING, K.BUSY_CREATING
        } else if ((status == K.BUSY_DESTROYING) || (status == K.BUSY_CREATING) || (status == K.BUSY_COMMITTING)) {
          throw K.BUSY_ERROR ;

        // K.DESTROY_DIRTY, bad state...
        } else if (status == K.DESTROYED_DIRTY) {
          throw K.BAD_STATE_ERROR ;
          
        // ignore K.BUSY_LOADING, K.BUSY_REFRESH_CLEAN, K.BUSY_REFRESH_DIRTY
        }
      }
    }
    
    // now retrieve storekeys from dataSource.  if there is no dataSource,
    // then act as if we couldn't retrieve.
    ok = NO;
    if (source) ok = source.retrieveRecords.call(source, this, ret, ids);

    // if the data source could not retrieve or if there is no source, then
    // simulate the data source calling dataSourceDidError on those we are 
    // loading for the first time or dataSourceDidComplete on refreshes.
    if (!ok) {
      len = ret.length;
      rev = SC.Store.generateStoreKey();
      for(idx=0;idx<len;idx++) {
        storeKey = ret[idx];
        status   = this.readStatus(storeKey);
        if (status === K.BUSY_LOADING) {
          this.writeStatus(storeKey, K.ERROR);
          this.dataHashDidChange(storeKey, rev, YES);
          
        } else if (status & K.BUSY_REFRESH) {
          this.writeStatus(storeKey, K.READY | (status & 0x03));
          this.dataHashDidChange(storeKey, rev, YES);
        }
      }
      ret.length = 0 ; // truncate to indicate that none could refresh
    }
    return ret ;
  },
  
  _TMP_RETRIEVE_ARRAY: [],
  
  /**
    Retrieves a record from the server.  If the record has already been loaded
    in the store, then this method will simply return.  Otherwise if your 
    store has a dataSource, this will call the dataSource to retrieve the 
    record.  Generally you will not need to call this method yourself.  
    Instead you can just use find().
    
    This will not actually create a record instance but it will initiate a 
    load of the record from the server.  You can subsequently get a record 
    instance itself using materializeRecord()

    @param {SC.Record} recordType class
    @param {String} id id to retrieve
    @param {Number} storeKey (optional) store key
    @param {Boolean} isRefresh
    @returns {Number} storeKey that was retrieved 
  */
  retrieveRecord: function(recordType, id, storeKey, isRefresh) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret;
    
    if (storeKey) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }
    
    ret = this.retrieveRecords(recordType, id, storeKey, isRefresh);
    array.length = 0 ;
    return ret[0];
  },

  /**
    Refreshes a record from the server.  If the record has already been loaded
    in the store, then this method will request a refresh from the dataSource.
    Otherwise it will attempt to retrieve the record.
    
    @param {String} id to id of the record to load
    @param {SC.Record} recordType the expected record type
    @param {Number} storeKey (optional) optional store key
    @returns {Boolean} YES if the retrieval was a success.
  */
  refreshRecord: function(recordType, id, storeKey) {
    return !!this.retrieveRecord(recordType, id, storeKey, YES);
  },

  /**
    Refreshes a set of records from the server.  If the records has already been loaded
    in the store, then this method will request a refresh from the dataSource.
    Otherwise it will attempt to retrieve them.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Boolean} YES if the retrieval was a success.
  */
  refreshRecords: function(recordTypes, ids, storeKeys) {
    var ret = this.retrieveRecords(recordTypes, ids, storeKeys, YES);
    return ret && ret.length>0;
  },
    
  /**
    Commits the passed store keys or ids. If no storeKeys are given 
    it will commit any records in the changelog. 
    
    Based on the current state of the record, this will ask the data 
    source to perform the appropriate actions
    on the store keys.
    
    @param {Array} recordTypes the expected record types (SC.Record)
    @param {Array} ids to commit
    @param {Array} storeKeys to commit
    @param {Hash} params optional additional parameters to pass along to the
      data source

    @returns {Boolean} if the action was succesful.
  */
  commitRecords: function(recordTypes, ids, storeKeys, params) {
    
    var source    = this._getDataSource(),
        isArray   = SC.typeOf(recordTypes) === SC.T_ARRAY,    
        retCreate= [], retUpdate= [], retDestroy = [], 
        rev       = SC.Store.generateStoreKey(),
        K         = SC.Record,
        recordType, idx, storeKey, status, key, ret, len ;

    // If no params are passed, look up storeKeys in the changelog property.
    // Remove any committed records from changelog property.

    if(!recordTypes && !ids && !storeKeys){
      storeKeys = this.changelog;
    }

    len = storeKeys ? storeKeys.get('length') : (ids ? ids.get('length') : 0);
    
    for(idx=0;idx<len;idx++) {
      
      // collect store key
      if (storeKeys) {
        storeKey = storeKeys[idx];
      } else {
        if (isArray) recordType = recordTypes[idx] || SC.Record;
        else recordType = recordTypes;
        storeKey = recordType.storeKeyFor(ids[idx]);
      }
      
      // collect status and process
      status = this.readStatus(storeKey);
      
      if ((status == K.EMPTY) || (status == K.ERROR)) {
        throw K.NOT_FOUND_ERROR ;
      } 
      else {
        if(status==K.READY_NEW) {
          this.writeStatus(storeKey, K.BUSY_CREATING);
          this.dataHashDidChange(storeKey, rev, YES);
          retCreate.push(storeKey);
        } else if (status==K.READY_DIRTY) {
          this.writeStatus(storeKey, K.BUSY_COMMITTING);
          this.dataHashDidChange(storeKey, rev, YES);
          retUpdate.push(storeKey);
        } else if (status==K.DESTROYED_DIRTY) {
          this.writeStatus(storeKey, K.BUSY_DESTROYING);
          this.dataHashDidChange(storeKey, rev, YES);
          retDestroy.push(storeKey);
        } else if (status==K.DESTROYED_CLEAN) {
          this.dataHashDidChange(storeKey, rev, YES);
        }
        // ignore K.READY_CLEAN, K.BUSY_LOADING, K.BUSY_CREATING, K.BUSY_COMMITTING, 
        // K.BUSY_REFRESH_CLEAN, K_BUSY_REFRESH_DIRTY, KBUSY_DESTROYING
      }
    }
    
    // now commit storekeys to dataSource
    if (source && (len>0 || params)) {
      ret = source.commitRecords.call(source, this, retCreate, retUpdate, retDestroy, params);
    }
    
    //remove all commited changes from changelog
    if (ret && !recordTypes && !ids && storeKeys===this.changelog){ 
      this.changelog = null; 
    }
    return ret ;
  },

  /**
    Commits the passed store key or id.  Based on the current state of the 
    record, this will ask the data source to perform the appropriate action
    on the store key.
    
    You have to pass either the id or the storeKey otherwise it will return 
    NO.
    
    @param {SC.Record} recordType the expected record type
    @param {String} id the id of the record to commit
    @param {Number} storeKey the storeKey of the record to commit
    @param {Hash} params optional additonal params that will passed down
      to the data source
    @returns {Boolean} if the action was successful.
  */
  commitRecord: function(recordType, id, storeKey, params) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret ;
    if (id === undefined && storeKey === undefined ) return NO;
    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }
    
    ret = this.commitRecords(recordType, id, storeKey, params);
    array.length = 0 ;
    return ret;
  },
  
  /**
    Cancels an inflight request for the passed records.  Depending on the 
    server implementation, this could cancel an entire request, causing 
    other records to also transition their current state.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} the store.
  */
  cancelRecords: function(recordTypes, ids, storeKeys) {
    var source  = this._getDataSource(),
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        K       = SC.Record,
        ret     = [],
        status, len, idx, id, recordType, storeKey;
        
    len = (storeKeys === undefined) ? ids.length : storeKeys.length;
    for(idx=0;idx<len;idx++) {
      if (isArray) recordType = recordTypes[idx] || SC.Record;
      else recordType = recordTypes || SC.Record;
      
      id = ids ? ids[idx] : undefined ;
      
      if(storeKeys===undefined){
        storeKey = recordType.storeKeyFor(id);
      }else{
        storeKey = storeKeys ? storeKeys[idx] : undefined ;        
      }
      if(storeKey) {
        status = this.readStatus(storeKey);

        if ((status == K.EMPTY) || (status == K.ERROR)) {
          throw K.NOT_FOUND_ERROR ;
        }
        ret.push(storeKey);
      }
    }
    
    if (source) source.cancel.call(source, this, ret);
    
    return this ;
  },

  /**
    Cancels an inflight request for the passed record.  Depending on the 
    server implementation, this could cancel an entire request, causing 
    other records to also transition their current state.
  
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} the store.
  */
  cancelRecord: function(recordType, id, storeKey) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret ;
        
    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }
    
    ret = this.cancelRecords(recordType, id, storeKey);
    array.length = 0 ;
    return this;
  },

  /** 
    Convenience method can be called by the store or other parts of your 
    application to load a record into the store.  This method will take a
    recordType and a data hashes and either add or update the 
    record in the store. 
    
    The loaded records will be in an SC.Record.READY_CLEAN state, indicating
    they were loaded from the data source and do not need to be committed 
    back before changing.
    
    This method will check the state of the storeKey and call either 
    pushRetrieve() or dataSourceDidComplete().  The standard state constraints 
    for these methods apply here.
    
    The return value will be the storeKey used for the push.  This is often
    convenient to pass into loadQuery(), if you are fetching a remote query.
    
    If you are upgrading from a pre SproutCore 1.0 application, this method 
    is the closest to the old updateRecord().
    
    @param {SC.Record} recordType the record type
    @param {Array} dataHash to update
    @param {Array} id optional.  if not passed lookup on the hash
    @returns {String} store keys assigned to these id
  */
  loadRecord: function(recordType, dataHash, id) {
    var K       = SC.Record,
        ret, primaryKey, storeKey;
        
    // save lookup info
    recordType = recordType || SC.Record;
    primaryKey = recordType.prototype.primaryKey;
    
    
    // push each record
    id = id || dataHash[primaryKey];
    ret = storeKey = recordType.storeKeyFor(id); // needed to cache
      
    if (this.readStatus(storeKey) & K.BUSY) {
        this.dataSourceDidComplete(storeKey, dataHash, id);
      } else this.pushRetrieve(recordType, id, dataHash, storeKey);
    
    // return storeKey
    return ret ;
  },
  
  /** 
    Convenience method can be called by the store or other parts of your 
    application to load records into the store.  This method will take a
    recordType and an array of data hashes and either add or update the 
    record in the store. 
    
    The loaded records will be in an SC.Record.READY_CLEAN state, indicating
    they were loaded from the data source and do not need to be committed 
    back before changing.
    
    This method will check the state of each storeKey and call either 
    pushRetrieve() or dataSourceDidComplete().  The standard state constraints 
    for these methods apply here.
    
    The return value will be the storeKeys used for each push.  This is often
    convenient to pass into loadQuery(), if you are fetching a remote query.
    
    If you are upgrading from a pre SproutCore 1.0 application, this method 
    is the closest to the old updateRecords().
    
    @param {SC.Record} recordTypes the record type or array of record types
    @param {Array} dataHashes array of data hashes to update
    @param {Array} ids optional array of ids.  if not passed lookup on hashes
    @returns {Array} store keys assigned to these ids
  */
  loadRecords: function(recordTypes, dataHashes, ids) {
    var isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        len     = dataHashes.get('length'),
        ret     = [],
        K       = SC.Record,
        recordType, id, primaryKey, idx, dataHash, storeKey;
        
    // save lookup info
    if (!isArray) {
      recordType = recordTypes || SC.Record;
      primaryKey = recordType.prototype.primaryKey ;
    }
    
    // push each record
    for(idx=0;idx<len;idx++) {
      dataHash = dataHashes.objectAt(idx);
      if (isArray) {
        recordType = recordTypes.objectAt(idx) || SC.Record;
        primaryKey = recordType.prototype.primaryKey ;
      }
      id = (ids) ? ids.objectAt(idx) : dataHash[primaryKey];
      ret[idx] = this.loadRecord(recordType, dataHash, id);
      
    }
    
    // return storeKeys
    return ret ;
  },

  /**
    Returns the SC.Error object associated with a specific record.

    @param {Number} storeKey The store key of the record.
 
    @returns {SC.Error} SC.Error or undefined if no error associated with the record.
  */
  readError: function(storeKey) {
    var errors = this.recordErrors ;
    return errors ? errors[storeKey] : undefined ;
  },

  /**
    Returns the SC.Error object associated with a specific query.

    @param {SC.Query} query The SC.Query with which the error is associated.
 
    @returns {SC.Error} SC.Error or undefined if no error associated with the query.
  */
  readQueryError: function(query) {
    var errors = this.queryErrors ;
    return errors ? errors[SC.guidFor(query)] : undefined ;
  },
  
  // ..........................................................
  // DATA SOURCE CALLBACKS
  // 
  // Mathods called by the data source on the store

  /**
    Called by a dataSource when it cancels an inflight operation on a 
    record.  This will transition the record back to it non-inflight state.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidCancel: function(storeKey) {
    var status = this.readStatus(storeKey), 
        K      = SC.Record;
    
    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      throw K.BAD_STATE_ERROR; // should never be called in this state
      
    }
    
    // otherwise, determine proper state transition
    switch(status) {
      case K.BUSY_LOADING:
        status = K.EMPTY;
        break ;
      
      case K.BUSY_CREATING:
        status = K.READY_NEW;
        break;
        
      case K.BUSY_COMMITTING:
        status = K.READY_DIRTY ;
        break;
        
      case K.BUSY_REFRESH_CLEAN:
        status = K.READY_CLEAN;
        break;
        
      case K.BUSY_REFRESH_DIRTY:
        status = K.READY_DIRTY ;
        break ;
        
      case K.BUSY_DESTROYING:
        status = K.DESTROYED_DIRTY ;
        break;
        
      default:
        throw K.BAD_STATE_ERROR ;
    } 
    this.writeStatus(storeKey, status) ;
    this.dataHashDidChange(storeKey, null, YES);
    
    return this ;
  },
  
  /**
    Called by a data source when it creates or commits a record.  Passing an
    optional id will remap the storeKey to the new record id.  This is 
    required when you commit a record that does not have an id yet.
    
    @param {Number} storeKey record store key to change to READY_CLEAN state
    @param {Hash} dataHash optional data hash to replace current hash
    @param {Object} newId optional new id to replace the old one
    @returns {SC.Store} reciever
  */
  dataSourceDidComplete: function(storeKey, dataHash, newId) {
    var status = this.readStatus(storeKey), K = SC.Record, statusOnly;
    
    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      throw K.BAD_STATE_ERROR; // should never be called in this state
    }
    
    // otherwise, determine proper state transition
    if(status===K.BUSY_DESTROYING) {
      throw K.BAD_STATE_ERROR ;
    } else status = K.READY_CLEAN ;

    this.writeStatus(storeKey, status) ;
    if (dataHash) this.writeDataHash(storeKey, dataHash, status) ;
    if (newId) SC.Store.replaceIdFor(storeKey, newId);
    
    statusOnly = dataHash || newId ? NO : YES;
    this.dataHashDidChange(storeKey, null, statusOnly);
    
    return this ;
  },
  
  /**
    Called by a data source when it has destroyed a record.  This will
    transition the record to the proper state.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidDestroy: function(storeKey) {
    var status = this.readStatus(storeKey), K = SC.Record;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      throw K.BAD_STATE_ERROR; // should never be called in this state
    }
    // otherwise, determine proper state transition
    else{
      status = K.DESTROYED_CLEAN ;
    } 
    this.removeDataHash(storeKey, status) ;
    this.dataHashDidChange(storeKey);

    return this ;
  },

  /**
    Converts the passed record into an error object.
    
    @param {Number} storeKey record store key to error
    @param {SC.Error} error [optional] an SC.Error instance to associate with storeKey
    @returns {SC.Store} reciever
  */
  dataSourceDidError: function(storeKey, error) {
    var status = this.readStatus(storeKey), errors = this.recordErrors, K = SC.Record;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) throw K.BAD_STATE_ERROR; 

    // otherwise, determine proper state transition
    else status = K.ERROR ;

    // Add the error to the array of record errors (for lookup later on if necessary).
    if (error && error.isError) {
      if (!errors) errors = this.recordErrors = [];
      errors[storeKey] = error;
    }

    this.writeStatus(storeKey, status) ;
    this.dataHashDidChange(storeKey, null, YES);

    return this ;
  },

  // ..........................................................
  // PUSH CHANGES FROM DATA SOURCE
  // 
  
  /**
    Call by the data source whenever you want to push new data out of band 
    into the store.
    
    @param {Class} recordType the SC.Record subclass
    @param {Object} id the record id or null
    @param {Hash} dataHash data hash to load
    @param {Number} storeKey optional store key.  
    @returns {Number|Boolean} storeKey if push was allowed, NO if not
  */
  pushRetrieve: function(recordType, id, dataHash, storeKey) {
    var K = SC.Record, status;
    
    if(storeKey===undefined) storeKey = recordType.storeKeyFor(id);
    status = this.readStatus(storeKey);
    if(status==K.EMPTY || status==K.ERROR || status==K.READY_CLEAN || status==K.DESTROYED_CLEAN) {
      
      status = K.READY_CLEAN;
      if(dataHash===undefined) this.writeStatus(storeKey, status) ;
      else this.writeDataHash(storeKey, dataHash, status) ;

      this.dataHashDidChange(storeKey);
      
      return storeKey;
    }
    //conflicted (ready)
    return NO;
  },
  
  /**
    Call by the data source whenever you want to push a deletion into the 
    store.
    
    @param {Class} recordType the SC.Record subclass
    @param {Object} id the record id or null
    @param {Number} storeKey optional store key.  
    @returns {Number|Boolean} storeKey if push was allowed, NO if not
  */
  pushDestroy: function(recordType, id, storeKey) {
    var K = SC.Record, status;

    if(storeKey===undefined){
      storeKey = recordType.storeKeyFor(id);
    }
    status = this.readStatus(storeKey);
    if(status==K.EMPTY || status==K.ERROR || status==K.READY_CLEAN || status==K.DESTROYED_CLEAN){
      status = K.DESTROYED_CLEAN;
      this.removeDataHash(storeKey, status) ;
      this.dataHashDidChange(storeKey);
      return storeKey;
    }
    //conflicted (destroy)
    return NO;
  },

  /**
    Call by the data source whenever you want to push an error into the 
    store.
    
    @param {Class} recordType the SC.Record subclass
    @param {Object} id the record id or null
    @param {SC.Error} error [optional] an SC.Error instance to associate with id or storeKey
    @param {Number} storeKey optional store key.
    @returns {Number|Boolean} storeKey if push was allowed, NO if not
  */
  pushError: function(recordType, id, error, storeKey) {
    var K = SC.Record, status, errors = this.recordErrors;

    if(storeKey===undefined) storeKey = recordType.storeKeyFor(id);
    status = this.readStatus(storeKey);

    if(status==K.EMPTY || status==K.ERROR || status==K.READY_CLEAN || status==K.DESTROYED_CLEAN){
      status = K.ERROR;
      
      // Add the error to the array of record errors (for lookup later on if necessary).
      if (error && error.isError) {
        if (!errors) errors = this.recordErrors = [];
        errors[storeKey] = error;
      }
      
      this.writeStatus(storeKey, status) ;
      this.dataHashDidChange(storeKey, null, YES);
      return storeKey;
    }
    //conflicted (error)
    return NO;
  },
  
  // ..........................................................
  // FETCH CALLBACKS
  // 
  
  // NOTE: although these method works on RecordArray instances right now.
  // They could be optimized to actually share query results between nested
  // stores.  This is why these methods are implemented here instead of 
  // directly on Query or RecordArray objects.
  
  /**
    Sets the passed array of storeKeys as the new data for the query.  You
    can call this at any time for a remote query to update its content.  If
    you want to use incremental loading, then pass a SparseArray object.
    
    If the query you pass is not a REMOTE query, then this method will raise
    an exception.  This will also implicitly transition the query state to 
    SC.Record.READY.
    
    If you called loadRecords() before to load the actual content, you can
    call this method with the return value of that method to actually set the
    storeKeys on the result.
    
    @param {SC.Query} query the query you are loading.  must be remote.
    @param {SC.Array} storeKeys array of store keys
    @returns {SC.Store} receiver
  */
  loadQueryResults: function(query, storeKeys) {
    if (query.get('location') === SC.Query.LOCAL) {
      throw new Error("Cannot load query results for a local query");
    }

    var recArray = this._findQuery(query, YES, NO);
    if (recArray) recArray.set('storeKeys', storeKeys);
    this.dataSourceDidFetchQuery(query);
    
    return this ;
  },
  
  /**
    Called by your data source whenever you finish fetching the results of a 
    query.  This will put the query into a READY state if it was loading.
    
    Note that if the query is a REMOTE query, then you must separately load 
    the results into the query using loadQueryResults().  If the query is 
    LOCAL, then the query will update automatically with any new records you 
    added to the store.
    
    @param {SC.Query} query the query you fetched
    @returns {SC.Store} receiver
  */
  dataSourceDidFetchQuery: function(query) {
    return this._scstore_dataSourceDidFetchQuery(query, YES);
  },
  
  _scstore_dataSourceDidFetchQuery: function(query, createIfNeeded) {
    var recArray     = this._findQuery(query, createIfNeeded, NO),
        nestedStores = this.get('nestedStores'),
        loc          = nestedStores ? nestedStores.get('length') : 0;
    
    // fix query if needed
    if (recArray) recArray.storeDidFetchQuery(query);
    
    // notify nested stores
    while(--loc >= 0) {
      nestedStores[loc]._scstore_dataSourceDidFetchQuery(query, NO);
    }
    
    return this ;
  },
  
  /**
    Called by your data source if it cancels fetching the results of a query.
    This will put any RecordArray's back into its original state (READY or
    EMPTY).
    
    @param {SC.Query} query the query you cancelled
    @returns {SC.Store} receiver
  */
  dataSourceDidCancelQuery: function(query) {
    return this._scstore_dataSourceDidCancelQuery(query, YES);
  },
  
  _scstore_dataSourceDidCancelQuery: function(query, createIfNeeded) {
    var recArray     = this._findQuery(query, createIfNeeded, NO),
        nestedStores = this.get('nestedStores'),
        loc          = nestedStores ? nestedStores.get('length') : 0;
    
    // fix query if needed
    if (recArray) recArray.storeDidCancelQuery(query);
    
    // notify nested stores
    while(--loc >= 0) {
      nestedStores[loc]._scstore_dataSourceDidCancelQuery(query, NO);
    }
    
    return this ;
  },
  
  /**
    Called by your data source if it encountered an error loading the query.
    This will put the query into an error state until you try to refresh it
    again.
    
    @param {SC.Query} query the query with the error
    @param {SC.Error} error [optional] an SC.Error instance to associate with query
    @returns {SC.Store} receiver
  */
  dataSourceDidErrorQuery: function(query, error) {
    var errors = this.queryErrors;

    // Add the error to the array of query errors (for lookup later on if necessary).
    if (error && error.isError) {
      if (!errors) errors = this.queryErrors = {};
      errors[SC.guidFor(query)] = error;
    }

    return this._scstore_dataSourceDidErrorQuery(query, YES);
  },

  _scstore_dataSourceDidErrorQuery: function(query, createIfNeeded) {
    var recArray     = this._findQuery(query, createIfNeeded, NO),
        nestedStores = this.get('nestedStores'),
        loc          = nestedStores ? nestedStores.get('length') : 0;

    // fix query if needed
    if (recArray) recArray.storeDidErrorQuery(query);

    // notify nested stores
    while(--loc >= 0) {
      nestedStores[loc]._scstore_dataSourceDidErrorQuery(query, NO);
    }

    return this ;
  },
    
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.reset();
  },
  
  
  toString: function() {
    // Include the name if the client has specified one.
    var name = this.get('name');
    if (!name) {
      return arguments.callee.base.apply(this,arguments);
    }
    else {
      var ret = arguments.callee.base.apply(this,arguments);
      return "%@ (%@)".fmt(name, ret);
    }
  },


  // ..........................................................
  // PRIMARY KEY CONVENIENCE METHODS
  // 

  /** 
    Given a storeKey, return the primaryKey.
  
    @param {Number} storeKey the store key
    @returns {String} primaryKey value
  */
  idFor: function(storeKey) {
    return SC.Store.idFor(storeKey);
  },
  
  /**
    Given a storeKey, return the recordType.
    
    @param {Number} storeKey the store key
    @returns {SC.Record} record instance
  */
  recordTypeFor: function(storeKey) {
    return SC.Store.recordTypeFor(storeKey) ;
  },
  
  /**
    Given a recordType and primaryKey, find the storeKey. If the primaryKey 
    has not been assigned a storeKey yet, it will be added.
    
    @param {SC.Record} recordType the record type
    @param {String} primaryKey the primary key
    @returns {Number} storeKey
  */
  storeKeyFor: function(recordType, primaryKey) {
    return recordType.storeKeyFor(primaryKey);
  },
  
  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  As opposed to storeKeyFor() however, this method
    will NOT generate a new storeKey but returned undefined.
    
    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyExists: function(recordType, primaryKey) {
    return recordType.storeKeyExists(primaryKey);
  },
  
  /**
    Finds all storeKeys of a certain record type in this store
    and returns an array.
    
    @param {SC.Record} recordType
    @returns {Array} set of storeKeys
  */
  storeKeysFor: function(recordType) {
    var ret = [], 
        isEnum = recordType && recordType.isEnumerable,
        recType, storeKey, isMatch ;
    
    if (!this.statuses) return ret;
    for(storeKey in SC.Store.recordTypesByStoreKey) {
      recType = SC.Store.recordTypesByStoreKey[storeKey];
      
      // if same record type and this store has it
      if (isEnum) isMatch = recordType.contains(recType);
      else isMatch = recType === recordType;
      
      if(isMatch && this.statuses[storeKey]) ret.push(parseInt(storeKey, 10));
    }
    
    return ret;
  },
  
  /**
    Finds all storeKeys in this store
    and returns an array.
    
    @returns {Array} set of storeKeys
  */
  storeKeys: function() {
    var ret = [], storeKey;
    if(!this.statuses) return ret;
    
    for(storeKey in this.statuses) {
      // if status is not empty
      if(this.statuses[storeKey] != SC.Record.EMPTY) {
        ret.push(parseInt(storeKey, 10));
      }
    }
    
    return ret;
  },
  
  /**
    Returns string representation of a storeKey, with status.
    
    @param {Number} storeKey
    @returns {String}
  */
  statusString: function(storeKey) {
    var rec = this.materializeRecord(storeKey);
    return rec.statusString();
  }
  
}) ;

SC.Store.mixin({
  
  /**
    Standard error raised if you try to commit changes from a nested store
    and there is a conflict.
    
    @property {Error}
  */
  CHAIN_CONFLICT_ERROR: new Error("Nested Store Conflict"),
  
  /**
    Standard error if you try to perform an operation on a nested store 
    without a parent.
  
    @property {Error}
  */
  NO_PARENT_STORE_ERROR: new Error("Parent Store Required"),
  
  /**
    Standard error if you try to perform an operation on a nested store that
    is only supported in root stores.
    
    @property {Error}
  */
  NESTED_STORE_UNSUPPORTED_ERROR: new Error("Unsupported In Nested Store"),
  
  /**
    Standard error if you try to retrieve a record in a nested store that is
    dirty.  (This is allowed on the main store, but not in nested stores.)
    
    @property {Error}
  */
  NESTED_STORE_RETRIEVE_DIRTY_ERROR: new Error("Cannot Retrieve Dirty Record in Nested Store"),

  /**
    Data hash state indicates the data hash is currently editable
    
    @property {String}
  */
  EDITABLE:  'editable',
  
  /**
    Data hash state indicates the hash no longer tracks changes from a 
    parent store, but it is not editable.
    
    @property {String}
  */
  LOCKED:    'locked',

  /**
    Data hash state indicates the hash is tracking changes from the parent
    store and is not editable.
    
    @property {String}
  */
  INHERITED: 'inherited',
  
  /** @private
    This array maps all storeKeys to primary keys.  You will not normally
    access this method directly.  Instead use the idFor() and 
    storeKeyFor() methods on SC.Record.
  */
  idsByStoreKey: [],
  
  /** @private
    Maps all storeKeys to a recordType.  Once a storeKey is associated with 
    a primaryKey and recordType that remains constant throughout the lifetime
    of the application.
  */
  recordTypesByStoreKey: {},
  
  /** @private
    Maps some storeKeys to query instance.  Once a storeKey is associated with
    a query instance, that remains constant through the lifetime of the 
    application.  If a Query is destroyed, it will remove itself from this 
    list.
    
    Don't access this directly.  Use queryFor().
  */
  queriesByStoreKey: [],
  
  /** @private
    The next store key to allocate.  A storeKey must always be greater than 0
  */
  nextStoreKey: 1,
  
  /**
    Generates a new store key for use.
    
    @property {Number}
  */
  generateStoreKey: function() { return this.nextStoreKey++; },
  
  /** 
    Given a storeKey returns the primaryKey associated with the key.
    If not primaryKey is associated with the storeKey, returns null.
    
    @param {Number} storeKey the store key
    @returns {String} the primary key or null
  */
  idFor: function(storeKey) {
    return this.idsByStoreKey[storeKey] ;
  },
  
  /**
    Given a storeKey, returns the query object associated with the key.  If
    no query is associated with the storeKey, returns null.
    
    @param {Number} storeKey the store key
    @returns {SC.Query} query query object
  */
  queryFor: function(storeKey) {
    return this.queriesByStoreKey[storeKey];  
  },
  
  /**
    Given a storeKey returns the SC.Record class associated with the key.
    If no record type is associated with the store key, returns null.
    
    The SC.Record class will only be found if you have already called
    storeKeyFor() on the record.
    
    @param {Number} storeKey the store key
    @returns {SC.Record} the record type
  */
  recordTypeFor: function(storeKey) {
    return this.recordTypesByStoreKey[storeKey];
  },
  
  /**
    Swaps the primaryKey mapped to the given storeKey with the new 
    primaryKey.  If the storeKey is not currently associated with a record
    this will raise an exception.
    
    @param {Number} storeKey the existing store key
    @param {String} newPrimaryKey the new primary key
    @returns {SC.Store} receiver
  */
  replaceIdFor: function(storeKey, newId) {
    var oldId = this.idsByStoreKey[storeKey],
        recordType, storeKeys;
        
    if (oldId !== newId) { // skip if id isn't changing

      recordType = this.recordTypeFor(storeKey);
       if (!recordType) {
        throw new Error("replaceIdFor: storeKey %@ does not exist".fmt(storeKey));
      }

      // map one direction...
      this.idsByStoreKey[storeKey] = newId; 

      // then the other...
      storeKeys = recordType.storeKeysById() ;
      delete storeKeys[oldId];
      storeKeys[newId] = storeKey;     
    }
    
    return this ;
  },
  
  /**
    Swaps the recordType recorded for a given storeKey.  Normally you should
    not call this method directly as it can damage the store behavior.  This
    method is used by other store methods to set the recordType for a 
    storeKey.
    
    @param {Integer} storeKey the store key
    @param {SC.Record} recordType a record class
    @returns {SC.Store} reciever
  */
  replaceRecordTypeFor: function(storeKey, recordType) {
    this.recordTypesByStoreKey[storeKey] = recordType;
    return this ;
  }
  
});


/** @private */
SC.Store.prototype.nextStoreIndex = 1;

// ..........................................................
// COMPATIBILITY
// 

/** @private
  global store is used only for deprecated compatibility methods.  Don't use
  this in real code.
*/
SC.Store._getDefaultStore = function() {
  var store = this._store;
  if(!store) this._store = store = SC.Store.create();
  return store;
};

/** @private

  DEPRECATED
  
  Included for compatibility, loads data hashes with the named recordType. 
  If no recordType is passed, expects to find a recordType property in the 
  data hashes.  dataSource and isLoaded params are ignored.
  
  Calls SC.Store#loadRecords() on the default store. Do not use this method in 
  new code.  
  
  @param {Array} dataHashes data hashes to import
  @param {Object} dataSource ignored
  @param {SC.Record} recordType default record type
  @param {Boolean} isLoaded ignored
  @returns {Array} SC.Record instances for loaded data hashes
*/
SC.Store.updateRecords = function(dataHashes, dataSource, recordType, isLoaded) {
  
  console.warn("SC.Store.updateRecords() is deprecated.  Use loadRecords() instead");
  
  var store = this._getDefaultStore(),
      len   = dataHashes.length,
      idx, ret;
      
  // if no recordType was passed, build an array of recordTypes from hashes
  if (!recordType) {
    recordType = [];
    for(idx=0;idx<len;idx++) recordType[idx] = dataHashes[idx].recordType;
  }
  
  // call new API.  Returns storeKeys
  ret = store.loadRecords(recordType, dataHashes);
  
  // map to SC.Record instances
  len = ret.length;
  for(idx=0;idx<len;idx++) ret[idx] = store.materializeRecord(ret[idx]);
  
  return ret ;
};

/** @private

  DEPRECATED 

  Finds a record with the passed guid on the default store.  This is included
  only for compatibility.  You should use the newer find() method defined on
  SC.Store instead.
  
  @param {String} guid the guid
  @param {SC.Record} recordType expected record type
  @returns {SC.Record} found record
*/
SC.Store.find = function(guid, recordType) {
  return this._getDefaultStore().find(recordType, guid);
};

/** @private

  DEPRECATED 

  Passes through to findAll on default store.  This is included only for 
  compatibility.  You should use the newer findAll() defined on SC.Store
  instead.
  
  @param {Hash} filter search parameters
  @param {SC.Record} recordType type of record to find
  @returns {SC.RecordArray} result set
*/
SC.Store.findAll = function(filter, recordType) {
  return this._getDefaultStore().findAll(filter, recordType);
};

/* >>>>>>>>>> BEGIN source/system/nested_store.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/store');

/**
  @class

  A nested store can buffer changes to a parent store and then commit them
  all at once.  You usually will use a NestedStore as part of store chaining
  to stage changes to your object graph before sharing them with the rest of
  the application.
  
  Normally you will not create a nested store directly.  Instead, you can 
  retrieve a nested store by using the chain() method.  When you are finished
  working with the nested store, destroy() will dispose of it.
  
  @extends SC.Store
  @since SproutCore 1.0
*/
SC.NestedStore = SC.Store.extend(
/** @scope SC.NestedStore.prototype */ {

  /**
    This is set to YES when there are changes that have not been committed 
    yet.

    @property {Boolean}
    @default NO
  */
  hasChanges: NO,

  /**
    The parent store this nested store is chained to.  Nested stores must have
    a parent store in order to function properly.  Normally, you create a 
    nested store using the SC.Store#chain() method and this property will be
    set for you.
    
    @property {SC.Store}
  */
  parentStore: null,

  /**
    YES if the view is nested. Walk like a duck
    
    @property {Boolean}
  */
  isNested: YES,

  /**
    If YES, then the attribute hash state will be locked when you first 
    read the data hash or status.  This means that if you retrieve a record
    then change the record in the parent store, the changes will not be 
    visible to your nested store until you commit or discard changes.
    
    If NO, then the attribute hash will lock only when you write data.
    
    Normally you want to lock your attribute hash the first time you read it.
    This will make your nested store behave most consistently.  However, if
    you are using multiple sibling nested stores at one time, you may want
    to turn off this property so that changes from one store will be reflected
    in the other one immediately.  In this case you will be responsible for
    ensuring that the sibling stores do not edit the same part of the object
    graph at the same time.
    
    @property {Boolean} 
  */
  lockOnRead: YES,

  /** @private
    Array contains the base revision for an attribute hash when it was first
    cloned from the parent store.  If the attribute hash is edited and 
    commited, the commit will fail if the parent attributes hash has been 
    edited since.
    
    This is a form of optimistic locking, hence the name.
    
    Each store gets its own array of locks, which are selectively populated
    as needed.
    
    Note that this is kept as an array because it will be stored as a dense 
    array on some browsers, making it faster.
    
    @property {Array}
  */
  locks: null,

  /** @private
    An array that includes the store keys that have changed since the store
    was last committed.  This array is used to sync data hash changes between
    chained stores.  For a log changes that may actually be committed back to
    the server see the changelog property.
    
    @property {Array}
  */
  chainedChanges: null,
    
  // ..........................................................
  // STORE CHAINING
  // 
  
  /**
    find() cannot accept REMOTE queries in a nested store.  This override will
    verify that condition for you.  See SC.Store#find() for info on using this
    method.
    
    @returns {SC.Record|SC.RecordArray}
  */
  find: function(query) {
    if (query && query.isQuery && query.get('location') !== SC.Query.LOCAL) {
      throw "SC.Store#find() can only accept LOCAL queries in nested stores";
    }
    return arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Propagate this store's changes to its parent.  If the store does not 
    have a parent, this has no effect other than to clear the change set.

    @param {Boolean} force if YES, does not check for conflicts first
    @returns {SC.Store} receiver
  */
  commitChanges: function(force) {
    if (this.get('hasChanges')) {
      var pstore = this.get('parentStore');
      pstore.commitChangesFromNestedStore(this, this.chainedChanges, force);
    }

    // clear out custom changes - even if there is nothing to commit.
    this.reset();
    return this ;
  },

  /**
    Discard the changes made to this store and reset the store.
    
    @returns {SC.Store} receiver
  */
  discardChanges: function() {
    // any locked records whose rev or lock rev differs from parent need to
    // be notified.
    var records, locks;
    if ((records = this.records) && (locks = this.locks)) {
      var pstore = this.get('parentStore'), psRevisions = pstore.revisions;
      var revisions = this.revisions, storeKey, lock, rev;
      for (storeKey in records) {
        if (!records.hasOwnProperty(storeKey)) continue ;
        if (!(lock = locks[storeKey])) continue; // not locked.

        rev = psRevisions[storeKey];
        if ((rev !== lock) || (revisions[storeKey] > rev)) {
          this._notifyRecordPropertyChange(parseInt(storeKey, 10));
        }
      }
    }   
    
    this.reset();
    this.flush();
    return this ;
  },
  
  /**
    When you are finished working with a chained store, call this method to 
    tear it down.  This will also discard any pending changes.
    
    @returns {SC.Store} receiver
  */
  destroy: function() {
    this.discardChanges();
    
    var parentStore = this.get('parentStore');
    if (parentStore) parentStore.willDestroyNestedStore(this);
    
    arguments.callee.base.apply(this,arguments);  
    return this ;
  },

  /**
    Resets a store's data hash contents to match its parent.
    
    @returns {SC.Store} receiver
  */
  reset: function() {

    // requires a pstore to reset
    var parentStore = this.get('parentStore');
    if (!parentStore) throw SC.Store.NO_PARENT_STORE_ERROR;
    
    // inherit data store from parent store.
    this.dataHashes = SC.beget(parentStore.dataHashes);
    this.revisions  = SC.beget(parentStore.revisions);
    this.statuses   = SC.beget(parentStore.statuses);
    
    // also, reset private temporary objects
    this.chainedChanges = this.locks = this.editables = null;
    this.changelog = null ;

    // TODO: Notify record instances
    
    this.set('hasChanges', NO);
  },
  
  /** @private
  
    Chain to parentstore
  */
  refreshQuery: function(query) {
    var parentStore = this.get('parentStore');
    if (parentStore) parentStore.refreshQuery(query);
    return this ;      
  },

  /**
    Returns the SC.Error object associated with a specific record.

    Delegates the call to the parent store.

    @param {Number} storeKey The store key of the record.
 
    @returns {SC.Error} SC.Error or null if no error associated with the record.
  */
  readError: function(storeKey) {
    var parentStore = this.get('parentStore');
    return parentStore ? parentStore.readError(storeKey) : null;
  },

  /**
    Returns the SC.Error object associated with a specific query.

    Delegates the call to the parent store.

    @param {SC.Query} query The SC.Query with which the error is associated.
 
    @returns {SC.Error} SC.Error or null if no error associated with the query.
  */
  readQueryError: function(query) {
    var parentStore = this.get('parentStore');
    return parentStore ? parentStore.readQueryError(query) : null;
  },
  
  // ..........................................................
  // CORE ATTRIBUTE API
  // 
  // The methods in this layer work on data hashes in the store.  They do not
  // perform any changes that can impact records.  Usually you will not need 
  // to use these methods.
  
  /**
    Returns the current edit status of a storekey.  May be one of INHERITED,
    EDITABLE, and LOCKED.  Used mostly for unit testing.
    
    @param {Number} storeKey the store key
    @returns {Number} edit status
  */
  storeKeyEditState: function(storeKey) {
    var editables = this.editables, locks = this.locks;
    return (editables && editables[storeKey]) ? SC.Store.EDITABLE : (locks && locks[storeKey]) ? SC.Store.LOCKED : SC.Store.INHERITED ;
  },
   
  /**  @private
    Locks the data hash so that it iterates independently from the parent 
    store.
  */
  _lock: function(storeKey) {
    var locks = this.locks, rev, editables;
    
    // already locked -- nothing to do
    if (locks && locks[storeKey]) return this;

    // create locks if needed
    if (!locks) locks = this.locks = [];

    // fixup editables
    editables = this.editables;
    if (editables) editables[storeKey] = 0;
    
    
    // if the data hash in the parent store is editable, then clone the hash
    // for our own use.  Otherwise, just copy a reference to the data hash
    // in the parent store. -- find first non-inherited state
    var pstore = this.get('parentStore'), editState;
    while(pstore && (editState=pstore.storeKeyEditState(storeKey)) === SC.Store.INHERITED) {
      pstore = pstore.get('parentStore');
    }
    
    if (pstore && editState === SC.Store.EDITABLE) {
      this.dataHashes[storeKey] = SC.clone(pstore.dataHashes[storeKey]);
      if (!editables) editables = this.editables = [];
      editables[storeKey] = 1 ; // mark as editable
      
    } else this.dataHashes[storeKey] = this.dataHashes[storeKey];
    
    // also copy the status + revision
    this.statuses[storeKey] = this.statuses[storeKey];
    rev = this.revisions[storeKey] = this.revisions[storeKey];
    
    // save a lock and make it not editable
    locks[storeKey] = rev || 1;    
    
    return this ;
  },
  
  /** @private - adds chaining support */
  readDataHash: function(storeKey) {
    if (this.get('lockOnRead')) this._lock(storeKey);
    return this.dataHashes[storeKey];
  },
  
  /** @private - adds chaining support */
  readEditableDataHash: function(storeKey) {

    // lock the data hash if needed
    this._lock(storeKey);
    
    return arguments.callee.base.apply(this,arguments);
  },
  
  /** @private - adds chaining support - 
    Does not call sc_super because the implementation of the method vary too
    much. 
  */
  writeDataHash: function(storeKey, hash, status) {
    var locks = this.locks, didLock = NO, rev ;

    // Update our dataHash and/or status, depending on what was passed in.
    // Note that if no new hash was passed in, we'll lock the storeKey to
    // properly fork our dataHash from our parent store.  Similarly, if no
    // status was passed in, we'll save our own copy of the value.
    if (hash) {
      this.dataHashes[storeKey] = hash;
    }
    else {
      this._lock(storeKey);
      didLock = YES;
    }

    if (status) {
      this.statuses[storeKey] = status;
    }
    else {
      if (!didLock) this.statuses[storeKey] = (this.statuses[storeKey] || SC.Record.READY_NEW);
    }

    if (!didLock) {
      rev = this.revisions[storeKey] = this.revisions[storeKey]; // copy ref
    
      // make sure we lock if needed.
      if (!locks) locks = this.locks = [];
      if (!locks[storeKey]) locks[storeKey] = rev || 1;
    }
    
    // Also note that this hash is now editable.  (Even if we locked it,
    // above, it may not have been marked as editable.)
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    editables[storeKey] = 1 ; // use number for dense array support
    
    return this ;
  },

  /** @private - adds chaining support */
  removeDataHash: function(storeKey, status) {
    
    // record optimistic lock revision
    var locks = this.locks;
    if (!locks) locks = this.locks = [];
    if (!locks[storeKey]) locks[storeKey] = this.revisions[storeKey] || 1;

    return arguments.callee.base.apply(this,arguments);
  },
  
  /** @private - book-keeping for a single data hash. */
  dataHashDidChange: function(storeKeys, rev, statusOnly, key) {
    
    // update the revision for storeKey.  Use generateStoreKey() because that
    // gaurantees a universally (to this store hierarchy anyway) unique 
    // key value.
    if (!rev) rev = SC.Store.generateStoreKey();
    var isArray, len, idx, storeKey;
    
    isArray = SC.typeOf(storeKeys) === SC.T_ARRAY;
    if (isArray) {
      len = storeKeys.length;
    } else {
      len = 1;
      storeKey = storeKeys;
    }

    var changes = this.chainedChanges;
    if (!changes) changes = this.chainedChanges = SC.Set.create();
    
    for(idx=0;idx<len;idx++) {
      if (isArray) storeKey = storeKeys[idx];
      this._lock(storeKey);
      this.revisions[storeKey] = rev;
      changes.add(storeKey);
      this._notifyRecordPropertyChange(storeKey, statusOnly, key);
    }

    this.setIfChanged('hasChanges', YES);
    return this ;
  },

  // ..........................................................
  // SYNCING CHANGES
  // 
  
  /** @private - adapt for nested store */
  commitChangesFromNestedStore: function(nestedStore, changes, force) {

    arguments.callee.base.apply(this,arguments);
    
    // save a lock for each store key if it does not have one already
    // also add each storeKey to my own changes set.
    var pstore = this.get('parentStore'), psRevisions = pstore.revisions, i;
    var myLocks = this.locks, myChanges = this.chainedChanges,len,storeKey;
    if (!myLocks) myLocks = this.locks = [];
    if (!myChanges) myChanges = this.chainedChanges = SC.Set.create();

    len = changes.length ;
    for(i=0;i<len;i++) {
      storeKey = changes[i];
      if (!myLocks[storeKey]) myLocks[storeKey] = psRevisions[storeKey]||1;
      myChanges.add(storeKey);
    }
    
    // Finally, mark store as dirty if we have changes
    this.setIfChanged('hasChanges', myChanges.get('length')>0);
    this.flush();
    
    return this ;
  },

  // ..........................................................
  // HIGH-LEVEL RECORD API
  // 
  
  
  /** @private - adapt for nested store */
  queryFor: function(recordType, conditions, params) {
    return this.get('parentStore').queryFor(recordType, conditions, params);
  },
  
  /** @private - adapt for nested store */
  findAll: function(recordType, conditions, params, recordArray, _store) { 
    if (!_store) _store = this;
    return this.get('parentStore').findAll(recordType, conditions, params, recordArray, _store);
  },

  // ..........................................................
  // CORE RECORDS API
  // 
  // The methods in this section can be used to manipulate records without 
  // actually creating record instances.
  
  /** @private - adapt for nested store
  
    Unlike for the main store, for nested stores if isRefresh=YES, we'll throw
    an error if the record is dirty.  We'll otherwise avoid setting our status
    because that can disconnect us from upper and/or lower stores.
  */
  retrieveRecords: function(recordTypes, ids, storeKeys, isRefresh) {
    var pstore = this.get('parentStore'), idx, storeKey, newStatus,
      len = (!storeKeys) ? ids.length : storeKeys.length,
      K = SC.Record, status;

    // Is this a refresh?
    if (isRefresh) {
      for(idx=0;idx<len;idx++) {
        storeKey = !storeKeys ? pstore.storeKeyFor(recordTypes, ids[idx]) : storeKeys[idx];
        status   = this.peekStatus(storeKey);
        
        // We won't allow calling retrieve on a dirty record in a nested store
        // (although we do allow it in the main store).  This is because doing
        // so would involve writing a unique status, and that would break the
        // status hierarchy, so even though lower stores would complete the
        // retrieval, the upper layers would never inherit the new statuses.
        if (status & K.DIRTY) {
          throw SC.Store.NESTED_STORE_RETRIEVE_DIRTY_ERROR;
        }
        else {
          // Not dirty?  Then abandon any status we had set (to re-establish
          // any prototype linkage breakage) before asking our parent store to
          // perform the retrieve.
          var dataHashes = this.dataHashes,
              revisions  = this.revisions,
              statuses   = this.statuses,
              editables  = this.editables,
              locks      = this.locks;

          var changed    = NO;
          var statusOnly = NO;
  
          if (dataHashes  &&  dataHashes.hasOwnProperty(storeKey)) {
            delete dataHashes[storeKey];
            changed = YES;
          }
          if (revisions   &&  revisions.hasOwnProperty(storeKey)) {
            delete revisions[storeKey];
            changed = YES;
          }
          if (editables) delete editables[storeKey];
          if (locks) delete locks[storeKey];

          if (statuses  &&  statuses.hasOwnProperty(storeKey)) {
            delete statuses[storeKey];
            if (!changed) statusOnly = YES;
            changed = YES;
          }
          
          if (changed) this._notifyRecordPropertyChange(storeKey, statusOnly);
        }
      }
    }
    
    return pstore.retrieveRecords(recordTypes, ids, storeKeys, isRefresh);
  },

  /** @private - adapt for nested store */
  commitRecords: function(recordTypes, ids, storeKeys) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  commitRecord: function(recordType, id, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  cancelRecords: function(recordTypes, ids, storeKeys) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  cancelRecord: function(recordType, id, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  // ..........................................................
  // DATA SOURCE CALLBACKS
  // 
  // Mathods called by the data source on the store

  /** @private - adapt for nested store */
  dataSourceDidCancel: function(storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  dataSourceDidComplete: function(storeKey, dataHash, newId) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  dataSourceDidDestroy: function(storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  dataSourceDidError: function(storeKey, error) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  // ..........................................................
  // PUSH CHANGES FROM DATA SOURCE
  // 
  
  /** @private - adapt for nested store */
  pushRetrieve: function(recordType, id, dataHash, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  pushDestroy: function(recordType, id, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  pushError: function(recordType, id, error, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  }
  
}) ;


/* >>>>>>>>>> BEGIN source/system/record_array.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');

/**
  @class

  A RecordArray wraps an array of storeKeys and, optionally, a Query object.
  When you access the items of a RecordArray it will automatically convert the
  storeKeys into actual SC.Record objects that the rest of your application
  can work with.
  
  Normally you do not create RecordArray's yourself.  Instead, a RecordArray
  is returned when you call SC.Store.findAll(), already properly configured.
  You can usually just work with the RecordArray instance just like another
  array.
  
  The information below about RecordArray internals is only intended for those
  who need to override this class for some reason to do some special.
  
  h2. Internal Notes
  
  Normally the RecordArray behavior is very simple.  Any array-like operations
  will be translated into similar calls onto the underlying array of 
  storeKeys.  The underlying array can be a real array or it may be a 
  SparseArray, which is how you implement incremental loading.
  
  If the RecordArray is created with an SC.Query objects as well (and it 
  almost always will have a Query object), then the RecordArray will also 
  consult the query for various delegate operations such as determining if 
  the record array should update automatically whenever records in the store
  changes.
  
  It will also ask the Query to refresh the storeKeys whenever records change
  in the store.
  
  @extends SC.Object
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.RecordArray = SC.Object.extend(SC.Enumerable, SC.Array, 
  /** @scope SC.RecordArray.prototype */ {
    
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly. 
    
    NOTE: You MUST set this property on the RecordArray when creating it or 
    else it will fail.
  
    @property {SC.Store}
  */
  store: null,

  /**
    The Query object this record array is based upon.  All record arrays MUST 
    have an associated query in order to function correctly.  You cannot 
    change this property once it has been set.

    NOTE: You MUST set this property on the RecordArray when creating it or 
    else it will fail.
    
    @property {SC.Query}
  */
  query: null,

  /**
    The array of storeKeys as retrieved from the owner store.
    
    @property {SC.Array}
  */
  storeKeys: null,

  /**
    The current status for the record array.  Read from the underlying 
    store.
    
    @property {Number}
  */
  status: SC.Record.EMPTY,
  
  /**
    The current editabile state based on the query.
    
    @property {Boolean}
  */
  isEditable: function() {
    var query = this.get('query');
    return query ? query.get('isEditable') : NO;
  }.property('query').cacheable(),
  
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /** @private
    Returned length is a pass-through to the storeKeys array.
  */
  length: function() {
    this.flush(); // cleanup pending changes
    var storeKeys = this.get('storeKeys');
    return storeKeys ? storeKeys.get('length') : 0;
  }.property('storeKeys').cacheable(),

  _scra_records: null,
  
  /** @private
    Looks up the store key in the store keys array and materializes a
    records.
    
    @param {Number} idx index of the object
    @return {SC.Record} materialized record
  */
  objectAt: function(idx) {

    this.flush(); // cleanup pending if needed

    var recs      = this._scra_records, 
        storeKeys = this.get('storeKeys'),
        store     = this.get('store'),
        storeKey, ret ;
    
    if (!storeKeys || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    
    // not in cache, materialize
    if (!recs) this._scra_records = recs = [] ; // create cache
    storeKey = storeKeys.objectAt(idx);
    
    if (storeKey) {
      // if record is not loaded already, then ask the data source to 
      // retrieve it
      if (store.peekStatus(storeKey) === SC.Record.EMPTY) {
        store.retrieveRecord(null, null, storeKey);
      }
      recs[idx] = ret = store.materializeRecord(storeKey);
    }
    return ret ;
  },

  /** @private - optimized forEach loop. */
  forEach: function(callback, target) {
    this.flush();
    
    var recs      = this._scra_records, 
        storeKeys = this.get('storeKeys'),
        store     = this.get('store'), 
        len       = storeKeys ? storeKeys.get('length') : 0,
        idx, storeKey, rec;
        
    if (!storeKeys || !store) return this; // nothing to do    
    if (!recs) recs = this._scra_records = [] ;
    if (!target) target = this;
    
    for(idx=0;idx<len;idx++) {
      rec = recs[idx];
      if (!rec) {
        rec = recs[idx] = store.materializeRecord(storeKeys.objectAt(idx));
      }
      callback.call(target, rec, idx, this);
    }
    
    return this;
  },
  
  /** @private
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeKeys.
    
    @param {Number} idx start index
    @param {Number} amt end index
    @param {SC.RecordArray} recs to replace with records
    @return {SC.RecordArray} 'this' after replace
  */
  replace: function(idx, amt, recs) {

    this.flush(); // cleanup pending if needed
    
    var storeKeys = this.get('storeKeys'), 
        len       = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        i, keys;
        
    if (!storeKeys) throw "storeKeys required";

    var query = this.get('query');
    if (query && !query.get('isEditable')) throw SC.RecordArray.NOT_EDITABLE;
    
    // you can't modify an array whose store keys are autogenerated from a 
    // query.
    
    // map to store keys
    keys = [] ;
    for(i=0;i<len;i++) keys[i] = recs.objectAt(i).get('storeKey');
    
    // pass along - if allowed, this should trigger the content observer 
    storeKeys.replace(idx, amt, keys);
    return this; 
  },
  
  /**
    Returns YES if the passed can be found in the record array.  This is 
    provided for compatibility with SC.Set.
    
    @param {SC.Record} record the record
    @returns {Boolean}
  */
  contains: function(record) {
    return this.indexOf(record)>=0;
  },
  
  /** @private
    Returns the first index where the specified record is found.
    
    @param {SC.Record} record the record
    @param {Number} startAt optional starting index
    @returns {Number} index
  */
  indexOf: function(record, startAt) {
    if (!SC.kindOf(record, SC.Record)) return NO ; // only takes records
    
    this.flush();
    
    var storeKey  = record.get('storeKey'), 
        storeKeys = this.get('storeKeys');
        
    return storeKeys ? storeKeys.indexOf(storeKey, startAt) : -1; 
  },

  /** @private 
    Returns the last index where the specified record is found.
    
    @param {SC.Record} record the record
    @param {Number} startAt optional starting index
    @returns {Number} index
  */
  lastIndexOf: function(record, startAt) {
    if (!SC.kindOf(record, SC.Record)) return NO ; // only takes records

    this.flush();
    
    var storeKey  = record.get('storeKey'), 
        storeKeys = this.get('storeKeys');
    return storeKeys ? storeKeys.lastIndexOf(storeKey, startAt) : -1; 
  },

  /** 
    Adds the specified record to the record array if it is not already part 
    of the array.  Provided for compatibilty with SC.Set.
    
    @param {SC.Record} record
    @returns {SC.RecordArray} receiver
  */
  add: function(record) {
    if (!SC.kindOf(record, SC.Record)) return this ;
    if (this.indexOf(record)<0) this.pushObject(record);
    return this ;
  },
  
  /**
    Removes the specified record from the array if it is not already a part
    of the array.  Provided for compatibility with SC.Set.
    
    @param {SC.Record} record
    @returns {SC.RecordArray} receiver
  */
  remove: function(record) {
    if (!SC.kindOf(record, SC.Record)) return this ;
    this.removeObject(record);
    return this ;
  },
  
  // ..........................................................
  // HELPER METHODS
  // 

  /**
    Extends the standard SC.Enumerable implementation to return results based
    on a Query if you pass it in.
    
    @param {SC.Query} query a SC.Query object
    @returns {SC.RecordArray} 
  */
  find: function(query, target) {
    if (query && query.isQuery) {
      return this.get('store').find(query.queryWithScope(this));
    } else return arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Call whenever you want to refresh the results of this query.  This will
    notify the data source, asking it to refresh the contents.
    
    @returns {SC.RecordArray} receiver
  */
  refresh: function() {
    this.get('store').refreshQuery(this.get('query'));
    return this;
  },
  
  /**
    Will recompute the results based on the SC.Query attached to the record
    array. Useful if your query is based on computed properties that might 
    have changed. Use refresh() instead of you want to trigger a fetch on your
    data source since this will purely look at records already loaded into
    the store.
    
    @returns {SC.RecordArray} receiver
  */
  reload: function() {
    this.flush(YES);
    return this;
  },
  
  /**
    Destroys the record array.  Releases any storeKeys, and deregisters with
    the owner store.
    
    @returns {SC.RecordArray} receiver
  */
  destroy: function() {
    if (!this.get('isDestroyed')) {
      this.get('store').recordArrayWillDestroy(this);
    } 
    
    arguments.callee.base.apply(this,arguments);
  },
  
  // ..........................................................
  // STORE CALLBACKS
  // 
  
  // NOTE: storeWillFetchQuery(), storeDidFetchQuery(), storeDidCancelQuery(),
  // and storeDidErrorQuery() are tested implicitly through the related
  // methods in SC.Store.  We're doing it this way because eventually this 
  // particular implementation is likely to change; moving some or all of this
  // code directly into the store. -CAJ
  
  /** @private
    Called whenever the store initiates a refresh of the query.  Sets the 
    status of the record array to the appropriate status.
    
    @param {SC.Query} query
    @returns {SC.RecordArray} receiver
  */
  storeWillFetchQuery: function(query) {
    var status = this.get('status'),
        K      = SC.Record;
    if ((status === K.EMPTY) || (status === K.ERROR)) status = K.BUSY_LOADING;
    if (status & K.READY) status = K.BUSY_REFRESH;
    this.setIfChanged('status', status);
    return this ;
  },
  
  /** @private
    Called whenever the store has finished fetching a query.
    
    @param {SC.Query} query
    @returns {SC.RecordArray} receiver
  */
  storeDidFetchQuery: function(query) {
    this.setIfChanged('status', SC.Record.READY_CLEAN);
    return this ;
  },
  
  /** @private
    Called whenever the store has cancelled a refresh.  Sets the 
    status of the record array to the appropriate status.
    
    @param {SC.Query} query
    @returns {SC.RecordArray} receiver
  */
  storeDidCancelQuery: function(query) {
    var status = this.get('status'),
        K      = SC.Record;
    if (status === K.BUSY_LOADING) status = K.EMPTY;
    else if (status === K.BUSY_REFRESH) status = K.READY_CLEAN;
    this.setIfChanged('status', status);
    return this ;
  },

  /** @private
    Called whenever the store encounters an error while fetching.  Sets the 
    status of the record array to the appropriate status.
    
    @param {SC.Query} query
    @returns {SC.RecordArray} receiver
  */
  storeDidErrorQuery: function(query) {
    this.setIfChanged('status', SC.Record.ERROR);
    return this ;
  },
  
  /** @private
    Called by the store whenever it changes the state of certain store keys.
    If the receiver cares about these changes, it will mark itself as dirty.
    The next time you try to access the record array it will update any 
    pending changes.
    
    @param {SC.Array} storeKeys the effected store keys
    @param {SC.Set} recordTypes the record types for the storeKeys.
    @returns {SC.RecordArray} receiver
  */
  storeDidChangeStoreKeys: function(storeKeys, recordTypes) {
    var query =  this.get('query');
    // fast path exits
    if (query.get('location') !== SC.Query.LOCAL) return this;
    if (!query.containsRecordTypes(recordTypes)) return this;   
    
    // ok - we're interested.  mark as dirty and save storeKeys.
    var changed = this._scq_changedStoreKeys;
    if (!changed) changed = this._scq_changedStoreKeys = SC.IndexSet.create();
    changed.addEach(storeKeys);
    
    this.set('needsFlush', YES);
    this.enumerableContentDidChange();

    return this;
  },
  
  /**
    Applies the query to any pending changed store keys, updating the record
    array contents as necessary.  This method is called automatically anytime
    you access the RecordArray to make sure it is up to date, but you can 
    call it yourself as well if you need to force the record array to fully
    update immediately.
    
    Currently this method only has an effect if the query location is 
    SC.Query.LOCAL.  You can call this method on any RecordArray however,
    without an error.
    
    @param {Boolean} _flush to force it - use reload() to trigger it
    @returns {SC.RecordArray} receiver
  */
  flush: function(_flush) {
    // Are we already inside a flush?  If so, then don't do it again, to avoid
    // never-ending recursive flush calls.  Instead, we'll simply mark
    // ourselves as needing a flush again when we're done.
    if (this._insideFlush) {
      this.set('needsFlush', YES);
      return this;
    }
    
    if (!this.get('needsFlush') && !_flush) return this; // nothing to do
    this.set('needsFlush', NO); // avoid running again.
    
    // fast exit
    var query = this.get('query'),
        store = this.get('store'); 
    if (!store || !query || query.get('location') !== SC.Query.LOCAL) {
      return this;
    }
    
    this._insideFlush = YES;
    
    // OK, actually generate some results
    var storeKeys = this.get('storeKeys'),
        changed   = this._scq_changedStoreKeys,
        didChange = NO,
        K         = SC.Record,
        rec, status, recordType, sourceKeys, scope, included;

    // if we have storeKeys already, just look at the changed keys
    var oldStoreKeys = storeKeys;
    if (storeKeys && !_flush) {
      if (changed) {
        changed.forEach(function(storeKey) {
          // get record - do not include EMPTY or DESTROYED records
          status = store.peekStatus(storeKey);
          if (!(status & K.EMPTY) && !((status & K.DESTROYED) || (status === K.BUSY_DESTROYING))) {
            rec = store.materializeRecord(storeKey);
            included = !!(rec && query.contains(rec));
          } else included = NO ;
          
          // if storeKey should be in set but isn't -- add it.
          if (included) {
            if (storeKeys.indexOf(storeKey)<0) {
              if (!didChange) storeKeys = storeKeys.copy(); 
              storeKeys.pushObject(storeKey); 
            }
          // if storeKey should NOT be in set but IS -- remove it
          } else {
            if (storeKeys.indexOf(storeKey)>=0) {
              if (!didChange) storeKeys = storeKeys.copy();
              storeKeys.removeObject(storeKey);
            } // if (storeKeys.indexOf)
          } // if (included)
        }, this);
        // make sure resort happens
        didChange = YES ;
      } // if (changed)
    
    // if no storeKeys, then we have to go through all of the storeKeys 
    // and decide if they belong or not.  ick.
    } else {
      
      // collect the base set of keys.  if query has a parent scope, use that
      if (scope = query.get('scope')) {
        sourceKeys = scope.flush().get('storeKeys');

      // otherwise, lookup all storeKeys for the named recordType...
      } else if (recordType = query.get('expandedRecordTypes')) {
        sourceKeys = SC.IndexSet.create();
        recordType.forEach(function(cur) { 
          sourceKeys.addEach(store.storeKeysFor(recordType));
        });
      }

      // loop through storeKeys to determine if it belongs in this query or 
      // not.
      storeKeys = [];
      sourceKeys.forEach(function(storeKey) {
        status = store.peekStatus(storeKey);
        if (!(status & K.EMPTY) && !((status & K.DESTROYED) || (status === K.BUSY_DESTROYING))) {
          rec = store.materializeRecord(storeKey);
          if (rec && query.contains(rec)) storeKeys.push(storeKey);
        }
      });
      
      didChange = YES ;
    }

    // clear set of changed store keys
    if (changed) changed.clear();
    
    // only resort and update if we did change
    if (didChange) {
      
      // storeKeys must be a new instance because orderStoreKeys() works on it
      if (storeKeys && (storeKeys===oldStoreKeys)) {
        storeKeys = storeKeys.copy();
      }
      
      storeKeys = SC.Query.orderStoreKeys(storeKeys, query, store);
      if (SC.compare(oldStoreKeys, storeKeys) !== 0){
        this.set('storeKeys', SC.clone(storeKeys)); // replace content
      }
    }

    this._insideFlush = NO;
    return this;
  },

  /**
    Set to YES when the query is dirty and needs to update its storeKeys 
    before returning any results.  RecordArrays always start dirty and become
    clean the first time you try to access their contents.
    
    @property {Boolean}
  */
  needsFlush: YES,

  // ..........................................................
  // EMULATE SC.ERROR API
  // 
  
  /**
    Returns YES whenever the status is SC.Record.ERROR.  This will allow you 
    to put the UI into an error state.
    
    @property {Boolean}
  */
  isError: function() {
    return this.get('status') & SC.Record.ERROR;
  }.property('status').cacheable(),

  /**
    Returns the receiver if the record array is in an error state.  Returns null
    otherwise.
    
    @property {SC.Record}
  */
  errorValue: function() {
    return this.get('isError') ? SC.val(this.get('errorObject')) : null ;
  }.property('isError').cacheable(),
  
  /**
    Returns the current error object only if the record array is in an error state.
    If no explicit error object has been set, returns SC.Record.GENERIC_ERROR.
    
    @property {SC.Error}
  */
  errorObject: function() {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readQueryError(this.get('query')) || SC.Record.GENERIC_ERROR;
    } else return null ;
  }.property('isError').cacheable(),
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private 
    Invoked whenever the storeKeys array changes.  Observes changes.
  */
  _storeKeysDidChange: function() {
    var storeKeys = this.get('storeKeys');
    
    var prev = this._prevStoreKeys, 
        f    = this._storeKeysContentDidChange,
        fs   = this._storeKeysStateDidChange;
    
    if (storeKeys === prev) return; // nothing to do
    
    if (prev) prev.removeObserver('[]', this, f);
    this._prevStoreKeys = storeKeys;
    if (storeKeys) storeKeys.addObserver('[]', this, f);
    
    var rev = (storeKeys) ? storeKeys.propertyRevision : -1 ;
    this._storeKeysContentDidChange(storeKeys, '[]', storeKeys, rev);
    
  }.observes('storeKeys'),
  
  /** @private
    Invoked whenever the content of the storeKeys array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _storeKeysContentDidChange: function(target, key, value, rev) {
    if (this._scra_records) this._scra_records.length=0 ; // clear cache
    
    this.beginPropertyChanges()
      .notifyPropertyChange('length')
      .enumerableContentDidChange()
    .endPropertyChanges();
  },
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._storeKeysDidChange();
  }
  
});

SC.RecordArray.mixin({  
  
  /** 
    Standard error throw when you try to modify a record that is not editable
    
    @property {SC.Error}
  */
  NOT_EDITABLE: SC.Error.desc("SC.RecordArray is not editable")
});

/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/datastore');

/* >>>>>>>>>> BEGIN javascript.js */
/* >>>>>>>>>> BEGIN source/license.js */
/*! @license
==========================================================================
SproutCore -- JavaScript Application Framework
copyright 2006-2008, Sprout Systems, Inc. and contributors.

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

For more information about SproutCore, visit http://www.sproutcore.com


==========================================================================
@license */

/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/mini');

