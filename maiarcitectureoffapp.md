Here’s a **simplified system architecture diagram** and explanation to help you clearly understand how all components work together in your OTT app system (like BigShow). This version uses **boxes and arrows** instead of sequence lines, and breaks down the flow into clear sections:

---

### 🧩 **Simplified System Architecture Diagram**

```plaintext
           [Super Admin Dashboard]
                    |
                    v
         (Upload Metadata to Firestore)
                    |
                    v
            [Firebase Firestore]
                    ^
                    |
        +-----------+------------+
        |                        |
        v                        v
 [BigShow OTT App] <-------- [User]
        |   ^                      |
        |   |                      |
        |   |         (App UI)     |
        v   |                      v
[Payment API (Railway.app)] <--> [Payment UI]
        |                                |
        v                                |
 [Process Payment & Return Status]      |
        |                                |
        v                                |
  (Update Subscription in Firestore) <---+

        |
        v
[Video Streaming Request to bunny.net CDN]
        |
        v
   [Video Streamed to App → User]
```

---

### 🪄 **Visual Flow in Simple Words**

#### 🎬 **Content Upload (Admin)**

* Admin uploads metadata (video title, thumbnail, episodes) via the **Dashboard**.
* Metadata is saved in **Firebase Firestore**.

#### 📱 **App Launch (User)**

* User opens the app.
* App reads metadata from **Firestore**.
* Shows available series & content to user in real-time.

#### 💳 **Subscription Payment**

* User selects a plan.
* App sends payment request to **LightSpeed API** (hosted on **Railway**).
* Payment API shows payment form → user enters details.
* Payment is processed and result (success/failure) is returned.
* If successful, app updates the user’s **subscription status** in Firestore.

#### ▶️ **Video Playback**

* App checks if subscription is active.
* If yes, it sends request to **bunny.net CDN** for the video.
* CDN streams video segments to the app → user watches content.

---

### ✅ **Key Technologies Used**

| Component           | Technology Used                               |
| ------------------- | --------------------------------------------- |
| Admin Panel         | Firebase Hosting                              |
| Database            | Firebase Firestore                            |
| App                 | BigShow OTT App (React Native / Flutter etc.) |
| Video Delivery      | bunny.net CDN                                 |
| Payment Integration | LightSpeed API (Railway)                      |

---

Would you like this as a **colorful block diagram image** too? I can generate a visual version.
