var Ultimatum = function(numPlayers, totalAmount, currentPlayerId) {
    // the game encapsulated so as not to pollute global namespace
    // requires jQuery and underscore.js

    var ultimatum = {
            totalAmount: totalAmount, // total amount to be divvied up
            currentPlayerId: currentPlayerId, // used to find the current player
            giverId: 1, // used to make sure the giver gets shown different screens
            selector: '#ultimatum', // the selector for the div containing this game
            players: [], // instances of the Player model
            currRound: 0,
            instructionRound: 0, // define which round number corresponds to which stage
            givingRound: 1,
            receivingRound: 2,
            resultsRound: 3
        },
        Player = function (params) {
            // each player in the game
            var playerDefaults = {
                    id: null,
                    isGiver: false, // is the one making the ultimatum
                    isReceiver: true, // is one of the acceptor/rejectors
                    amount: null, // the amount his player receives
                    acceptedOffer: null // has accepted the offer or not
                },
                player = $.extend(playerDefaults, params);

                player.validate = function() {
                    // make sure they have an id
                    if (!$.isNumeric(player.id)) {
                        return false;
                    }

                    // make sure they aren't a giver and receiver by using
                    // this is a not of xor
                    if (!(!player.isGiver !== !player.isReceiver)) {
                        return false;
                    }

                    // make sure they put in a number
                    if (!$.isNumeric(player.amount)) {
                        return false;
                    }

                    // make sure the amount is positive
                    if (player.amount < 0) {
                        return false;
                    }

                    return true;
                };
            return player;
        };

    // init functions
    for (var i = 0; i < numPlayers; ++i) {
        ultimatum.players[i] = Player({
            id: i+1,
            isGiver: i+1 == ultimatum.giverId,
            isReceiver: i+1 != ultimatum.giverId
        });
    }
    ultimatum.start = function() {
        // starts the game
        $('#template-area').html(this.renderTemplate('#instructions-template', this.getCurrentPlayer()));

        this.rebind();
        var self = this;
        $('.btn').on('click', function(evt) {
            self.nextRound();
            // make sure to unbind so not all buttons do this
            $(this).off('click');
        });
    };

    ultimatum.nextRound = function() {
        var currentPlayer = this.getCurrentPlayer();
        if (this.currRound == this.instructionRound) {
            if (currentPlayer.isGiver) {
                $('#template-area').html(this.renderTemplate('#giver-form-template', this));
            }
        } else if (this.currRound == this.givingRound) {

        } else if (this.currRound == this.receivingRound) {

        } else if (this.currRound == this.resultsRound) {

        } else {
            throw 'Unknown round ' + this.currRound;
        }
        this.currRound = this.currRound + 1;
        $(this.selector).trigger('nextRound');
    }

    ultimatum.rebind = function() {
        // rebind things when DOM changes, usually round change
        $('a[href="#null"]').off('click');
        $('a[href="#null"]').on('click', function(evt) {
            evt.preventDefault();
        });
    }

    ultimatum.numPlayers = function() { return ultimatum.players.length; };
    ultimatum.getPlayer = function(id) { return ultimatum.players[id-1]; };
    ultimatum.getCurrentPlayer = function() { return this.getPlayer(this.currentPlayerId); };

    ultimatum.calculatedTotal = function() {
        var total = 0, i;
        for (i = 0; i < ultimatum.numPlayers(); ++i) {
            if (ultimatum.players[i].amount) {
                total += ultimatum.players[i].amount;
            }
        }
        return total;
    };

    ultimatum.validate = function() {
        // have to validate they didn't put an amount over the total that they
        // were allowed to put
        if (ultimatum.calculatedTotal() > ultimatum.totalAmount) {
            return false;
        }
        return true;
    };

    ultimatum.renderTemplate = function(selector, params) {
        // find the template for the given selector and renders it with the
        // given params.
        return _.template($(selector).text(), params);
    };

    return ultimatum;
};
