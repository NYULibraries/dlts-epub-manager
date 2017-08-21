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
            contributors       : util.getAsArray( this._xml.Product.Contributor ),
            otherText          : util.getAsArray( this._xml.Product.OtherText ),
            productIdentifiers : util.getAsArray( this._xml.Product.ProductIdentifier ),
            subjects           : util.getAsArray( this._xml.Product.Subject ),
            subtitle           : this._xml.Product.Title.Subtitle,
            title              : this._xml.Product.Title.TitleText._Data,
        };
    }
}

module.exports.Onix = Onix;
