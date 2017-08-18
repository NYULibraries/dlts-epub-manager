"use strict";

let fs   = require( 'fs' );
let XML  = require( 'pixl-xml' );

class Epub {
    constructor( explodedEpubDir ) {
        this.explodedEpubDir = explodedEpubDir;

        let containerFilePath = `${this.explodedEpubDir}/META-INF/container.xml`;

        this.container = {
            _xml : XML.parse(
                fs.readFileSync( containerFilePath, 'utf8' )
            )
        };

        let packageFilePath = `${this.explodedEpubDir}/${this.container._xml.rootfiles.rootfile[ 'full-path' ]}`;

        this.package = {
            _xml: XML.parse(
                fs.readFileSync( packageFilePath, 'utf8' )
            )
        };

        this.package.authors    = this.package._xml.metadata[ 'dc:creator' ];
        this.package.date       = this.package._xml.metadata[ 'dc:date' ];
        this.package.format     = this.package._xml.metadata[ 'dc:format' ];
        this.package.identifier = this.package._xml.metadata[ 'dc:identifier' ];
        this.package.language   = this.package._xml.metadata[ 'dc:language' ];
        this.package.publisher  = this.package._xml.metadata[ 'dc:publisher' ];
        this.package.rights     = this.package._xml.metadata[ 'dc:rights' ];
        this.package.title      = this.package._xml.metadata[ 'dc:title' ];
    }
}

module.exports = {
    Epub: Epub,
};
