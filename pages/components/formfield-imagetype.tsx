export default function FieldImageType({inputChange,includeNone}) {

    return(
        <label className="flex flex-col text-slate-200">
            Image Generation
            <select name="imageGenerationType" 
                    onChange={(e) => inputChange(e.target.value)}
                    id="imageGenerationType" 
                    className="bg-white border border-gray-200 
                    text-slate-700 text-sm rounded
                    block w-full p-2.5">
                {includeNone ? ( <option value="none">None</option> ) : null }
                <option value="dall-e-2">DALL·E 2 (Basic Images)</option>
                <option value="dall-e-3">DALL·E 3 (Highest-Quality Images)</option>
            </select>
        </label>
    )
}