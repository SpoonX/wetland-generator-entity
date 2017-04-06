const {Generator}       = require('boards');
const inquirer          = require('inquirer');
const {Homefront}       = require('homefront');
const emoji             = require('node-emoji');
const path              = require('path');
const FieldStringParser = require('./FieldStringParser');

const templateStrings = {
  extendEntity: ' extends Entity',
  importField : ', field',
  importEntity: {
    js: "const Entity = require('wetland').Entity;\n\n",
    ts: "import {Entity} from 'wetland';\n"
  }
};

class EntityGenerator extends Generator {
  static defaults() {
    return {
      sourceDirectory: path.join(__dirname, '../templates'),
      targetDirectory: path.join(process.cwd(), 'app', 'entity')
    };
  }

  prepare(parameters) {
    parameters = this.enrichParameters(parameters);

    if (!parameters.interactive) {
      parameters.language = parameters.language || 'js';

      return this.buildMappings(parameters);
    }

    console.log('\n', emoji.get('lollipop') + ` Entity generator\n`);

    const queries = [
      {
        name   : 'extendEntity',
        type   : 'confirm',
        message: 'Should this entity extend wetland.Entity (for .toObject)?',
        default: !!parameters.extend
      },
      {
        name   : 'language',
        message: 'What language are you using?',
        type   : 'list',
        choices: [{name: 'TypeScript', value: 'ts', short: 'ts'}, {name: 'Javascript', value: 'js', short: 'js'}],
        default: parameters.language
      },
      {name: 'addFields', type: 'confirm', message: 'Do you want to add some fields?', default: false},
    ];

    return inquirer.prompt(queries)
      .then(answers => {
        let name      = parameters.name;
        let extension = answers.language;

        parameters = Homefront.merge(parameters, {
          extension,
          language    : answers.language,
          sourceFile  : `entity.${extension}.template`,
          targetFile  : `${name}.${extension}`,
          extendEntity: answers.extendEntity && templateStrings.extendEntity || null,
          importEntity: answers.extendEntity && templateStrings.importEntity[extension] || null,
          className   : name
        });

        if (!answers.addFields) {
          return this.buildMappings(parameters);
        }

        // @todo collect fields and don't render until at this point.
        return this.collectMappings(parameters).then(parameters => this.buildMappings(parameters));
      });
  }

  buildMappings(parameters) {
    // console.log(parameters.fields);
    if (Array.isArray(parameters.fields) && parameters.fields.length) {
      // Woo! do stuff.
      parameters.fields = '\n' + parameters.fields
          .map(field => this.renderFieldMapping(field.property, field.argumentString, parameters.language))
          .join('\n');
    }

    return parameters;
  }

  enrichParameters(parameters) {
    if (parameters.language === 'ts') {
      parameters.importField = templateStrings.importField;
    }

    let name = parameters.name[0].toUpperCase() + parameters.name.substr(1);

    if (parameters.fields) {
      let fields = FieldStringParser.parse(parameters.fields);

      parameters.fields = Reflect.ownKeys(fields).map(property => {
        return {property, argumentString: fields[property].argumentString};
      });
    }

    return Homefront.merge({
      extension   : parameters.language,
      sourceFile  : `entity.${parameters.language}.template`,
      targetFile  : `${name}.${parameters.language}`,
      extendEntity: parameters.extend && templateStrings.extendEntity || '',
      importEntity: parameters.extend && templateStrings.importEntity[parameters.language] || '',
      className   : name
    }, parameters);
  }

  collectField() {
    console.log('\n', emoji.get('unicorn_face') + ` Field generator\n`);

    return inquirer.prompt([
      {name: 'fieldName', message: 'What should the field be named? (empty to cancel)'},
      {
        name   : 'columnName',
        message: 'What should the column be named?',
        when   : answers => !!answers.fieldName,
        default: answers => answers.fieldName
      },
      {name: 'type', message: 'What is the type?', default: 'string', when: answers => !!answers.fieldName},
      {
        name   : 'addAnotherField',
        message: 'Do you want to add another field?',
        type   : 'confirm',
        default: false,
        when   : answers => !!answers.fieldName
      }
    ]);
  }

  renderFieldMapping(property, argumentsString, extension) {
    if (extension === 'ts') {
      return `\n  @field(${argumentsString}) ${property};`;
    }

    return `    mapping.field('${property}', ${argumentsString});`;
  }

  renderFieldOptions(options, extension) {
    let fieldOptions = `{ type: '${options.type}'`;

    if (options.columnName !== options.fieldName) {
      fieldOptions += `, name: '${options.columnName}'`;
    }

    return fieldOptions + ' }';
  }

  collectMappings(parameters) {
    parameters.fields = Array.isArray(parameters.fields) ? parameters.fields : [];

    let fields = parameters.fields;

    return this.collectField().then(field => {
      if (!field.fieldName) {
        console.log('\n', emoji.get('coffee') + ` Canceling field generator`);

        return parameters;
      }

      fields.push({property: field.fieldName, argumentString: this.renderFieldOptions(field, parameters.extension)});

      if (field.addAnotherField) {
        return this.collectMappings(parameters);
      }

      return parameters;
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

module.exports = EntityGenerator;
