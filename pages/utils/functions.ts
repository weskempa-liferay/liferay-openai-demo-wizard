// functions.js
// ========
module.exports = {
    millisToMinutesAndSeconds: (millis) => {
        const date = new Date(millis);
        if(date.getMinutes()){
            return `${date.getMinutes()} minutes, ${date.getSeconds()} seconds`;
        } else { 
            return `${date.getSeconds()} seconds`;
        }
    },
    foo: () => {
      // whatever
    }
};
