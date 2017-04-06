const EntityGenerator = require('./src/EntityGenerator');

// todo find way to link generator to command.
module.exports = {
  generators : {entity: EntityGenerator},
  steps      : {}, // @todo allow these to be passed in as steps for the boards module.
  command    : 'entity <name>',
  description: 'Generate a new entity',
  examples   : ['entity user -l ts -e -f "username,password:string,email:field({type: text, size: 255})"'],
  options    : [
    {option: '-l, --language <language>', description: 'One of "ts" or "js" for the target language (defaults to js)'},
    {option: '-e, --extend', description: 'Set to extend wetland.Entity for .toObject (defaults to false)'},
    {option: '-f, --fields <fields>', description: 'Fields to add. E.g. `-f username:string,password:string`'},
    {option: '-i, --interactive', description: 'Use interactive mode to design the entity'}
  ]
};
