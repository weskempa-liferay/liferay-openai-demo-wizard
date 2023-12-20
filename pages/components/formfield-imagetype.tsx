export default function FieldImageType({inputChange}) {

    return(
        <label className="flex max-w-xs flex-col text-slate-200">
            Image Generation
            <select name="imageGenerationType" 
                    onChange={(e) => inputChange(e.target.value)}
                    id="imageGenerationType" 
                    className="bg-white border border-gray-200 
                    text-slate-700 text-sm rounded
                    block w-full p-2.5">
                <option value="none">None</option>
                <option value="dall-e-2">DALL·E 2 (Basic Images)</option>
                <option value="dall-e-3">DALL·E 3 (Highest-Quality Images)</option>
            </select>
        </label>
    )
}