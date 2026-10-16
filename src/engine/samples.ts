export interface Sample {
  id: string
  label: string
  text: string
}

export const SAMPLES: Sample[] = [
  {
    id: 'digital_arrest',
    label: 'Digital arrest call',
    text:
      'This is Inspector Rajesh from Mumbai Police Cyber Crime Branch. A parcel in your name containing MDMA drugs and fake passports was seized by customs. An FIR has been registered and an arrest warrant is issued under money laundering. You are under digital arrest. Stay on the video call and do not tell anyone, not even your family. To prove your innocence, transfer your savings to the RBI verification account immediately. The amount will be refunded after verification.',
  },
  {
    id: 'kyc',
    label: 'KYC expiry SMS',
    text:
      'Dear Customer, your SBI YONO account will be blocked today as your PAN card KYC is not updated. Update immediately: http://sbi-kyc-update.xyz/login or call +855 12 345 678. Share the OTP received to complete verification.',
  },
  {
    id: 'hindi',
    label: 'Hindi (डिजिटल अरेस्ट)',
    text:
      'मैं सीबीआई से बोल रहा हूँ। आपके आधार से मनी लॉन्ड्रिंग हुई है और आपके नाम पर गिरफ्तार करने का वारंट जारी हुआ है। वीडियो कॉल पर रहें और किसी को मत बताना। तुरंत पैसे ट्रांसफर करें वरना कानूनी कार्रवाई होगी।',
  },
  {
    id: 'job',
    label: 'Part-time job',
    text:
      'Hi! We are hiring for a part-time job. Work from home, just like YouTube videos and earn Rs 3000 per day. Join our Telegram task group: https://bit.ly/3xYzTask. Small registration fee of Rs 499 to activate your account.',
  },
  {
    id: 'electricity',
    label: 'Electricity bill',
    text:
      'Dear consumer, your electricity power will be disconnected tonight at 9:30 pm because your previous month bill was not updated. Please immediately contact our electricity officer 98XXXXXX21. Thank you.',
  },
  {
    id: 'safe',
    label: 'Genuine bank OTP',
    text:
      '482913 is your OTP for transaction of INR 1,250.00 at AMAZON on your HDFC Bank card ending 4321. Valid for 10 mins. Do not share this OTP with anyone. - HDFC Bank',
  },
]
