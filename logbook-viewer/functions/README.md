# Gotchas

Functions emulations needs a little help to work:

    yarn add --dev @google-cloud/functions-emulator --ignore-engines --no-save

`--ignore-engines` is needed because it requires node v6 but you are most likely
running a more recent version.
