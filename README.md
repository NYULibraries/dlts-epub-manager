# em - DLTS EPUB Manager

**`em` is a command-line program for managing the DLTS EPUB collections made available online
 by NYU Press websites [Open Access Books](https://github.com/NYULibraries/dlts-open-access-books)
and [Connected Youth](https://github.com/NYULibraries/dlts-connected-youth).**

Current functions

* Add, update, delete EPUBs in Solr index.
* Add, update, delete EPUBs in [epub_library.json file](https://github.com/readium/readium-js-viewer/blob/master/epub_content/epub_library.json) used by
[ReadiumJS viewer](https://github.com/readium/readium-js-viewer)
* Write out metadata dump file for analysis.

Functions that will be migrated from the previous system at a later date:

* Intake of EPUB files: decompressing, creating thumbnails, normalization.
* Add, update, delete handles from the handle server.

Possible future functions:

* Publish EPUB: full processing of new EPUBs -- all functions performed in one step.
* Verification of collection: check that decompressed EPUB files, Solr index, and
`epub_library.json` file are in sync.

Can operate in either immediate execution or interactive shell mode.

## Getting Started

### Prerequisities

* NodeJS version 4.x or higher (for ES6 support).
* Java  for running the bundled Solr v3.6.0 used for `solr` tests.

### Installation and setup

To use `em` for processing NYU Press collections, do the following steps.

**Step 1)** Clone the repo and install NPM packages:

```
git clone https://github.com/NYULibraries/dlts-epub-manager.git epub-manager
cd epub-manager
npm install
```

**Step 2)** Clone the repos containing the EPUB metadata and the `epub_library.json` file.
For the NYU Press websites, the former is public Github repo [dlts-epub-metadata](https://github.com/NYULibraries/dlts-epub-metadata).
The latter is the `dl-pa-servers-epub-content` private repo and can be accessed
by DLTS and technical partners only.

```
git clone https://github.com/NYULibraries/dlts-epub-metadata.git ~/epub-metadata
git clone [REPO] ~/dl-pa-servers-epub-content
```

**Step 3)** Make a local configuration if desired
([dev](https://github.com/NYULibraries/dlts-epub-manager/blob/develop/config/dev.json),
[stage](https://github.com/NYULibraries/dlts-epub-manager/blob/develop/config/stage.json),
and [prod](https://github.com/NYULibraries/dlts-epub-manager/blob/develop/config/prod.json)
are already
included in the repo):

```
$ ls config/
dev.json   prod.json   stage.json
$ cat > config/local.json
{
    "cacheMetadataInMemory" : true,
    "epubList"              : null,
    "metadataDir"           : "/home/somebody/epub-metadata/nyupress",

    "readiumJsonFile"       : "/home/somebody/dl-pa-servers-epub-content/epub_library.json",

    "solrHost"              : "localhost",
    "solrPort"              : 8080,
    "solrPath"              : "/solr"
}
```

**Step 4)** Process EPUBs

Solr indexing - dev configuration:

```
# Add all dev EPUB metadata to Solr index.
./em solr add dev

# Delete dev EPUB metadata from Solr index.
./em solr delete dev

# Delete everything from Solr index.
./em solr delete all dev

# Same as `delete all` followed by `add`.
./em solr full-replace dev
```

`epub_library.json` file editing - local configuration:

```
# Add all local EPUB metadata to file.
./em readium-json add local

# Delete local EPUB metadata from file.
./em readium-json delete local

# Delete everything from file.
./em readium-json delete all local

# Same as `delete all` followed by `add`.
./em readium-json full-replace local
```

Load prod configuration metadata and write to file.  Start interactive shell,
run `load prod` followed by `load write`.

```
$ ./em
em$ load prod
Cloning into '/Users/david/Documents/programming/src/dlts/epub-manager/cache/metadataRepo'...
Already on 'master'
em$ load write
Metadata dumped to /home/someboady/epub-manager/cache/metadata.json.
em$ quit
$ # Metadata for prod was written to JSON file in cache directory.
$ ls cache/metadata.json
cache/metadata.json

```

Get help message (note that not all commands listed in help have been implemented
yet):

```
$ ./em help

  Commands:

    help [command...]                          Provides help for a given command.
    exit                                       Exits application.
    handles [options]                          Manage handles.
    handles add [options]                      Bind EPUB handles.
    handles delete [options]                   Unbind EPUB handles.
    handles delete all [options]               Unbind all EPUB handles.
    handles full-replace [options]             Replace all EPUB handles.
    intake [options]                           Manage intake of EPUB and source metadata.
    intake add [options]                       Add EPUBs and source metadata to intake.
    intake delete [options]                    Delete EPUBs and source metadata from intake.
    intake delete all [options]                Delete all EPUBs and source metadata from intake.
    intake full-replace [options]              Replace all EPUBs and source metadata in intake.
    load <configuration>                       Read in configuration file and load resources.
    load write [file]                          Write metadata out to file.
    load clear                                 Clear all loaded metadata.
    publish [options]                          Publish EPUBs.
    publish add [options]                      Add EPUBs.
    publish delete [options]                   Delete EPUBs.
    publish delete all [options]               Delete all EPUBs.
    publish full-replace [options]             Replace all EPUBs.
    readium-json add [configuration]           Add EPUBs to `epub_library.json` file.
    readium-json delete [configuration]        Delete EPUBs from `epub_library.json` file.
    readium-json delete all [configuration]    Delete all EPUBs from `epub_library.json` file.
    readium-json full-replace [configuration]  Replace entire `epub_library.json` file.
    solr add [configuration]                   Add EPUBs to Solr index.
    solr delete [configuration]                Delete EPUBs from Solr index.
    solr delete all [configuration]            Delete all EPUBs from Solr index.
    solr full-replace [configuration]          Replace entire Solr index.
    verify                                     Verify integrity of published collection, handles, and metadata indexes.

```

Get help for specific commands in interactive mode:

```
$ ./em
em$ help load

  Usage: load [options] <configuration>

  Read in configuration file and load resources.

  Options:

    --help  output usage information

em$ help solr

  Commands:

    solr add [configuration]           Add EPUBs to Solr index.
    solr delete [configuration]        Delete EPUBs from Solr index.
    solr delete all [configuration]    Delete all EPUBs from Solr index.
    solr full-replace [configuration]  Replace entire Solr index.

em$
```

See [Configuration file format](#configuration-file-format) for more details.

### Examples

[TODO: exploded content]

```
Examples
```

[TODO: Solr]

```
Examples
```


[TODO: handle server]
```
Examples
```

[TODO: epub_library.json]

```
Examples
```

## Running the tests

```
# Unit tests
mocha test/unit/

# Acceptance tests - all
mocha test/acceptance/

# Acceptance tests - by command/function
mocha test/acceptance/load
mocha test/acceptance/readium-json
mocha test/acceptance/solr
```

Note that the `solr` tests require that the `test/solr/` Solr instance be running.
If it is not running, the test will produce an error message with instructions on how to
start the test Solr:

```
$ mocha test/acceptance/solr


  solr command
    1) "before all" hook


  0 passing (184ms)
  1 failing

  1) solr command "before all" hook:
     AssertionError:

Solr is not responding.  Try running Solr setup and start script:

	test/solr/start-solr-test-server.sh

Error: connect ECONNREFUSED 127.0.0.1:9001
      at Context.before (test/acceptance/solr.js:41:20)
```

The `test/solr/start-solr-test-server.sh` script is a modified version of
[django-haystack's](https://github.com/django-haystack/django-haystack/blob/106e660867398612c7e080fd512685210f3b2e4f/test_haystack/solr_tests/server/start-solr-test-server.sh).
Running it will do the following:

* Download the appropriate Solr archive to `test/solr/download-cache/`.  This
step is skipped if the archive exists already.
* Unpack the archive, install the Solr server and configure it using the files in
`test/solr/config-files/`.
* Start Solr on port 9001 in the foreground.  To start it in the background,
set `BACKGROUND_SOLR` to a non-empty value:

```
BACKGROUND_SOLR=true test/solr/start-solr-test-server.sh
```

To stop the server, simply `kill` the process.

### Configuration file format

Configuration files are stored in `config/`.  The basenames of the files are the
configuration names that can be specified as options for various `em` commands.
They will be automatically loaded as autocomplete possibilities for commands
 that take a configuration option.

The `dev`, `stage,` and `prod` configurations for NYU Press collections are already
included in the repo.  New configuration files can be created in `config/` and
will be ignored by git.

* **cacheMetadataInMemory**: `true` to load all metadata at once into memory for
faster processing, otherwise `false`.  Currently only `true` is supported.
* **epubList**: array of EPUB ids specifying the EPUBs to be processed.  All others
will be ignored.  Example: [ "9780814706404", "9780814706657", "9780814711774" ]
* **metadataDir**: full path to the directory containing the metadata files.  For
NYU Press collections, this would be the `nyupress` directory in the local clone
of the [dlts-epub-metadata](https://github.com/NYULibraries/dlts-epub-metadata) repo.
If this option is specified, metadata repo options will be ignored.
Example: "/home/somebody/epub-metadata/nyupress"
* Metadata repo options -- these will be ignored if **metadataDir** has been specified.
  * **metadataRepo**: URL for the git repo containing the metadata.  The repo will
be cloned locally using `git clone [metadataRepo]`.
Example: "https://github.com/NYULibraries/dlts-epub-manager.git"
  * **metadataRepoBranch**: branch or commit to use.  Will be checked out using
  `git checkout [metadataRepoBranch].  Example: "0c18465a5c80c056088e98d45b6dd621e6001a7b"
  * **metadataRepoSubdirectory**: relative path to subdirectory containing the metadata to be
  processed.  Example: "nyupress"
* **readiumJsonFile**: full path to the `epub_library.json` file.
Example: "/home/somebody/dl-pa-servers-epub-content/epub_library.json"
* **solrHost**: hostname of Solr server.  Example: "localhost"
* **solrPort**: port that Solr is running on.  Example: 8080
* **solrPath**: path to Solr server.  Example: "/solr"

For examples, look in `config/` and `/test/acceptance/fixture/config/`.