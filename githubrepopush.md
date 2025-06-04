# React Native प्रोजेक्ट को GitHub Actions से APK/AAB में बदलने के लिए Step-by-Step गाइड

नीचे दिए गए सभी स्टेप्स को आप सीधे `push.md` में पेस्ट कर सकते हैं। हर स्टेप में कमांड्स, फ़ाइल पाथ, और GitHub-संबंधित इन्स्ट्रक्शंस शामिल हैं ताकि Cursor AI बिना भटके एक्‍शन ले सके।

---

## 1. GitHub Repository बनाना

1. GitHub में लॉगिन करें।
2. राइट-ऊपर कोने में “+” आइकन पर क्लिक करें और **New repository** चुनें।
3. Repository नाम (उदा. `MyReactNativeApp`) दें।
4. Description (Optional) भरें।
5. **Public** या **Private** में से एक चुनें (आपकी प्रेफरेंस के आधार पर)।
6. “Add a README file” का बॉक्स चेक कर दें (ज़रूरी नहीं, पर अच्छा रहता है)।
7. **Create repository** पर क्लिक करें।
8. आपके सामने क्लोन URL आएगा, जैसे:
https://github.com/<your-username>/MyReactNativeApp.git

yaml
Copy
Edit

---

## 2. लोकली React Native प्रोजेक्ट तैयार करना

> मान लें कि आपने Cursor AI से React Native कोड जनरेट कर लिया है और आपके लोकल मशीन पर एक फोल्डर `MyReactNativeApp` में पड़ा है।

