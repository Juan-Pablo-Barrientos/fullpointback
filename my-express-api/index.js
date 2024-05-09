const express = require("express");
const nodemailer = require("nodemailer");
const cors = require('cors');
require('dotenv').config();
var bodyParser = require('body-parser')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'fullpontsrl2024@gmail.com',
    pass: process.env.MAILER_KEY
  }
});

const corsOptions = {
  origin: ['http://localhost', 'https://localhost', 'https://fullpoint.com.ar', 'http://localhost:4200']
};

async function sendMail(base64Attachment, req, esCV) {
  // Create a new attachment object
  let attachment = {}
  if (base64Attachment!=undefined){
    attachment = {
      filename: 'cv.pdf',
      content: base64Attachment,
      encoding: 'base64' // Specify that the content is Base64 encoded
    };
  }
  if (esCV){
    const info = await transporter.sendMail({
      from: 'fullpoint@srl.com',
      to: req.recipient,
      subject: "CV: " + req.surname + ", " + req.name,
      text: "Hola mi nombre es "+req.name+" "+req.surname+" mi teléfono es "+req.phone+" y tengo "+req.age+" años"+" estoy aplicando para la sección de "+req.position+" te dejo mi email para contactarte conmigo "+req.email,
      attachments: [attachment]
    });
  } else{
    let text = "Hola mi nombre es "+req.name+' '+req.surname
    if (req.phone){
      text += "\nTeléfono: "+req.phone
    }
    if (req.province || req.city){
      text += "\nVivo en: "+req.province+", "+req.city
    }
    text +="\nMi Email: "+req.email+"\nConsulta: "+req.message
    const info = await transporter.sendMail({
      from: 'fullpoint@srl.com',
      to: req.recipient,
      subject: req.subject,
      text: text
    });
  }

  // send mail with defined transport object and the attachment

}

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.post("/cv", (req, res) => {
  console.log(req.body);
  const { pdfString, recipient, name, surname, phone, age, position, email } = req.body;
  if (!pdfString || !recipient || !name || !surname || !phone || !age || !position|| !email) {
    return res.status(400).send("Missing required fields in request body");
  }

  sendMail(req.body.pdfString, req.body , true);
  res.send("CV sent successfully!");
});

app.post("/contact", (req, res) => {
  console.log(req.body);
  const { recipient, name, surname, email, message, subject } = req.body;
  if (!recipient || !name || !surname ||!email || !message || !subject) {
    return res.status(400).send("Missing required fields in request body");
  }
  sendMail("",req.body, false);
  res.send("Contact information sent successfully!");
});

app.get("/home", (req, res) => {
    return res.status(200).send("Working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;