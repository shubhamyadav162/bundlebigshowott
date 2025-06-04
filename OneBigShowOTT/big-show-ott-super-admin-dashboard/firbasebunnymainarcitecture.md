
यहाँ सबसे सरल, जल्दी लागू करने योग्य समाधान का पूरा आरकीटेक्चर और स्टेप-बाय-स्टेप कार्ययोजना है, ताकि आपकी ऐप में नए सीरीज/एपिसोड “हॉट रीलोड” के साथ बिना ऐप अपडेट किए खुद-ब-खुद दिखें:

1. फ़ायरस्टोर में डेटा मॉडल तैयार करें  
   • Collection: `series`  
     – हर डॉक्यूमेंट (seriesId) में रखें:  
       `{ title, description, genre, releaseYear, thumbnailUrl, bannerUrl, isFeatured, createdAt, updatedAt }`  
   • Sub-collection: `episodes` (प्रत्येक seriesId के अंतर्गत)  
     – हर एपिसोड डॉक्यूमेंट में:  
       `{ title, description, duration, playbackUrl, episodeNumber, createdAt, updatedAt }`

2. एडमिन पैनल (React Native Web / expo-web)  
   • वेब पे चलने वाला वही कोड, Firebase Hosting पर डिप्लॉय करें (`expo build:web` → `firebase deploy --only hosting`)  
   • फ़ाइल चुनने के लिए Expo/ImagePicker या `<input type="file"/>` यूज़ करें  
   • **Bunny.net Storage API** से थंबनेल/बैनर अपलोड करें:  
     ```js
     async function uploadImage(fileUri, storagePath) {
       const blob = await fetch(fileUri).then(r=>r.blob());
       const endpoint = `https://${process.env.BUNNY_STORAGE_ZONE}.storage.bunnycdn.com/${storagePath}`;
       const res = await fetch(endpoint, {
         method: 'PUT',
         headers: {
           AccessKey: process.env.BUNNY_STORAGE_API_KEY,
           'Content-Type': blob.type
         },
         body: blob
       });
       if (!res.ok) throw new Error('Image upload failed');
       return `https://${process.env.BUNNY_STORAGE_ZONE}.b-cdn.net/${storagePath}`;
     }
     ```  
   • **Bunny.net Stream API** से वीडियो अपलोड करें:  
     ```js
     // 1) मेटा डेटा बनाएं
     const createVideo = async ({ Title, Description }) => {
       const res = await fetch(
         `https://video.bunnycdn.com/library/${process.env.BUNNY_STREAM_LIBRARY_ID}/videos`,
         {
           method: 'POST',
           headers: {
             accessKey: process.env.BUNNY_STREAM_API_KEY,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({ Title, Description })
         }
       );
       if (!res.ok) throw new Error('Video meta create failed');
       return await res.json(); // इसमें मिलेगा { Id: videoId, UploadUrl, ... }
     };

     // 2) बाइनरी डेटा अपलोड
     const uploadVideo = async (uploadUrl, fileUri) => {
       const blob = await fetch(fileUri).then(r=>r.blob());
       const res = await fetch(uploadUrl, {
         method: 'PUT',
         headers: { 'Content-Type': blob.type },
         body: blob
       });
       if (!res.ok) throw new Error('Video upload failed');
     };

     // 3) Encode होने के बाद playbackUrl लें
     const getPlaybackUrl = async (videoId) => {
       const res = await fetch(
         `https://video.bunnycdn.com/library/${process.env.BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
         { headers: { AccessKey: process.env.BUNNY_STREAM_API_KEY } }
       );
       const data = await res.json();
       return data.Url; // या data.playbackUrl
     };
     ```  
   • इन तीनों को मिलाकर, जब एडमिन “Save Series” या “Add Episode” क्लिक करे, तो:  
     1. थंबनेल और बैनर अपलोड → URLs मिलें  
     2. वीडियो मेटा बनाएं → UploadUrl/VideoId मिलें → वीडियो अपलोड करें → Encode प्रोसेस हो  
     3. Encode पूरा होने के बाद `getPlaybackUrl(videoId)` → `playbackUrl` मिलें  
     4. Firestore में पूरी मेटा (thumbnailUrl, bannerUrl, playbackUrl इत्यादि) सेव करें  

3. रीयल-टाइम हॉट रीलोड (मोबाइल/वेब ऐप दोनों)  
   • फ्रंटएंड में Firestore का `onSnapshot` listener लगाएं:  
     ```js
     useEffect(() => {
       const unsubscribe = onSnapshot(
         collection(db, 'series'),
         snapshot => {
           setSeriesList(snapshot.docs.map(d=>({ id:d.id, ...d.data() })));
         }
       );
       return unsubscribe;
     }, []);
     ```  
   • जब भी Firestore में कोई नया series/episode डॉक्यूमेंट जुड़ेगा या अपडेट होगा, UI तुरन्त रिफ्रेश हो जाएगा।

4. Environment और सेक्योरिटी  
   • `.env` (या Firebase Hosting env) में रखें:  
     ```
     BUNNY_STORAGE_ZONE=bigshow
     BUNNY_STORAGE_API_KEY=...
     BUNNY_STREAM_LIBRARY_ID=425837
     BUNNY_STREAM_API_KEY=...
     ```  
   • क्लाइंट में कभी सीधे हार्ड-कोड न करें—वेब-होस्टिंग पर सेट करें।  
   • Firestore Rules में एडमिन और पब्लिक राइट्स अलग करें।

5. डिप्लॉयमेंट  
   • `firebase init hosting` → public dir = `web-build` (या expo का web-build आउटपुट)  
   • `firebase deploy --only hosting`  
   • एडमिन UI से कंटेंट मैनेजमेंट, Bunny पर अपलोड और Firestore में अपडेट → सब कुछ रीयल-टाइम अपडेट

इस वर्कफ़्लो से:

– एडमिन पैनल पर फ़ाइलें सीधे Bunny CDN पर सेव होंगी  
– मेटाडेटा तुरंत Firestore में स्टोर होगा  
– मोबाइल/वेब ऐप में Firestore Listeners से ऑटोमैटिक UI अपडेट होगा  
– आपको कोई अलग पब्लिक-एपीआई या Cloud Function लिखने की ज़रूरत नहीं (सिवाय env सेटअप के)  
– सिक्योरिटी और स्केलेबिलिटी दोनों में सरलता बनी रहेगी  

बस इन स्टेप्स को फ़ॉलो करें, और आपकी ऐप में नए वेब सीरीज़ बिना ऐप अपडेट के “हॉट रीलोड” के साथ दिखेंगी।
