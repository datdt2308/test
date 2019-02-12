;(function($){
  PageTop = function($trigger, options){
    if($trigger.length == 0) return;
    this.options = $.extend(this.DEFAULT_OPTIONS, options);
    this.options.duration = this.options.duration * 1000;
    this.$trigger = $trigger;
		this.init();
  };

  PageTop.prototype = {
    DEFAULT_OPTIONS: {
      duration: 0.5,
      easing: 'linear'
    },
    init: function(){
      this.setParameters();
      this.bindEvents();
    },
    setParameters: function(){
      this.$window = $(window);
      this.$htmlBody = $('html, body');
    },
    bindEvents: function(){
      this.$trigger.on('click',$.proxy(this.scrollTop, this));
    },
    scrollTop: function(){
      this.$htmlBody.animate({ scrollTop: 0 }, this.options.duration, this.options.easing);
    }
  };

  $.fn.pageTop = function(options) {
    this.each(function(){ new PageTop($(this), options) });
	};
})(jQuery);
