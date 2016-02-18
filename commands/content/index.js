"use strict";

let vorpal;

let initialize = function( vorpalArg ) {
    vorpal = vorpalArg;

    vorpal.log( `Loaded ${ __filename }.` );

    vorpal.command( 'content', 'Manage exploded EPUB content.' );
};

module.exports = {
    initialize
};
