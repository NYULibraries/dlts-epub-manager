// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

const SupafolioApiError = require( './SupafolioApiError' ).SupafolioApiError;

class SupafolioApiErrorProductNotInDatabase extends SupafolioApiError {
    static MESSAGE = 'Product not in database';

    constructor() {
        super(
            'SupafolioApiErrorProductNotInDatabase',
            SupafolioApiErrorProductNotInDatabase.MESSAGE,
        );
    }
}

module.exports.SupafolioApiErrorProductNotInDatabase = SupafolioApiErrorProductNotInDatabase;
