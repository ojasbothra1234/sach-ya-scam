import type { Category, Rule } from './types'

export const CATEGORY_INFO: Record<Category, { label: string; labelHi: string; advice: string }> = {
  digital_arrest: {
    label: 'Digital arrest / authority impersonation',
    labelHi: 'डिजिटल अरेस्ट / फ़र्ज़ी अधिकारी',
    advice:
      'There is no such thing as a "digital arrest". Police, CBI, ED, customs or courts never question people over video call or ask for money to "verify" accounts. Disconnect immediately.',
  },
  kyc_otp: {
    label: 'KYC / OTP / bank fraud',
    labelHi: 'केवाईसी / ओटीपी धोखाधड़ी',
    advice:
      'Banks never ask for OTP, PIN, CVV or remote-access apps. Never enter your UPI PIN to "receive" money. Update KYC only at your branch or the official app.',
  },
  parcel_customs: {
    label: 'Fake parcel / courier / customs',
    labelHi: 'फ़र्ज़ी पार्सल / कूरियर',
    advice:
      'Courier companies do not call about drugs in your parcel or demand customs fees via UPI. Track parcels only on the official website using your own tracking number.',
  },
  job_task: {
    label: 'Fake job / task scam',
    labelHi: 'फ़र्ज़ी नौकरी / टास्क स्कैम',
    advice:
      'Genuine jobs never ask you to pay to start, or to "like videos" or "rate hotels" for money. Small early payouts are bait for a larger deposit.',
  },
  investment: {
    label: 'Investment / trading scam',
    labelHi: 'निवेश / ट्रेडिंग स्कैम',
    advice:
      'Guaranteed or very high returns are a red flag. Invest only through SEBI-registered brokers and verify on sebi.gov.in.',
  },
  lottery_prize: {
    label: 'Lottery / prize / reward scam',
    labelHi: 'लॉटरी / इनाम स्कैम',
    advice:
      'You cannot win a lottery you never entered. Any prize that needs a "processing fee" or tax upfront is a scam.',
  },
  loan_app: {
    label: 'Instant loan app scam',
    labelHi: 'इंस्टेंट लोन ऐप स्कैम',
    advice:
      'Use only RBI-registered lenders. Unregulated loan apps harvest contacts and photos to harass and blackmail borrowers.',
  },
  sextortion: {
    label: 'Sextortion / blackmail',
    labelHi: 'सेक्सटॉर्शन / ब्लैकमेल',
    advice:
      'Do not pay — paying leads to more demands. Preserve evidence, block the sender and report on cybercrime.gov.in (there is a dedicated women/child category).',
  },
  utility: {
    label: 'Electricity / utility bill scam',
    labelHi: 'बिजली बिल स्कैम',
    advice:
      'Electricity boards do not send SMS from personal numbers threatening disconnection tonight. Pay bills only via the official portal or app.',
  },
  phishing_link: {
    label: 'Phishing link',
    labelHi: 'फ़िशिंग लिंक',
    advice:
      'Do not open the link. Type the official website address yourself instead of tapping links in messages.',
  },
  generic: {
    label: 'General scam tactics',
    labelHi: 'सामान्य स्कैम तरीके',
    advice: 'Pause. Scammers rely on fear and urgency. Verify independently through official contact details before acting.',
  },
}

