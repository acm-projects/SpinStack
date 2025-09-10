
<p align="center">
  <img src="spinstack-banner.gif" alt="SpinStack Banner" width="520">
</p>

<h1 align="center">SpinStack 🎵</h1>

<p align="center">
SpinStack is a mobile-first social music diary for sharing the <i>exact moments</i> in songs that move you — that bar at 0:57, the beat drop at 1:27, the lyric you can’t forget. Create shareable <b>Stacks</b> (vinyl-style collections) with timestamped highlights, notes, emojis, and reactions. A TikTok-like Moment Feed lets friends swipe through your exact snippets with your visuals on top.
</p>

<br/>

## MVP 🛠️

- **Auth**: Sign up / Sign in; protected routes.
- **Stacks & Vinyl UI**: Create stacks, add tracks, set cover/name, reorder.
- **Timestamped Moments**: Choose **10–30s** snippet windows anywhere in the track; add note/emoji and optional background visual.
- **Moment Feed (TikTok-like)**: Vertical, full-screen cards; autoplay the chosen snippet; foreground UI with GIF/album art + spinning vinyl overlay.
- **Reactions & Comments**: React to specific moments; threaded comments under a moment.
- **Follow & Shelves**: Follow friends; view their stacks.
- **Search (Cross-Provider)**: One search that merges **Spotify** and **Apple Music** results via **ISRC**, de-duping duplicates; fast typeahead.
- **Playback (Ad‑Free, Policy‑Compliant)**:
  - **Exact interval playback** for **Spotify Premium** (App Remote) and **Apple Music subscribers** (MusicKit) — seek to the moment’s start and pause at end.

> **Important**: No YouTube/SoundCloud playback in MVP to guarantee **no ads** and consistent timestamp control.

<br/>

## Tech Stack & Resources 💻

<details>
  
**<summary>Comprehensive Full-Stack Tutorials</summary>**

