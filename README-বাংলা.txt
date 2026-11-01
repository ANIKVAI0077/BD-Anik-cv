ANIK.CV.COM — সেটআপ নির্দেশিকা

ফাইলগুলো একই ফোল্ডারে রাখুন:
index.html, style.css, script.js, auth.js, firebase-config.js, developer.png

গুরুত্বপূর্ণ: নিরাপদ লগইন/অ্যাকাউন্ট এবং ব্যবহারকারীভিত্তিক অনলাইন CV সংরক্ষণের জন্য Firebase লাগবে। শুধু GitHub Pages/HTML দিয়ে নিরাপদ ব্যক্তিগত অ্যাকাউন্ট সম্ভব নয়।

১) https://console.firebase.google.com/ এ গিয়ে নতুন Firebase project তৈরি করুন।
২) Authentication > Sign-in method থেকে Email/Password চালু করুন।
৩) Firestore Database তৈরি করুন।
৪) Project settings > General > Your apps > Web app তৈরি করে Firebase config কপি করুন।
৫) firebase-config.js ফাইলে placeholder-এর জায়গায় নিজের config বসান।
৬) Firestore Rules-এ firestore.rules ফাইলের নিয়মগুলো Publish করুন।
৭) ছয়টি ফাইল GitHub repository-র root-এ আপলোড করুন।

Firebase Firestore Rules ব্যবহারকারীর UID অনুযায়ী প্রতিটি CV আলাদা রাখে। কাউকে Firebase Console-এর Admin access দেবেন না।

ওয়েবসাইটের প্রদর্শিত নাম anik.cv.com রাখা হয়েছে। বাস্তবে anik.cv.com ঠিকানাটি ব্যবহার করতে হলে cv.com ডোমেইনের মালিকানা/অনুমতি থাকতে হবে, কারণ এটি cv.com-এর একটি subdomain। নিজের ডোমেইন (যেমন anikcv.com) কিনলে GitHub Pages Settings > Custom domain-এ সেটি যুক্ত করে DNS রেকর্ড দিতে হবে।

ছবি আপলোড হলে CV-এর ছবির বক্সের “ছবি” লেখা CSS দিয়ে লুকানো হয়; ছবি না থাকলে লেখা দেখা যায়।
