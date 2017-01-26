# em - DLTS EPUB Manager

`em` is a command-line program for managing the DLTS EPUB collections made available online
 by NYU Press websites [Open Access Books](https://github.com/NYULibraries/dlts-open-access-books)
and [Connected Youth](https://github.com/NYULibraries/dlts-connected-youth).

## Overview

Current functions:

* Add, update, delete  handles in handle server.
* Add, update, delete EPUBs in Solr index.
* Add, update, delete EPUBs in [epub_library.json file](https://github.com/readium/readium-js-viewer/blob/master/epub_content/epub_library.json) used by
[ReadiumJS viewer](https://github.com/readium/readium-js-viewer).
* Write out metadata dump file for analysis.

Functions that will be migrated from the previous system at a later date:

* Intake of EPUB files: decompressing, creating thumbnails, normalization.

Possible future functions:

* Publish EPUB: full processing of new EPUBs -- all functions performed in one step.
* Verification of collection: check that decompressed EPUB files, Solr index, and
`epub_library.json` file are in sync.

`em` can operate in either immediate execution or interactive shell mode.

## Getting Started

### Prerequisities

* NodeJS version 4.x or higher (for ES6 support).
* Java for running the bundled Solr v3.6.0 used for `solr` tests.

### Installation and setup

To use `em` for processing NYU Press collections, do the following steps:

**Step 1)** Clone the repo and install NPM packages:

```
git clone https://github.com/NYULibraries/dlts-epub-manager.git epub-manager
cd epub-manager
npm install
```

**Step 2)** Clone the repos containing the EPUB metadata and the `epub_library.json` file.
For the NYU Press websites, the former is the public Github repo [dlts-epub-metadata](https://github.com/NYULibraries/dlts-epub-metadata).
The latter is the `dl-pa-servers-epub-content` private repo and can be accessed
by DLTS and technical partners only.

```
git clone https://github.com/NYULibraries/dlts-epub-metadata.git ~/epub-metadata
git clone [REPO] ~/dl-pa-servers-epub-content
```

**Step 3)** Make private configuration files for dev, stage, and prod.  Private
configuration files contain sensitive information that cannot be committed into
the repo in the [dev.json](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/dev.json),
                [stage.json](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/stage.json),
                and [prod.json](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/prod.json)
files in `config/`. 
The usernames and passwords for our restful handle servers need to be specified
here:

```
somebody@host:~/epub-manager$ cat config-private/dev.json 
{
    "restfulHandleServerUsername" : "[USERNAME FOR DEV RESTFUL HANDLE SERVER]",
    "restfulHandleServerPassword" : "[PASSWORD FOR DEV RESTFUL HANDLE SERVER]"
}
somebody@host:~/epub-manager$ cat config-private/stage.json 
{
    "restfulHandleServerUsername" : "[USERNAME FOR STAGE RESTFUL HANDLE SERVER]",
    "restfulHandleServerPassword" : "[PASSWORD FOR STAGE RESTFUL HANDLE SERVER]"
}
somebody@host:~/epub-manager$ cat config-private/prod.json 
{
    "restfulHandleServerUsername" : "[USERNAME FOR PROD RESTFUL HANDLE SERVER]",
    "restfulHandleServerPassword" : "[PASSWORD FOR PROD RESTFUL HANDLE SERVER]"
}

```

**Step 4)** Make a local configuration if desired
([dev](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/dev.json),
[stage](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/stage.json),
and [prod](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/prod.json)
are already
included in the repo):

```
somebody@host:~/epub-manager$ ls config/
dev.json   prod.json   stage.json
somebody@host:~/epub-manager$ cat > config/local.json
{
    "cacheMetadataInMemory" : true,
    "epubList"              : null,
    "metadataDir"           : "/home/somebody/epub-metadata/nyupress",

    "readiumJsonFile"       : "/home/somebody/dl-pa-servers-epub-content/epub_library.json",

    "restfulHandleServerHost" : "localhost:9002",
    "restfulHandleServerPath" : "/id/handle",

    "solrHost"              : "localhost",
    "solrPort"              : 8080,
    "solrPath"              : "/solr"
}
```

Don't forget the private configuration file:

```
somebody@host:~/epub-manager$ cat config-private/local.json 
{
    "restfulHandleServerUsername" : "[USERNAME FOR CHOSEN RESTFUL HANDLE SERVER]",
    "restfulHandleServerPassword" : "[PASSWORD FOR CHOSEN RESTFUL HANDLE SERVER]"
}
```

See [Configuration file format](#configuration-file) for more details.

### Quickstart

Handles processing indexing - prod configuration:

```
# Add all prod handles to handle server.
./em handles add prod

# Delete prod handles from handle server.
./em handles delete prod
```

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

Load prod configuration metadata and write to file: start interactive shell,
run `load prod` followed by `load write`.

```
somebody@host:~/epub-manager$ ./em
em$ load prod
Cloning into '/Users/david/Documents/programming/src/dlts/epub-manager/cache/metadataRepo'...
Already on 'master'
em$ load write
Metadata dumped to /home/someboady/epub-manager/cache/metadata.json.
em$ quit
somebody@host:~/epub-manager$ # Metadata for prod was written to JSON file in cache directory.
somebody@host:~/epub-manager$ ls cache/metadata.json
cache/metadata.json

```

Get help message (note that not all commands listed in help have been implemented
yet):

```
somebody@host:~/epub-manager$ ./em help

  Commands:

    help [command...]                          Provides help for a given command.
    exit                                       Exits application.
    handles add [configuration]                Bind EPUB handles.
    handles delete [configuration]             Unbind EPUB handles.
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
somebody@host:~/epub-manager$ ./em
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

### Usage

`em` is built using [Vorpal](https://github.com/dthree/vorpal), a NodeJS framework
for building interactive CLI applications.  The various EPUB management functions
are executed using specific commands: `load`, `solr`, and `readium-json`.
Most `em` commands and subcommands can be run immediately from the command line
by passing them as arguments to the `em` script.  There are a relatively small subset
of commands that can only be run in the interactive shell because they must be run
as part of a sequence of commands.

The `help` command lists all these function commands along with information about
their subcommands and options.  For help on individual commands, use `help COMMAND`.
Note that the following commands are listed in `help` but are not yet implemented:
`intake`, `publish`, `verify`.
These have been set up as placeholders only (and for testing).

While in interactive shell mode, the following features are available:

* Autocompletion via the `tab` key.  Commands can be autocompleted, as can their
subcommands.  In addition, for commands that take the `[configuration]` option,
there is autocompletion for the names of the configuration files in `config/`
(minus their *.json suffixes).
* Command history using the up and down arrows.

#### General note about operations

Most of the commands share a similar set of subcommands which run specific
operations whose semantics are generally the same for all commands.  In each
case, EPUB-related data are first loaded by a `load [configuration]` operation
(which is performed transparently if `[configuration]` is used with the current
command).  The subcommand then performs operations on the destination, which is
usually a datastore of some kind or a filesystem.

* `add`: add EPUB data to the destination, updating in place any EPUBs that already
 exist.  Do not delete any existing EPUBs.
* `delete`: delete the EPUB data specified by `[configuration]` from the destination.
Do not delete any other data for EPUBs that are already there.
* `delete all`: delete all EPUB data from the destination, regardless of whether
the EPUBs are specified in `[configuration]`.
* `full-repace`: this is a `delete all` followed by an `add`.

#### Examples

See [Quickstart](#quickstart) for some basic usage examples.  Below are some more
detailed use cases.

##### Note about invocation

Most of the examples given will employ the interactive shell.
With few exceptions, the command invocations shown can also be performed in
immediate execution mode.
For example, the following command invocations do the same thing:

In `em` shell, using the `tab` key to get suggestions for `[configuration]`:

```
somebody@host:~/epub-manager$ ./em
em$ readium-json add
dev  local  prod  stage
em$ readium-json add local
Added to Readium JSON file /home/somebody/dl-pa-servers-epub-content/epub_library.json for conf "local": 67 EPUBs.
```

Immediately executed on the command line:

```
somebody@host:~/epub-manager$ ./em readium-json add local
Added to Readium JSON file /home/somebody/dl-pa-servers-epub-content/epub_library.json for conf "local": 67 EPUBs.
```

---

**EXAMPLE: Update Solr index and `epub_library.json` for `local`
(from [Installation and setup](#installation-and-setup)), then add to Solr index for
[dev](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/dev.json).**

---

Note that `local` configuration specifies `metadataDir` while
[dev](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/dev.json)
specifies `metadataRepo`, `metadataRepoBranch`, and `metadataRepoSubdirectory`.

```
somebody@host:~/epub-manager$ ./em
em$ load local
em$ solr add
Added 67 EPUBs to Solr index:
9780814706404
9780814706657
9780814711774
...
[SNIPPED]
em$ readium-json add
Added to Readium JSON file /home/somebody/dl-pa-servers-epub-content/epub_library.json for conf "local": 67 EPUBs.
em$ load dev
Cloning into '/home/somebody/epub-manager/cache/metadataRepo'...
Switched to a new branch 'develop'
em$ solr add
Added 67 EPUBs to Solr index:
9780814706404
9780814706657
9780814711774
...
[SNIPPED]
em$ quit

```

...or...

```
somebody@host:~/epub-manager$ ./em
em$ solr add local
Added 67 EPUBs to Solr index:
9780814706404
9780814706657
9780814711774
...
[SNIPPED]
em$ readium-json add local
Added to Readium JSON file /home/somebody/dl-pa-servers-epub-content/epub_library.json for conf "local": 67 EPUBs.
em$ load dev
Cloning into '/home/somebody/epub-manager/cache/metadataRepo'...
Switched to a new branch 'develop'
em$ solr add dev
Cloning into '/Users/david/Documents/programming/src/dlts/epub-manager/cache/metadataRepo'...
Switched to a new branch 'develop'
Added 67 EPUBs to Solr index:
9780814706404
9780814706657
9780814711774
...
[SNIPPED]
em$ quit
```

Note that it is not possible to rewrite the remote `epub_library.json` file sitting on
the dev server.  The `epub_library.json` file rewrite is always local.  Thus, in this use case, the user
presumably switched the local repo `/home/somebody/dl-pa-servers-epub-content/`
to `develop` branch before running the `readium-json` command.

Rewriting the `epub_library.json` file for a local instance of ReadiumJS viewer
would have involved changing the `readiumJsonFile` option in `local.conf` from the
path to the repo copy `/home/somebody/dl-pa-servers-epub-content/epub_library.json`
to the path of the library content directory of a locally installed ReadiumJS viewer:
e.g. `/var/www/html/readium-js-viewer/cloud-reader/epub_content/epub_library.json`.

---

**EXAMPLE: Dump metadata for 3 EPUBs into file `cache/3-epubs.json`, then delete them
from [stage](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/stage.json)
Solr index, then dump the metadata again to `/tmp/3-epubs.json`.**

---

Note that `load write [file]` cannot be run in immediate execution mode, because
it must first be preceded by `load [configuration]`.

Copy [config/stage.json](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/stage.json)
to `config/ad-hoc.json` (for example) and change:

```
"epubList"              : null,
```

...to:

```
"epubList"              : [ "9780814706404", "9780814706657", "9780814711774" ],
```

...then:

```
somebody@host:~/epub-manager$ ./em
em$ load ad-hoc
Cloning into '/home/somebody/epub-manager/cache/metadataRepo'...
Switched to a new branch 'stage'
em$ load write cache/3-epubs.json
Metadata dumped to cache/3-epubs.json.
em$ quit
somebody@host:~/epub-manager$ ls cache/3-epubs.json
  cache/3-epubs.json
somebody@host:~/epub-manager$ ./em
em$ solr delete ad-hoc
Cloning into '/home/somebody/epub-manager/cache/metadataRepo'...
Switched to a new branch 'stage'
Deleted 9780814706404 from Solr index.
Deleted 9780814706657 from Solr index.
Deleted 9780814711774 from Solr index.
Deleted 3 EPUBs.
em$ quit
somebody@host:~/epub-manager$ cat cache/3-epubs.json
cat: cache/3-epubs.json: No such file or directory
somebody@host:~/epub-manager$ # Whoops, cache/ was cleared when `em` was restarted for `solr delete ad-hoc`.
somebody@host:~/epub-manager$ # Write the file again, this time to /tmp/:
somebody@host:~/epub-manager$ ./em
em$ load ad-hoc
em$ load write /tmp/3-epubs.json
Metadata dumped to /tmp/3-epubs.json.
em$ quit
somebody@host:~/epub-manager$ ls /tmp/3-epubs.json
/tmp/3-epubs.json
```

---

**EXAMPLE: Add handles for `prod`, then delete handles specified in `ad-hoc`.**

---

```
somebody@host:~/epub-manager$ ./em
em$ handles add prod
Cloning into '/Users/david/Documents/programming/src/dlts/epub-manager/cache/metadataRepo'...
Already on 'master'
Added 67 handles to handles server:
9780814706404: 2333.1/37pvmfhh
9780814706657: 2333.1/4tmpg641
9780814711774: 2333.1/zgmsbf5k
9780814712481: 2333.1/9s4mw88v
9780814712771: 2333.1/tqjq2dn7
9780814712917: 2333.1/ffbg7c4r
...
[SNIPPED]
em$ handles delete ad-hoc 
Cloning into '/Users/david/Documents/programming/src/dlts/epub-manager/cache/metadataRepo'...
Switched to a new branch 'develop'
Added 3 handles to handles server:
9780814793398: 2333.1/b8gthvz5
9781479824243: 2333.1/73n5tfjs
9781479899982: 2333.1/brv15j8p
em$ quit
```

---

**EXAMPLE: Delete all EPUBs in `epub_library.json` file for `local`, then add `local` EPUBs
twice, then do a full replace.**

---

```
somebody@host:~/epub-manager$ ./em
em$ readium-json delete all local
Deleted all EPUBs from /home/somebody/dl-pa-servers-epub-content/epub_library.json.
em$ quit
somebody@host:~/epub-manager$ cat /home/somebody/dl-pa-servers-epub-content/epub_library.json
[]
somebody@host:~/epub-manager$ # Accidentally add `local` EPUBs twice.  The second
somebody@host:~/epub-manager$ # `add` will simply update with the same content.
somebody@host:~/epub-manager$ ./em
em$ readium-json add local
Added to Readium JSON file /home/somebody/dl-pa-servers-epub-content/epub_library.json for conf "local": 67 EPUBs.
em$ readium-json add local
Added to Readium JSON file /home/somebody/dl-pa-servers-epub-content/epub_library.json for conf "local": 67 EPUBs.
em$ quit
somebody@host:~/epub-manager$ # Verify that the file only has 67 EPUBs in it, despite
somebody@host:~/epub-manager$ # having run `readium-json add local` twice.
somebody@host:~/epub-manager$ grep '"identifier":' //home/somebody/dl-pa-servers-epub-content/epub_library.json | wc -l
      67
somebody@host:~/epub-manager$ # But do a full replace anyway...
somebody@host:~/epub-manager$ ./em
em$ readium-json full-replace local
Deleted all EPUBs from /home/somebody/dl-pa-servers-epub-content/epub_library.json.
Added to Readium JSON file /home/somebody/dl-pa-servers-epub-content/epub_library.json for conf "local": 67 EPUBs.
Fully replaced all EPUBs in Readium JSON for conf local.
em$ quit
somebody@host:~/epub-manager$ grep '"identifier":' /home/somebody/dl-pa-servers-epub-content/epub_library.json | wc -l
      67
```

## Running the tests

```
# Unit tests
mocha test/unit/

# Acceptance tests - all
mocha test/acceptance/

# Acceptance tests - by command/function
mocha test/acceptance/load
mocha test/acceptance/handles
mocha test/acceptance/readium-json
mocha test/acceptance/solr
```

Note that the `solr` tests require that the `test/solr/` Solr instance be running.
If it is not running, the test will produce an error message with instructions on how to
start the test Solr:

```
somebody@host:~/epub-manager$ mocha test/acceptance/solr


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

## Configuration files

Configuration files are stored in `config/` and `config-private/`.  Each file in
`config/` must have a corresponding, identically named file in `config-private/`
for storing sensitive information related to that configuration.
The basenames of the files in `config/` are the configuration names that can be
specified as options for various `em` commands, and are used as autocomplete
possibilities for commands that take a configuration option.

The
[dev](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/dev.json),
[stage](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/stage.json),
and [prod](https://github.com/NYULibraries/dlts-epub-manager/blob/master/config/prod.json)
configurations for NYU Press collections are already included in the repo in
`config/`.  Individual clones of this repo must have local `config-private/` files
corresponding to these three configurations.  See
[Installation and setup](#installation-and-setup), Step 3.

New configuration files can be created in `config/` and will be ignored by git.
The contents of `config-private/` is ignored by `git` entirely.

`config/` file properties:

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
  `git checkout [metadataRepoBranch]`.  Examples:
    * "master"
    * "0c18465a5c80c056088e98d45b6dd621e6001a7b"
  * **metadataRepoSubdirectory**: relative path to subdirectory containing the metadata to be
  processed.  Example: "nyupress"
* **readiumJsonFile**: full path to the `epub_library.json` file.
Example: "/home/somebody/dl-pa-servers-epub-content/epub_library.json"
* **restfulHandleServerHost**: hostname of the restful handle server.
Example: "devhandle.dlib.nyu.edu"
* **restfulHandleServerPath**: path to use for handle requests.
Example: "/id/handle"
* **solrHost**: hostname of Solr server.  Example: "localhost"
* **solrPort**: port that Solr is running on.  Example: 8080
* **solrPath**: path to use for Solr requests.  Example: "/solr/nyupress"

`config-private/` file properties:

* **restfulHandleServerUsername**: user authorized to add, update, and delete
  on the restful handle server.
* **restfulHandleServerPassword**: password for the user authorized to add,
  update, and delete on the restful handle server.


For example configuration files that illustrate the correct usage of all the above options,
look in
[config/](https://github.com/NYULibraries/dlts-epub-manager/tree/master/config)
and
[test/acceptance/fixture/config/](https://github.com/NYULibraries/dlts-epub-manager/tree/master/test).