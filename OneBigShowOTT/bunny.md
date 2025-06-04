नीचे English और हिन्दी में बताया गया है कि आप अपना इंडिजिनस (भारतीय) पेमेंट गेटवे यूज़ करके Bunny.net स्ट्रीमिंग + पेवाल सेटअप कैसे कर सकते हैं—बिना Stripe के।

---

## 1. वीडियो होस्टिंग & ट्रांसकोडिंग  
EN  
- जैसा पहले बताया, Bunny Stream या Storage Zone+Stream में वीडियो अपलोड करें।  
- Bunny.net HLS/DASH में ट्रांसकोड कर देगा और play-URL देगा।  

HI (हिन्दी)  
- वीडियो Bunny Stream पर अपलोड करें।  
- Bunny अपने आप उसे मल्टी-बिटरेट HLS/DASH में तैयार कर देगा।  

---

## 2. इंडियन पेमेंट गेटवे सेटअप  
EN  
- आपके चुने हुए भारतीय पेमेंट गेटवे (उदा. Razorpay, PayU, CCAvenue, आदि) में अकाउंट बनाएं।  
- उसका मोबाइल/वेब SDK या REST API अपनाएं।  
- फ्रंटend पर यूज़र पेमेंट शुरू करेगा, पेमेंट गेटवे SDK/Webview में पे-फ़्लो चलेगा।  

HI (हिन्दी)  
- अपने इंडिजिनस पेमेंट गेटवे में Merchant ID, Key/Secret सेटअप करें।  
- ऐप/वेब में SDK या API इंटीग्रेट करें, ताकि यूज़र पेमेंट पेज पर जा सके।  

---

## 3. पेमेंट वेरिफ़िकेशन बैकएंड में  
EN  
1. पेमेंट पूरा होने पर पेमेंट गेटवे आपके बैकएंड को webhook/callback भेजेगा (या आप SDK से transactionId क्लाइंट से बैकएंड भेजें)।  
2. बैकएंड `verifyTransaction(transactionId)` API कॉल करके transaction की वैधता चेक करे (Signature, OrderID मिलान)।  
3. सफल वेरिफ़िकेशन पर यूज़र के लिए entitlement (access) रिकॉर्ड करें—जैसे `user_paid_for_series_X = true`।  

HI (हिन्दी)  
1. पेमेंट पूरा होते ही पेमेंट गेटवे webhook या callback भेजेगा।  
2. आपका सर्वर transactionId, signature, orderId वेरिफ़ाई करेगा।  
3. अगर पेमेंट क्लियर, तो DB में यूज़र को उस सीरीज के लिए एक्सेस दें।  

---

## 4. Secure Play URL जनरेट & रिटर्न  
EN  
- बैकएंड चेक करेगा "क्या user_paid_for_series_X?"  
- अगर हाँ, तो Bunny API से play URL (HLS/DASH playlist) प्राप्त करेगा:  
  - `GET /stream/video-library/{lib}/videos/{id}/play`  
- (Optional) अपने JWT/lookup token से उस URL को साइन/लिमिटेड एक्सपायरी दे दें।  
- क्लाइंट को सिर्फ़ वही signed URL लौटाएँ।  

HI (हिन्दी)  
- सर्वर चेक करेगा "यूज़र ने पेमेंट किया?"  
- Bunny API कॉल करके प्लेलिस्ट URL लेगा।  
- (ऑप्शनल) URL को अपने बनाये टोकन (JWT, expiry) से साइन कर देगा।  
- ऐप को सिर्फ़ वैध, सीमित समय-के लिए काम करने वाला URL भेजें।  

---

## 5. CDN-लेवल सिक्योरिटी विकल्प  
EN  
1. **Token Authentication** (Pull Zone settings में secret): Bunny सिर्फ valid tokens पर फ़ाइल सर्व करे।  
2. **Edge Scripting**: अपने छोटे JS script में Authorization header या JWT चेक कराएँ।  

HI (हिन्दी)  
1. Pull Zone में टोकन-सिक्योरिटी ऑन करें।  
2. Edge Script से JWT या अपने custom token वेलिडेशन करें।  

---

## 6. फ्रंटएंड फ्लो  
EN  
1. यूज़र कैटलॉग देखेगा (thumbnails Bunny Pull Zone से)।  
2. एपिसोड टैप: ऐप `/api/get-play-url?videoId=…` कॉल करेगा।  
3. बैकएंड पे भुगतान चेक → Bunny play URL → साइन किए URL रिटर्न।  
4. `<VideoPlayer source={{ uri: signedUrl }} />` से CDN-बफ़रिंग+ABR।  

HI (हिन्दी)  
1. यूज़र कैटलॉग देखें—थंबनेल्स Bunny से।  
2. टैप करने पर ऐप आपके बैकएंड को प्लेबैक-URL के लिए रिक्वेस्ट भेजे।  
3. बैकएंड पेमेंट चेक → Bunny URL लें → ऐप को भेजें।  
4. वीडियो प्लेयर CDN से स्ट्रीमिंग संभालेगा।  

