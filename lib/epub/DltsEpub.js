"use strict";

let Epub = require( './Epub' ).Epub;
let util = require( '../util' );

class DltsEpub extends Epub {
    constructor( explodedEpubDir ) {
        super( explodedEpubDir );
    }
}

module.exports.DltsEpub = DltsEpub;
