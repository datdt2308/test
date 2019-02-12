;(function($){
  var Carousel = function(el, option) {
    this.el = el;
    this.option = $.extend({}, this.DEFAULT_OPTION, option);
    this.option.duration = this.option.duration * 1000;
    this.init();
  };

  Carousel.prototype = {
    CLASS: {
      ACTIVE: 'is-active',
      IS_TRANSITION: 'is-transition'
    },
    DEFAULT_OPTION: {
      duration: 3,
      auto: false,
      viewCount: 3,
      spViewCount: 1,
      viewButton: false,
      viewIndicator: false,
      isSwipe: false,
      breakpoint: 0,
      swipeOffset: 50
    },
    init: function() {
      if(!this.setParams()) return;
      this.prepare();
      this.bindEvents();
    },
    setParams: function() {
      this.$container = this.el;
      if(this.$container.length === 0) return false;

      this.$window = null;
      this.$list = null;
      this.$items = this.$container.children();
      if(this.$items.length === 0) return false;

      this.$window = $(window);
      this.$body = $('body');

      this.$prevButton = null;
      this.$nextButton = null;
      this.$indicators = null;

      this.viewLength = this.option.viewCount;
      this.currentViewLength = this.option.breakpoint > this.$window.outerWidth() ? this.option.spViewCount : this.option.viewCount;
      this.itemLength = this.$items.length;
      this.timer = null;
      this.index = 0;
      this.indexOffset = 0;
      this.isSpEvent = false;
      return true;
    },
    prepare: function() {
      this.createCarousel();
      if(this.option.viewIndicator) this.createIndicator();
      if(this.option.viewButton) this.createButton();
      this.applyLoopStructure();
      this.makeready();
      if(this.option.auto) this.setIntervalTimer();
    },
    createCarousel: function() {
      this.$container.addClass('carousel');
      this.$window = $('<div class="carousel-window"></div>');
      this.$list = $('<div class="carousel-list"></div>');
      this.$list.append(this.$items);
      this.$window.append(this.$list);
      this.$container.append(this.$window);
    },
    createButton: function() {
      var $fragment = $(document.createDocumentFragment()),
        $button = $('<ul class="carousel-button-list"></ul>');
      $button.append('<li><a href="javascript: void(0);" class="jsc-carousel-button carousel-button prev">＜</a></li>');
      $button.append('<li><a href="javascript: void(0);" class="jsc-carousel-button carousel-button next">＞</a></li>');

      $fragment.append($button);
      this.$container.append($fragment);
      this.$prevButton = this.$container.find('.jsc-carousel-button.prev');
      this.$nextButton = this.$container.find('.jsc-carousel-button.next');
    },
    createIndicator: function() {
      var $fragment = $(document.createDocumentFragment()),
        $indicator = $('<ul class="carousel-indicator-list"></ul>');

      for(var i = 0, len = this.itemLength; i < len; i++) {
        $indicator.append($('<li><a href="javascript: void(0)" class="jsc-carousel-indicator carousel-indicator"></a></li>'))
      }

      $fragment.append($indicator);
      this.$container.append($fragment);
      this.$indicators = this.$container.find('.jsc-carousel-indicator');
    },
    applyLoopStructure: function() {
      this.indexOffset = this.viewLength;

      var $headItemfragment = $(document.createDocumentFragment()),
        $tailItemfragment = $(document.createDocumentFragment());

      for(var i = 0, len = this.viewLength - 1; i <= len; i++) {
        $headItemfragment.append(this.$items.eq(i).clone());
      }
      for(var i = this.itemLength - this.viewLength, len = this.itemLength; i < len; i++) {
        $tailItemfragment.append(this.$items.eq(i).clone());
      }

      this.$list.append($headItemfragment);
      this.$list.prepend($tailItemfragment);
    },
    makeready: function() {
      this.$list.outerWidth(this.$window.outerWidth() / this.currentViewLength * (this.itemLength + this.indexOffset * 2));
      this.move(0, false);
    },
    bindEvents: function() {
      var myself = this;
      $(window).on('resize', $.proxy(this.resizeEvent, this));
      if(this.option.breakpoint >= this.$window.outerWidth() && this.option.isSwipe && !this.isSpEvent) this.bindSpEvent();
      if(this.option.breakpoint < this.$window.outerWidth() && this.option.isSwipe && this.isSpEvent) this.unbindSpEvent();
      if(this.$prevButton) this.$prevButton.on('click', function() { myself.clearIntervalTimer(); myself.prevMove(); });
      if(this.$nextButton) this.$nextButton.on('click', function() { myself.clearIntervalTimer(); myself.nextMove(); });
      if(this.$indicators) this.$indicators.on('click', function() { myself.clearIntervalTimer(); myself.clickIndicator(myself.$indicators.index($(this))); });
    },
    bindTransitionEndEvent: function() {
      this.$list.on('mozTransitionEnd webkitTransitionEnd transitionend', $.proxy(function(e) {
        e.preventDefault(e);
        if(e.originalEvent.propertyName.indexOf('transform') < 0) return;
        this.$list.removeClass(this.CLASS.IS_TRANSITION);

        if(this.getIndex(false) < 0) {
          this.setIndex(this.itemLength - 1);
        } else if(this.getIndex(false) > this.itemLength - 1) {
          this.setIndex(0);
        }

        this.move(false);

        if(!this.timer && this.option.auto) this.setIntervalTimer();
      }, this));
    },
    bindSpEvent: function() {
      this.isSpEvent = true;
      this.$list.on('touchstart.carousel', $.proxy(this.swipeStart, this));
      this.$body.on('touchmove.carousel', $.proxy(this.swipeMove, this));
      this.$list.on('touchend.carousel', $.proxy(this.swipeEnd, this));
    },
    unbindSpEvent: function() {
      this.isSpEvent = false;
      this.$list.off('touchstart.carousel');
      this.$body.off('touchmove.carousel');
      this.$list.off('touchend.carousel');
    },
    resizeEvent: function() {
      if(this.option.auto) this.clearIntervalTimer();
      this.currentViewLength = this.option.breakpoint > this.$window.outerWidth() ? this.option.spViewCount : this.option.viewCount;
      if(this.option.breakpoint >= this.$window.outerWidth() && this.option.isSwipe && !this.isSpEvent) this.bindSpEvent();
      if(this.option.breakpoint < this.$window.outerWidth() && this.option.isSwipe && this.isSpEvent) this.unbindSpEvent();
      this.$list.outerWidth(this.$window.outerWidth() / this.currentViewLength * (this.itemLength + this.indexOffset * 2));
      this.move(false);
      if(this.option.auto) this.setIntervalTimer();
    },
    swipeStart: function(e) {
      e.preventDefault();
      if(this.isSwipe || this.$list.hasClass(this.CLASS.IS_TRANSITION)) return;
      this.isSwipe = true;
      this.clearIntervalTimer();
      this.swipeStartPosX = e.originalEvent.changedTouches[0].pageX;
    },
    swipeMove: function(e) {
      if(!this.isSwipe) return;
      this.swipeMovePosX = e.originalEvent.changedTouches[0].pageX;

      var left = -this.getIndex(true) * this.$items.outerWidth();
      this.$list.css({'transform': 'translate3d(' + (left + this.swipeMovePosX - this.swipeStartPosX) + 'px, 0, 0)'});
    },
    swipeEnd: function() {
      this.isSwipe = false;
      if(this.swipeMovePosX - this.swipeStartPosX > this.option.swipeOffset) {
        this.prevMove();
      } else if(this.swipeMovePosX - this.swipeStartPosX < -this.option.swipeOffset) {
        this.nextMove();
      } else {
        this.move(true);
      }
    },
    clickIndicator: function(index) {
      if(this.$list.hasClass(this.CLASS.IS_TRANSITION)) return;
      if(this.getIndex(false) === index) return;
      this.setIndex(index);
      this.move(true);
    },
    prevMove: function() {
      if(this.$list.hasClass(this.CLASS.IS_TRANSITION)) return;
      var index = this.getIndex(false) - 1;
      this.setIndex(index < 0 - 1 ? this.itemLength - 1 : index);
      this.move(true);
    },
    nextMove: function() {
      if(this.$list.hasClass(this.CLASS.IS_TRANSITION)) return;
      var index = this.getIndex(false) + 1;
      this.setIndex(index > this.itemLength - 1 + 1 ? 0 : index);
      this.move(true);
    },
    setIntervalTimer: function() {
      if(this.timer || !this.option.auto) return;
      this.timer = setInterval($.proxy(this.nextMove, this), this.option.duration);
    },
    clearIntervalTimer: function() {
      clearInterval(this.timer);
      this.timer = null;
    },
    setIndex: function(index) {
      this.index = index;
    },
    getIndex: function(isOffset) {
      return isOffset ? this.index + this.indexOffset : this.index;
    },
    move: function(isAnimate) {
      if(isAnimate) {
        this.$list.addClass(this.CLASS.IS_TRANSITION);
        this.bindTransitionEndEvent();
      }
      this.removeActive();
      this.addActive();
      var left = -this.getIndex(true) * this.$items.outerWidth();
      this.$list.css({ transform: 'translate3d(' + left + 'px, 0, 0)' });
    },
    addActive: function() {
      if(this.getIndex(false) > this.itemLength - 1) {
        if(this.$indicators) this.$indicators.eq(this.getIndex(false) - this.itemLength).addClass(this.CLASS.ACTIVE);
      } else if(this.getIndex(false) < 0) {
        if(this.$indicators) this.$indicators.eq(this.itemLength - this.getIndex(false) - 2).addClass(this.CLASS.ACTIVE);
      } else {
        if(this.$indicators) this.$indicators.eq(this.getIndex(false)).addClass(this.CLASS.ACTIVE);
      }
    },
    removeActive: function() {
      if(this.$indicators) this.$indicators.removeClass(this.CLASS.ACTIVE);
    }
  };

  $.fn.carousel = function(options) {
    this.each(function(){
      new Carousel($(this), options)
    })
  };
})(jQuery);
