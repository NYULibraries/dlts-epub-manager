"use strict";

class Book {
    static CATEGORY_LEVEL_DELIMITER = ' / ';
    static HARCOVER_FORMAT_CODE = 'BB';

    supafolioApiResponse;

    // supafolioApiResponse is already public, no need to have this be public too.
    // We just need this for making the many calls more convenient.
    #book;

    constructor( supafolioApiResponse ) {
        this.supafolioApiResponse = supafolioApiResponse;
        this.book = this.supafolioApiResponse.data.book[ 0 ];
    }

    get authors() {
        return this.book.contributors.map( obj => {
            return {
                first : obj.contributor.first,
                last  : obj.contributor.last,
                name  : obj.contributor.name,
                order : obj.order,
                role  : obj.role.name,
                seo   : obj.contributor.seo,
            };
        } );
    }

    get authorsForDisplay() {
        const contributors = this.book.contributors;

        contributors.sort( ( a, b ) => {
            if ( a.order < b.order ) {
                return -1;
            }

            if ( a.order > b.order ) {
                return 1;
            }

            return 0;
        } );

        return contributors.map( obj => obj.contributor.name ).join( ', ' );
    }

    get date() {
        const formats = this.book.formats;
        const hardcoverFormat = formats.find( obj => {
            return obj.format.code === Book.HARCOVER_FORMAT_CODE;
        } );

        if ( hardcoverFormat ) {
            return hardcoverFormat.date.date;
        } else {
            // Just use the date of the first format
            return book.formats[ 0 ].date.date;
        }
    }

    get description() {
        return this.book.description;
    }

    get isbn() {
        return this.book.isbn13;
    }

    get languageCode() {
        return this.book.custom.language;
    }

    get license() {
        return {
            link : this.book.custom.license_link,
            name : this.book.custom.license_name,
        };
    }

    get pages() {
        return this.book.pages;
    }

    get publisher() {
        return this.book.publisher.name;
    }

    get subjects() {
        const subjects = {};

        this.book.categories.forEach( obj => {
            const categoriesEachLevel = obj.category.name.split( Book.CATEGORY_LEVEL_DELIMITER );
            subjects[ categoriesEachLevel[ 0 ] ] = 1;
        } );

        return Object.keys( subjects ).sort();
    }

    get subtitle() {
        return this.book.subtitle;
    }

    get title() {
        return this.book.title;
    }

    get titleWithoutPrefix() {
        return this.book.title_without_prefix;
    }
}

module.exports.Book = Book;
