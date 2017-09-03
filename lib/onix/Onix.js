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
            mainDescription    : getDataFromStringOrObjectValue(
                util.getAsArray( this._xml.Product.OtherText )
                    .find( otherText => {
                        return otherText.TextTypeCode === '01';
                    } ).Text
            ),
            productIdentifiers : util.getAsArray( this._xml.Product.ProductIdentifier ),
            subjects           : util.getAsArray( this._xml.Product.Subject ),
            subtitle           : getDataFromStringOrObjectValue(
                this._xml.Product.Title.Subtitle
            ),
            title              : this._xml.Product.Title.TitleText._Data,
        };
    }
}

// Sometimes the node returned by pixl-xml is a string containing the value directly,
// and sometimes it's an object with a `_Data` member containing the value.
// Could have something to do with whether CDATA was used (this seems to make the
// node a string).
function getDataFromStringOrObjectValue( value ) {
    if ( typeof value === 'string' || value === undefined ) {
        return value;
    } else {
        return value._Data;
    }
}

module.exports.Onix = Onix;
