"use strict";

let fs   = require( 'fs' );
let path = require( 'path' );
let XML  = require( 'pixl-xml' );

class Epub {
    constructor( explodedEpubDir ) {
        this.explodedEpubDir = explodedEpubDir;

        this.paths = {
            containerFile: `${this.explodedEpubDir}/META-INF/container.xml`,
        };

        this.containerFile = XML.parse(
            fs.readFileSync( this.paths.containerFile, 'utf8' )
        );

        this.paths.packageFile =
            `${this.explodedEpubDir}/${this.containerFile.rootfiles.rootfile[ 'full-path' ]}`;

        this.packageFile = XML.parse(
            fs.readFileSync( this.paths.packageFile, 'utf8' )
        );

        this.authors    = this.packageFile.metadata[ 'dc:creator' ];
        this.date       = this.packageFile.metadata[ 'dc:date' ];
        this.format     = this.packageFile.metadata[ 'dc:format' ];
        this.identifier = this.packageFile.metadata[ 'dc:identifier' ];
        this.language   = this.packageFile.metadata[ 'dc:language' ];
        this.publisher  = this.packageFile.metadata[ 'dc:publisher' ];
        this.rights     = this.packageFile.metadata[ 'dc:rights' ];
        this.title      = this.packageFile.metadata[ 'dc:title' ];
    }
}

module.exports = {
    Epub: Epub,
};
