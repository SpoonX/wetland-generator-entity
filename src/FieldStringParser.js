const util = require('util');
const ezon = require('ezon');

class FieldStringParser {
  constructor(fieldString) {
    this.fieldString = fieldString;
    this.fields      = {};
  }

  static parse(fieldsString) {
    let parser = new FieldStringParser(fieldsString);

    return parser.parse();
  }

  parse() {
    this.fieldString.split(/,(?![^()]*\))/).forEach(definition => this.parseField(definition));

    return this.fields;
  }

  parseField(field) {
    field = field.trim();

    let parts            = field.split(':');
    let property         = parts.shift();
    let definitionString = parts.join(':');
    let definition       = this.parseDefinition(definitionString);

    this.fields[property] = {argumentString: util.inspect(definition, {showHidden: true, depth: null}), definition};
  }

  parseDefinition(definition) {
    if (!definition.length) {
      return {type: 'string'};
    }

    let definitionSegments = definition.replace(/\)$/, '').split('(');

    if (definitionSegments.length === 1) {
      // Type is `definition` on function field.
      return {type: definition};
    }

    let fieldDefinition = ezon(definitionSegments[1], {defaultKey: 'type'});

    if (!fieldDefinition.type) {
      fieldDefinition.type = 'string';
    }

    return fieldDefinition;
  }
}

module.exports = FieldStringParser;
