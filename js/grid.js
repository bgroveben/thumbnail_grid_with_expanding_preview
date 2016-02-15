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
