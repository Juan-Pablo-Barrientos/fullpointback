const express = require("express");
const nodemailer = require("nodemailer");
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // for example, limit to 5MB
});
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
  origin: ['https://fullpoint.com.ar','http://localhost:4200/','*']
};

async function sendMail(file, req, esCV, res) {
  // Create a new attachment object
  let attachment = {}
  if (file) {
    attachment = {
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype
    };
  }
  if (esCV) {
    const info = await transporter.sendMail({
      from: 'fullpoint@srl.com',
      to: req.recipient,
      subject: "CV: " + req.surname + ", " + req.name,
      text: "Hola mi nombre es " + req.name + " " + req.surname + " mi teléfono es " + req.phone + " y tengo " + req.age + " años" + " estoy aplicando para la sección de " + req.position + " te dejo mi email para contactarte conmigo " + req.email,
      attachments: file ? [attachment] : []
    });

    console.log("Email sent: ", info.messageId);
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

app.post("/cv", upload.single('cv'), async (req, res) => {


  try {
    await sendMail(req.file, req.body, true, res);
    res.send("CV sent successfully!");
  } catch (error) {
    console.error("Error in /cv route:", error);
    res.status(500).send("Error sending email");
  }
});

app.post("/contact", async (req, res) => {
  console.log(req.body);
  const { recipient, name, surname, email, message, subject } = req.body;
  if (!recipient || !name || !surname ||!email || !message || !subject) {
    return res.status(400).send("Missing required fields in request body");
  }
  await sendMail("",req.body, false);
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