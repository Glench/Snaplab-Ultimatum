var Ultimatum = function(numPlayers, totalAmount) {
    // the game encapsulated so as not to pollute global namespace
    // requires jQuery

    var ultimatum = {
            totalAmount: totalAmount, // total amount to be divvied up
            players: [] // instances of the Player model
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
                player = $.extend(player_defaults, params);

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
            isGiver: i+1 == 0,
            isReceiver: i+1 != 0
        });
    }

    ultimatum.numPlayers = function() { return ultimatum.players.length; };
    ultimatum.getPlayer = function(id) { return ultimatum.players[id-1]; };

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

    return ultimatum;
};
