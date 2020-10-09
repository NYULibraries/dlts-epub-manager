"use strict";

class Book {
    authors = [];
    coverage;

    constructor( supafolioResponse ) {
        const book = supafolioResponse.data.book[ 0 ];

        this.authors = getAuthors( book );
        this.coverage = book.pages;
    }
}

function getAuthors( book ) {
    const authors = [];

    book.contributors.forEach( obj => {
        authors.push(
            {
                first : obj.contributor.first,
                last  : obj.contributor.last,
                name  : obj.contributor.name,
                role  : obj.role.name,
                seo   : obj.contributor.seo,
            }
        );
    } );

    return authors;
}
    }
}

module.exports.Book = Book;
