        ;(function() {
          var target_name = 'sproutcore/ace' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 
          
          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/empty_theme'],
            styles:   ['/static/sproutcore/ace/es/72f11e2cfc904a03b71e3cbfb76260b2661b3692/stylesheet-packed.css','/static/sproutcore/ace/es/72f11e2cfc904a03b71e3cbfb76260b2661b3692/stylesheet.css'],
            scripts:  ['/static/sproutcore/ace/es/72f11e2cfc904a03b71e3cbfb76260b2661b3692/javascript-packed.js','/static/sproutcore/ace/es/72f11e2cfc904a03b71e3cbfb76260b2661b3692/javascript.js']
          }
        })();
