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
    getBase64data: () => {
      const usernamePasswordBuffer = Buffer.from( 
        process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
        ':' + process.env.LIFERAY_ADMIN_PASSWORD);

        return usernamePasswordBuffer.toString('base64');
    }
};
