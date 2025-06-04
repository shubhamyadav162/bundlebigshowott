
English:

Payment Creation & Subscription Flow (Detailed Overview)

1. Firestore Data Model and User Record  
- When a new user signs up or logs in for the first time, create a Firestore document under the “users” collection keyed by their UID.  
- Initialize two fields:  
  • isSubscribed: false (indicates whether the user currently has an active subscription)  
  • subscriptionEnd: null (will later hold the timestamp when their paid access expires)  
- This document becomes the single source of truth for that user’s subscription status and expiry date.

2. Railway Backend Subscription API  
- On your Railway‐hosted server, introduce a set of REST endpoints under a common “/subscriptions” path:  
  • GET /subscriptions/plans  
    – Returns a list of all available subscription plans (monthly, quarterly, yearly) along with their IDs, durations, and prices.  
  • GET /subscriptions/current  
    – Secured by verifying the user’s Firebase ID token.  
    – Reads the user’s Firestore document and returns the current values of isSubscribed and subscriptionEnd.  
  • POST /subscriptions/subscribe  
    – Also secured by ID token verification.  
    – Accepts the selected plan ID.  
    – Calculates a new expiration date based on the plan’s duration (e.g. now + 30 days).  
    – Updates the user’s Firestore record: sets isSubscribed to true and subscriptionEnd to that future date.  
    – Returns success with the new expiry date.  
  • (Optionally) Integrate with your payment gateway: instead of immediately granting access, you could create a hosted checkout session and return its URL. Your existing webhook endpoint will then perform the Firestore update once payment succeeds.

3. Payment Webhook (Existing)  
- You already have a `/paymentWebhook` route that verifies gateway signatures and updates the same Firestore fields on successful payment.  
- Keep this live to handle asynchronous gateway events (refunds, retries, etc.) and to ensure Firestore is always in sync with real payment confirmations.

4. Client-Side Integration in the Expo App  
a) API Client Configuration  
   - Point your API client’s base URL to your Railway app domain.  
   - Replace the stored “userToken” header with a real Firebase ID token obtained from the authenticated user object.  

b) Subscription State Management  
   - Create a subscription context or extend your auth context to hold `isSubscribed` and `subscriptionEnd`.  
   - On app start or user login:  
     • Fetch the current subscription via GET /subscriptions/current.  
     • Optionally subscribe to real-time updates on the user’s Firestore document so you get live changes.  

c) Paywall Component  
   - Build a reusable overlay or component that  
     • Informs the user that the series is locked behind a paywall  
     • Offers a button to view subscription plans  

d) Gating Premium Content  
   - In all screens that show web series or premium videos (Video Player, Episode List, Content Details):  
     • At the top, check if `isSubscribed` is true AND if the current date is before `subscriptionEnd`.  
     • If not, render the paywall component instead of the video or details.  

e) Subscription User Interface  
   - Enhance your existing subscription screens to:  
     • Load available plans from GET /subscriptions/plans  
     • Let the user select a plan and confirm  
     • Call POST /subscriptions/subscribe with the chosen plan ID  
     • After success, update the local subscription context to unlock content  

5. Automatic Expiry Handling  
- Every time the app reads or listens to the user’s subscription data, compare the stored expiry timestamp with the current system time.  
- If the expiry date has passed, treat the user as unsubscribed: set `isSubscribed` to false in local state (you may also clear or update it in Firestore via a scheduled job or on-the-fly).  
- The next time they open any premium screen, the paywall will re-appear, prompting them to renew.

6. Cleanup and Deployment  
- Since your Railway server handles both subscription endpoints and webhooks, you can remove the unused Firebase Cloud Functions folder and related configuration.  
- Update your `firebase.json` to remove the functions block so that `firebase deploy` only targets hosting and Firestore rules.  
- Ensure your Firestore security rules only allow the server (via Admin SDK) to write subscription fields, and allow the client to read their own subscription document.

By following this detailed flow—defining a clear Firestore schema, exposing secure subscription APIs on Railway, integrating real-time subscription state in your Expo app, gating content via a paywall component, and handling expiration automatically—you create a robust, end-to-end paid-access system that an AI or developer can use to generate all the necessary code and configuration.

---

हिन्दी:

भुगतान निर्माण और सदस्यता प्रवाह (विस्तृत विवरण)

1. Firestore डेटा मॉडल और उपयोगकर्ता रिकॉर्ड  
- जब नया उपयोगकर्ता साइन-अप करता है या पहली बार लॉगिन करता है, तो उसके UID पर आधारित “users” संग्रह में एक दस्तावेज़ बनाएं।  
- इसमें दो फ़ील्ड सेट करें:  
  • isSubscribed: false (बताता है कि क्या उसकी सक्रिय सदस्यता है)  
  • subscriptionEnd: null (बाद में समाप्ति तारीख संग्रहीत होगी)  
