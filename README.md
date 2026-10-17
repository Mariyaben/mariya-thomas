# Mariya & Thomas

Pink for Mariya, purple for Thomas. Shared clocks, manual ship-time adjustments, a call planner, notes, and encrypted chat. Includes an Android app with a home-screen clock widget and an installable web app for iPhone.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import this GitHub repository.
2. Keep the repository root as the Root Directory. The included `vercel.json` sets the build command and output directory. No environment variables are required.
3. Deploy. Send Thomas `https://YOUR-PROJECT.vercel.app/?person=thomas` through WhatsApp.

Thomas opens the link in **Safari → Share → Add to Home Screen**. Enable **Open as Web App** if shown. Open the new **M & T** icon before pairing Chat; Safari and the installed app may use separate storage. A fresh Thomas link starts in purple. The profile switch changes between Mariya and Thomas.

This is an iPhone web app, not an IPA. No Apple Developer membership is required. The web version has no iPhone home-screen clock widget or background message notifications. Clocks work offline after the app shell has cached successfully. Physical iPhone installation has not yet been verified.

## Android

The personal debug APK is in [`downloads/Mariya-and-Thomas.apk`](downloads/Mariya-and-Thomas.apk). It is also available at `/downloads/Mariya-and-Thomas.apk` after Vercel deployment. Install it on Android 9 or newer and select Mariya. Use **Add banner** for the live Android home-screen widget.

Build with an installed JDK and Android SDK:

```powershell
.\gradlew.bat :app:assembleDebug
```

The result is `app/build/outputs/apk/debug/app-debug.apk`. This repository includes the Gradle wrapper and requires Android SDK platform 35.

## Clocks

India remains at UTC +05:30. Thomas starts at UTC +00:00, 5h 30m behind India. Use **+ 1 hour** when his ship advances and **− 1 hour** to reverse an adjustment. No automatic time-zone guesses. Keep the underlying phone clock accurate.

Mariya remains fixed to IST. Thomas is stored as a difference from IST, starting **5h 30m behind**. The ±1-hour buttons adjust only his difference. **Set difference** corrects hours/minutes ahead or behind.

Pair the phones once in Chat. Clock changes synchronize over the encrypted relay while the apps are open and online. Each device saves a versioned snapshot offline. Reconnecting requests the latest snapshot from the peer and announces its own. Stale and duplicate events cannot roll back newer updates; concurrent offline edits converge deterministically. If the relay cache has expired and the device with the newest update is closed, open that device too so it can share its saved snapshot. There is no background synchronization or durable cloud clock database.

Both phones need version 1.2. This release migrates old local-only clock settings to the confirmed starting difference of 5h30 behind IST. Manual clock codes remain available as a fallback. Notes remain local until shared.

## Chat

One person opens Chat and chooses **Create our chat → Share pairing code**. The other pastes that code into Chat. Keep the code private. If both created different chats, choose **Change pairing** to use the same code.

Chat uses the hosted [ntfy.sh relay](https://docs.ntfy.sh/publish/); no account or server hosting is needed. Messages, reactions, and receipts use AES-256-GCM encryption before publication. A random pairing code carries the shared key, and the topic is derived separately using SHA-256. The relay can see IP addresses, timing, topic and ciphertext sizes. Local history and the key are stored in app/browser storage and are not separately encrypted at rest. This small personal chat has no independently audited security, identity verification, or forward secrecy.

Messages are limited to 500 characters. Offline sends remain queued on the sending device and retry while the app is open. **Receive while the app is open. There are no background chat notifications.** The relay normally retains messages for **12 hours**; a recipient offline longer may miss messages. Service rate limits and availability apply. “Sent to relay” confirms service acceptance, and “Seen” confirms that the other interface opened Chat and sent a receipt.

Changing domains creates a fresh browser storage location. Re-pair Chat and set the current ship offset after moving from the previous site to Vercel. Existing Android pairings continue to work with the same code. No real messages, pairing codes, credentials, or Sites hosting identity are included in this repository.

## Local development

Node.js 20 or newer; no npm dependencies:

```sh
npm test
npm run build
python -m http.server 4173 --directory public
```

Open `http://localhost:4173`. The Android assets in `app/src/main/assets` are the source of the web build. Run `npm run build` after editing them. HTTPS or localhost is required for Web Crypto and service workers.

The tests cover clock offsets/day rollover, IST-relative ship time, encrypted two-client updates and reconnect recovery, and chat encryption/tamper detection. Optional hosted-relay test, using an encrypted synthetic message only:

```sh
node tests/chat.test.cjs --live
```
