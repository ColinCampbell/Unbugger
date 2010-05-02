SC.EmptyTheme=SC.BaseTheme.extend({classNames:["sc-empty"]});SC.Theme.register("sc-empty",SC.EmptyTheme);
SC.AceTheme=SC.EmptyTheme.extend({name:"Ace",description:"Coolness.",classNames:["ace","light"]});
SC.Theme.register("sc-ace",SC.AceTheme);SC.Pane.prototype.baseTheme="sc-ace";require("src/theme");
SC.AceTheme.renderers.Button=SC.EmptyTheme.renderers.Button.extend({renderContents:function(a){a.push("<span class='button-left'></span>");
a.push("<span class='button-middle'>");a=a.begin("label").addClass("sc-button-label");
this._titleRenderer.render(a);a=a.end();a.push("</span>");a.push("<span class='button-right'></span>")
}});SC.AceTheme.renderers.button=SC.AceTheme.renderers.Button.create();SC.AceTheme.IphoneForm=SC.AceTheme.subtheme("iphone-form","iphone-form");
require("theme");SC.AceTheme.IphoneForm.renderers.Form=SC.EmptyTheme.renderers.Form.extend({formFlowSpacing:{left:10,right:10,top:0,bottom:0}});
SC.AceTheme.IphoneForm.renderers.FormRow=SC.EmptyTheme.renderers.FormRow.extend({rowFlowPadding:{left:15,right:0,top:0,bottom:0},rowFlowSpacing:{left:0,right:15,top:0,bottom:0}});
SC.AceTheme.IphoneForm.renderers.Label=SC.EmptyTheme.renderers.Label.extend({renderTitle:function(a){a.push("<div class='inner'>");
this.titleRenderer.render(a);a.push("</div>");a.css("font-weight","")},updateTitle:function(){this.titleRenderer.update();
this.$().css("font-weight","")},didAttachLayer:function(a){this.titleRenderer.attachLayer(this.provide(".inner"))
}});SC.AceTheme.IphoneForm.renderers.form=SC.AceTheme.IphoneForm.renderers.Form.create();
SC.AceTheme.IphoneForm.renderers.formRow=SC.AceTheme.IphoneForm.renderers.FormRow.create();
SC.AceTheme.IphoneForm.renderers.label=SC.AceTheme.IphoneForm.renderers.Label.create();
SC.AceTheme.Popover=SC.AceTheme.subtheme("popover","popover");SC.AceTheme.SolidPopover=SC.AceTheme.Popover.subtheme("solid","solid");
SC.AceTheme.register("solid-popover",SC.AceTheme.SolidPopover);require("src/panels/picker/popover/popover");
SC.AceTheme.Popover.renderers.Picker=SC.EmptyTheme.renderers.Picker.extend({render:function(a){if(this.contentProvider){this.contentProvider.renderContent(a)
}a.addClass(this.pointerPos)},update:function(){this.$().addClass(this.pointerPos)
}});SC.AceTheme.Popover.renderers.picker=SC.AceTheme.Popover.renderers.Picker.create();
require("src/panels/picker/popover/popover");var theme=SC.AceTheme.Popover;SC.AceTheme.Popover.renderers.Workspace=SC.EmptyTheme.renderers.Workspace.extend({computeClassNames:function(){var a=this._TMP_CLASS_NAMES||{};
a["top-toolbar"]=this.hasTopToolbar;a["bottom-toolbar"]=this.hasBottomToolbar;this._TMP_CLASS_NAMES=a;
return a},render:function(a){a.setClass(this.computeClassNames());a.push("<div class='sc-workspace-overlay'>","<div class='middle'></div>","<div class='top-left-edge'></div>","<div class='top-edge'></div>","<div class='top-right-edge'></div>","<div class='right-edge'></div>","<div class='bottom-right-edge'></div>","<div class='bottom-edge'></div>","<div class='bottom-left-edge'></div>","<div class='left-edge'></div>","<div class='sc-pointer'></div>","</div>");
if(this.contentProvider){this.contentProvider.renderContent(a)}},update:function(){this.$().setClass(this.computeClassNames())
}});SC.AceTheme.Popover.renderers.workspace=SC.AceTheme.Popover.renderers.Workspace.create();
var Square=SC.AceTheme.extend({classNames:["square","normal"]});SC.Theme.register("square",Square);