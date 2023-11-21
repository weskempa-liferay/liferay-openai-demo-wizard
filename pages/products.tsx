import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import hljs from "highlight.js";
import React from "react";

export default function Review() {
  // Create a ref for the div element
  const textDivRef = useRef<HTMLDivElement>(null);
  const [productInput, setProductInput] = useState("");
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);


    // Add a click event listener to the copy icon that copies the text in the div to the clipboard when clicked
    useEffect(() => {
      const copyIcon = document.querySelector(".copy-icon");
      if (!copyIcon) return;
      copyIcon.addEventListener("click", () => {
        const textDiv = textDivRef.current;
        
        let text;
        if (textDivRef.current) {
          text = textDivRef.current.textContent;
        }
          
        // Create a hidden textarea element
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
  
        // Select the text in the textarea
        textArea.select();
  
        // Copy the text to the clipboard
        document.execCommand("copy");
  
        // Remove the textarea element
        document.body.removeChild(textArea);
      });
    }, []); // Run this only once


  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product: productInput }),
    });
    const data = await response.json();
    console.log("data", data);
    console.log("data.result", data.result);

    let rawResult = data.result;

    console.log("rawResult");

    const hljsResult = hljs.highlightAuto(rawResult).value;

    // set result to the highlighted code. Address this error: Argument of type 'string' is not assignable to parameter of type '(prevState: undefined) => undefined'.ts(2345)
    setResult(hljsResult);

    setProductInput("");
    setIsLoading(false);
  }

  return (
    <div>
  <Head>
      <title>OpenAI API Starter - Product generator</title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
    
        <h3 className="text-slate-200 font-bold text-xl mb-3">
          Liferay Product Generator
        </h3>
        <p className="text-slate-100 text-lg mb-3">
          Open AI app to generate products.
        </p>
        <form onSubmit={onSubmit}>
          <input
            className="text-sm text-gray-base w-full 
                              mr-3 py-5 px-4 h-2 border 
                              border-gray-200 rounded mb-2"
                              
            type="text"
            name="product"
            placeholder="Enter a company theme"
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
          />

          <button
            className="text-sm w-full bg-blue-600 h-7 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Generate products
          </button>
        </form>
        {isLoading ? (
          <div>
            <p class="text-slate-200">Loading... be patient.. </p>

            <div role="status">
                <svg aria-hidden="true" class="mx-auto mt-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span class="sr-only">Loading...</span>
            </div>
          </div>
        ) : result ? (
          <div className="relative w-2/4 ">
            <div
              ref={textDivRef}
              className="rounded-md border-spacing-2 border-slate-900 bg-slate-100 break-words max-w-500 overflow-x-auto  "
            >
              <pre className="">
                <code
                  className=""
                  dangerouslySetInnerHTML={{ __html: result }}
                />
              </pre>
            </div>
            <div className="absolute top-0 right-0 mt-2 mr-2 cursor-pointer copy-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-copy"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <rect x="8" y="8" width="12" height="12" rx="2"></rect>
                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
              </svg>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}


