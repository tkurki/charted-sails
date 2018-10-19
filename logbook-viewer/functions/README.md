# Gotchas

Functions emulations needs a little help to work:

    yarn add @google-cloud/functions-emulator --ignore-engines

`--ignore-engines` is needed because it requires node v6 but you are most likely
running a more recent version.


(A better solution would be to do a `yarn add --global @google-cloud/functions-emulator`
but since we require `firebase-tools` in the parent folder, it uses a local copy
and then does not find the emulator in the global node_modules.)