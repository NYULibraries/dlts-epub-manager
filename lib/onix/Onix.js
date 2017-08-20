"use strict";

const fs   = require( 'fs' );

const XML  = require( 'pixl-xml' );

const util = require( '../util' );

class Onix {
    constructor( onixFile ) {
        this._xml = XML.parse(
            fs.readFileSync( onixFile, 'utf8' )
        );

        this.product = {
            contributors : util.getAsArray( this._xml.Product.Contributor ),
            otherText    : util.getAsArray( this._xml.Product.OtherText ),
            subjects     : util.getAsArray( this._xml.Product.Subject ),
            title        : this._xml.Product.Title,
        }
    }
}

module.exports.Onix = Onix;
