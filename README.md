# Board wetland entity

A [boards](https://github.com/SpoonX/boards) generator for [wetland](https://wetland.spoonx.org) entities.
Supports typescript and javascript.

## Installation

Install local to enable the generator in the project:

`npm i -D board-wetland-entity`

## Usage

Wetland generators automatically register themselves with the [wetland-cli](https://github.com/SpoonX/wetland-cli).

`wetland generator entity <name> [flags]`

### Options

The following options / flags can be passed in to the generator.

| option | description |
| :------------- | :------------- |
| -l, --language <language> | One of "ts" or "js" for the target language (defaults to js) |
| -e, --extend | Set to extend wetland.Entity for .toObject (defaults to false) |
| -f, --fields <fields> | Fields to add. E.g. `-f username:string,password:string` |
| -i, --interactive | Use interactive mode to design the entity |

### Generate

Fields can be passed in using JSON, or the [ezon](https://github.com/SpoonX/ezon) format.

`wetland generator entity user -l ts -f 'username,password:(size:50),active:boolean'`

or

`wetland generator entity user -l ts -f 'username:string,password:field(size:50),active:field(type:boolean)'`

### Interactive

This generator also offers an interactive mode. Simply pass in the `-i` or `--interactive` flag.

`wetland generator entity user -i`

## Missing

At the moment you can't generate:

- indexes
- uniques
- relations

These will be added in future versions

## License

MIT
