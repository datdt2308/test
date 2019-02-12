;(function($){
  ScrollAnimation = function($wrapper, options){
    if($wrapper.length == 0){
      return;
    }
    this.settings = $.extend({
      delay: 0.5,
      animationDuration: 1.5,
      easingType: 'linear',
      animatinOffset: 2,
		}, options);
    this.$wrapper = $wrapper;
    this.settings.delay = this.settings.delay * 1000;
		this.init();
  };

  ScrollAnimation.prototype = {
    stateClass: 'is-over',
    init: function(){
      this.setParameters();
      this.setAnimationOption();
      this.bindEvents();
      this.judgePos();
    },
    setParameters: function(){
      this.$window = $(window);
      if(this.$wrapper.hasClass('jsc-scroll-animation-target')){
        this.$target = this.$wrapper;
      }else{
        this.$target = this.$wrapper.find('.jsc-scroll-animation-target');
      }
    },
    setAnimationOption: function(){
      this.$target.css({
        'transition-duration': this.settings.animationDuration + 's',
        'transition-timing-function': this.settings.easingType
      });
    },
    bindEvents: function(){
  		this.$window.on('scroll',$.proxy(this.judgePos,this));
  	},
    judgePos: function(){
  		var windowBottom = this.$window.scrollTop() + this.$window.outerHeight();

			var posBorder = this.$wrapper.offset().top + (this.$wrapper.innerHeight() / this.settings.animatinOffset);
			if(windowBottom > posBorder) this.animateTarget();
  	},
    animateTarget: function(){
      var _self = this;
      this.$target.each(function(i){
        $(this).delay(i * _self.settings.delay).queue(function() {
				   $(this).addClass('is-over').dequeue();
				});
      });
    }
  };

  $.fn.ScrollAnimation = function(options){
    this.each(function(){
      new ScrollAnimation($(this), options)
    })
	};
})(jQuery);