- [Build a Full Stack React Native App with Payments | PostgreSQL, TypeScript, Stripe, Tailwind](https://youtu.be/kmy_YNhl0mw?si=JIaAr0XorXpL7he7)
- [MERN Stack React Native Project: Build a Bookstore App With React Native and Node.js](https://www.youtube.com/watch?v=o3IqOrXtxm8)

</details>


<details>
<summary><b>Frontend</b></summary>

- React Native (TypeScript), Expo, React Navigation  
- Styling: Custom components, NativeWind  
- State/data: React Query, React Hook Form + Zod  
- Media/UI: Reanimated, Lottie (vinyl), expo-blur, expo-image, expo-av (for provider previews & short MP4 loops)  
- Secure storage: Expo SecureStore, AsyncStorage  
- Design: Figma

Helpful links:
- <a href="https://www.youtube.com/watch?v=Tn6-PIqc4UM">What is React?</a>
- <a href="https://www.youtube.com/watch?v=mrjy92pW0kM">React Native #1: Setup Visual Studio Code</a>
- <a href="https://reactnative.dev/docs/environment-setup">Setting up the Environment</a>
- <a href="https://reactnative.dev/docs/getting-started">React Native: Getting Started</a>
- <a href="https://reactnative.dev/docs/tutorial?language=javascript">Learn the Basics</a>
- <a href="https://www.youtube.com/playlist?list=PLC3y8-rFHvwhiQJD1di4eRVN30WWCXkg1">React Native Tutorial for Beginners</a>
- <a href="https://www.youtube.com/watch?v=6ZnfsJ6mM5c">React Native Tutorial for Beginners - Getting Started</a>
- <a href="https://docs.expo.dev/">Expo Documentation</a>
- <a href="https://reactnavigation.org/docs/getting-started">React Navigation: Getting Started</a>
- <a href="https://www.nativewind.dev/quick-starts/expo">NativeWind (Expo Quick Start)</a>
- <a href="https://react-hook-form.com/get-started">React Hook Form: Get Started</a>
- <a href="https://zod.dev/">Zod Documentation</a>
- <a href="https://docs.expo.dev/versions/latest/sdk/securestore/">Expo SecureStore (Secure Token Storage)</a>
- <a href="https://help.figma.com/hc/en-us">Figma Help Center</a>
- <a href="https://www.youtube.com/watch?v=1pW_sk-2y40">Designing in Figma (Crash Course)</a>
- <a href="https://www.youtube.com/watch?v=jQ1sfKIl50E">Figma Tutorial for Beginners</a>
- <a href="https://www.youtube.com/watch?v=xjd6DymqGNE">Learn Figma in 2025 | Mobile app design in Figma: a step-by-step guide for beginners</a>
- <a href="https://www.youtube.com/watch?v=ThmHV38Ecqk">FULL UI Design Mobile Apps Course</a>

</details>

<details>
<summary><b>Backend</b></summary>

- Node.js + Fastify (TypeScript), Prisma ORM  
- Postgres w/ Supabase
- Auth: Supabase Auth
- Caching: Redis for search/typeahead results  
- API testing: Postman

Helpful links:
- <a href="https://www.fastify.io/docs/latest/">Fastify Documentation</a>
- <a href="https://www.prisma.io/docs">Prisma Documentation</a>
- <a href="https://www.postgresql.org/docs/">PostgreSQL Docs</a>
- <a href="https://supabase.com/docs">Supabase Docs</a>
- <a href="https://supabase.com/docs/guides/auth/quickstarts/react-native">Use Supabase Auth with React Native</a>
- <a href="https://www.youtube.com/watch?v=AE7dKIKMJy4">React Native Database & User Authentication</a>
- <a href="https://redis.io/docs/">Redis Docs</a>
- <a href="https://learning.postman.com/docs/introduction/overview/">Postman Learning Center</a>
- <a href="https://www.youtube.com/watch?v=LMoMHP44-xM">Build a RESTful API with Fastify, Prisma & TypeScript</a>

</details>

<details>
<summary><b>Third-Party Integrations / APIs</b></summary>

- **Spotify (Premium for exact seek):** App Remote SDK
- **Apple Music (subscriber):** MusicKit
- **Search**: Spotify Web API + Apple Music Catalog
</details>

<details>
<summary><b>Dev Tools/Software</b></summary>

- [Git](https://git-scm.com/downloads)
- [VS Code](https://code.visualstudio.com/download)
- [Node.js](https://nodejs.org/en/download/package-manager)
- [Postman](https://www.postman.com/downloads/)

</details>

## Timeline & Milestones 🗓️

> **Weeks 1–2**: onboarding, design, schema/API kick‑off  
> **End of Week 8**: entire MVP functional & demoable  
> **Weeks 9–10**: polish + presentation practice

<table>
  <tr>
    <th>Week</th>
    <th>Overall</th>
    <th>Frontend Tasks</th>
    <th>Backend Tasks</th>
  </tr>

  <tr>
    <td>Week 1</td>
    <td>
      <ul>
        <li>Decide roles (FE/BE/Integrations/QA)</li>
        <li>Set up communication, repos, CI, and issue board</li>
        <li>Set up development environments (frontend & backend)</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Begin UI/UX exploration</li>
        <li>Initialize RN + Expo project, navigation, and theme</li>
        <li>Review RN + NativeWind basics</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Initialize Fastify + Prisma + Postgres</li>
        <li>Sketch initial ERD and API surface</li>
        <li>Review Spotify/Apple provider docs & auth flows</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>Week 2</td>
    <td>
      <ul>
        <li>Get familiar with core tech stack</li>
        <li><b>Finalize database schema (freeze by end of week)</b></li>
        <li><b>Figma design complete by end of week</b></li>
        <li><b>Start API contract</b> (basic routes agreed)</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Flesh out app vision & flows</li>
        <li>Build core components (cards, lists, forms)</li>
        <li>Wire screen shells to mock data</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Run initial migrations & seed data</li>
        <li>Stand up basic endpoints (health, auth hooks, lists)</li>
        <li>Search foundation (Spotify/Apple queries; ISRC merge plan)</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>Week 3/4</td>
    <td>
      <ul>
        <li>Build out MVP flows end-to-end (first pass)</li>
        <li>Agree on error/loading patterns</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Finish UI/UX details (by end of Week 3)</li>
        <li>Implement Auth screens & basic stack flows</li>
        <li><b>Implement Moment editor UI</b> (select 10–30s, notes/emojis)</li>
        <li>Set up routing/state patterns</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>CRUD for users/stacks/tracks</li>
        <li>Search aggregator (Spotify + Apple) with ISRC de-dupe</li>
        <li>Moments APIs (create/list) with validation</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>Week 5/6</td>
    <td>
      <ul>
        <li>Integrate core features; test across iOS/Android</li>
        <li>Define acceptance checks for MVP features</li>
      </ul>
    </td>
    <td>
      <ul>
        <li><b>Moment feed</b> (vertical swipe, preloading)</li>
        <li>Editor preview hooked to provider playback</li>
        <li>Reactions/comments UI; follow & profile basics</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Track–provider mapping & capabilities</li>
        <li>Reactions/comments endpoints; follow graph & feed queries</li>
        <li>Search polish (paging, fuzzy match when no ISRC)</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>Week 7/8</td>
    <td>
      <ul>
        <li><b>Finish integration and stabilize</b></li>
        <li><b>Entire MVP working by end of Week 8</b></li>
        <li>Begin presentation outline/script</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Provider integration parity & UX polish</li>
        <li>Animations, accessibility, empty/error states</li>
        <li>Small fixes and quality pass</li>
        <li>Just QoL things and help backend</li>
        <li>FINISH EVERYTHING.</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Security & rate limits; logs/health checks</li>
        <li>Indexes & performance checks</li>
        <li>Deploy and verify environments</li>
        <li>FINISH EVERYTHING.</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>Week 9</td>
    <td>
      <ul>
        <li><b>No new features</b>; presentation prep & rehearsals</li>
        <li>Fix any bugs and implement any performance fixes</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>UI refinement; cross-device testing</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Monitoring & performance tuning</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>Week 10</td>
    <td>
      <ul>
        <li><b>Practice, polish, and finalize!!!</b></li>
        <li>Live and breathe the slides and presentation</li>
      </ul>
    </td>
    <td>
      <ul>
      </ul>
    </td>
    <td>
      <ul>
      </ul>
    </td>
  </tr>
</table>




<br/>

## Stretch Goals 🚀

- Blends (co‑curated stacks)  
- Voice Reactions  
- Shelf Themes  
- Emotion/Mood Insights  
- Ambient Visualizer Mode  
- Moment Lockers  
- AI Mood Sorting & Recs
- Fallback preview option for non-subscribers (30-second non-customizable preview)

<br/>

## Roadblocks & Solutions 🚧 💡

- **Provider limitations / subscriptions**  
  - Exact seek requires **Spotify Premium** or **Apple Music** subscriber.  
  - **Solution**: Gate exact snippets; provide **preview fallback**; clear UI copy.

- **Apple Music Developer Token**  
  - Needs Apple Developer account.  
  - **Solution**: Set up in **Week 1–2**; automate token generation; store securely.

- **Schema churn**  
  - Late changes break work.  
  - **Solution**: **Freeze schema by Week 2**; only additive changes later.

- **Mobile media quirks / latency**  
  - **Solution**: Keep prev/current/next mounted; pre‑seek next; first‑tap to enable audio.

- **Region/availability mismatches**  
  - **Solution**: Map both providers by ISRC; pick the best available source per viewer; show preview/deep link if neither plays.

<br/>

## Competition 🥊

- Spotify/YouTube playlists — audio only, no timestamped emotion  
- Last.fm — tracks plays, not memories  
- Songwhip/Odesli — link sharing, no social memory context  
- Instagram Notes - no storage/permanence
- Airbuds - no timestamped emotion, no personalized groupings  
- Smule/Reels Karaoke — performance‑focused, not listener moments  
- SoundCloud — timestamped comments exist, but public & creator‑centric  

<br/>

## Git Cheatsheet 📓

| Command                             | What it does                               |
| ----------------------------------- | ------------------------------------------ |
| git init                            | Initalize a new Git repo                   |
| git clone "rep-url"                 | Clone a repo from a URL                    |
|                                     |                                            |
| git status                          | Show changes status                        |
| git add "file"                      | Add changes to staging, use "." for all    |
| git commit -m "Descriptive Message" | Commit changes with a message              |
| git push                            | Upload local repo content to a remote repo |
| git log                             | View commit history                        |
|                                     |                                            |
| git branch                          | Lists all the branches                     |
| git branch "branch-name"            | Create a new branch                        |
| git checkout "branch-name"          | Switch to a branch                         |
| git checkout -b "branch-name"       | Combines the previous 2 commands           |
| git merge "branch-name"             | Merge changes from a branch                |
| git branch -d "branch-name"         | Delete a branch                            |
| git push origin "branch-name"       | Push to branch                             |
| git pull origin "branch-name"       | Pull updates from a specific branch        |
|                                     |                                            |
| git pull                            | Fetch and merge changes                    |
| git fetch                           | Fetch changes without merging              |
| git reset --hard HEAD               | Discard changes                            |
| git revert <commit-hash>            | Revert changes in a commit                 |

<br>

## SpinStack TEAM!!!! 🎶🫂

- Yugank Mishra
- Bradley Nguyen
- Haden Hicks
- Braxton Riggs
- Mohammad Mehrab - Project Manager
- Bryce Duncan - Industry Mentor

