import { useState, useEffect } from "react";
import FieldString from "./../components/formfield-string";
import FieldSelect from "./../components/formfield-select";

export default function ObjectField({id, handleChange}) {

    const [fieldName, setFieldName] = useState("");
    const [fieldDescription, setFieldDescription] = useState("");
    const [fieldType, setFieldType] = useState("string");

    const fieldOptions = [{id:"string",name:"String"}];
  
    useEffect(() => {
        let changeObject = {fieldName:fieldName,fieldDescription:fieldDescription,fieldType:fieldType};
        handleChange(changeObject,id);
    }, [fieldName,fieldDescription,fieldType]);

    const updateFieldName = (newValue) => {
        setFieldName(newValue);
    }
  
    const updateFieldDescription = (newValue) => {
        setFieldDescription(newValue);
    }
  
    const updateFieldType = (newValue) => {
        setFieldType(newValue);
    }

    return (

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-4">

            <FieldString 
                name={"objectFieldName"}
                label={"Object Field Key Name"} 
                placeholder={"Enter a object field name"}
                inputChange={updateFieldName}
                defaultValue={""}
                />
            
            <FieldString 
                name={"objectFieldDescription"}
                label={"Content Description"} 
                placeholder={"Example: Country Name"}
                inputChange={updateFieldDescription}
                defaultValue={""}
                />
            
            <FieldSelect 
                    name={"objectFieldType"}
                    label={"Field Type"}
                    inputChange={updateFieldType}
                    optionMap={fieldOptions}
                  />

        </div>

    );
}