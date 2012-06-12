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

        var self = this;
        $('.btn').on('click', function(evt) {
            evt.preventDefault();
            self.nextRound();
            // make sure to unbind so not all buttons do this
            $(this).off('click');
        });
    };

    ultimatum.nextRound = function() {
        var currentPlayer = this.getCurrentPlayer(),
            self = this;
        if (this.currRound == this.instructionRound) {
            if (currentPlayer.isGiver) {
                $('#template-area').html(this.renderTemplate('#giver-form-template', this));

                $('.player input').on('change', function(evt) {
                    var playerId = $(this).attr('name'),
                        player = self.getPlayer(playerId),
                        amount = parseInt($(this).val());
                    // update the player with the new amount
                    if (_.isNaN(amount)) {
                        player.amount = null;
                    } else {
                        player.amount = amount;
                    }

                    // make sure this is a valid amount for the player
                    var $playerContainer = $(this).parents('.control-group');
                    if (player.validate()) {
                        $playerContainer.removeClass('error');
                    } else {
                        $playerContainer.addClass('error');
                    }

                    // update the total amount left in the game
                    $('#calculatedAmount').html(self.totalAmount - self.calculatedTotal());
                    // make sure this is a valid amount for the game
                    if (!self.validate()) {
                        $('.alert').addClass('alert-error');
                        $('.alert').removeClass('alert-info');
                    } else {
                        $('.alert').removeClass('alert-error');
                        $('.alert').addClass('alert-info');
                    }
                });

                $('.btn-primary').on('click', function(evt) {
                    // submit all player inputs
                });

                $('.btn-secondary').on('click', function(evt) {
                    // clear out player values
                    $('.player input').val('').trigger('change');
                });
            }
        } else if (this.currRound == this.givingRound) {
            if (currentPlayer.isGiver) {
            } else {

            }
        } else if (this.currRound == this.receivingRound) {
            if (currentPlayer.isGiver) {

            } else {

            }
        } else if (this.currRound == this.resultsRound) {
            if (currentPlayer.isGiver) {

            } else {

            }
        } else {
            throw 'Unknown round ' + this.currRound;
        }
        this.currRound = this.currRound + 1;
        $(this.selector).trigger('nextRound');
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
