document.addEventListener('DOMContentLoaded', () => {

    const keyboard_buttons = document.querySelectorAll('.keyboard-button');
    keyboard_buttons.forEach(button => {
        button.addEventListener('click', () => {
            handleKeyPress({key: button.getAttribute('data-letter')});
        });
    });

    const language_dict = {
        'english': 'en.txt',
        'spanish': 'es.txt',
        'french': 'fr.txt',
        'portuguese': 'pt.txt',
        'german': 'de.txt'
    }

    const language = sessionStorage.getItem('language');
    const filePath = `/static/words/${language_dict[language]}`;


    const TOTAL_TRIES = 6;
    let remaining_tries = TOTAL_TRIES;
    let correctWord;
    var words = [];
    var guessedWords = [];

    const language_characters = {
        'english': /^[a-zA-Z]+$/,
        'spanish': /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+$/,
        'french': /^[a-zA-ZàâçéèêëîïôûùüÿœæÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ]+$/,
        'portuguese': /^[a-zA-ZáâãàçéêíóôõúÁÂÃÀÇÉÊÍÓÔÕÚ]+$/,
        'german': /^[a-zA-ZäöüßÄÖÜ]+$/ 
    }

    fetch(filePath)
        .then(response => response.text()) 
        .then(text => {
            words = text.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length);
            correctWord = words[Math.floor(Math.random() * words.length)];
            initGame(correctWord); 
        })
        .catch(error => console.error('Error loading the word list:', error));
    
    
    function initGame(correctWord) {
        console.log(`Starting Game in ${language} with correct word: ${correctWord}`)
        
    }

    window.addEventListener('keydown', handleKeyPress);
    

    function handleKeyPress(event) {
        const currentRow = document.querySelector('.guess-row.active');
        if (!currentRow) return;
        const key = event.key;

        if (key === 'Enter') {
            submitGuess();
        } else if (key === 'Backspace' || key === 'Del') {
            removeLastCharacter();
        } else {
            const regex = language_characters[sessionStorage.getItem('language')];
            if (regex.test(key)) {
                const emptyBox = currentRow.querySelector('.letter-box:not(.filled):not(.locked)');
                if (emptyBox) {
                    emptyBox.textContent = key.toUpperCase();
                    emptyBox.classList.add('filled');
                }
            }
        }
    }

    function submitGuess() {
        const currentRow = document.querySelector('.guess-row:not(.locked)'); 
        if (!currentRow) return; 

        const boxes = currentRow.querySelectorAll('.letter-box');
        const guess = Array.from(boxes).map(box => box.textContent).join('');

        if (guess.length < boxes.length) {
            alert("Guess must be 5 letters");
            return;
        }

        console.log("Submitted Guess:", guess);
        // Process the guess here (check correctness, update game state, etc.)
        if (!words.includes(guess)) {
            alert("Invalid Word");
            return;
        }

        guessedWords.push(guess);
        remaining_tries = remaining_tries - 1;
        update_board(guess, boxes);

        // Lock the current row
        Array.from(boxes).forEach(box => box.classList.add('locked'));
        currentRow.classList.remove('active');
        currentRow.classList.add('locked');

        
        if (guess == correctWord) {
            alert("Congratulations! You guessed the right word!");
            saveGame(true);
        } else if (remaining_tries == 0) {
            alert("Game Over! Better Luck Next Time.");
            saveGame(false);
        }

        // prepare the next row for input
        const nextRow = currentRow.nextElementSibling;
        if (nextRow) {
            nextRow.classList.add('active');
        }
    }

    function removeLastCharacter() {
        const filledBoxes = Array.from(document.querySelectorAll('.guess-row:not(.locked) .letter-box.filled:not(.locked'))
        const lastFilledBox = filledBoxes[filledBoxes.length - 1]
        if (lastFilledBox) {
            lastFilledBox.textContent = '';
            lastFilledBox.classList.remove('filled');
        }
    }

    function update_board(guess, boxes) {

        let correctWord_list = correctWord.split('');
        let currGuess = guess.split('');
        let correctLetterCounts = {};

        correctWord_list.forEach(letter => {
            if (correctLetterCounts[letter]) {
                correctLetterCounts[letter]++;
            } else {
                correctLetterCounts[letter] = 1;
            }
        });

        // marking correct letters
        currGuess.forEach((letter, i) => {
            if (letter === correctWord_list[i]) {
                boxes[i].style.backgroundColor = 'green';
                boxes[i].textContent = letter.toUpperCase();
                correctLetterCounts[letter]--;
                shadeKeyboard(letter, 'green');
            }
        });

        // marking letters in word but wrong location
        currGuess.forEach((letter, i) => {
            let delay = 100 * i;
            // Skip already green boxes
            if (boxes[i].style.backgroundColor !== 'green') {
                let letterColor = 'grey';  // Default color
                if (correctWord_list.includes(letter) && correctLetterCounts[letter] > 0) {
                    letterColor = 'yellow';
                    correctLetterCounts[letter]--;
                }
                // coloring board
                setTimeout(() => {
                    if (boxes[i].style.backgroundColor !== 'green') {  
                        boxes[i].style.backgroundColor = letterColor;
                        boxes[i].textContent = letter.toUpperCase();
                        shadeKeyboard(letter, letterColor);
                    }
                }, delay);
            }
        });
    }

    

  
    function shadeKeyboard(letter, letterColor) {
        const keys = document.querySelectorAll(".keyboard-button")
        letter = letter.toUpperCase();

        keys.forEach(elem => {
            
            if (elem.textContent.toUpperCase() === letter) {
                if (elem.style.backgroundColor == 'green') {
                    return; // Don't downgrade color if already green
                }

                if (elem.style.backgroundColor == 'yellow' && letterColor !== 'green') {
                    return; // Don't change yellow if new color isn't green
                }

                // Remove existing color classes
                elem.style.backgroundColor = letterColor; // Add the new color class
        }
        });
    }


    function saveGame(passFail) {

        const gameData = {
            language: language,
            pass_fail: passFail,
            number_of_attempts: TOTAL_TRIES - remaining_tries,
            words_guessed: guessedWords,
            correct_word: correctWord
        };

        fetch('/goldenGuess/save_game/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
            body: JSON.stringify(gameData),
            credentials: 'include'
        })  
        .then(response => response.json())
        .then(data => {
            delay = 1000
            setTimeout(() => {
                console.log(data.message);
                window.location.href = '/goldenGuess/game_over/';
            }, delay);
            
        }).catch(error => {
          console.error('Error saving the game:', error);
        });


    }

    function getCsrfToken() {
        let csrfToken = null;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let [key, value] = cookie.trim().split('=');
            if (key === 'csrftoken') {
                csrfToken = value;
                break;
            }
        }
        return csrfToken;
    }


});
