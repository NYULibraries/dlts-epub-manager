"use strict";

const striptags = require( 'striptags' );

const Onix = require( './Onix' ).Onix;
const util = require( '../util' );

class DltsOnix extends Onix {
    constructor( onixFile ) {
        super( onixFile );

        // NOTE: Some quick tests showed that this.product.* members are copied by
        // value, not by reference.  Both == and test mutation showed that
        // this.dlts.metadata.* fields did not directly refer to their corresponding
        // this.product.* fields.
        this.dlts = {
            metadata : {
                authors          : '[TBD]',
                description      : striptags( this.product.mainDescription),
                description_html : this.product.mainDescription,
                identifier       : '[TBD]',
                subject          : this.product.subjects[ 0 ].SubjectHeadingText,
                subtitle         : this.product.subtitle,
                title            : this.product.title,
            }
        };
    }
}

module.exports.DltsOnix = DltsOnix;
