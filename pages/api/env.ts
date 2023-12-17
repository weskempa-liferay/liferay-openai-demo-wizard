export default async function (req, res) {

    const openAPIKey = process.env.OPENAI_API_KEY;
    const path = process.env.LIFERAY_PATH;
    const emailAddress = process.env.LIFERAY_ADMIN_EMAIL_ADDRESS;
    const password = process.env.LIFERAY_ADMIN_PASSWORD;

    let message = "";
    let status = "error";

    if(openAPIKey.length==0) {
        message = "<b>OpenAI API key is required.</b> Please add a api key to your .env properties file."
    } else if(path.length==0) {
        message = "<b>A Liferay instance path is required.</b> Please add it to your .env properties file."
    } else if(emailAddress.length==0) {
        message = "<b>An admin user email address is required.</b> Please add it to your .env properties file."
    } else if(password.length==0) {
        message = "<b>A password is required.</b> Please add a password to your .env properties file."
    } else {
        message = "Connected to <b>" + path + "</b> with user <b>" + emailAddress + "</b>";
        status = "connected";
    }
  
    res.status(200).json({ result: message, status: status});
}