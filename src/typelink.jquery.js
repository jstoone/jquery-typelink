/*
 *  jQuery TypeLink
 *  A plugin created for people to animate text
 *  and use it as a navigation for their website.
 *  http://typelink.dev.jakobsteinn.com
 *
 *  Made by Jakob Steinn
 *
 *  Used jQuery Boilerplate:
 *      by Zeno Rocha
 *  http://jqueryboilerplate.com/
 *
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
			externalTarget: '_blank',
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

		this._charIndex = 0;
		this._currentPage = this.settings.pages[this.settings.startPage];
		this._fullstring = '';
		this._fullstringLength = 0;

		this._externalWrapper = $('<a href="#" />');

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
		 * Initializes the text animation
		 *
		 * @param pageId
		 */
		animateText: function ( currentPageId ) {
			this._currentPage = this.settings.pages[currentPageId];
			this._fullstring = this._currentPage.text;
			this._fullstringLength = this._fullstring.length;

			this._animationInterval = setInterval(
				$.proxy( this.animationCycle, this ),
				this.settings.textDelay
			);
		},

		/**
		 * The main animation loop
		 */
		animationCycle: function () {
			var currentCharecter = this._fullstring.substring(
				this._charIndex - 1,
				this._charIndex
			);

			this.$element.append( currentCharecter );

			// Check whether we have reached the end
			if ( this._charIndex >= this._fullstringLength ) {
				this.stopTyping();
			}

			// Check if a space has been hit
			for ( var i = 0; i < this._currentPage.links.length; i++ ) {
				var currentLink = this._currentPage.links[i];

				if ( currentLink.endCharecter == this._charIndex ) {
					this.wrapWord(
						currentLink
					)

					this._charIndex++;
			 	}

			}

			this._charIndex++;
		},

		/**
		 * Wrap selected word in custom tags
		 *
		 * @param isFirstWord
		 */
		wrapWord: function ( linkObj ) {
			var start = linkObj.startCharecter,
				end = linkObj.endCharecter;
			var wrapText = this._fullstring.slice( start, end + 1 ),
				currentHtml = this.$element.html(),
				preTextLength = currentHtml.length,
				preText = currentHtml.slice( 0, preTextLength - wrapText.length ),
				wrappedText = null;

			if( linkObj.toText != undefined ) {
				wrappedText = this.settings.$wrapper.text( wrapText );
				wrappedText.attr( 'data-page', linkObj.toText );
			} else {
				wrappedText = this._externalWrapper.text(wrapText);
				wrappedText.addClass(this.settings.externalClass);
				wrappedText.attr({
					href: linkObj.link,
					target: this.settings.externalTarget
				});
			}


			if ( start == 0 )
				preText = '';

			this.$element.html( preText + " " ).append( wrappedText );
		},

		/**
		 * Clear interval when end has been reached
		 */
		stopTyping: function () {
			clearInterval( this._animationInterval );
		},

		/**
		 * Reset current values, so that we can re-animate
		 *
		 * @param pageId
		 */
		resetValues: function () {
			this._charIndex = 0;

			this._fullstring = this._currentPage.text;
			this.wordList = this._fullstring.split( " " );
		},

		/**
		 * Create wrapper click events
		 */
		createEvents: function () {
			var wrapperClass = "." + this.settings.wrapperClass;
			var selection = wrapperClass + ":not('a')";

			// passing the `this` scope as event data for future reference
			this.$document.on( 'click', selection, this, this.changePage );
		},

		/**
		 * Change page to specified link
		 *
		 * @param event
		 */
		changePage: function ( event ) {
			var appScope = event.data;
			var pageId = $( this ).data( 'page' );

			clearInterval( appScope._animationInterval );

			appScope.textResetHideAnimation( function () {
				appScope.animateText( pageId );
			} );

			appScope.resetValues( pageId );
		},

		/**
		 * Reset the text though animation
		 *
		 * @param callback
		 */
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