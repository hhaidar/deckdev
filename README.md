# deckdev

Stream Deck Development Tool

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/deckdev.svg)](https://npmjs.org/package/deckdev)
[![Downloads/week](https://img.shields.io/npm/dw/deckdev.svg)](https://npmjs.org/package/deckdev)
[![License](https://img.shields.io/npm/l/deckdev.svg)](https://github.com/hhaidar/deckdev/blob/master/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g deckdev
$ deckdev COMMAND
running command...
$ deckdev (-v|--version|version)
deckdev/0.0.0 win32-x64 node-v15.7.0
$ deckdev --help [COMMAND]
USAGE
  $ deckdev COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`deckdev watch [PLUGIN]`](#deckdev-watch-plugin)
- [`deckdev help [COMMAND]`](#deckdev-help-command)

## `deckdev watch [PLUGIN]`

watch a plugin source directory for changes and refresh the Stream Deck

```
USAGE
  $ deckdev watch [PLUGIN]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/watch.ts](https://github.com/hhaidar/deckdev/blob/v0.0.0/src/commands/watch.ts)_

## `deckdev help [COMMAND]`

display help for deckdev

```
USAGE
  $ deckdev help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

<!-- commandsstop -->