- यह दस्तावेज़ उस उपयोगकर्ता की सदस्यता स्थिति का एकमात्र सत्य स्रोत बन जाएगा।

2. Railway पर बैकएंड सदस्यता API  
- अपने Railway सर्वर पर “/subscriptions” पथ के तहत REST endpoints बनाएँ:  
  • GET /subscriptions/plans  
    – सभी उपलब्ध योजनाओं (मासिक, त्रैमासिक, वार्षिक) की सूची लौटाता है।  
  • GET /subscriptions/current  
    – उपयोगकर्ता के Firebase ID टोकन की जाँच के बाद, Firestore से isSubscribed और subscriptionEnd पढ़कर लौटाता है।  
  • POST /subscriptions/subscribe  
    – टोकन सत्यापन के बाद ग्राह‍क द्वारा चुनी गई योजना की अवधि (जैसे 30 दिन) जोड़कर समाप्ति तारीख बनाएँ।  
    – Firestore दस्तावेज़ को अपडेट करें: isSubscribed=true, subscriptionEnd=नवीनीकृत तारीख।  
  • (वैकल्पिक) पेमेंट गेटवे चेकआउट सत्र बनाएँ और उसका URL क्लाइंट को लौटाएँ; सफल भुगतान पर आपका मौजूदा webhook Firestore अपडेट कर देगा।

3. भुगतान वेबहुक (मौजूदा)  
- आपका `/paymentWebhook` मार्ग पहले से सिग्नेचर सत्यापन और Firestore अपडेट करता है।  
- इसे बनाए रखें ताकि वास्तविक भुगतान पुष्टियों के साथ Firestore सिंक में रहे।

4. क्लाइंट-साइड इंटीग्रेशन (Expo ऐप)  
a) API क्लाइंट कनफ़िगरेशन  
   - बेस URL को आपके Railway डोमेन पर सेट करें।  
   - अनुरोधों में Firebase ID टोकन भेजें, न कि कोई स्थानीय “userToken”।

b) सदस्यता स्थिति प्रबंधन  
   - एक SubscriptionContext बनाएँ जिसमें isSubscribed और subscriptionEnd हो।  
   - ऐप स्टार्ट या लॉगिन पर GET /subscriptions/current को कॉल करें;  
   - रियल-टाइम अपडेट के लिए Firestore सब्सक्रिप्शन से onSnapshot का उपयोग करें।

c) Paywall कॉम्पोनेंट  
   - एक पुन:उपयोगी ओवरले बनाएँ जो  
     • बताये कि यह कंटेंट भुगतान के पीछे बंद है  
     • “योजनाएँ देखें” का बटन दे

d) प्रीमियम कंटेंट गेटिंग  
   - Video Player, Episode List, Content Details स्क्रीन में:  
     • चेक करें कि isSubscribed true हो और वर्तमान समय subscriptionEnd से पहले हो।  
     • नहीं तो paywall दिखाएँ।

e) सदस्यता UI  
   - अपनी मौजूदा स्क्रीन में योजनाएँ लोड करें, उपयोगकर्ता को चुनने दें,  
   - चुनी गई योजना के साथ POST /subscriptions/subscribe कॉल करें।  
   - सफल होने पर SubscriptionContext को अपडेट करें।

5. समाप्ति का स्वत: हैंडलिंग  
- हर बार जब ऐप subscriptionEnd पढ़े या सुनें, मौजूदा समय से तुलना करें।  
- अगर समाप्ति समय बीत चुका है, तो उपयोगकर्ता को unsubscribed मानें; paywall फिर से दिखाएँ।

6. सफ़ाई और डिप्लॉयमेंट  
- चूँकि Railway सर्वर ही सब कुछ हैंडल करता है, Firebase Cloud Functions को हटा दें।  
- `firebase.json` से functions ब्लॉक हटा दें ताकि `firebase deploy` से केवल होस्टिंग और Firestore नियम डिप्लॉय हों।  
- Firestore सुरक्षा नियम यह सुनिश्चित करें कि केवल आपका सर्वर (Admin SDK) ही सदस्यता फ़ील्ड लिख सके और क्लाइंट अपने दस्तावेज़ को पढ़ सके।

इस तरह, एक स्पष्ट Firestore स्कीमा, Railway API, रियल-टाइम क्लाइंट इंटीग्रेशन, paywall गेटिंग, और स्वत: समाप्ति प्रबंधन के साथ आपका भुगतान आधारित एक्सेस सिस्टम पूरी तरह से तैयार होगा।
