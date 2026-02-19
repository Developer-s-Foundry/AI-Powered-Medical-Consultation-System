-- Email Verification Template
INSERT INTO notification_templates (
    type, 
    name, 
    description,
    email_subject_template,
    email_body_template,
    variables,
    language
) VALUES (
    'email_verification',
    'Email Verification',
    'Template for email verification when user registers',
    'Verify Your Email - Health Bridge',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Health Bridge</h1>
        </div>
        <div class="content">
            <h2>Welcome to Health Bridge!</h2>
            <p>Hi {{name}},</p>
            <p>Thank you for registering with Health Bridge. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{verificationUrl}}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn''t create an account with Health Bridge, please ignore this email.</p>
            <p>Best regards,<br>The Health Bridge Team</p>
        </div>
    </div>
</body>
</html>',
    '[
        {"name": "name", "description": "User full name", "required": true, "example": "John Smith"},
        {"name": "verificationUrl", "description": "Email verification link", "required": true, "example": "https://healthbridge.com/verify/abc123"}
    ]'::jsonb,
    'en'
);

-- Appointment Confirmation Template
INSERT INTO notification_templates (
    type, 
    name, 
    description,
    email_subject_template,
    email_body_template,
    sms_template,
    variables,
    language
) VALUES (
    'appointment_confirmed',
    'Appointment Confirmation',
    'Template sent when doctor confirms an appointment',
    'Appointment Confirmed with {{doctorName}} - Health Bridge',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Confirmed!</h1>
        </div>
        <div class="content">
            <p>Hi {{patientName}},</p>
            <p>Your appointment with <strong>{{doctorName}}</strong> has been confirmed.</p>
            <div class="details">
                <h3>Appointment Details</h3>
                <div class="detail-row">
                    <span><strong>Doctor:</strong></span>
                    <span>{{doctorName}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Specialty:</strong></span>
                    <span>{{doctorSpecialty}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Date:</strong></span>
                    <span>{{appointmentDate}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Time:</strong></span>
                    <span>{{appointmentTime}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Location:</strong></span>
                    <span>{{clinicAddress}}</span>
                </div>
            </div>
            <p><strong>Important:</strong> Please arrive 10 minutes before your appointment time.</p>
            <p>Best regards,<br>The Health Bridge Team</p>
        </div>
    </div>
</body>
</html>',
    'Your appointment with {{doctorName}} is confirmed for {{appointmentDate}} at {{appointmentTime}}. Location: {{clinicAddress}}',
    '[
        {"name": "patientName", "description": "Patient full name", "required": true, "example": "John Smith"},
        {"name": "doctorName", "description": "Doctor full name", "required": true, "example": "Dr. Jane Doe"},
        {"name": "doctorSpecialty", "description": "Doctor specialty", "required": true, "example": "Cardiologist"},
        {"name": "appointmentDate", "description": "Appointment date", "required": true, "example": "February 20, 2025"},
        {"name": "appointmentTime", "description": "Appointment time", "required": true, "example": "10:00 AM"},
        {"name": "clinicAddress", "description": "Clinic address", "required": true, "example": "123 Medical Center, Lagos"}
    ]'::jsonb,
    'en'
);

-- Prescription Ready Template
INSERT INTO notification_templates (
    type, 
    name, 
    description,
    email_subject_template,
    email_body_template,
    sms_template,
    variables,
    language
) VALUES (
    'prescription_ready',
    'Prescription Ready',
    'Template sent when doctor creates a prescription',
    'Your Prescription is Ready - Health Bridge',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .medications { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Prescription is Ready</h1>
        </div>
        <div class="content">
            <p>Hi {{patientName}},</p>
            <p><strong>{{doctorName}}</strong> has created a prescription for you.</p>
            <div class="medications">
                <h3>Diagnosis:</h3>
                <p>{{diagnosis}}</p>
                <h3>Prescribed Medications:</h3>
                <p>{{medications}}</p>
            </div>
            <a href="{{prescriptionUrl}}" class="button">View Prescription</a>
            <p>You can download and print your prescription from the link above.</p>
            <p>Best regards,<br>The Health Bridge Team</p>
        </div>
    </div>
</body>
</html>',
    'Your prescription from {{doctorName}} is ready. View it here: {{prescriptionUrl}}',
    '[
        {"name": "patientName", "description": "Patient full name", "required": true, "example": "John Smith"},
        {"name": "doctorName", "description": "Doctor full name", "required": true, "example": "Dr. Jane Doe"},
        {"name": "diagnosis", "description": "Diagnosis", "required": true, "example": "Upper Respiratory Tract Infection"},
        {"name": "medications", "description": "List of medications", "required": true, "example": "Amoxicillin 500mg - 3x daily for 7 days"},
        {"name": "prescriptionUrl", "description": "Link to prescription", "required": true, "example": "https://healthbridge.com/prescriptions/123"}
    ]'::jsonb,
    'en'
);

-- Pharmacy Matched Template
INSERT INTO notification_templates (
    type, 
    name, 
    description,
    email_subject_template,
    email_body_template,
    sms_template,
    variables,
    language
) VALUES (
    'pharmacy_matched',
    'Pharmacy Matched',
    'Template sent when pharmacies with prescribed medicines are found',
    'Your Medicines are Available Nearby - Health Bridge',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .pharmacy { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #fa709a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Medicines are Available!</h1>
        </div>
        <div class="content">
            <p>Hi {{patientName}},</p>
            <p>Good news! We found pharmacies near you that have your prescribed medicines in stock.</p>
            {{#each pharmacies}}
            <div class="pharmacy">
                <h3>{{name}}</h3>
                <p>{{address}}</p>
                <p>{{distance}} km away</p>
                <p>Total Cost: ₦{{totalCost}}</p>
            </div>
            {{/each}}
            <p>Visit any of these pharmacies with your prescription to get your medicines.</p>
            <p>Best regards,<br>The Health Bridge Team</p>
        </div>
    </div>
</body>
</html>',
    'Your prescribed medicines are available at {{pharmacyCount}} pharmacies near you. Closest: {{closestPharmacy}} ({{distance}} km away)',
    '[
        {"name": "patientName", "description": "Patient full name", "required": true, "example": "John Smith"},
        {"name": "pharmacies", "description": "Array of pharmacy objects", "required": true, "example": "[{name, address, distance, totalCost}]"},
        {"name": "pharmacyCount", "description": "Number of pharmacies", "required": false, "example": "3"},
        {"name": "closestPharmacy", "description": "Name of closest pharmacy", "required": false, "example": "HealthPlus Pharmacy"},
        {"name": "distance", "description": "Distance to closest pharmacy", "required": false, "example": "2.5"}
    ]'::jsonb,
    'en'
);

-- Payment Success Template
INSERT INTO notification_templates (
    type, 
    name, 
    description,
    email_subject_template,
    email_body_template,
    sms_template,
    variables,
    language
) VALUES (
    'payment_success',
    'Payment Success',
    'Template sent when payment is successful',
    'Payment Successful - Health Bridge',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Successful</h1>
        </div>
        <div class="content">
            <p>Hi {{patientName}},</p>
            <p>Your payment has been successfully processed.</p>
            <div class="receipt">
                <h3>Payment Details</h3>
                <p><strong>Amount:</strong> ₦{{amount}}</p>
                <p><strong>Transaction Reference:</strong> {{reference}}</p>
                <p><strong>Date:</strong> {{paymentDate}}</p>
            </div>
            <p>Your appointment booking is now confirmed.</p>
            <p>Best regards,<br>The Health Bridge Team</p>
        </div>
    </div>
</body>
</html>',
    'Payment of ₦{{amount}} successful. Reference: {{reference}}',
    '[
        {"name": "patientName", "description": "Patient full name", "required": true, "example": "John Smith"},
        {"name": "amount", "description": "Payment amount", "required": true, "example": "8500"},
        {"name": "reference", "description": "Transaction reference", "required": true, "example": "TXN123456"},
        {"name": "paymentDate", "description": "Payment date", "required": true, "example": "February 12, 2025"}
    ]'::jsonb,
    'en'
);