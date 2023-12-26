import {useState} from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import NavItem from "./components/navitem";

export default function Review() {

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  return (
    <div>
      
      <AppHead title={"User Generation Options"}/>

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader title={"Liferay User Generator"} desc={"How would you like to add users?"} />
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">

          <NavItem title={"CSV Upload"}    path={"/users-file"}  desc={"Upload a list of specific users from a CSV file."} />
          <NavItem title={"AI Generation"} path={"/users-ai"}    desc={"Use OpenAI to generate a list of random demo users."} />

        </div>
        
      </main>
        
      <AppFooter debugModeChange={onDebugModeChange} />
        
    </div>
  );
};
