# NBA Playoff Predictor — Full Setup Guide

Your project folder contains these files:
  index.html   — the page structure
  style.css    — all styling
  bracket.js   — bracket logic, picks, submissions
  firebase.js  — connects to Firestore (cloud database)
  vercel.json  — tells Vercel how to serve the app
  public/
    robots.txt — lets Google index your site

Follow every step below in order.

────────────────────────────────────────────────────────────────────
STEP 1 — Install Node.js (one time only)
────────────────────────────────────────────────────────────────────

1. Go to https://nodejs.org
2. Download the "LTS" version (the green button)
3. Run the installer — click Next on everything
4. When it finishes, open Terminal (Mac) or Command Prompt (Windows)
5. Type this and press Enter to confirm it worked:

   node --version

   You should see something like: v20.11.0


────────────────────────────────────────────────────────────────────
STEP 2 — Set up your Firebase database (free)
────────────────────────────────────────────────────────────────────

This is where all predictions get saved so everyone can see them.

1. Go to https://firebase.google.com
2. Click "Go to console" (top right) — sign in with a Google account
3. Click "Add project"
4. Name it: nba-predictor → click Continue
5. Turn OFF Google Analytics (not needed) → click "Create project"
6. Wait ~30 seconds for it to finish, then click "Continue"

Now register your web app:
7. On the project home screen, click the </> icon (it says "Web")
8. App nickname: nba-predictor → click "Register app"
9. You will see a code block with a firebaseConfig object. It looks like:

   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "nba-predictor-xxxx.firebaseapp.com",
     projectId: "nba-predictor-xxxx",
     ...
   };

10. COPY those values — you will paste them into firebase.js in Step 3.
11. Click "Continue to console"

Now create the database:
12. In the left sidebar, click Build → Firestore Database
13. Click "Create database"
14. Select "Start in test mode" → click Next
15. Choose the region closest to you (e.g. us-east1) → click Enable
16. Wait ~20 seconds. You now have a live database.


────────────────────────────────────────────────────────────────────
STEP 3 — Paste your Firebase config into firebase.js
────────────────────────────────────────────────────────────────────

1. Open firebase.js in any text editor (Notepad, VS Code, TextEdit)
2. Find this section near the top:

   const firebaseConfig = {
     apiKey:            "PASTE_YOUR_API_KEY_HERE",
     authDomain:        "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
     projectId:         "PASTE_YOUR_PROJECT_ID",
     storageBucket:     "PASTE_YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
     appId:             "PASTE_YOUR_APP_ID",
   };

3. Replace each "PASTE_YOUR_..." value with the real values from Step 2
4. Save the file

Example of what it should look like when done:

   const firebaseConfig = {
     apiKey:            "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     authDomain:        "nba-predictor-a1b2c.firebaseapp.com",
     projectId:         "nba-predictor-a1b2c",
     storageBucket:     "nba-predictor-a1b2c.appspot.com",
     messagingSenderId: "123456789012",
     appId:             "1:123456789012:web:abcdef1234567890",
   };


────────────────────────────────────────────────────────────────────
STEP 4 — Test it locally on your computer
────────────────────────────────────────────────────────────────────

1. Open Terminal / Command Prompt
2. Navigate to your project folder. For example:

   Mac:     cd ~/Desktop/nba-predictor
   Windows: cd C:\Users\YourName\Desktop\nba-predictor

3. Run:

   npx serve .

4. Open your browser and go to: http://localhost:3000
5. Fill out a bracket and click "Lock In" — you should see it appear
   in the Submissions panel below. Check your Firebase console
   (Firestore → predictions collection) to confirm it saved.

If that works, you're ready to deploy.


────────────────────────────────────────────────────────────────────
STEP 5 — Deploy to Vercel (makes it a real public website)
────────────────────────────────────────────────────────────────────

1. Go to https://github.com and create a free account if you don't have one
2. Click the + icon → "New repository"
   Name: nba-predictor → Public → Create repository
3. Follow the instructions GitHub shows you to push your files.
   In your terminal (inside your project folder):

   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nba-predictor.git
   git push -u origin main

4. Go to https://vercel.com → sign up with your GitHub account
5. Click "Add New Project" → Import your nba-predictor repository
6. Leave all settings as default → click "Deploy"
7. In about 60 seconds you get a live URL like:
   https://nba-predictor-abc123.vercel.app

Share that URL with your friends — they can open it on any device.


────────────────────────────────────────────────────────────────────
STEP 6 (Optional) — Add a custom domain
────────────────────────────────────────────────────────────────────

If you want something like "nbapicks.com" instead of the vercel.app URL:

1. Go to https://namecheap.com (or Google Domains)
2. Search for a domain you like → buy it (~$10-15/yr)
3. In your Vercel dashboard → your project → Settings → Domains
4. Type your domain name → Add
5. Vercel shows you DNS records to add — copy them
6. In Namecheap: Domain List → Manage → Advanced DNS → paste the records
7. Wait 10-30 minutes for it to go live. Vercel handles HTTPS automatically.


────────────────────────────────────────────────────────────────────
STEP 7 (Optional) — Get on Google Search
────────────────────────────────────────────────────────────────────

1. Go to https://search.google.com/search-console
2. Sign in → Add property → paste your website URL
3. Verify ownership (Vercel makes this easy via the HTML tag method)
4. Click URL Inspection → paste your URL → Request Indexing
5. Google usually indexes it within 1-4 weeks


────────────────────────────────────────────────────────────────────
HOW DATA IS STORED
────────────────────────────────────────────────────────────────────

Every "Lock In" submission saves to Firestore as a document with:
  - name          (e.g. "Mike J")
  - timestamp     (ISO format for sorting)
  - displayTime   (human readable)
  - champion      (predicted champion)
  - champGames    (games prediction)
  - champReason   (text explanation)
  - eastConf      (East conference pick)
  - westConf      (West conference pick)
  - picks         (full bracket: every round, every series, winner + games + reason)

You can view all submissions at any time in your Firebase console:
  firebase.google.com → your project → Firestore Database → predictions


────────────────────────────────────────────────────────────────────
UPDATING THE SEEDINGS
────────────────────────────────────────────────────────────────────

When the real playoff picture becomes official, open bracket.js
and edit the SEEDS object at the top of the file. Then:

  git add bracket.js
  git commit -m "update seedings"
  git push

Vercel will automatically redeploy within ~30 seconds.


────────────────────────────────────────────────────────────────────
NEED HELP?
────────────────────────────────────────────────────────────────────

If anything gets stuck, the most common issues are:
  - firebase.js config values not replaced (Step 3)
  - Firestore still in "test mode expiry" — go back to Firebase console,
    Firestore → Rules, and make sure read/write are allowed
  - CORS error locally — use "npx serve ." not opening index.html directly
