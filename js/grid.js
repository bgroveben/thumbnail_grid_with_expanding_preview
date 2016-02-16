// list of items
var $grid = $( '#og-grid' ),
  // the items
  $items = $grid.children( 'li' ),
  // current expanded item's index
  current = -1,
  // position (top) of the xpanded item
  // used to know if the preview will expand in a different row
  previewPos = -1,
  // extra amount of pixels to scroll the window
  scrollExtra = 0,
  // extra margin when expanded (between the preview element and the next item row)
  marginExpanded = 10,
  $window = $( window ), winsize,
  $body = $( 'html, body' ),
  // transitioned events
  transEndEventNames = {
    'WebkitTransition' : 'webkitTransitionEnd',
    'MozTransition' : 'transitioned',
    'OTransition' : 'oTransitionEnd',
    'msTransition' : 'msTransitionEnd',
    'transition' : 'transitioned'
  },
  transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
  // support for csstransitions
  support = Modernizr.csstransitions,
  // default settings
  settings = {
    minHeight : 500,
    speed : 350,
    easing : 'ease'
  };

  function init( config ) {
    // the settings...
    settings = $.extend( true, {}, settings, config );
    // preload all images
    $grid.imagesLoaded( function () {
      // save item's size and offset
      saveItemInfo( true );
      // get window's size
      getWinSize();
      // initialize some events
      initEvents();
    });
  }

  // saves the item's offset top and height (if saveheight is true)
  function saveItemInfo( saveheight ) {
    $items.each( function() {
      var $item = $( this );
      $item.data( 'offsetTop', $item.offset().top );
      if( saveheight ) {
        $item.data( 'height', $item.height() );
      }
    });
  }

function getWinSize() {
  winsize = { width : $window.width(), height : $window.height() };
}

function initEvents() {
  // when clicking an item, show the preview with the item's info and large image
  // close the item if already expanded
  // also close if clicking on the item's cross
  $items.on( 'click', 'span.og-close', function() {
    hidePreview();
    return false;
  }).children( 'a' ).on( 'click', function(e) {
    var $item = $( this ).parent();
    // check if item already opened
    current === $item.index() ? hidePreview() : showPreview( $item );
    return false;
  });
  // on window resize get the window's size again
  // reset some values..
  $window.on( 'debouncedresize', function() {
    scrollExtra = 0;
    previewPos = -1;
    // save item's offset
    saveItemInfo();
    getWinsize();
    var preview = $.data( this, 'preview' );
    if( typeof preview != 'undefined' ) {
      hidePreview();
    }
  });
}

function showPreview( $item ) {
  var preview = $.data( this, 'preview' ),
  // item's offset top
    position = $item.data( 'offsetTop' );
  scrollExtra = 0;
  // if a preview exists and previewPos is different (in a different row) from the item's top, then close it
  if( typeof preview != 'undefined' ) {
    // not in the same row
    if(previewPos !== position ) {
      // if position > previewPos then we need to take the current preview's height into consideration
      // when scrolling the window
      if (position > previewPos ) {
        scrollExtra = preview.height;
      }
      hidePreview();
    }
    // same row
    else {
      preview.update( $item );
      return false;
    }
  }
  // update previewPos
  previewPos = position;
  // initialize new preview for the clicked item
  preview = $.data( this, 'preview', new Preview( $item ) );
  // expand preview overlay
  preview.open();
}

// the preview object / overlay
function Preview ( $item ) {
  this.$item = $item;
  this.expandedIdx = this.$item.index();
  this.create();
  this.update();
}
// As the Preview object is initialized we create the necessary structure where the item's details
// will be rendered and we append it to the item:
create : function() {
  // create Preview structure
  this.$title = $( '<h3></h3>' );
  this.$description = $( '<p></p>' );
  this.$href = $( '<a href="#">Visit Website</a>' );
  this.$details = $( '<div class="og-details"></div' ).append( this.$title, this.$description, this.$href );
  this.$loading = $ ( '<div class="og-loading"></div>' );
  this.fullimage = $( '<div class="og-fullimg"></div>' ).append( this.$loading );
  this.$closePreview = $( '<span class="og-close"></span>' );
  this.$previewInner = $( '<div class="og-expander-inner"></div>' ).append( this.$closePreview, this.$fullimage, this.$details );
  this.$previewEl = $( 'div class="og-expander"></div>' ).append( this.$previewInner );
  // append preview element to the item
  this.$item.append ( this.getEl() );
  // set the transitions for the preview and the item
  if( support ) {
    this.setTransition();
  }
}

// Then we fill the previous structure with the item´s details (stored in data attributes and the href).
// The update function will also be used to just update the content of an existing preview.

update : function( $item ) {
  // update with new item's details
  if( $item ) {
    this.$item = $item;
  }
  // if already expanded, remove class "og-expanded" form current item and add it to new item
  if( current !== -1 ) {
    var $currentItem = $items.eq( current );
    $currentItem.removeClass( 'og-expanded' );
    this.$item.addClass( 'og-expanded' );
    // position the preview correctly
    this.positionPreview();
  }
  // update current value
  current = this$item.index();
  // update preview's content
  var $itemEl = this.$item.children( 'a' ),
    eldata = {
      href : $itemEl.attr( 'href' ),
      largesrc : $itemEl.data( 'largesrc' ),
      title : $itemEl.data( 'title' ),
      description : $itemEl.data( 'description' )
    };
  this.$title.html( eldata.title );
  this.$description.html( eldata.description );
  this.$href.attr( 'href', eldata.href );

  var self = this;
  // remove the current image in the preview
  if( typeof self.$largeImg != 'undefined' ) {
    self.$largeImg.remove();
  }
  // preload large image and add it to the preview
  // for smaller screens we don't display the large image (the last media query will hide the wrapper of the image)
  if( self.$fullimage.is( ':visible' ) ) {
    this.$loading.show();
    $( '<img/>' ).load( function() {
      self.$loading.hide();
      self.$largeImg = $( this ).fadeIn( 350 );
      self.$fullimage.append( self.$largeImg );
    } ).attr( 'src', eldata.largesrc );
  }
}
