// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

const SupafolioAPIError = require( './SupafolioAPIError' ).SupafolioAPIError;

class SupafolioAPIErrorProductNotInDatabase extends SupafolioAPIError {
    static MESSAGE = 'Product not in database';

    constructor() {
        super(
            'SupafolioAPIErrorProductNotInDatabase',
            SupafolioAPIErrorProductNotInDatabase.MESSAGE,
        );
    }
}

module.exports.SupafolioAPIErrorProductNotInDatabase = SupafolioAPIErrorProductNotInDatabase;
