;(function($) {
  var smoothScrollController = {
    init: function() {
      this.setParams();
    },
    setParams: function() {
      this.instances = [];
    },
    setInstance: function($instance) {
      this.instances.push($instance);
    },
    notifyActionAll: function($actionEl) {
      for(var i = 0, len = this.instances.length; i < len; i++) {
        if($actionEl === this.instances[i] || this.instances[i].gid == void(0) || this.instances[i].gid !== $actionEl.gid) continue;
        this.instances[i].removeActive();
      }
    }
  };

  var smoothScroll = function(el, options) {
    this.$el = el;
    this.options = $.extend({}, this.DEFAULT_OPTIONS, options);
    this.options.duration = this.options.duration * 1000;
    this.controller = smoothScrollController;
    this.init();
  };

  smoothScroll.prototype = {
    CLASS: {
      ACTIVE: 'is-active'
    },
    DEFAULT_OPTIONS: {
      gid: null,
      offset: 0,
      duration: 1
    },
    init: function() {
      if(!this.setParams()) return;
      this.prepare();
      this.bindEvents();
    },
    setParams: function() {
      this.gid = this.options.gid;
      this.$targetEl = $(this.$el.attr('href'));
      if(this.$el.length === 0 || this.$targetEl.length === 0) return false;
      this.$htmlBody = $('html, body');
      return true;
    },
    prepare: function() {
      this.controller.setInstance(this);
    },
    bindEvents: function() {
      this.$el.on('click', $.proxy(this.notifyAndAction, this));
    },
    notifyAndAction: function(e) {
      e.preventDefault();
      if(this.gid) {
        this.controller.notifyActionAll(this);
        this.addActive();
      }
      this.toScroll();
    },
    toScroll: function() {
      var scrollTop = this.$targetEl.offset().top + this.options.offset;
      this.$htmlBody.animate({scrollTop: scrollTop}, this.options.duration);
    },
    addActive: function() {
      this.$el.addClass(this.CLASS.ACTIVE);
    },
    removeActive: function() {
      this.$el.removeClass(this.CLASS.ACTIVE);
    },
  };

  $.fn.smoothScroll = function(options) {
    this.each(function() { new smoothScroll($(this), options) });
  };

  smoothScrollController.init();
})(jQuery);