1. टर्मिनल/कमांड प्रॉम्प्ट खोलें।
2. प्रोजेक्ट की डायरेक्टरी में जाएँ:
```bash
cd /path/to/MyReactNativeApp
अगर आपने अभी तक Git इनिशियलाइज़ नहीं किया है:

bash
Copy
Edit
git init
GitHub रिमोट जोड़ें:

bash
Copy
Edit
git remote add origin https://github.com/<your-username>/MyReactNativeApp.git
सभी फाइल्स स्टेज करें और पहला कमिट करें:

bash
Copy
Edit
git add .
git commit -m "Initial commit: Cursor AI से जनरेटेड React Native प्रोजेक्ट"
main ब्रांच पर पुश करें:

bash
Copy
Edit
git branch -M main
git push -u origin main
3. Android Keystore जनरेट करना
APK/AAB साइन करने के लिए आपको एक Keystore फ़ाइल चाहिए होगी। मान लें कि हम my-release-key.jks नाम से बनाएँगे।

टर्मिनल में जाएँ और प्रोजेक्ट रूट पर ये कमांड चलाएँ:

bash
Copy
Edit
keytool -genkey -v \
  -keystore my-release-key.jks \
  -alias my_key_alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
कमांड रन करने पर यह आपसे कुछ जानकारी मांगेगा:

Keystore password (दुबारा कन्फर्म करें)

Your first and last name, organizational unit, organization, city, state, country code

Key password (यदि अलग रखना हो तो, या एंटर प्रेस करें ताकि वही Keystore password इस्तेमाल हो)

इसी डायरेक्टरी में my-release-key.jks तैयार हो जाएगा।

4. Keystore को Base64 में कन्वर्ट करना
टर्मिनल/कमांड प्रॉम्प्ट में (जहाँ my-release-key.jks है) चलाएँ:

macOS/Linux:

bash
Copy
Edit
base64 my-release-key.jks > keystore-base64.txt
Windows (Git Bash या WSL में):

bash
Copy
Edit
base64 my-release-key.jks > keystore-base64.txt
अब keystore-base64.txt में आपका Base64 एन्कोडेड स्ट्रिंग होगा। इसे बाद में GitHub Secrets में इस्तेमाल करेंगे।

5. GitHub में Secrets सेटअप करना
GitHub पर अपना MyReactNativeApp रिपॉज़िटरी ओपन करें।

Settings → बाएँ साइड में Secrets and variables → Actions पर जाएँ।

New repository secret बटन पर क्लिक करें।

इन चार Secrets बनाएँ:

Name: ANDROID_KEYSTORE_BASE64
Value: keystore-base64.txt में से पूरा Base64 कंटेंट कॉपी-पेस्ट करें।

Name: KEYSTORE_ALIAS
Value: my_key_alias

Name: KEYSTORE_PASSWORD
Value: (वही पासवर्ड जो आपने Keystore बनाते समय दिया था)

Name: KEY_PASSWORD
Value: (यदि अलग पासवर्ड दिया था, वरना वही पासवर्ड)

ध्यान दें: हर Secret सेव करते ही GitHub उसे सुरक्षित स्टोर कर लेगा।

6. Gradle कन्फ़िगरेशन: android/gradle.properties
प्रोजेक्ट में android/gradle.properties फाइल खोलें (यदि नहीं है, तो क्रिएट करें)।

नीचे वाली लाइन्स जोड़ें:

properties
Copy
Edit
MYAPP_UPLOAD_STORE_FILE=my-release-key.jks
MYAPP_UPLOAD_KEY_ALIAS=${KEYSTORE_ALIAS}
MYAPP_UPLOAD_STORE_PASSWORD=${KEYSTORE_PASSWORD}
MYAPP_UPLOAD_KEY_PASSWORD=${KEY_PASSWORD}
ध्यान रखें कि ${KEYSTORE_ALIAS} वग़ैरह GitHub Actions के रनटाइम पर Environment Variables से रिप्लेस हो जाएँगे।

7. Gradle कन्फ़िगरेशन: android/app/build.gradle
android/app/build.gradle फाइल खोलें।

android { ... } सेक्शन के अंतर्गत (या signingConfigs में) ये चेक करें कि release सिग्निंग कुछ इस तरह दिखता हो:

groovy
Copy
Edit
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        // Proguard और अन्य ऑप्शन्स
        signingConfig signingConfigs.release
    }
}
यदि पहले से signingConfigs मौजूद नहीं है, तो ऊपर वाली ब्लॉक को android { ... } में सही जगह पर ऐड करें।

8. GitHub Actions Workflow फ़ाइल बनाना
रिपॉज़िटरी रूट पर .github/workflows नाम का फोल्डर बनाएँ (यदि नहीं है)।

उस ड्रेक्टरी में android-build.yml नाम से फाइल क्रिएट करें।

नीचे दिया गया YAML कंटेंट उस फाइल में पेस्ट करें:

yaml
Copy
Edit
name: Android Build

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    env:
      ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
      KEYSTORE_ALIAS: ${{ secrets.KEYSTORE_ALIAS }}
      KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
      KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

    steps:
      # 1. कोड क्लोन करें
      - name: Checkout repository
        uses: actions/checkout@v3

      # 2. Java और Android SDK सेटअप
      - name: Set up JDK 11
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Set up Android SDK
        uses: android-actions/setup-android@v2
        with:
          api-level: 33
          build-tools: 33.0.2

      # 3. Node.js सेटअप और npm डिपेंडेंसी इंस्टॉल
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'

      - name: Install JS dependencies
        run: |
          npm install
        working-directory: .

      # 4. Keystore फ़ाइल तैयार करें
      - name: Decode and save Keystore
        run: |
          echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > android/app/my-release-key.jks

      # 5. Gradle Clean
      - name: Clean Gradle
        run: |
          cd android
          ./gradlew clean

      # 6. Release Build
      - name: Build APK (assembleRelease)
        run: |
          cd android
          ./gradlew assembleRelease

      # अगर AAB चाहिए, तो इस कमांड को Uncomment करें:
      # - name: Build AAB (bundleRelease)
      #   run: |
      #     cd android
      #     ./gradlew bundleRelease

      # 7. बिल्ट आउटपुट्स को आर्टिफ़ैक्ट के रूप में अपलोड करें
      - name: Upload Release Artifact
        uses: actions/upload-artifact@v3
        with:
          name: android-app-release
          path: |
            android/app/build/outputs/apk/release/app-release.apk
            # android/app/build/outputs/bundle/release/app-release.aab
YAML में दिए गए सारे इंडेंटेशन और वेरिएबल नेम्स ठीक उसी तरह ध्यान से कॉपी करें।

9. लोकली वर्कफ़्लो और प्रोजेक्ट चेक करना
लोकली बिल्ड टैस्ट के लिए:

bash
Copy
Edit
cd android
./gradlew assembleRelease
अगर लोकल बिल्ड सफल रहता है, तो YAML फाइल से GitHub Actions भी सफल होना चाहिए।

10. सभी बदलाव GitHub पर कमिट और पुश करना
स्टेज करें:

bash
Copy
Edit
git add .
कमिट मेसेज लिखें:

bash
Copy
Edit
git commit -m "Add GitHub Actions workflow for Android release build"
पुश करें:

bash
Copy
Edit
git push origin main
GitHub पर पुश होते ही Actions टैब में जॉब रन शुरू हो जाएगा।
1–2 मिनट में आपका APK (या AAB) बनकर तैयार हो जाएगा।

11. बिल्डेड APK/AAB डाउनलोड करना
GitHub में अपने रिपॉज़िटरी पर जाएँ।

ऊपर के “Actions” टैब में क्लिक करें।

लेटेस्ट “Android Build” वर्कफ़्लो रन सिलेक्ट करें।

बाएँ साइड में “Artifacts” सेक्शन में “android-app-release” नाम दिखाई देगा।

“Download” पर क्लिक करके app-release.apk (या .aab) डाउनलोड करें।

12. निष्कर्ष और टिप्स
Keystore का बैकअप रखें: my-release-key.jks की एक और लोकल कॉपी सुरक्षित जगह पर सेव कर लें।

सिक्योरिटी: कभी भी Keystore पासवर्ड या Alias सीधे कोड में न डालें। GitHub Secrets का इस्तेमाल करें।

ब्रांच पॉलिसी: यदि आप main के अलावा किसी अन्य ब्रांच से बिल्ड चलाना चाहते हैं, तो YAML में branches: [ your-branch ] अपडेट कर दें।

मोबाइल टेस्टिंग: बिल्डेड APK को इंस्टॉल करके अपने Android डिवाइस पर टेस्ट करें।