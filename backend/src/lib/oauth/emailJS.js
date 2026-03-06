import axios from 'axios';

const sendVerificationEmail = async (name, email, otp) => {
  const data = {
    service_id: process.env.SERVICE_ID,
    template_id:process.env.EMAIL_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY, // Keep this in your .env file!
    template_params: {
      'name': name,
      'email': email,
      'otp': otp
    }
  };

  try {
    await axios.post('https://api.emailjs.com/api/v1.0/email/send', data);
    // console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
  }
};
const sendResetPasswordLink = async (email,resetUrl) => {
  const data = {
    service_id: process.env.SERVICE_ID,
    template_id:process.env.PASSWORD_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY, // Keep this in your .env file!
    template_params: {
      'email': email,
      'resetUrl': resetUrl
    }
  };

  try {
    await axios.post('https://api.emailjs.com/api/v1.0/email/send', data);
    // console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
  }
};



export {sendVerificationEmail,sendResetPasswordLink};