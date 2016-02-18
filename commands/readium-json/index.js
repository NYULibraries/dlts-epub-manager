"use strict";

let vorpal;

let initialize = function( vorpalArg ) {
    vorpal = vorpalArg;

    vorpal.log( `Loaded ${ __filename }.` );
};

module.exports = {
    initialize
};
