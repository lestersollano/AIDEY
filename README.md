# AIDEY

## Team Information

**Team Name:**
GLAK

**Project Name:**
AIDEY — *Ang Gabay sa Dokumento at ID*

---

## Project Brief

AIDEY is a journey-centered mobile and web app that guides Filipinos through acquiring government documents and IDs — from knowing what to prepare to finding the nearest office on the map.

**The problem your solution addresses**

Every year, millions of Filipinos apply for jobs, enroll in schools, open bank accounts, and access healthcare — and almost every one of those opportunities begins with a government document or valid ID. Yet the process remains frustrating:

- **Information is scattered** across dozens of agencies, outdated websites, and conflicting social media advice.
- **Requirements depend on other requirements** — you often need an ID to get an ID, leaving people stuck before they even start.
- **People travel for hours** only to be turned away with *"Kulang po requirements"* or *"Balik na lang po kayo."*
- **Tens of millions still lack a National ID** despite registration campaigns, because knowing *where to start* is harder than the paperwork itself.

This is not just wasted time — it delays education, employment, financial access, and healthcare for everyday Filipinos.

**Your proposed solution**

AIDEY treats every government document like a **destination on a map** — with a clear route from where you are to where you need to go.

- **What it does:** Search or browse 27+ Philippine government documents and IDs, follow structured step-by-step guides, ask an AI assistant for help, upload and store your IDs, and navigate to the nearest issuing office.
- **How it solves the problem:** Instead of dumping information, AIDEY walks users through **requirements → process steps → upload → directions**, unlocking each stage only after the previous one is complete — so users arrive at government offices prepared.
- **What makes it different:** It is **journey-centered, not information-centered** — combining curated document guides, a context-aware AI assistant (Gemini), GPS-based office finder, interactive maps with routing, bilingual support (English and Filipino), and speech-to-text search in one friendly, mascot-guided experience.

> *"Because every opportunity begins with a document… and every document should begin with AIDEY."*

**The intended users or beneficiaries**

Everyday Filipinos who need government documents and valid IDs — students, job seekers, first-time applicants, and anyone navigating Philippine government processes without clear guidance.

**The impact of your project**

AIDEY reduces wasted trips, rejected applications, and confusion around document requirements. By preparing users before they visit a government office, it helps more Filipinos access education, employment, financial services, and healthcare sooner.

---



## Team Members


| Name                   | Role           |
| ---------------------- | -------------- |
| Lester Matthew Sollano | Lead Developer |
| Kristal Mae Tamayo     |                |
| Angel Geoff Dare       |                |
| Gabriel Josef Lacsa    |                |


---



## Google Technologies Used

- **Gemini API** — Powers the AI assistant chat. Sends conversation history plus app context (owned documents, guide progress, location, checklists) to Gemini models and receives structured JSON replies with messages, suggested chips, task checklists, and map destinations.
- **Firebase Authentication** — Email/password sign-up and sign-in. Gates cloud sync so uploads, chat sessions, and guide progress are tied to a user account.
- **Firebase Cloud Storage** — Stores uploaded ID and document photos in the cloud. Images are saved locally first, then synced to Storage when the user is signed in and online.
- **Firebase Realtime Database** — Syncs user data across devices: chat session history, document upload metadata, and step-by-step guide progress (checked requirements, completed steps).
- **Firebase Hosting** — Hosts the static web build of the app at [aidey.web.app](https://aidey.web.app).
- **Google Maps Platform (Routes API)** — Computes driving routes from the user's GPS location to the nearest government office. Returns distance, duration, and an encoded polyline drawn on the in-app map.
- **Google Maps Platform (Places API)** — Finds the nearest issuing office when the user asks for directions or when the AI sets a map destination. Searches by agency name with a location bias, then ranks results by distance.
- **Google Maps SDK for Android** — Renders the interactive map on Android with Google map tiles, destination markers, the user's live location, and the driving route polyline.

---



## SparkFest 2026

This project was developed as part of **SparkFest 2026**, the flagship hackathon organized by the **Google Developer Groups on Campus – Polytechnic University of the Philippines (GDG on Campus PUP)**.

---



## Repository Information

- **Live Demo:** [https://aidey.web.app](https://aidey.web.app)
- **APK Download:** [https://aidey.web.app/aidey.apk](https://aidey.web.app/aidey.apk)
- **GitHub Repository:** [https://github.com/lestersollano/AIDEY](https://github.com/lestersollano/AIDEY)

