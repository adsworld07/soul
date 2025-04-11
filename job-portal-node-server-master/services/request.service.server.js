module.exports = function (app) {
    const Request = require('../models/contact-Requests/request.model.server');
    const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// API Routes
app.post('/api/submit-request', async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      tierSelected: true
    };
    
    // Save to database
    const newRequest = new Request(requestData);
    await newRequest.save();
    
    // Send email notification
    await sendEmailNotification(requestData, true);
    
    // Send confirmation email to user
    await sendConfirmationEmail(requestData);
    
    res.status(200).json({ 
      success: true, 
      message: 'Your request has been submitted successfully!' 
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request.' 
    });
  }
});

app.post('/api/submit-custom-request', async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      tierSelected: false
    };
    
    // Save to database
    const newRequest = new Request(requestData);
    await newRequest.save();
    
    // Send email notification
    await sendEmailNotification(requestData, false);
    
    // Send confirmation email to user
    await sendConfirmationEmail(requestData);
    
    res.status(200).json({ 
      success: true, 
      message: 'Your custom quote request has been submitted successfully!' 
    });
  } catch (error) {
    console.error('Error processing custom request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your custom quote request.' 
    });
  }
});

// Utility Functions
async function sendEmailNotification(data, isStandardTier) {
  const subject = isStandardTier 
    ? `New Pricing Tier Request: ${data.points} Points` 
    : `New Custom Quote Request: ${data.points}+ Points`;
  
  const htmlContent = `
    <h2>${subject}</h2>
    <p><strong>From:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Industry:</strong> ${data.industry}</p>
    <p><strong>Position:</strong> ${data.position}</p>
    <p><strong>Points Requested:</strong> ${data.points}</p>
    ${data.requirements ? `<p><strong>Additional Requirements:</strong> ${data.requirements}</p>` : ''}
    <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: subject,
    html: htmlContent
  });
}

async function sendConfirmationEmail(data) {
  const htmlContent = `
    <h2>Thank you for your request!</h2>
    <p>Dear ${data.firstName},</p>
    <p>We have received your request for ${data.points} points. Our team will review your submission and get back to you shortly.</p>
    <p>Here's a summary of your request:</p>
    <ul>
      <li><strong>Points:</strong> ${data.points}</li>
      <li><strong>Industry:</strong> ${data.industry}</li>
      <li><strong>Position:</strong> ${data.position}</li>
    </ul>
    ${data.requirements ? `<p><strong>Additional Requirements:</strong> ${data.requirements}</p>` : ''}
    <p>If you have any questions, please feel free to contact our support team.</p>
    <p>Best regards,<br>The Support Team</p>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: 'Your Request Has Been Received',
    html: htmlContent
  });
}
   
}; 