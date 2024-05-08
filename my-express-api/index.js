const express = require("express");
const nodemailer = require("nodemailer");
const cors = require('cors');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'fullpontsrl2024@gmail.com',
    pass: process.env.CLIENT_KEY
  }
});

const corsOptions = {
    origin: ['http://localhost', 'https://localhost', 'https://fullpoint.com.ar']
  };

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(attachmentByteArray, subject, recipient) {
  // Create a new attachment object
  const attachment = {
    filename: 'file.pdf',
    content: Buffer.from(attachmentByteArray, 'binary')
  };

  // send mail with defined transport object and the attachment
  if (attachmentByteArray == ""){
    const info = await transporter.sendMail({
      from: 'fullpoint@srl.com',
      to: recipient,
      subject: subject,
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });
  } else {
    const info = await transporter.sendMail({
      from: 'fullpoint@srl.com',
      to: recipient,
      subject: subject,
      text: "Hello world?",
      html: "<b>Hello world?</b>",
      attachments: [attachment]
    });
  }

  console.log("Message sent: %s", info.messageId);
}

const app = express();
app.use(cors(corsOptions));

app.post("/cv", (req, res) => {
  // Assuming you have the PDF byte array available
  const cvByteArray = [/* your CV PDF byte array */];
  sendMail(cvByteArray, "CV", "jpbarrientosros@gmail.com");
  res.send("CV sent successfully!");
});

app.post("/contact", (req, res) => {
  sendMail("", "Contact Information", "jpbarrientosros@gmail.com");
  res.send("Contact information sent successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;