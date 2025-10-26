
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const app = express();
const WorkItem = require('./models/WorkItem');
const cookieParser = require('cookie-parser');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));




// Load environment variables (recommended)
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());




//  Twilio Setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

//  Nodemailer Setup
const transporter = nodemailer.createTransport({
//   service: 'gmail',
    host: 'smtp.gmail.com',
  port: 587, // Use TLS instead of SSL
  secure: false, // TLS requires secure to be false

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// ✅ Firebase Setup
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// app.post('/contact', (req, res) => {
//   console.log('Contact form received:', req.body);
//   res.json({ success: true });
// });
// ✅ Contact Route/Public Route
app.post('/api/contact', async (req, res) => {
  const { name, phone, email, service, message } = req.body;

  try {
    // 📬 Save to Firebase
    await db.collection('submissions').add({
      name,
      phone,
      email,
      service,
      message,
      timestamp: new Date()
      
    });

    // 📧 Email to Brandace
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER,
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`
    });

    // 📧 Email to Client
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: `Thank you for contacting Brandace`,
      text: `Hi ${name},\n\nThank you for reaching out to Brandace. We’ve received your request for "${service}" and will get back to you shortly.\n\nIf you have any urgent questions, feel free to call us at +234 802 945 3879.\n\n— Brandace Creative Team`
    });
     console.log('Saving to Firestore...');
      console.log('Sending email to Brandace...');
      console.log('Sending email to client...');

    // // 📲 WhatsApp to Brandace
    // await twilioClient.messages.create({
    //   from: 'whatsapp:+14155238886',
    //   to: 'whatsapp:+2348029453879',
    //   body: `📬 New Inquiry from ${name}\nService: ${service}\nPhone: ${phone}`
    // });

    // // 📲 WhatsApp to Client
    // await twilioClient.messages.create({
    //   from: 'whatsapp:+14155238886',
    //   to: `whatsapp:${phone}`,
    //   body: `Hi ${name}, thanks for contacting Brandace! We’ve received your request for "${service}". We'll be in touch soon.`
    // });

    console.log("📬 Submission processed:", { name, phone, email, service, message });
    res.status(200).json({ success: true, message: "Form received!" });

  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


//ADMIN PAGE

require('dotenv').config();

const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const ClientLogo = require('./models/ClientLogo');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Multer setup for local uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage });

// Admin dashboard
app.get('/admin', checkAdminSession, async (req, res) => {
  try {
    const logos = await ClientLogo.find().sort({ createdAt: -1 });
    const workItems = await WorkItem.find().sort({ createdAt: -1 });
    res.render('dashboard', { logos, workItems }); // ✅ Single render with both datasets
  } catch (error) {
    console.error('❌ Error loading admin dashboard:', error);
    res.status(500).send('Failed to load dashboard');
  }
});


app.post('/upload-logo', upload.single('logo'), async (req, res) => {
  const { name } = req.body;
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'brandace/logos'
  });

  await ClientLogo.create({
    name,
    imageUrl: result.secure_url
  });

  res.redirect('/admin');
});

// Delete logo
app.post('/delete-logo/:id', async (req, res) => {
  await ClientLogo.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

app.get('/api/client-logos', async (req, res) => {
  try{
    const logos = await ClientLogo.find().sort({ createdAt: -1 });
  res.json(logos);
  }catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logos' });
  }
});


// WORK UPLOAD
app.post('/upload-work', upload.single('image'), async (req, res) => {
  const { title, description, category } = req.body;

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'brandace/work'
    });

    await WorkItem.create({
      title,
      description,
      category,
      imageUrl: result.secure_url
    });

    res.redirect('/admin?upload=success');
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Upload failed');
    res.redirect('/admin?upload=fail');
  }
});

//DELETE WORK ITEM
app.post('/delete-work/:id', async (req, res) => {
  try {
    await WorkItem.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (error) {
    res.status(500).send('Delete failed');
  }
});

//VIEW WORK ITEM BY CATEGORIES
app.get('/branding.html', async (req, res) => {
  const items = await WorkItem.find({ category: 'Branding' });
  res.render('branding', { items });
});

app.get('/web-design.html', async (req, res) => {
  const items = await WorkItem.find({ category: 'Web Design' });
  res.render('web-design', { items });
});

app.get('/mobile-app.html', async (req, res) => {
  const items = await WorkItem.find({ category: 'Mobile App' });
  res.render('mobile-app', { items });
});

app.get('/graphic-design.html', async (req, res) => {
  const items = await WorkItem.find({ category: 'Graphic Design' });
  res.render('graphic-design', { items });
});

app.get('/motion-graphics.html', async (req, res) => {
  const items = await WorkItem.find({ category: 'Motion Graphics' });
  res.render('motion-graphics', { items });
});

//Admin Login

app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

app.post('/session-login', async (req, res) => {
  const idToken = req.body.token;
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true });
    res.status(200).send('Logged in');
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

app.get('/admin', async (req, res) => {
  const sessionCookie = req.cookies.session || '';

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    res.render('admin-dashboard', { user: decodedClaims });
  } catch (error) {
    res.redirect('/admin-login');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/admin-login');
});

function checkAdminSession(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(decoded => {
      req.user = decoded;
      next();
    })
    .catch(() => res.redirect('/admin-login'));
}

app.get('/admin', checkAdminSession, (req, res) => {
  res.render('admin-dashboard', { user: req.user });
});

app.listen(PORT, () => console.log(`🚀 Admin dashboard running on port ${PORT}`));