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

        this.getManifestItemsFilePaths = () => {
            let packageFileParentDir = path.basename( path.dirname( this.paths.packageFile ) );

            return this.packageFile.manifest.item
                .filter(
                    ( item ) => {
                        return item[ 'media-type' ].match( /text|xml/ );
                    }
                )
                .map(
                    ( item ) => {
                        return `${packageFileParentDir}/${item.href}`;
                    }
                );
        };
    }
}

module.exports = {
    Epub: Epub,
};
