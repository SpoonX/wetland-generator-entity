const {Board}     = require('boards');
const inquirer    = require('inquirer');
const {Homefront} = require('homefront');
const emoji       = require('node-emoji');
const path        = require('path');

class EntityBoard extends Board {
  static name () {
    return 'wetland-entity';
  }

  static defaults() {
    return {
      sourceDirectory: path.join(__dirname, 'templates'),
      targetDirectory: path.join(process.cwd(), 'app', 'entity')
    };
  }

  constructor(config) {
    super();

    this.config = config;
  }

  prepare(parameters) {
    if (parameters.yes && parameters.name) {
      return parameters;
    }

    console.log('\n', emoji.get('lollipop') + ` Entity generator\n`);

    const queries = [
      {name: 'name', message: 'What should this Entity be named?'},
      {name: 'extendEntity', type: 'confirm', message: 'Should this entity extend wetland.Entity (for .toObject)?', default: false},
      {name: 'language', message: 'What language are you using?', type: 'list', choices: ['TypeScript', 'Javascript'], default: 'Javascript'},
      {name: 'addFields', type: 'confirm', message: 'Do you want to add some fields?', default: false},
    ];

    const templateStrings = {
      extendEntity: ' extends Entity',
      importField: ', field',
      importEntity: {
        js: "const Entity = require('wetland').Entity;\n\n",
        ts: "import {Entity} from 'wetland';\n"
      }
    };

    return inquirer.prompt(queries)
      .then(answers => {
        let name      = answers.name[0].toUpperCase() + answers.name.substr(1);
        let extension = answers.language === 'Javascript' ? 'js' : 'ts';

        parameters = Homefront.merge({
          extension,
          sourceFile: `entity.${extension}.template`,
          targetFile: `${name}.${extension}`,
          extendEntity: answers.extendEntity && templateStrings.extendEntity || '',
          importEntity: answers.extendEntity && templateStrings.importEntity[extension] || '',
          className: name
        }, parameters);

        if (!answers.addFields) {
          return parameters;
        }

        if (extension === 'ts') {
          parameters.importField = templateStrings.importField;
        }

        return this.collectFields(parameters).then(fields => {
          parameters.fields = '\n' + fields.join('\n');

          return parameters;
        });
      });
  }

  collectField() {
    console.log('\n', emoji.get('unicorn_face') + ` Field generator\n`);

    return inquirer.prompt([
      {name: 'fieldName', message: 'What should field be named? (empty to cancel)'},
      {name: 'columnName', message: 'What should the column be named?', when: answers => !!answers.fieldName, default: answers => answers.fieldName},
      {name: 'type', message: 'What is the type?', default: 'text', when: answers => !!answers.fieldName},
      {name: 'addAnotherField', type: 'confirm', message: 'Do you want to add another field?', default: false, when: answers => !!answers.fieldName}
    ]);
  }

  renderFieldMapping(options, extension) {
    let fieldOptions = `{type: '${options.type}'`;

    if (options.columnName !== options.fieldName) {
      fieldOptions += `, name: '${options.columnName}'`;
    }

    fieldOptions += '}';

    if (extension === 'ts') {
      return `\n  @field(${fieldOptions}) ${options.fieldName};`;
    }

    let fieldMapping = `    mapping.field('${options.fieldName}', `;
    fieldMapping += fieldOptions + ');';

    return fieldMapping;
  }

  collectFields(parameters) {
    let fields = [];

    return this.collectField().then(field => {
      if (!field.fieldName) {
        console.log('\n', emoji.get('coffee') + ` Canceling field generator`);

        return fields;
      }

      fields.push(this.renderFieldMapping(field, parameters.extension));

      if (field.addAnotherField) {
        return this.collectFields(parameters).then(newFields => fields.concat(newFields));
      }

      return fields;
    });
  }

  generate(parameters) {
    return this.runSteps(['read', 'replace', 'write']);
  }

  complete(stream) {
    console.log('\n', emoji.get('birthday') + ` Entity generated!\n`);

    return stream;
  }
}

module.exports = {Board: EntityBoard};
