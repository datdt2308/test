;(function($) {
  var tabSwicher = function($el, option) {
    this.$el = $el;
    this.option = option;
    return this.init();
  };

  tabSwicher.prototype = {
    CLASS: {
      ACTIVE: 'is-active',
      TABS: 'jsc-tabswitcher-tabs',
      CONTENTS: 'jsc-tabswitcher-contents'
    },
    init: function() {
      if(!this.setParams());
      this.prepare();
      this.bindEvents();
    },
    setParams: function() {
      if(!this.isValidOption()) return false;
      this.$tabs = this.$el.find('.' + this.CLASS.TABS).children();
      this.$contents = this.$el.find('.' + this.CLASS.CONTENTS).children();
      return true;
    },
    isValidOption: function() {
      var valid = false;
      valid = this.$el != void(0);
      valid = this.$el.length !== 0 && valid;
      return valid;
    },
    prepare: function() {
      this.$el.addClass('tabswitcher');
      this.$tabs.parent().addClass('tabswitcher-tabs');
      this.$contents.parent().addClass('tabswitcher-contents');
      if(!this.$tabs.hasClass(this.CLASS.ACTIVE) || !this.$contents.hasClass(this.CLASS.ACTIVE)) {
        this.switchTab(this.$tabs.eq(0));
      }
    },
    bindEvents: function() {
      var myself = this;
      this.$tabs.on('click', function(e) {
        e.preventDefault();
        myself.switchTab($(this));
      });
    },
    switchTab: function($tab) {
      var index = this.$tabs.index($tab);
      this.$tabs.removeClass(this.CLASS.ACTIVE);
      this.$contents.removeClass(this.CLASS.ACTIVE);
      $tab.addClass(this.CLASS.ACTIVE);
      this.$contents.eq(index).addClass(this.CLASS.ACTIVE);
    }
  };


  $.fn.tabSwicher = function(options){
    this.each(function(){
      new tabSwicher($(this), options)
    })
  };
})(jQuery);
