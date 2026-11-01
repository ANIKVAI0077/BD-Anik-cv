ANIK.CV.COM — Firebase সংযুক্ত সংস্করণ

ফাইলসমূহ:
- index.html, style.css, script.js
- firebase-config.js (তোমার Firebase Web config)
- firestore.rules (ব্যবহারকারীভিত্তিক নিরাপত্তা নিয়ম)

সেটআপ:
১) Firebase Console > Authentication > Sign-in method > Email/Password Enable থাকতে হবে।
২) Firestore Database > Rules-এ firestore.rules ফাইলের সম্পূর্ণ নিয়ম কপি করে Publish করতে হবে।
৩) GitHub Pages-এ সব ফাইল একই ফোল্ডারের রুটে আপলোড করতে হবে।
৪) Firebase Console > Authentication > Settings > Authorized domains-এ তোমার GitHub Pages hostname যুক্ত করতে হবে (যেমন username.github.io)।
৫) HTTPS দিয়ে ওয়েবসাইট খুলতে হবে।

অ্যাকাউন্ট:
- ওয়েবসাইট খুলে নতুন অ্যাকাউন্ট তৈরি করো (নাম, ই-মেইল, পাসওয়ার্ড)।
- প্রত্যেক ব্যবহারকারীর CV users/{uid}/cvs-এ এবং অসমাপ্ত খসড়া users/{uid}/drafts/current-এ থাকে।
- Firestore rules UID অনুযায়ী অন্য ব্যবহারকারীর ডেটা পড়া/লেখা বন্ধ রাখে।
- ছবি ছোট JPEG-এ সংকুচিত করে CV-র সঙ্গে Firestore-এ রাখা হয়।

নোট: Firebase Web API key browser config-এ থাকা স্বাভাবিক। নিরাপত্তা নির্ভর করে Authentication, Firestore Rules এবং Firebase project restrictions-এর ওপর; Service Account private key কখনো ওয়েবসাইটে দেবে না।
