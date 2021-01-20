const gameBoard = (function gameModule() {

    const gameArea = document.querySelector("#gameArea");

    let gameBoard = []; //array that we'll push our player's moves into and use to populate the board each move in the render function

    function player(name, choice, won = false, moves = []) { //player construction factory
        return {name, choice, won, moves};
    }

    function getInfo(e) {
        e.preventDefault();
        const checked = [...document.querySelectorAll(`input:checked`)]; //spread operator to return an array of our checked inputs for our validation check
        const names = [...document.querySelectorAll(`input[type="text"]`)]; //spread operator to get our players names for our validation check
        const duplicatesX = checked.filter(input => input[`value`] === `x`); //filtering for x values
        const duplicatesO = checked.filter(input => input[`value`] === `o`); //fitlering for o values
        if (duplicatesX.length === 2 || duplicatesO.length === 2) { //if players have the same team
            alert("players cannot have the same team"); //tell them they can't 
        } else if (names[0].value === '' || names[1].value === '') { //if players name inputs are blank
            alert("players need names"); //tell them they can't 
        } else { //teams are correct, please proceed
            const form = document.querySelector("form");
            const formData = new FormData(form); /* learned this from this thread https://stackoverflow.com/questions/41431322/how-to-convert-formdatahtml5-object-to-json*/
            const obj = Object.fromEntries(formData); //create an object from our form data
            game.player1 = player(obj.playerOneName, obj.playerOneTeam); //create player 1 object using our factory function passing in object properties from our form object and add it to game object under property player1
            game.player2 = player(obj.playerTwoName, obj.playerTwoTeam); //create player 2 object using our factory function passing in object properties from our form object and add it to game object under property player2
            form.reset(); //reset the form for next round in advance
            form.classList.toggle("hidden"); //hide our form
            gameArea.classList.toggle("hidden"); //show our gameboard
            turns();
        }
    }

    function turns() {

        const spaces = document.querySelectorAll(".playContainer");

        function render() { //helper function that redraws the board and sets a unique data-attribute on a played div
            spaces.forEach(space => { //for each space in our playboard container
                gameBoard.forEach(index => { //and for each move object in our gameBoard array
                    if (space.id === index.name) { //if the space id marks the index of the gameBoard array object we're on:
                        space.innerHTML = index.choice.toLocaleUpperCase(); //set that div container's inner html to the choice value of our move object 
                        space.setAttribute("data-played", true); //set a data attribute that marks that this space is now a played one
                        space.setAttribute("data-player", `${index.choice}`); //also sets which player claimed the space
                    }
                });
            });
        }

        function gameOver(obj) { //helper function that determines if the game is over after each play

            const winningMoves = [ //array of arrays that holds possible winning moves (order combination doesn't matter)
                ["one", "two", "three"],
                ["four", "five", "six"],
                ["seven", "eight", "nine"],
                ["one", "four", "seven"],
                ["two", "five", "eight"],
                ["three", "six", "nine"],
                ["one", "five", "nine"],
                ["three", "five", "seven"]
            ];
    
            function noMorePlays(arr) { //helper function that will invalidate the board for future moves since the game is now over (when called)
                arr.forEach(space => space.setAttribute("data-played", true)); //accepted an array to pass in and mark each index as played
            }
           
           for (let moveset of winningMoves) { //go through each moveset of our winningMoves array
               let checking1 = moveset.filter(value => obj.player1.moves.includes(value)); //compare our players (currently player1) moves with the moveset of the current index 
               let checking2 = moveset.filter(value => obj.player2.moves.includes(value)); //compare our players (currently player2) moves with the moveset of the current index 
               //storing those comparisons in filtered array variables
                if (JSON.stringify(moveset) == JSON.stringify(checking1)) { //using json.stringify to compare the data of our different arrays. If they are the same:
                    noMorePlays(spaces); //call our nomoreplays helper function (line 63) and pass our spaces nodelist as our array argument
                    obj.player1.won = true; //set the winning status of the appropriate player to true
                    whoWon(obj.player1); //pass the appropriate player into our whoWon function (line 85) as our argument
                } else if (JSON.stringify(moveset) == JSON.stringify(checking2)) { //virtually identical to the above code block but with player2 as our parameter to pass
                    noMorePlays(spaces); //call our nomoreplays helper function (line 63) and pass our spaces nodelist as our array argument
                    obj.player2.won = true; //set the winning status of the appropriate player to true
                    whoWon(obj.player2); //pass the appropriate player into our whoWon function (line 85) as our argument
                }
           }
           if (gameBoard.length === 9 && obj.player1.won === false && obj.player2.won === false) whoWon("draw"); //checking if gameboard is full and no players have a true status on their won keys
           //passing the string "draw" into our whoWon(line 85) function
        } //end of our gameover helper function
    
        function whoWon(who) { //helper function that decides who won and writes the message and either resets the page or starts a rematch
            const messageArea = document.querySelector("#messageArea");
            const reset = document.querySelector("#reset");
            const rematch = document.querySelector("#rematch");
            const message = document.querySelector("#winningMessage");
            messageArea.classList.remove("hidden"); //showing our message to the user
            switch (true) {
                case (who === game.player1):
                    message.innerHTML = `${game.player1.name} won the match`;
                    break;
                case (who === game.player2):
                    message.innerHTML = `${game.player2.name} won the match`;
                    break;
                case (who == "draw"):
                    message.innerHTML = "It's a draw";
                    break;
            }
    
            function resetPage() { //this is lazy and sloppy, if I make improvements to the game I can start here
                location.reload(); //yes it's a functional reset but feels cheap
            }
    
            function clear() { //helper function to initiate a rematch by clearing all saved moves for players and erasing the gameBoard array
                messageArea.classList.add("hidden");
                spaces.forEach(space => { //clearing the divs and attributes of our playboard container
                    space.innerHTML = "";
                    space.removeAttribute("data-played");
                });
                gameBoard = []; //reset the gameboard array to an empty array
                game.player1.moves = []; //reset our players moves array to empty
                game.player2.moves = [];
                game.player1.won = false; //reset our players win status back to false
                game.player2.won = false;
            }
            // adding event listeners and calling the above clear or reset functions on the appropriate buttons
            rematch.addEventListener("click", clear);
            reset.addEventListener("click", resetPage);
        } //end of our whoWon helper function

        let turn = game.player1; //instantiating a turn variable and assigning it a reference to our player1 object property in our game object

        //this event listener calls all of our above helper functions
        spaces.forEach(space => space.addEventListener("click", () => {  //for each div space in our playarea container
            if (space.hasAttribute("data-played")) { //if it's already been played, do nothing.
                return;
            } else { 
                let move = { //instantiating a move object that holds the space id and current turn's player marker
                    name: space.id,
                    choice: turn.choice
                };
                if (turn === game.player1) { //if it's player 1's turn
                    gameBoard.push(move); //push their move object into the gameBoard array
                    game.player1.moves.push(move.name); //push that space id they just played on into the player1 moves array (default empty array in our factory function)
                    turn = game.player2; //turn is now the other players turn
                } else if (turn === game.player2) { //same as above but with player 2's turn
                    gameBoard.push(move);
                    game.player2.moves.push(move.name);
                    turn = game.player1; 
                }
            }
            //caling our helper functions from above to populate the board and check if the game is over
            render(); 
            gameOver(game);
        }));
    } //end of our turns function

    function play() { //pass our getInfo function as a click event to our playButton - getInfo will eventually fire our turns() function.
        const playButton = document.querySelector(`input[type="submit"]`);
        playButton.addEventListener("click", getInfo);
    }

    let game = { // an object that stores our play function as a property so we can call our play method outside of our IIFE module
        play
    };
    
    return game; //return that object
})();

gameBoard.play(); //call that method





