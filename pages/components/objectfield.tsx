import { useEffect, useState } from 'react';

import FieldSelect from './../components/formfield-select';
import FieldString from './../components/formfield-string';

const fieldOptions = [{ id: 'string', name: 'String' }];

export default function ObjectField({ handleChange, id }) {
  const [fieldName, setFieldName] = useState('');
  const [fieldDescription, setFieldDescription] = useState('');
  const [fieldType, setFieldType] = useState('string');

  useEffect(() => {
    handleChange(
      {
        fieldDescription: fieldDescription,
        fieldName: fieldName,
        fieldType: fieldType,
      },
      id
    );
  }, [fieldName, fieldDescription, fieldType]);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-4">
      <FieldString
        defaultValue=""
        inputChange={setFieldName}
        label="Object Field Key Name"
        name="objectFieldName"
        placeholder="Enter a object field name"
      />

      <FieldString
        defaultValue=""
        inputChange={setFieldDescription}
        label="Content Description"
        name="objectFieldDescription"
        placeholder="Example: Country Name"
      />

      <FieldSelect
        inputChange={setFieldType}
        label="Field Type"
        name="objectFieldType"
        optionMap={fieldOptions}
      />
    </div>
  );
}
