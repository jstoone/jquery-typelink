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
(function ($, window, document, undefined) {

	// Create the defaults once
	var pluginName = "typelink",
		defaults = {
			pages: {},
			startPage: 0,
			textDelay: 50,
			$wrapper: $('<span>'),
			wrapperClass: "highlight",
			deleteDelay: 15
		};

	/**
	 * Plugin constructor
	 *
	 * @param $element
	 * @param options
	 * @constructor
	 */
	function Plugin($element, options) {
		this.$element = $($element);
		this.$document = $(document);

		this.settings = $.extend({}, defaults, options);

		this._defaults = defaults;
		this._name = pluginName;
		this._animationInterval = $.noop();

		this.wordIndex = 1;
		this.charIndex = 1;

		this.currentWordLength = 0;
		this.currentPage = this.settings.pages[this.settings.startPage];


		this.fullstring = this.currentPage.text;
		this.wordList = this.fullstring.split(" ");

		_this = this;

		this.backAnimation = {
			text: '',
			textLength: 0,
			characterIndex: 0
		};

		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
		/**
		 * Initialize the plugin
		 */
		init: function () {
			this.settings.$wrapper = this.buildWordWrap();

			this.createEvents();
			this.animateText(this.settings.startPage);
		},

		/**
		 * Build the supplied wrapper to highlight word
		 *
		 * @returns $element
		 */
		buildWordWrap: function () {
			return this.settings.$wrapper.addClass(this.settings.wrapperClass);
		},

		/**
		 * Main animation loop
		 *
		 * @param pageId
		 */
		animateText: function (currentPageId) {

			this.currentPage = this.settings.pages[currentPageId];
			this.fullstring = this.currentPage.text;
			this.wordList = this.fullstring.split(" ");

			this._animationInterval = setInterval(
				this.animationCycle,
				this.settings.textDelay
			);
		},

		animationCycle: function () {
			var currentCharecter = _this.fullstring.substring(
				_this.charIndex - 1,
				_this.charIndex
			);

			// Set the current text
			_this.$element.append(currentCharecter);

			// Check whether we have reached the end
			// TODO: Extract string length to member var
			if (_this.charIndex >= _this.fullstring.length) {
				_this.stopTyping();
			}

			// Check if a space has been hit
			// TODO: Extract space charecter to member var as this.delimiter
			if (currentCharecter == " ") {
				_this.wordIndex++;

				// Handle words
				// TODO: Extact these variables to method
				if (_this.currentPage.links.word + 1 == _this.wordIndex) {
					if (_this.currentPage.links.word <= 1) {
						_this.wrapWord(true);
					} else {
						_this.wrapWord(false);
						_this.charIndex--;
					}
				}

				_this.currentWordLength = 0;
			}

			_this.charIndex++;
			_this.currentWordLength++;
		},

		/**
		 * Wrap selected word in custom tags
		 *
		 * @param isFirstWord
		 */
		wrapWord: function (isFirstWord) {
			var printedText = this.$element.text();
			var startOfWord = (this.charIndex - 1) - (this.currentWordLength - 1);
			var endOfWord = printedText.length - 1;

			var word = printedText.substring(startOfWord, endOfWord);
			var wrappedWord = this.settings.$wrapper.text(word);
			wrappedWord.attr('data-page', this.currentPage.links.toText);
			var preText = printedText.substring(0, startOfWord);


			this.$element.text(preText).append(wrappedWord);
		},

		stopTyping: function () {
			if (this.currentPage.links.word == this.wordList.length) {
				this.wrapWord(false);
			}

			clearInterval(this._animationInterval);
		},

		/**
		 * Reset current values, so that we can re-animate
		 *
		 * @param pageId
		 */
		resetValues: function () {
			this.wordIndex = 1;
			this.charIndex = 1;

			this.currentWordLength = 0;


			this.fullstring = this.currentPage.text;
			this.wordList = this.fullstring.split(" ");
		},

		createEvents: function () {
			var wrapperClass = "."+this.settings.wrapperClass;
			// passing the `this` scope as event data for future reference
			this.$document.on('click', wrapperClass, this, this.shiftPage);
		},

		shiftPage: function (event) {
			var appScope = event.data;
			var pageId = $(this).data('page');

			clearInterval(appScope._animationInterval);

			appScope.textResetHideAnimation(function() {
				appScope.animateText(pageId);
			});

			appScope.resetValues(pageId);
		},

		textResetHideAnimation: function (callback) {
			var $parent = this.settings.$wrapper.parent();

			// Convert current html to plain text
			$parent.html($parent.text());

			var fullText = $parent.text();

			var proxyObject = {
				scope: this,
				currentIndex: fullText.length,
				fullText: fullText,
				$element: $parent,
				callback: callback
			}

			this._animationInterval = setInterval($.proxy(function() {
				var _this = proxyObject;
				var newString = _this.fullText.substring(0, _this.currentIndex);

				_this.$element.text(newString);

				if(_this.currentIndex <= 0)
				{
					clearInterval(_this.scope._animationInterval);
					_this.callback();
				}

				_this.currentIndex--;

			}, proxyObject), this.settings.deleteDelay);
		}

	});

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options) {
		this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});

		// chain jQuery functions
		return this;
	};

})(jQuery, window, document);