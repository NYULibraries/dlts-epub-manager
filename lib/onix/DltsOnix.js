"use strict";

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
                description      : '[TBD]',
                description_html : '[TBD]',
                identifier       : '[TBD]',
                subject          : '[TBD]',
                subtitle         : '[TBD]',
                title            : '[TBD]',
            }
        };
    }
}

module.exports.DltsOnix = DltsOnix;
