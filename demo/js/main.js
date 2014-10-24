$(function () {
    var pages = [
        {
            text: "___«N»___ leverer digitale løsninger for kunder som ønsker at forbedre deres online tilstedeværelse, gennem faktuel indsigt...",
            links: {
                word: 1,
                toText: 1
            }
        },
        {
            text: "Kunder er virkelig rare, men først efter du har holdt dem i den kælder i 3 måneder, og truet deres famile. - ___«N»___",
            links: {
                word: 4,
                toText: 0
            }
        }
    ]

    var textDelay = 50;

    // start by animating first page
    animateText(pages[0])

    function animateNewText($highLight, pageId) {
        $highLight.parent().empty();
        $highLight.parent().show();

        animateText(pages[pageId]);
        console.log("test");
    }

    function animateText(pageObj) {
        var wordIndex = 1;
        var charIndex = 1;

        var fullstring = pageObj.text;
        var wordList = fullstring.split(" ");

        var currentWordLength = 0;

        var isInsertingTag = false;

        var $content = $("#text-container");

        var animationInterval = setInterval(function () {
            var currentText = $content.text().substring(0, charIndex - 1);
            var currentContent = $content.html();
            var currentCharacter = fullstring.substring(charIndex - 1, charIndex);

            // set the current text
            $content.append(currentCharacter);

            // check whether we have reached the end
            if (charIndex >= fullstring.length) {
                stopTyping();
            }

            // check if a space has bin hit
            if (currentCharacter === " ") {
                wordIndex++;

                // handle words
                //console.log(currentWordLength + " | " + currentCharacter);
                if (pageObj.links.word + 1 == wordIndex && !isInsertingTag) {
                    isInsertingTag = true;
                    wrapWord($content, charIndex - 1, currentWordLength - 1);
                    charIndex - 2;
                }

                currentWordLength = 0;
                isInsertingTag = false;
            }

            charIndex++
            currentWordLength++;
        }, textDelay);

        function wrapWord($contentElem, characterIndex, wordLength, isEndWord) {
            var printedText = $contentElem.html();
            var startOfWord = characterIndex - wordLength;
            var endOfWord = printedText.length;
            if(! isEndWord) {
                endOfWord = printedText.length - 1;
            }
            var word = printedText.substring(startOfWord, endOfWord);
            var newString = printedText.substr(0, startOfWord)
                + "<span class='highlight' data-page='"+pageObj.links.toText+"'>"
                + word
                + "</span> ";


            $contentElem.html(newString);

            $(document).on('click', 'h1 .highlight', function() {
                var $this = $(this);
                var callback = animateNewText($this, $this.data('page'));
                $this.parent().fadeOut('fast', callback);

                charIndex = 1;
                currentWordLength = 0;
            });
        }

        function stopTyping() {
            if(pageObj.links.word == wordList.length) {
                wrapWord($content, charIndex - 1, currentWordLength - 1, true);
            }

            clearInterval(animationInterval);
        }
    }
})