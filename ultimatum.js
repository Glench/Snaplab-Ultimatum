var Ultimatum = function(numPlayers, totalAmount, percentNeeded, currentPlayerId) {
    // the game encapsulated so as not to pollute global namespace
    // requires jQuery and underscore.js

    var ultimatum = {
            totalAmount: totalAmount, // total amount to be divvied up
            currentPlayerId: currentPlayerId, // used to find the current player
            percentNeeded: percentNeeded, // percent needed to accept offers
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
                    isCurrent: false, // tells if the user is the viewing user
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

                player.acceptOffer = function() {
                    this.acceptedOffer = true;
                };

                player.rejectOffer = function() {
                    this.acceptedOffer = false;
                };

                player.getName = function() {
                    if (this.isCurrent) {
                        return 'You';
                    } else {
                        return 'Player ' + this.id;
                    }
                };

            return player;
        };

    // init functions
    for (var i = 0; i < numPlayers; ++i) {
        ultimatum.players[i] = Player({
            id: i+1,
            isGiver: i+1 == ultimatum.giverId,
            isReceiver: i+1 != ultimatum.giverId,
            isCurrent: i+1 == ultimatum.currentPlayerId
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
            // start giving round for giver while still showing instructions
            // for receivers
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
                        $('.alert').removeClass('alert-success');
                    } else {
                        $('.alert').removeClass('alert-error');
                        $('.alert').removeClass('alert-info');
                        $('.alert').addClass('alert-success');
                    }
                });

                $('.btn-primary').on('click', function(evt) {
                    // submit all player inputs
                    evt.preventDefault();
                    if (self.validate() && self.validatePlayers()) {
                        self.getCurrentPlayer().acceptOffer();
                        $(self.selector).trigger('givingRoundOver');
                    } else {
                        $('input').trigger('change');
                    }
                });

                $('.btn-secondary').on('click', function(evt) {
                    // clear out player values
                    $('.player input').val('').trigger('change');
                });
            }
        } else if (this.currRound == this.givingRound) {
            // move to receiving round
            var $templateArea = $('#template-area');
            $templateArea.html('<h1>Other players are evaluating their offers...</h1><div class="progress progress-striped active well"><div class="bar" style="width: 100%"></div></div>');

            // show the receivers the other player moves as well as give
            // them an accept/reject form
            _.each(this.players, function(player) {
                if (player.isCurrent && player.isReceiver) {
                    // show the current receiver the accept/reject form
                    $templateArea.append(self.renderTemplate('#receiver-form-template', player));
                    // set up the form controls for this player
                    var replaceForm = function() {
                        var $receiverForm = $('#receiver-form');
                        $receiverForm.after(self.renderTemplate('#receiver-view-template', self.getCurrentPlayer()));
                        $receiverForm.remove();
                    };
                    $('#accept').on('click', function(evt) {
                        evt.preventDefault();
                        self.getCurrentPlayer().acceptOffer();
                        replaceForm();
                    });
                    $('#reject').on('click', function(evt) {
                        evt.preventDefault();
                        self.getCurrentPlayer().rejectOffer();
                        replaceForm();
                    });
                } else {
                    // show other receivers what the other players got
                    $templateArea.append(self.renderTemplate('#receiver-view-template', player));
                }
            });

        } else if (this.currRound == this.receivingRound) {
            // the results screen
            if (this.enoughAccepted()) {
                $('#template-area').html('<div class="alert alert-success"><h1>Congratulations! :D A majority of offers were accepted!</h1></div>')
            } else {
                $('#template-area').html('<div class="alert alert-error"><h1>Aw, no one gets anything :(</h1></div>')
            }

        } else if (this.currRound == this.resultsRound) {
            // time to quit the game
        } else {
            throw 'Unknown round ' + this.currRound;
        }
        this.currRound += 1;
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

    ultimatum.enoughAccepted = function() {
        // returns true if the percent accepting is above the percent needed
        // for a success
        var totalAccepted = 0,
            percentAccepted,
            player;
        for (var i = 0; i < this.players.length; ++i) {
            player = this.players[i];
            if (player.acceptedOffer) {
                totalAccepted += 1;
            }
        }
        return (totalAccepted / this.players.length) > this.percentNeeded;

    }

    ultimatum.validate = function() {
        // have to validate they didn't put an amount over the total that they
        // were allowed to put
        if (ultimatum.calculatedTotal() != ultimatum.totalAmount) {
            return false;
        }
        return true;
    };

    ultimatum.validatePlayers = function() {
        // have to validate they didn't put an amount over the total that they
        // were allowed to put
        var player;
        for (var i=0; i < this.players.length; ++i) {
            player = this.players[i];
            if (!player.validate()) {
                return false;
            }
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
