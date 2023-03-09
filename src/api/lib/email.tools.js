import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendsBlogPostCreatedEmail = async recipientAdress => {
  const msg = {
    to: recipientAdress,
    cc: "mfb.auerbacher@hotmail.com",
    from: process.env.SENDER_EMAIL_ADDRESS,
    subject: "You Blog Post has been succesfully created",
    text: "bla bla bla",
    html: `
      <h1>Congrats</h1>

    `,
   
  
       
  };
  await sgMail.send(msg);
};
