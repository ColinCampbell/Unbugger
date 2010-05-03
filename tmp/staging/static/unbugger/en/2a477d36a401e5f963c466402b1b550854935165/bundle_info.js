        ;(function() {
          var target_name = 'square' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 
          
          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/ace'],
            styles:   ['/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/stylesheet-packed.css','/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/stylesheet.css'],
            scripts:  ['/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/javascript-packed.js','/static/square/en/dc854028e8da674b3dd14018640eb337e83d6743/javascript.js']
          }
        })();
