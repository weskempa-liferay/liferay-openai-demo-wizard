import React from "react";
import ObjectField from "./components/objectfield";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";

import hljs from "highlight.js";

class Review extends React.Component {

  state = {
    aiRoleInput : "You are a helpful assistant responsible for providing a list of answers",
    aiRequestInput : "Provide a list of 10 countries in Europe",
    aiEndpointInput : "/o/c/exampleobjects/batch",
    result : "",
    isLoading : false,
    updateCount : 0,
    objectFields : [{fieldName:"",fieldDescription:"",fieldType:""}],
    debugMode: false
  }

  onDebugModeChange = () => {
    this.setState({debugMode:!this.state.debugMode});
  };

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({isLoading:true});

    let postFields = {};
    
    for(let i = 0;i<this.state.objectFields.length;i++){
      let fieldName = this.state.objectFields[i].fieldName;
      postFields[fieldName] = {
        type:this.state.objectFields[i].fieldType,
        description:this.state.objectFields[i].fieldDescription
      }
    }

    const response = await fetch("/api/objects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aiRole: this.state.aiRoleInput,
        aiRequest: this.state.aiRequestInput,
        aiEndpoint: this.state.aiEndpointInput, 
        objectFields: postFields,
        debugMode:this.state.debugMode
      }),
    
    });
    const data = await response.json();
    if(this.state.debugMode) console.log("data", data);

    const hljsResult = hljs.highlightAuto(data.result).value;

    this.setState({
      result:hljsResult,
      isLoading:false
    });
    
  }

  addField = (event) => {
    event.preventDefault();

    let stack = this.state.objectFields;
    stack.push({fieldName:"",fieldDescription:"",fieldType:""})

    this.setState({
      objectFields:stack,
    });
  }

  removeField = (event) => {
    event.preventDefault();
    if(this.state.objectFields.length>1){
      let stack = this.state.objectFields.splice(0,this.state.objectFields.length-1);

      this.setState({objectFields:stack});
    }
  }

  handleFieldChange = (event, key) => {
    this.setState({
      objectFields:this.updateStack(event,key)
    });
  }

  updateStack = (fieldSet,id) => {
    let fields = this.state.objectFields;
    
    fields.splice(id,1,fieldSet);
    return fields;
  }

  render(){

    return (
      <div>
        <AppHead title={"Object Generator"}/>

        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
          
          <AppHeader title={"Liferay Object Data Generator"} desc={"Complete the prompts below and describe your object to create the object data."} />

          <form className="mb-6" onSubmit={this.onSubmit}>

              <div className="d-block mb-4">
                  <label className="text-slate-200">
                          Enter the role the OpenAI should act as:
                      <input
                          className="text-sm text-gray-base w-full 
                                      mr-3 py-5 px-4 h-2 border 
                                      border-gray-200 text-slate-700 rounded"
                          type="text"
                          name="topic"
                          placeholder="You are a helpful assistant responsible for providing a list of answers"
                          value={this.state.aiRoleInput}
                          onChange={(e) => this.setState({aiRoleInput:e.target.value})}
                          />
                  </label>
              </div>
              
              <div className="d-block mb-4">
                  <label className="text-slate-200">
                          Enter your specific request to OpenAI:
                      <input
                          className="text-sm text-gray-base w-full 
                                      mr-3 py-5 px-4 h-2 border 
                                      border-gray-200 text-slate-700 rounded"
                          type="text"
                          name="topic"
                          placeholder="Provide a list of 10 countries in Europe"
                          value={this.state.aiRequestInput}
                          onChange={(e) => this.setState({aiRequestInput:e.target.value})}
                          />
                  </label>
              </div>

              <div className="d-block mb-4">
                  <label className="text-slate-200">
                      Location of your object's batch endpoint (Example /o/c/exampleobjects/batch):
                      <input
                          className="text-sm text-gray-base w-full 
                                      mr-3 py-5 px-4 h-2 border 
                                      border-gray-200 text-slate-700 rounded"
                          type="text"
                          name="topic"
                          placeholder="/o/c/exampleobjects/batch"
                          value={this.state.aiEndpointInput}
                          onChange={(e) => this.setState({aiEndpointInput:e.target.value})}
                          />
                  </label>
              </div>
              
              <div className=" bg-white/10 rounded p-3 mb-5">
                  <h4 className="text-slate-200 font-bold mb-3">
                      Describe your object structure
                  </h4>

                  {Object.entries(this.state.objectFields).map(([key, value], index) => {
                    return (
                      <ObjectField key={index} id={index} handleChange={this.handleFieldChange} />
                    )})
                  }

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4 mb-2">
                      <button onClick={this.addField}
                          className="text-sm pl-4 pr-4 rounded mt-6 disabled:bg-blue-800
                                    bg-blue-400 font-semibold h-7 text-white disabled:text-slate-400" >
                          Add Field
                      </button>
                      <button onClick={this.removeField}
                          disabled={this.state.objectFields.length <= 1 ? true : false}
                          className="text-sm pl-4 pr-4 rounded mt-6 disabled:bg-blue-800
                                      bg-blue-400 font-semiboldh-7 text-white disabled:text-slate-400" >
                          Remove Last Field
                      </button>
                  </div>
              </div>
            
            <button disabled={this.state.isLoading}
              className="text-sm w-full bg-blue-600 h-10 text-white
                          rounded-2xl mb-10"
              type="submit"
            >
              Generate Object Data
            </button>
          </form>
          
          {this.state.isLoading ? (
            <LoadingAnimation/>
          ) : this.state.result ? (
            <ResultDisplay result={this.state.result} />
          ) : null}
          
        </main>

        <div className="hidden">{this.state.updateCount}</div>
      
        <AppFooter debugModeChange={this.onDebugModeChange} />
      
      </div>
    );
  }
}
export default Review;