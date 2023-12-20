export default function FieldSelect({name,label,optionMap,inputChange}) {

    return(
        <label className="flex max-w-xs flex-col text-slate-200">
            {label}
            <select name={name}
                    onChange={(e) => inputChange(e.target.value)}
                    id={name}
                    className="bg-white border border-gray-200 
                    text-slate-700 text-sm rounded
                    block w-full p-2.5">
                    {optionMap.map((option) => {
                      return (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      );
                    })}
            </select>
        </label>
    )
}