export const RULES: Rule[] = [
  // Digital arrest / authority impersonation
  {
    id: 'authority_impersonation',
    category: 'digital_arrest',
    label: 'Claims to be police / CBI / court / regulator',
    labelHi: 'पुलिस / सीबीआई / अदालत होने का दावा',
    description: 'Scammers impersonate law-enforcement or government officials to create fear.',
    weight: 10,
    patterns: [
      /\b(cbi|ncb|narcotics (control )?bureau|enforcement directorate|customs (officer|department)|cyber ?(cell|crime (branch|department))|crime branch|(mumbai|delhi|bangalore|bengaluru|hyderabad|kolkata|chennai) police|trai|rbi officer|income ?tax (officer|department)|supreme court|high court|chief justice|cji|interpol|ips officer)\b/i,
      /\bE\.?D\.?\b/,
      /(पुलिस|सीबीआई|न्यायालय|अदालत|कस्टम|साइबर सेल|क्राइम ब्रांच)/,
    ],
  },
  {
    id: 'arrest_threat',
    category: 'digital_arrest',
    label: 'Threatens arrest / legal case',
    labelHi: 'गिरफ्तारी की धमकी',
    description: 'Threats of arrest, warrants or money-laundering cases are the core of "digital arrest" scams.',
    weight: 35,
    patterns: [
      /\b(digital(ly)? arrest(ed)?|arrest warrant|warrant (has been |is )?issued|(you|u) (will|shall) be arrested|under (digital )?arrest|money[- ]laundering|fir (has been |is )?(registered|filed|lodged)|non[- ]bailable|giraftar|giraftari|human trafficking case|drug trafficking case)\b/i,
      /(गिरफ्तार|डिजिटल अरेस्ट|वारंट|मनी लॉन्ड्रिंग|एफआईआर)/,
    ],
  },
  {
    id: 'video_custody',
    category: 'digital_arrest',
    label: 'Keeps victim on video call / "virtual court"',
    labelHi: 'वीडियो कॉल पर बने रहने का दबाव',
    description: 'Victims are kept on Skype/WhatsApp video calls for hours and shown fake courtrooms.',
    weight: 25,
    patterns: [
      /\b(stay on (the )?(video )?call|do not (disconnect|cut) (the )?call|don'?t (disconnect|cut) (the )?call|skype (call|id)|virtual (court(room)?|hearing)|online (court|hearing)|keep (your )?camera on|video (call )?(interrogation|statement|verification))\b/i,
      /(वीडियो कॉल पर रहें|कॉल मत काटना|कैमरा चालू)/,
    ],
  },
  {
    id: 'secrecy',
    category: 'digital_arrest',
    label: 'Demands secrecy',
    labelHi: 'किसी को न बताने का दबाव',
    description: 'Isolating the victim from family or bank staff stops them from realising it is a scam.',
    weight: 20,
    ignoreNegation: true,
    patterns: [
      /\b(do not|don'?t) (tell|inform|share (this )?with|discuss (this )?with) (anyone|anybody|your family|family|bank (staff|officials?))\b/i,
      /\b(keep (this|it) (strictly )?(confidential|secret)|national secrets? act|official secrets? act|kisi ko (mat|na) (batana|batao|bataye))\b/i,
      /(किसी को (मत|न) बता|गोपनीय रखें)/,
    ],
  },
  {
    id: 'verification_account',
    category: 'digital_arrest',
    label: 'Asks to move money to a "safe / verification" account',
    labelHi: '"सुरक्षित / वेरिफिकेशन" खाते में पैसे भेजने को कहना',
    description: 'No agency ever asks you to transfer funds for "verification". This is how victims lose savings.',
    weight: 30,
    patterns: [
      /\b(safe|secure|verification|rbi|government|escrow|supervised|refundable|secret supervision) (bank )?account\b/i,
      /\b(will be refunded after (verification|investigation)|for verification purposes?|fund(s)? verification|rbi verification)\b/i,
    ],
  },

  // Parcel / customs
  {
    id: 'parcel_contraband',
    category: 'parcel_customs',
    label: 'Parcel with drugs / illegal items',
    labelHi: 'पार्सल में ड्रग्स / अवैध सामान',
    description: 'Fake courier calls claim your parcel contained drugs or fake passports, then hand you to "police".',
    weight: 30,
    patterns: [
      /\b(parcel|courier|package|consignment|fedex|dhl|blue ?dart)\b.{0,80}\b(drugs?|mdma|narcotics?|illegal|contraband|fake passports?|seized)\b/is,
    ],
  },
  {
    id: 'parcel_fee',
    category: 'parcel_customs',
    label: 'Parcel held / customs fee / address update',
    labelHi: 'पार्सल रुका / कस्टम शुल्क',
    description: 'India Post and couriers do not ask for address updates or fees through random links.',
    weight: 20,
    patterns: [
      /\b(customs (duty|clearance|charges?|fee)|parcel (is |has been )?(on hold|held|stuck|seized|returned)|(could|can) ?not be delivered|update (your )?(delivery )?address|incomplete address)\b/i,
    ],
  },

  // KYC / OTP / bank
  {
    id: 'kyc_expiry',
    category: 'kyc_otp',
    label: 'KYC / PAN / Aadhaar "expiring"',
    labelHi: 'केवाईसी / पैन अपडेट का दबाव',
    description: 'KYC-expiry messages push you to a phishing link or a fake "bank officer".',
    weight: 25,
    patterns: [
      /\b(kyc|pan( card)?|aadhaa?r)\b.{0,60}\b(expire[ds]?|expiring|update|pending|suspend(ed)?|block(ed)?|deactivat(ed|e)|not (linked|updated))\b/is,
      /(केवाईसी|पैन|आधार).{0,40}(अपडेट|बंद|ब्लॉक|समाप्त)/,
    ],
  },
  {
    id: 'account_block',
    category: 'kyc_otp',
    label: 'Threat to block account / card / SIM',
    labelHi: 'खाता / सिम बंद करने की धमकी',
    description: 'Threats to block your account or SIM are used to rush you into acting without thinking.',
    weight: 20,
    patterns: [
      /\b(account|a\/c|card|sim|mobile number|number|wallet|connection)\b.{0,40}\b(blocked|suspended|deactivated|closed|frozen|disconnected|band ho)/is,
      /\b(band ho (jayega|jaega|jayegi|jaegi))\b/i,
      /(खाता|अकाउंट|सिम|नंबर).{0,30}(बंद|ब्लॉक)/,
    ],
  },
  {
    id: 'otp_request',
    category: 'kyc_otp',
    label: 'Asks for OTP / PIN / CVV / password',
    labelHi: 'ओटीपी / पिन / सीवीवी मांगना',
    description: 'Anyone asking for your OTP, PIN or CVV is trying to take money from your account.',
    weight: 35,
    patterns: [
      /\b(share|send|tell|forward|provide|give|read out|bata(o|do|iye)|bhej(o|do|iye))\b.{0,40}\b(otp|one[- ]time password|upi pin|atm pin|pin|cvv|password|verification code)\b/is,
      /\b(otp|cvv|upi pin)\b.{0,30}\b(share|send|bhejo|batao|bata do|bataiye)\b/is,
      /\benter (your )?upi pin to (receive|get|claim)\b/i,
      /(ओटीपी|पिन|सीवीवी).{0,20}(बताएं|भेजें|बताओ|भेजो|बताइए)/,
    ],
  },
  {
    id: 'remote_access',
    category: 'kyc_otp',
    label: 'Asks to install remote-access app / APK',
    labelHi: 'रिमोट ऐप / एपीके इंस्टॉल कराना',
    description: 'Screen-sharing apps and unknown APKs let scammers read OTPs and control your phone.',
    weight: 35,
    patterns: [
      /\b(anydesk|any desk|teamviewer|quick ?support|rustdesk|airdroid|screen ?shar(e|ing))\b/i,
      /\.apk\b/i,
      /\b(download|install) (this|the|our) (app|application|file)\b/i,
    ],
  },
  {
    id: 'upi_collect',
    category: 'kyc_otp',
    label: 'QR / collect-request trick',
    labelHi: 'क्यूआर / कलेक्ट रिक्वेस्ट धोखा',
    description: 'Scanning a QR code or approving a collect request sends money — it never receives it.',
    weight: 20,
    patterns: [/\b(scan (this|the) (qr|code)|approve (the )?(collect |payment )?request|accept (the )?collect request)\b/i],
  },

  // Payment demands and pressure
  {
    id: 'payment_demand',
    category: 'generic',
    label: 'Demands money transfer',
    labelHi: 'पैसे भेजने की मांग',
    description: 'Unsolicited demands to transfer money are the end goal of almost every scam.',
    weight: 20,
    patterns: [
      /\b(transfer|pay|deposit|send|remit)\b.{0,50}(rs\.?\s?\d|inr\s?\d|₹\s?\d|\d[\d,]{3,}|rupees|lakh|crore|amount|money|funds|savings)/is,
      /\b(paise|paisa|rupaye|rupees)\b.{0,20}\b(bhejo|bhejiye|bhej do|transfer|jama karo|jama karein)\b/i,
      /(पैसे|रुपये|राशि).{0,20}(भेजें|भेजो|ट्रांसफर|जमा)/,
    ],
  },
  {
    id: 'gift_card_crypto',
    category: 'generic',
    label: 'Gift cards / crypto payment',
    labelHi: 'गिफ्ट कार्ड / क्रिप्टो भुगतान',
    description: 'Untraceable payment methods are a strong sign of fraud.',
    weight: 20,
    patterns: [/\b(gift ?cards?|google play (card|code|recharge)|amazon (pay )?gift card|usdt|bitcoin|btc|crypto ?(currency|wallet)?|binance)\b/i],
  },
  {
    id: 'urgency',
    category: 'generic',
    label: 'Creates urgency',
    labelHi: 'जल्दबाज़ी का दबाव',
    description: 'Artificial deadlines stop you from thinking or checking with someone.',
    weight: 10,
    patterns: [
      /\b(urgent(ly)?|immediately|within \d+ ?(hours?|hrs?|minutes?|mins?)|today itself|before midnight|tonight|last (chance|warning|notice|reminder)|final (notice|warning|reminder)|act now|right now|asap|turant|jaldi)\b/i,
      /(तुरंत|अंतिम चेतावनी|जल्दी करें|आज रात)/,
    ],
  },
  {
    id: 'penalty_threat',
    category: 'generic',
    label: 'Threatens penalty / legal action',
    labelHi: 'जुर्माना / कानूनी कार्रवाई की धमकी',
    description: 'Vague threats of penalties or legal action are a pressure tactic.',
    weight: 10,
    patterns: [/\b(legal action|penalty|fine of|court case|case (will be|has been) (filed|registered)|blacklist(ed)?|strict action)\b/i, /(कानूनी कार्रवाई|जुर्माना)/],
  },
  {
    id: 'personal_info',
    category: 'generic',
    label: 'Asks for personal / bank details',
    labelHi: 'निजी / बैंक जानकारी मांगना',
    description: 'Never share Aadhaar, PAN, card or account details with unknown callers.',
    weight: 15,
    patterns: [
      /\b(share|send|provide|confirm|verify|give)\b.{0,40}\b(aadhaa?r|pan( card| number)?|bank (details|account( number)?)|card (number|details)|debit card|credit card|date of birth|net ?banking)\b/is,
    ],
  },
  {
    id: 'foreign_number',
    category: 'generic',
    label: 'Foreign number often used by scam centres',
    labelHi: 'विदेशी नंबर',
    description: 'Many scam calls originate from numbers in Cambodia, Laos, Myanmar, Pakistan and similar regions.',
    weight: 15,
    patterns: [/\+\s?(92|855|856|95|84|63|234|880|977)[\s-]?\d{2,}/],
  },

  // Lottery / prize
  {
    id: 'prize',
    category: 'lottery_prize',
    label: 'You "won" a prize / lottery',
    labelHi: 'इनाम / लॉटरी जीतने का दावा',
    description: 'Unexpected prizes are bait for a fee or your bank details.',
    weight: 25,
    patterns: [
      /\b(you (have )?won|you are (the )?(lucky )?winner|lucky draw|lottery|jackpot|kbc|kaun banega crorepati|prize money|claim your (prize|reward|gift)|reward points? (will )?expir\w*)\b/i,
      /(आपने .{0,30}जीत|लॉटरी|लकी ड्रॉ|इनाम राशि)/,
    ],
  },
  {
    id: 'processing_fee',
    category: 'lottery_prize',
    label: 'Asks for an upfront fee',
    labelHi: 'पहले शुल्क मांगना',
    description: 'Legitimate prizes, loans and jobs do not require upfront "processing" or "registration" fees.',
    weight: 20,
    patterns: [/\b(processing|registration|clearance|release|gst|tds|token|security|activation|insurance) (fee|charges?|deposit|amount)\b/i],
  },

  // Job / task
  {
    id: 'job_task',
    category: 'job_task',
    label: 'Easy money job / online tasks',
    labelHi: 'आसान कमाई वाली नौकरी / टास्क',
    description: 'Task scams pay small amounts first, then demand larger "prepaid tasks".',
    weight: 25,
    patterns: [
      /\b(work from home|part[- ]time (job|work|opportunity)|daily (income|earning|payout)|like (youtube )?videos?|subscribe (to )?(youtube )?channels?|rate (hotels?|products?|restaurants?)|google (map )?reviews?|task[- ]based|telegram (task|group|channel)|prepaid tasks?|merchant tasks?)\b/i,
      /\bearn (rs\.?|₹|inr)?\s?[\d,]+.{0,20}\b(per|a|every|\/) ?(day|daily|hour|task)\b/i,
    ],
  },

  // Investment
  {
    id: 'investment',
    category: 'investment',
    label: 'Guaranteed / unrealistic returns',
    labelHi: 'गारंटीड / अवास्तविक रिटर्न',
    description: 'Fake trading groups show fake profits on fake apps until you try to withdraw.',
    weight: 25,
    patterns: [
      /\b(guaranteed (returns?|profits?|income)|double your (money|investment)|\d+ ?% (daily|weekly|monthly|per day|per week) (returns?|profits?)|stock (market )?tips|ipo allotment|(vip|premium) (trading )?group|trading (group|app|platform)|risk[- ]free (returns?|investment|profit)|investment (plan|opportunity|scheme))\b/i,
    ],
  },

  // Loan app
  {
    id: 'instant_loan',
    category: 'loan_app',
    label: 'Instant / pre-approved loan offer',
    labelHi: 'तुरंत / प्री-अप्रूव्ड लोन',
    description: 'Unregulated loan apps charge hidden fees and blackmail borrowers.',
    weight: 15,
    patterns: [/\b(instant (personal )?loan|pre[- ]?approved (personal )?loan|loan (is )?approved|without (cibil|documents|credit check)|no cibil)\b/i],
  },

  // Sextortion
  {
    id: 'sextortion',
    category: 'sextortion',
    label: 'Threatens to leak private photos / videos',
    labelHi: 'निजी फ़ोटो / वीडियो लीक करने की धमकी',
    description: 'Blackmail with real or morphed intimate content.',
    weight: 35,
    patterns: [
      /\b(obscene|nude|private|intimate|morphed|objectionable) (video|photos?|pictures?|images?|clips?)\b/i,
      /\b(make (it )?viral|leak (your )?(video|photos?)|send (it|this) to (all )?your (contacts|family|friends))\b/i,
    ],
  },

  // Utility
  {
    id: 'electricity',
    category: 'utility',
    label: 'Electricity disconnection threat',
    labelHi: 'बिजली कटने की धमकी',
    description: 'Fake electricity-board messages ask you to call a personal number or install an app.',
    weight: 25,
    patterns: [
      /\b(electricity|power|bijli|light)\b.{0,60}\b(disconnect(ed|ion)?|cut|kat (jayegi|jaegi)|bill (is )?(pending|not updated|unpaid|overdue))\b/is,
      /(बिजली).{0,40}(कट|काट|बंद)/,
    ],
  },
]
