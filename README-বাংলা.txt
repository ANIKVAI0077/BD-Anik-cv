ANIK.CV.COM — চূড়ান্ত লগইনবিহীন সংস্করণ

এই প্যাকেজে আছে:
1. index.html
2. style.css
3. script.js
4. developer-photo.jpg (ওয়েবসাইটের ডেভেলপার ছবির জন্য)

ব্যবহার:
- চারটি ফাইল একই ফোল্ডারে রাখুন।
- GitHub Pages repository-তে আগের index.html, style.css ও script.js-এর জায়গায় এই তিনটি ফাইল আপলোড/Replace করুন।
- firebase-config.js, auth.js বা Firebase SDK এই সংস্করণে দরকার নেই।
- GitHub Pages-এ পরিবর্তন প্রকাশের পর সাইটে hard refresh করুন (মোবাইলে cache clear করে পুনরায় খুলুন)।

যা আছে:
- বাংলা CV ফর্ম, লাইভ প্রিভিউ ও তিনটি টেমপ্লেট
- শিক্ষাগত যোগ্যতা যোগ/মুছুন
- ঐচ্ছিক অংশ চালু/বন্ধ
- পাসপোর্ট ছবি আপলোড; ছবি না থাকলে শুধু “ছবি” placeholder, ছবি থাকলে placeholder লুকানো
- CV সংরক্ষণ, ইতিহাস, খুলুন, প্রিন্ট
- ব্রাউজারে draft auto-save

তথ্য সংরক্ষণের সীমাবদ্ধতা:
ডেভেলপার ছবি শুধু ওয়েবসাইটের ফুটারে দেখাবে, CV-এর ভেতরে নয়।

এই সংস্করণে তথ্য localStorage-এ থাকে। একই ব্রাউজার ও ডিভাইসে রিফ্রেশ করলে থাকবে। Browser data/cache/site data মুছে ফেললে, private/incognito mode ব্যবহার করলে বা অন্য ডিভাইসে গেলে তথ্য নাও থাকতে পারে। এটি Firebase cloud account storage নয়।

PDF:
“PDF/প্রিন্ট” বোতাম ব্রাউজারের Print dialog খুলবে। সেখানে “Save as PDF” নির্বাচন করুন। কনটেন্ট এক A4 পৃষ্ঠায় না ধরলে একাধিক পৃষ্ঠা হতে পারে; কোনো লেখা কেটে ফেলার চেয়ে পূর্ণ CV রাখা অগ্রাধিকার পাবে।

ডেভেলপার ক্রেডিট:
MD ANIK MIA, আপলোড করা ডেভেলপার ছবি এবং দেওয়া Facebook link।
