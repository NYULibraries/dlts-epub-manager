"use strict";

let fs  = require( 'fs' );
let XML = require( 'pixl-xml' );

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

        this.package.creators    = this.package._xml.metadata[ 'dc:creator' ];
        this.package.date        = this.package._xml.metadata[ 'dc:date' ];
        this.package.format      = this.package._xml.metadata[ 'dc:format' ];

        let identifiers = this.package._xml.metadata[ 'dc:identifier' ];
        if ( ! Array.isArray( identifiers ) ) {
            identifiers = [ identifiers ];
        }
        this.package.identifiers = identifiers.map( ( identifier ) => {
            return identifier._Data;
        } );

        this.package.language    = this.package._xml.metadata[ 'dc:language' ];
        this.package.publisher   = this.package._xml.metadata[ 'dc:publisher' ];
        this.package.rights      = this.package._xml.metadata[ 'dc:rights' ];
        this.package.title       = this.package._xml.metadata[ 'dc:title' ];
    }
}

module.exports.Epub = Epub;
