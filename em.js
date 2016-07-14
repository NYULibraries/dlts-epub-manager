"use strict";

let em = require( './lib/bootstrap' );

let vorpal = em.vorpal;

if ( process.argv.length > 2 ) {
    // Process command immediately
    vorpal.parse( process.argv );
} else {
    // Enter interactive shell
    vorpal
        .show();
}