---

## 7. मॉनिटरिंग & एनालिटिक्स  
EN  
- Bunny Statistics API (`GET /statistics`) से bandwidth, regions, edge-cache हिट देखें।  
- Stream Heatmaps, Play Data endpoints से engagement ट्रैक करें।  

HI (हिन्दी)  
- Bunny Statistics API से usage रिपोर्ट देखें।  
- Video Heatmap API से कहाँ यूज़र ड्रॉप होते हैं, जानें।  

---

## 8. Supabase Environment Setup / वातावरण सेटअप

EN:
- Configure the following environment variables for your Supabase project or in a `.env` file:
  - `SUPABASE_URL`: Your Supabase project URL (e.g. `https://xyz.supabase.co`).
  - `SUPABASE_SERVICE_ROLE_KEY`: The service role API key from Supabase settings.
  - `BUNNY_ACCESS_KEY`: Your bunny.net AccessKey for API calls.
  - `BUNNY_LIBRARY_ID`: The ID of your Bunny Stream or Storage Zone library.
  - `BUNNY_PULL_ZONE`: Your Pull Zone hostname for CDN URL (e.g. `example.b-cdn.net`).
- For Edge Functions, set secrets via the Supabase dashboard or CLI:
  ```bash
  supabase secrets set \
    SUPABASE_URL="https://xyz.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
    BUNNY_ACCESS_KEY="<bunny-access-key>" \
    BUNNY_LIBRARY_ID="<library-id>" \
    BUNNY_PULL_ZONE="example.b-cdn.net"
  ```

HI (हिन्दी):
- निम्न Environment Variables सेट करें (Supabase Dashboard या `.env` में):
  - `SUPABASE_URL`: आपका Supabase प्रोजेक्ट URL。
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase से मिला सर्विस-रोल API key।
  - `BUNNY_ACCESS_KEY`: bunny.net का AccessKey।
  - `BUNNY_LIBRARY_ID`: आपका Bunny Stream/Storage Zone लाइब्रेरी ID।
  - `BUNNY_PULL_ZONE`: CDN Pull Zone होस्टनाम (जैसे `example.b-cdn.net`)।
- Edge Functions के लिए Dashboard या CLI से secrets सेट करें:
  ```bash
  supabase secrets set \
    SUPABASE_URL="https://xyz.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
    BUNNY_ACCESS_KEY="<bunny-access-key>" \
    BUNNY_LIBRARY_ID="<library-id>" \
    BUNNY_PULL_ZONE="example.b-cdn.net"
  ```

---

## 9. Backend Flow Overview / बैकएंड फ्लो अवलोकन

EN:
1. Client calls the Edge Function endpoint with HTTP POST to `/functions/v1/get-playback-url`:
   ```json
   { "videoId": "<series_id>" }
   ```
   and includes `Authorization: Bearer <user_jwt>` header.
2. Edge Function:
   - Verifies JWT and fetches user via Supabase Auth.
   - Queries `content_entitlements` table to check access.
   - On success, calls Bunny Stream API to get a signed HLS/DASH URL.
   - Returns JSON `{ "url": "<signed_playback_url>" }`.
3. Client receives the signed URL and passes it to the video player (e.g., `react-native-video`).
   - Bunny CDN handles buffering, ABR, and geo-distribution.
4. Unauthorized or expired requests receive `401` or `403` responses.

HI (हिन्दी):
1. क्लाइंट HTTP POST से Edge Function को `/functions/v1/get-playback-url` पर कॉल करेगा:
   ```json
   { "videoId": "<series_id>" }
   ```
   और हेडर में `Authorization: Bearer <user_jwt>` भेजेगा।
2. Edge Function:
   - JWT वेरिफाई करके Supabase Auth से यूज़र डेटा लेता है।
   - `content_entitlements` टेबल में एक्सेस चेक करता है।
   - सफल होने पर Bunny Stream API से साइन किया HLS/DASH URL लेता है।
   - JSON `{ "url": "<signed_playback_url>" }` रिटर्न करता है।
3. क्लाइंट वीडियो प्लेयर (जैसे `react-native-video`) को वो URL देता है।
   - Bunny CDN buffering, ABR, और Geo-distribution को मैनेज करता है।
4. अनऑथराइज़्ड या एक्सपायर्ड रिक्वेस्ट पर `401` या `403` रेस्पॉन्स मिलेगा।

---

## Next Steps / आगे के कदम

- Edge Function में Bunny.net Stream API कॉल इम्प्लीमेंट करें।
- `supabase functions deploy get-playback-url` से फ़ंक्शन deploy करें।
- क्लाइंट ऐप को अपडेट करें ताकि ये endpoint कॉल और प्लेबैक URL यूज़ हो सके।

इस आर्किटेक्चर से आप Stripe के बिना भी इंडियन पेमेंट गेटवे यूज़ करके एक सिक्योर, स्केलेबल वीडियो-पेवाल प्लेटफ़ॉर्म बना सकते हैं।
