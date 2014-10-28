/*
 *  jQuery TypeLink
 *  A plugin created for people to animate text
 *  and use it as a navigation for their website
 *  -- No website --
 *
 *  Made by Jakob Steinn
 *  Based on jQuery Boilerplate:
 *      by Zeno Rocha
 *  http://jqueryboilerplate.com/
 *  Under MIT License
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;
(function ( $, window, document, undefined ) {

	// Create the defaults once
	var pluginName = "typelink",
		defaults = {
			pages: {},
			startPage: 0,
			textDelay: 50,
			$wrapper: $( '<span>' ),
			wrapperClass: "highlight",
			externalClass: "highlight",
			deleteDelay: 15
		};

	/**
	 * Plugin constructor
	 *
	 * @param $element
	 * @param options
	 * @constructor
	 */
	function Plugin( $element, options ) {
		this.$element = $( $element );
		this.$document = $( document );

		this.settings = $.extend( {}, defaults, options );

		this._defaults = defaults;
		this._name = pluginName;
		this._animationInterval = $.noop();

		this.charIndex = 0;
		this.currentWordLength = 0;
		this.currentPage = this.settings.pages[this.settings.startPage];
		this.fullstring = this.currentPage.text;
		this.backAnimation = {
			text: '',
			textLength: 0,
			characterIndex: 0
		};

		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend( Plugin.prototype, {

		/**
		 * Initialize the plugin
		 */
		init: function () {
			this.settings.$wrapper = this.buildWordWrap();

			this.settings.$wrapper.css( 'white-space', 'pre' );

			this.createEvents();
			this.animateText( this.settings.startPage );
		},

		/**
		 * Build the supplied wrapper to highlight word
		 *
		 * @returns $element
		 */
		buildWordWrap: function () {
			return this.settings.$wrapper.addClass( this.settings.wrapperClass );
		},

		/**
		 * Main animation loop
		 *
		 * @param pageId
		 */
		animateText: function ( currentPageId ) {

			this.currentPage = this.settings.pages[currentPageId];
			this.fullstring = this.currentPage.text;
			this.wordList = this.fullstring.split( " " );

			this._animationInterval = setInterval(
				$.proxy( this.animationCycle, this ),
				this.settings.textDelay
			);
		},

		animationCycle: function () {
			var currentCharecter = this.fullstring.substring(
				this.charIndex - 1,
				this.charIndex
			);

			// Set the current text
			this.$element.append( currentCharecter );

			// Check whether we have reached the end
			if ( this.charIndex >= this.fullstring.length ) {
				this.stopTyping();
			}

			// Check if a space has been hit
			for ( var i = 0; i < this.currentPage.links.length; i++ ) {
				var currentLink = this.currentPage.links[i];
				if ( currentLink.endCharecter == this.charIndex ) {
					this.wrapWord(
						currentLink.startCharecter,
						currentLink.endCharecter,
						currentLink.toText
					)
					this.charIndex++;
				}
			}

			this.charIndex++;
		},

		/**
		 * Wrap selected word in custom tags
		 *
		 * @param isFirstWord
		 */
		wrapWord: function ( start, end, toText ) {
			var wrapText = this.fullstring.slice( start, end + 1 );

			var currentText = this.$element.html();
			var preTextLength = currentText.length;
			var preText = currentText.slice( 0, preTextLength - wrapText.length );
			var wrappedText = this.settings.$wrapper.text( wrapText );
			wrappedText.attr( 'data-page', toText );

			if ( start == 0 )
				preText = '';

			this.$element.html( preText + " " ).append( wrappedText );
		},

		stopTyping: function () {
			clearInterval( this._animationInterval );
		},

		/**
		 * Reset current values, so that we can re-animate
		 *
		 * @param pageId
		 */
		resetValues: function () {
			this.charIndex = 0;

			this.fullstring = this.currentPage.text;
			this.wordList = this.fullstring.split( " " );
		},

		createEvents: function () {
			var wrapperClass = "." + this.settings.wrapperClass;
			// passing the `this` scope as event data for future reference
			this.$document.on( 'click', wrapperClass, this, this.shiftPage );
		},

		shiftPage: function ( event ) {
			var appScope = event.data;
			var pageId = $( this ).data( 'page' );

			clearInterval( appScope._animationInterval );

			appScope.textResetHideAnimation( function () {
				appScope.animateText( pageId );
			} );

			appScope.resetValues( pageId );
		},

		textResetHideAnimation: function ( callback ) {
			var $container = this.settings.$wrapper.parent();
			$container.html( $container.text() );

			var fullText = $container.text();
			var currentIndex = fullText.length;

			this._animationInterval = setInterval( $.proxy( function () {
				var newString = fullText.substring( 0, currentIndex );

				$container.text( newString );

				if ( currentIndex <= 0 ) {
					clearInterval( this._animationInterval );
					callback();
				}

				currentIndex--;

			}, this ), this.settings.deleteDelay );
		}

	} );

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		this.each( function () {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		} );

		// chain jQuery functions
		return this;
	};

})( jQuery, window, document );