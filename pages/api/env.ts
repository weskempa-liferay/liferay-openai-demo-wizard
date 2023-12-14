export default async function (req, res) {

    const openAPIKey = process.env.OPENAI_API_KEY;
    const path = process.env.LIFERAY_PATH;
    const emailAddress = process.env.LIFERAY_ADMIN_EMAIL_ADDRESS;
    const password = process.env.LIFERAY_ADMIN_PASSWORD;

    let message = "";

    if(openAPIKey.length==0) {
        message = "Open API Key is required. Please add a api key to your .env properties file."
    } else if(path.length==0) {
        message = "The path to your Liferay Instance is required. Please add a server path to your .env properties file."
    } else if(emailAddress.length==0) {
        message = "The email address of an admin user is required. Please add an email address to your .env properties file."
    } else if(password.length==0) {
        message = "The password for your user is required. Please add a password to your .env properties file."
    } else {
        message = "Connected to " + path + " with user " + emailAddress;
    }
  
  res.status(200).json({ result: message });
}