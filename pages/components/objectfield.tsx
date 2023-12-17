import { useState, useRef } from "react";
import React from "react";


class ObjectField extends React.Component<{handleChange,id},{}> {

    state = {
        fieldName : "",
        fieldDescription : "",
        fieldType : "string"
    }
  
    updateFieldName  = (newValue) => {
        this.setState({
            fieldName: newValue.target.value
        }, () => {
          this.updateValues();
        });
    }
  
    updateFieldDescription = (newValue) => {
        this.setState({
            fieldDescription: newValue.target.value
        }, () => {
          this.updateValues();
        });
    }
  
    updateFieldType  = (newValue) => {
        this.setState({
            fieldType: newValue.target.value
        }, () => {
          this.updateValues();
        });
    }

    updateValues  = () => {
      this.props.handleChange( this.state, this.props.id );
    }

    render(){

        return(
            
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-4">

                <label className="flex max-w-xs flex-col text-slate-200">
                    Object Field Key Name:
                    <input
                        className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                        type="text"
                        name="objectFieldName"
                        id="objectFieldName"
                        value={this.state.fieldName}
                        onChange={this.updateFieldName}
                        placeholder="Enter a object field name"
                    />
                </label>

                <label className="flex max-w-xs flex-col text-slate-200">
                    Content Description
                    <input
                        className="text-sm text-gray-base w-full 
                                    py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                        type="text"
                        name="objectFieldDescription"
                        id="objectFieldDescription"
                        value={this.state.fieldDescription}
                        onChange={this.updateFieldDescription}
                        placeholder="Example: Country Name" 
                    />
                </label>

                <label className="flex max-w-xs flex-col text-slate-200">
                    Field Type
                    <select name="objectFieldType" 
                            value={this.state.fieldType}
                            onChange={this.updateFieldType}
                            id="objectFieldType" 
                            className="bg-white border border-gray-200 
                            text-slate-700 text-sm rounded
                            block w-full p-2.5">
                        <option value="string">String</option>
                    </select>
                </label>

            </div>

        )
    }
}
export default ObjectField;