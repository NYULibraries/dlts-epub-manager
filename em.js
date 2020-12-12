"use strict";

const em = require( './lib/bootstrap' );

const vorpal = em.vorpal;

if ( process.argv.length > 2 ) {
    // Process command immediately
    vorpal.parse( process.argv );
} else {
    // Enter interactive shell
    vorpal
        .show();
}
