"use strict";

let vorpal;

let initialize = function( vorpalArg ) {
    vorpal = vorpalArg;

    console.log( `Loaded ${ __filename }.` );
};

module.exports = {
    initialize
};
