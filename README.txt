Welcome to...

  🧩 AESTHETIC.COMPUTER 🧩

  A general interface / computer toy / art machine that...

  - Runs "pieces" instead of "apps" or "programs".
  - Works in updated web browsers on all major devices, including VR headsets! 
  - Comes with a processing-inspired API that's fun to learn
    and write interactive, audio-visual pieces for in JavaScript. 
  - Defaults to an accessible resolution and pixel density, great for learning
    and counting pixels with.

  (More technical)
  - Threaded logic, audio, and rendering.
    - Low overhead hypervisor that runs one piece at a time.
      (similar to a disk based operating system)
    - Pieces can transition from one to another (instantly) without refreshing
      the page or losing context. 
    - Pieces can load remotely of any `https://` url and link to other pieces via the API.
    - Pieces that stick to software-rendering are guaranteed accurate results on
      future runtimes, given that Math in JavaScript doesn't change.

*** Piecemaker Sources ***
  - Niki:  https://glitch.com/edit/#!/niki-aesthetic-computer
  - Artur: https://glitch.com/edit/#!/artur-aesthetic-computer 
    - [] Move this account off Glitch.
    - [] Make simple lessons.
  - Reas: https://glitch.com/edit/#!/reas-aesthetic-computer
  - Sage: https://glitch.com/edit/#!/sage--aesthetic--computer

🐞 Major Bugs & Regressions
  - [] `npm run code` does not work offline, due to netlify relying on online conectivity.
  - [] Fix Firefox AudioWorklet Initialization Bug `Error: Module resolve hook not set`
  - [x] Pull - fix pointer delta event in-accuracy.

🌟 Projects In Progress 🌟

*** Pieces: Prompt ***
 - [🔴] No more tildes for user paths...
      Instead, use an @ for usernames.
      eg. sage/piece
 - [] Up arrow for previous comand. 
 - [] Update MOTD. 

*** Pieces: Run&Gun ***
- [] Make a basic character with multi-platform controls.
- [] Make a ground for them to run on back and forth.
- [] Make something dangerous that can easily kill them. 
- [] Add a timer.

*** Density ***
 - [] Only allow density to be set as an export?
 - Or... prevent density from clearing the screen buffer.
 - [] Remove the frameCount hack.

*** API: Glaze ***
 - [] Be able to turn glaze on inside of remotely hosted pieces.
 - [] Add ability to update glaze uniforms via
     `glaze.params({uniform1: value, uni2: [0, 1, 2]});``
       function paint() {
         // user draw a dirty box that needs gpu processing as a tile larger than
         // the original pixel drawing
         glaze.params({
           crop: dirtyBox,
           samples: 12 // this dirtyBox will keep being glazed over for 12 frames
           uniform1: 1,
           uniform2: 2,
         });
         return dirtyBox;
       } 
 - [] Add "kiln" function to bake in a glaze at the end.
 
*** Load Image ***
  - [] From a URL into a buffer.
  - [] and then be able to paste it.
   
*** Save PNG ***
  - [] Stamp of URL 
   
*** Pressure ***
  - [] Get pen and finger working together.
       (When finger is drawing and pen is touched... is it recognized as pen?)
  - [] Pen: Get a good mapping for Apple Pencil / normalize the data. 
  - [] Touch: Two finger pressure. (Second finger regulates it via Y axis.)
  - [] Mouse: Use scroll wheel for delta. 

***Picture Architecture***
+ Now
- [] The painting resolution should auto-expand, but not contract.
- [] Add saving of webp or png images.
- [] Set up a glitch account / editing situation for Sage.
- [] Add `nopaint` template for Sage, Casey and Niki.
- [x] Write `rect` tool, which necessitates an extra buffer.
- [x️] Write boilerplate for painting tool.
- [x] Make a glaze appear instantly after it loads the first time?

***Android Day***
- [] Provision Android phone.
- [] Fix keyboard controls not working (this should also fix Meta Quest 2).

***Audio + Video Storage (Microphone)***
 + Now
  - [🌟] Add a "done" or "close" button to the recording UI / share sheet which
         re-activates the UI.
  - [] Add a special UI for uploading the file / receiving a code...
      so it's a choice?
  - [] Make the recording process re-entrant. (Don't reload ffmpeg each time?)  
  - [] Check to see if ffmpeg encoding can be skipped if the browser doesn't need to do it.
  - [] FFMPEG does not work offline: https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js - https://github.com/ffmpegwasm/ffmpeg.wasm#why-it-doesnt-work-in-my-local-environment
  + Later
  - [] Add more pointerevents to make a better / final record button: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
 + Done
  - [x] Add a progress bar / interstitial that runs while the file is encoding,
      preventing the user from being able to act.
      - [x] Test the interaction.
      - [x] Gray out the screen.
  - [x] Make microphone recording button a bit nicer.
  - [x] Add ffmpeg.wasm
  - [x] Fix microphone record button.
  - [x] Try to just upload the file directly here.
  - [x] Write a netlify serverless function and call it from the microphone
        piece... so the file can be uploaded.
    - [x] Netlify Serverless Hello World
    - https://www.netlify.com/blog/2021/07/29/how-to-process-multipart-form-data-with-a-netlify-function/

***Bleep***
 + Now
  - [] Support more wave types in `lib/speaker`.
    - [] Sine
    - [] Triangle
    - [x] Square
 + Later
  - [] Add support for playing samples.
  - [] Add the ability to play sound from other top level functions.
 + Complete
  - [x] Test multi-touch support on a phone.
  - [x] Add multi-touch support through bleep, via `pen`.
    - [x] Add support to `bleep`.
      - ui.mjs:69, bleep.mjs:162
      - Sidenote: https://marketplace.visualstudio.com/items?itemName=alefragnani.Bookmarks
    - [x] Write a `multipen` implementation example with a simple API.
  - [x] Why does the board generate twice on first load.
  - [x] Support roll-over after touch.
  - [x] Hide cursor on finger action, but show it during mouse action.
  - [x] Resize window support.
  - [x] Make a basic bleep box that makes a tone when you tap on it.
  - [x] Automatically generate bleep grids with a command line parameter for WxH.

***2D Whistlegraph Recorder*** (August 1st - Launch)
 - [] Only record frames that are not part of the interface.
   - [🟢] Make a DOM based button.
     - [] Attach events to it... figure out the smartest way to have it connect to `function act`?
     - [] Should I use a ShadowDOM for this or is it overkill...
          - https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM
   OR ...
   - [] Dump frames before painting the interface on top... via a pixel buffer
        being sent over the worker.
        (This might be slow)
        (Could be useful eventually... to selectively record video of certain pixel buffers, or render frame by frame.)
 - [] Record frames at a multiplied resolution over the original canvas.
 - [] Complete ***Upload Server***
 - [] Is there a way for a local install to still use codes? How would this be
      proxied and tested? Maybe with an environment variable and a separate
      upload server that has no expiration?
 - [] Store the video on a camera roll in a mobile browser.
 - [] Explore using the TikTok API Integration : https://developers.tiktok.com/apps
  - This should allow users to save / post? their video directly to TikTok from the web.
 - [] Two finger twist and zoom while recording... use vector data.
 - [X] Make sure that the audio and video are synchronized across devices.
      (Video seems delayed on iOS right now.)
 - [X] Record and playback the user's voice in `microphone`.
 - [X] Record the content of `microphone` as a video.
 - [Commented Out] Add an "audio engine off" system overlay / call to action
      that uses the DOM?
      - [X] It should be removed... each program should handle this on its own...
      - [X] Throw up the html if the audio engine is off and the beat function
            has not been exported.
      - [X] Add all the new Typefaces to CSS. (Berkeley Mono Variable, and Proce55ing)

 ***Upload Server***
 [] 1. Show the media (video) in a div overlay with a "Retry" or "Done" button.
   A. Retry - Removes the modal div and lets you re-record again.
   B. Done - Allows you to download the file immediately (if possible),
             and uploads it, giving you the code no matter what.
                             (The code page layout could be shared here.)

 [] 2. After the file uploads...
   A. You can also have the option to "Post" or "Publish?" which
   will make the work available as part of an ever-growing collection.
     - Idea: Posts are automatically minted to our wallet, but can optionally
             be minted to a poster's wallet if they decide to connect.
   B. Regardless, the file stored at the code will be deleted in 24 hours.
     - [X] Setting expiration policies on DO spaces: https://www.howtogeek.com/devops/how-to-set-an-expiration-policy-on-digitalocean-spaces-buckets
     - [X] Follow along with – https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
                            - Using multipart-form-data
          Using             - https://www.npmjs.com/package/fastify-multer
          Get code via      - https://glitch.com/edit/#!/nopaint-server?path=server.js
     - Inside of TikTok
       - Tell the user their video is ready and they can visit
         aesthetic.computer/CODE in a browser
         to download their video, which expires after 5 minutes.

         aesthetic.computer/microphone -> aesthetic.computer/dl.bn67gff5
         aesthetic.computer/get.dfcx4

         After recording in the microphone, you get this...

         aesthetic.computer/mic -> aesthetic.codes/bn67gff5
         ... or
         aesthetic.computer/mic -> codes.ac/bn67gff5
           (where codes.ac/bn67gff5 -> aesthetic.computer/codes.bn67gff5)
           (and the resource is stored at -> bin.aesthetic.computer/bn67gff5.ext)
                                             art.aesthetic.computer/...

         A pop-up that shows a QR code / a code to enter into aesthetic.codes.
         Upon visiting aesthetic.codes...
     - iOS or Android Mobile Browser or Desktop Browser
       - 1. Show a download button
     - in a native iOS app
       - let the user download the video immediately to their camera roll
     - Where do recordings / files get stored? What is the userflow...
       - Do they get stored at a special code, then users can
         go to the website / open another window and mint from the code
         or download it?
 - [] Look into categorizing uploaded objects with tags...
 https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-tagging.html
 - [] And making use of user defined metadata in s3.
      These would be great for custom file properties likw
      what piece was used to make the art / object and what git commit
      of the project was used or something like that...
      
***Don't Go Upstairs***
  + Plans
    - An interactive story, told in multi-piece parts: https://twitter.com/digitpain/status/1567690125743919104/photo/1
    - This should serve as a test for fast-transitioning / preloading and
      sequencing pieces.
    - Use old Vectrex animation software as inspiration for the editors.
  + Now
    - Make a sub-directory for the pieces, and adjust the prompt so that
      if no file exists in the subdirectory then it checks an `index` file.
      
***3D Spatial Co-present Drawing***
  ***A-Frame Integration***
  - Prototype:
    - Either way:
      [] Set up an orthographic camera and mouse-enabled drawing for desktop users
         of the a-frame layer.
      [] Read source code of a-painter: https://aframe.io/a-painter/

    -  iframe method:
        [X] Make sure the "escape" and "~" key is handled (see Whistlegraph).
        [X] Set cursor to none on the iframe.
        [X] Send events from the iframe back to the main window.
        [X] Use those events to update the a.c cursor.

    -  Non-iframe method (why would this be better... maybe for recording?) [hold off for now]
        [] Get aframe script tag loading inside of the body then
           inject the scene.
***Explore VR without A-Frame***
  ***Without A-Frame***
   - [] Clone the basic WebXR examples, run them and and read them.
        URL here: https://github.com/immersive-web/webxr-samples

*** Re-organize Repository *** 
  - [] Make a better entry point for this repository, consider how far the
       monorepo idea should extend and make better room for text files, such as
       splitting up README.txt with PROJECTS.txt, WIP.txt, and GRAVEYARD.txt.

*** Publishing ***
  - [] How to have a default or custom thumbnail... even though things are randomly routed?

*** Refactoring ***
  - [] Clean up the use of "aesthetic.computer/disks/" across the whole project.
  - [] Refactor `wg` to make better use of thumbnails... what should the new structure be?

*** Favicons ***  
  - [] How should I generate favicons for each page or treat favicons in general?
   - Maybe just design a favicon? Should each piece also be able to have an icon?
   - Maybe the system could use these icons if pieces defined them...

***Terminal***
  - [] Make `function terminal()` to render to a text mode layer.

***Cursors***
  - [] View current custom cursor css examples.
  - "Chromium cursor images are restricted to 128x128 pixels by default, but it is
    recommended to limit the cursor image size to 32x32 pixels" - https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
  - [] Sidetrack: Hack in an SVG cursor really quick.
  - [] Replace Canvas 2D cursors with SVGs (or DIVs?).
  - [] Test to see what's the fastest these days? Check for scaling issues on linux (see Figma...)

***JtoA***
  - [] Use web speech recognition API to make a program so that Artur and I can 
      communicate more complex thoughts.
      - https://www.google.com/intl/en/chrome/demos/speech.html
  Note: It's only gonna work in Safari on iOS. <https://bugs.webkit.org/show_bug.cgi?id=225298> (And if Dictation is enabled.)

***Spinline***
  - [] Circle algorithm with transparency, has doubly drawn pixels.
  - [] example: ink(255, 100).circle(x, y, 128);
  - [] Circle needs 'pan' support.
  - [] Make the regular circle small, and positioned at the tip of the rotating line.
  - [] No exported boot function does not show the mouse cursor...
  - [] Click and drag selection bug needs to be fixed on iOS. (Chrome + Safari)
  - [] Improve "density" function.

***Developers***
  - [] Add developer console log / catch errors and show them to users
       directly on the screen. Maybe this should be available all the time,
       even in production?
  - [] Catch errors better in the modules, so they can be easily deciphered
       from console messages.
  - [] Get it working on: https://glitch.com/edit/#!/niki-aesthetic-computer
  - [] Make an `edit` or `new` command to open an editor from the main page.

***View-Source***
  - [] Pressing 'Ctrl + `' should open the source code. - Document this in console.log of bios.
  - [] Typing `src` plus the `piece` should jump you to the github source page and these should also be url addressable.
  - [] Each page should print out its own description in the console.
   - [] Then all descriptions of existing pieces can be written.
   - [] Why are the disks located there in the first place?

***Readme***
  - [] Directly load the GitHub readme in a scrollable content window.
  - [] How could this tie into publishing a blog or devlog?

***i***
  - [] See `disks/i.mjs` 

***Walkie Talkie***
- [] Maybe recordings / videos can be sent back and forth between two parties?

***Shortcuts / open a new URL ***
  - [] Figure out notation: ~user/piece, piece~param1, #notion
    - [] Should this only be for `prompt` or should it also route URLs?
  - [] Make `manual` and `hq` load the notion (separate places) in a new tab.
  - [] Should the manual be a super.so site using one of the chosen typefaces?

***Prompt Start***
  - [] What info goes on the starting prompt page?
       Given that it can change every 60 seconds.
       And anyone who shares the link will see a preview image.
  - [] Short poem? Weekly poem?
  - [] Make the prompt start message easily editable by Niki.
    What would it mean for this message to use the ***Upload Server*** and merit
    a text editor.

***Prompt Updates***
  - [] “search bar” any letter typed shows “ghost” letters of all possible options
  - [] Also make the commands case insensitive!

***Rooms***
  (WIP Notes)
  - Pieces can either be singleplayer or multiplayer, but rooms work everywhere!
  - All piece changes are global. People can only be in one piece at a time together.
  - Start a room with other people and their mouse cursors / fingers appear as pixels.
  - People can join rooms different devices simultaneously.

***Basic Server Work / Rooms / Synchronized Metronome***
  - [] How to get metronomes syncing across a network?
       aesthetic.computer/metronome.180.red
       aesthetic.computer/metronome_300.yellow
       aesthetic.computer/metronome-180.black
       aesthetic.computer/metronome~180.blue

  Option 1: Visit rooms.ac to get a roomID which can be added to a command.
  Option 2: Automatically get a room with every new tab.
            - Join another room using `room roomID`.
            - Entering an activity is part of the room.
            - There should be a basic "shout" program for rooms.

 ***Socket Server*** 
  - [] Fix server.aesthetic.computer... maybe just take it offline for now?

***World***
 - [] Make an interconnected series of pieces that players can walk between, and
      maintain a server connection throughout.
 - [] Players should be able to wave or point their arm.

***Developer / User Login***
- [] Change the contents of user.aesthetic.computer/login.mjs to  ...
   - This would prompt the author to edit a string in login.mjs to match, which
     would grant them a javascript web token?.
   - Look up netlify identity... https://docs.netlify.com/visitor-access/identity

***Thumbnail Longtail***
  - [] Get the external thumbnail server running on a VPS to see how fast it is
       compared to the netlify function.
  - Provision a machine that can actually execute `npx playwright install chrome`.
  - [] Optimize netlify function... switch to jpeg to see if it's any faster? 

***Routing Longtail***
- [] Do away with hashtag routes entirely.
- [] Refactor ":" parameter encoding (see `wg`) into using classic url parameters.
  - [] Or just use one of these special characters: `. _ ~ -`

      aesthetic.computer/wg.fuzz
      aesthetic.computer/wg_fuzz
      aesthetic.computer/wg-fuzz
      aesthetic.computer/wg~fuzz
      aesthetic.computer/metronome~80~100

      aesthetic.computer/~niki/plot~40~50
      aesthetic.computer/~niki/plot~40~50

      // Maybe the special characters could be default parameters, or represent
      // types of some kind?

      Available domains:
        - prompt.ac
        - wgr.ac (whistlegraph recorder)
        - wgl.ac (whistlegraph live)
        - jas.ac (my new homepage)
        - aesthetic.run
        - aesthetic.codes
        - aesthetic.cx

**Image Viewer / Media Viewer**
 - [] Write a great image-viewer that implements the `rdp` piece.
 - [] Also implement `tumpin`, `ten-minute-painting`, and `basedballz`.
 - [] Add my small series of Tezos 1of1s as well: `emokidpix` and `1bits`.

***Model Viewer***
 - [] Implement <model-viewer> for my 3d glb files so that when I share
      them to Twitter they can be in 3D, and also so that they can be wrapped
      as aesthetic.computer pieces.
      - https://modelviewer.dev/examples/twitter/generator.html

🪟 Browser Quirks
 - [] Development server only: videos don't load in Firefox (tested on Windows). 2022.05.07.00.01
 - [] Make the cursor faster / match the speed of the native cursor.

*** 🎃 DIGITPAIN ***
 - [] Complete DIGITPAIN 0-5.
 - [] Mint the work and have the contract made.
 - [] Make a frame capture tool for generating webp images.
 - [] Add the work to the JSON and release digitpain.com.
 - [] Write a better static exporter script includes only the disks I want, plus resources.
     - [] Automate DIGITPAIN (Teia) exports:
            1. Clone `public` directory.
            2. Remove any `.html` files that aren't `digitpain-ipfs-index.html`.
            3. Process `digitpain-ipfs-index.html`, inserting info for a new mint.
            4. Rename `digitpain-ipfs-index.html` to `index.html`.
            3. Remove all files other than `/digitpain` and `digitpain0.js` from `disks/`.
            4. Zip the contents so there is a zip file with one directory called `public`,
               and rename it to `DIGITPAIN #.zip`.

🌟 Next In Line 🌟
 ***Transcribe the original Proce55ing typeface***

 ***Multi-player Drawing / Core Drawing***
  - [] Allow users to join / create rooms with codes (QR codes esp.)
  - [] Abstract `line` and `spline` into `nail`. See also: `gesture`.
  - [] Add sound to `nail`.
  - [] Use https://wicg.github.io/video-rvfc/ for video frame updates.

 ***No Paint***
  - [] Should the old nopaint.art be reachable from within aesthetic.computer
  - [] Should a new nopaint be built from scratch?

 ❤️Side Missions❤️
  - [] Finish learning about Tezos, LIGO: https://academy.ligolang.org/pascal/chapter-types
  - [] Chalkboard / material simulation.
  - [] Try and get fullscreen on iOS / iPadOS again... maybe sideload the app shim?
  - [] Add `every("1s", () => {})` shortcut to the `sim` api. 
  - [] How to limit the number of Frame's in the start of a disk?
       Perhaps I could have a hidden meta-programming setup line at the top?
  - [] (disk.js:28) Make this a boot choice via the index.html file?
  - [] Fix skippy scale rendering of pixels on non-retina displays.
  - [] Bake `wrap` and `pixel` into the api. 2022.02.01.02.46 (JAS) [via sage.js]
  - [] in `tracker.js`: Recenter boxes on line 174.
  - [] Multiplayer board reset in `spray` and `server`.
  - [] Global recording of user actions (what about application actions) and
       audio+video into one file?
  - [] Prototype the dream I had about a system-wide, radial menu.
  - [] Write a file editor for something crucial in aesthetic.computer, like a
       TODO: Program, or produce media to store with GIT-LFS.
       See also: https://web.dev/file-system-access
       And: https://googlechromelabs.github.io/text-editor
  - [] Make a VSCode extension that opens an official aesthetic.computer pane?

*Recently Completed*

*** Safari Day ***
- [-] Thin lines appearing from `gap` and no gap in mobile Safari.
- [x] Grey selection bubble appears in mobile Safari.
- [x] Loading spinner not appearing in mobile Safari. 
- [x] Fix iOS Safari page refresh bug. (Test on MacBook Pro)
  (Needed `Vary: *` http header, to prevent Safari's cache from bugging out
  on the SharedArrayBuffer / isolatedOrigin CORS headers.)

***Tracker, Pull***
- [x] Fix interface boxes.
- [x] Make `boxes` test piece.

 ***Meta***
 - [x] Add support for custom / locally generated thumbnail overrides.
   - [x] Test override for some specific route... maybe blank?
 - [x] Serve a 404 page for anything else that breaks.
   - [x] Right now it just crashes here: https://aesthetic.computer/okok
   - [x] Right now it just is black here: https://aesthetic.computer/~niki/whatever
 - [x] Do the TOML routes actually matter? No.
 - [x] Get ~/niki/blank working again.
 - [x] Separate out / parse the text before loading a disk serverside so that
       parameterized disks work again.
 - [x] Make them work on iOS
 - [x] Write a new netlify function that returns the proper html for every page,
       so that prerendering can be turned off (get imessage previews working).
 - [x] Should og:image and twitter:image have file extensions?

***L8 Night***
- [x] Get a debugger working. 

***2D Drawing Primitives for Niki***
 - [x] line from point... at angle with distance
 
***Routing & Twitter Cards***
 - [X] Figure out how to get open-graph info and twitter cards working for all of a.c?
      - [X] How should the og:images be made? Perhaps a special tool is needed or screenshots
           can be taken automatically?
      - [x] Set defaults if the info isn't there...
- [x] Test Netlify pre-rendering to see if it functions.
- [x] Use netlify's pre-rendering and (it's already turned on... and change the og:title)
- [X] Enable Netlify pre-rendering.
       - Validator: https://cards-dev.twitter.com/validator
       - Prototype: https://glitch.com/edit/#!/pepper-efficacious-yellowhorn?path=index.html
 - [X] Implement path based routing for pieces via netlify and on a local dev server.

***User Pieces (niki.aesthetic.computer)***
- [x] History breaks right now across domains, because some parsing goes through the `prompt`.
  - [x] Make sure loading using the `tilde` key works across hosts.
  - [x] Start remote routing from boot instead of only in prompt?
      - [x] Make a `parse.js` library file that can be used in `prompt`, then `boot`.
      - [x] Copy the code from prompt and replicate it in boot, then
      - [x] follow the logic through to check for inconsistencies.
      - [x] Remove `search` from `disk.js` load. (Deprecrate reading queryParams
        at the disk level... they should only be reserved for system settings?)
- [x] Also, the page can't refresh and the path gets rewritten improperly. 
- [x] Get `niki.aesthetic.computer` running.
- [x] Get a prototype of Niki's piece working that she can actually edit as the first user.

***Server Re-organization***
 - [x] Should the uploader be a serverless function? Yes!
      (This would prevent the need for a load balancer if file uploading was a bottleneck.)
      (Would it run locally?)
 - [x] Set netlify environment variables for the digital ocean space.
 - [x] How to run two server processes from one npm command?
 - [x] Should the websocket server run as a separate process from the http api?
 - [x] Should it run on a separate machine as of now?

***Editor***
- [-] Get socket server running under GitHub codespaces as well.
  (wss:// is currently unsupported)
- [x] Get the project working in GitHub codespaces.

🐛 Completed Bugs & Regressions
  - [X] Check to see why custom thumbnails are broken for remote URL disks.
  - [X] `wg` disks no longer work 
  - [X] Kill any microphone (or video) connection after leaving a piece it's connected to.
  - [X] Routing: Check ~tilde~ key - don't push duplicate states in the history.


⏳ Investigate ⏳

* Bugs / Improvements

  Stop sending duplicate event data for "draw" and "touch" in `pen`.
    - e.is("draw") && e.is("touch") should not send duplicate event {x, y} data
    
  Explore: removing: send({ type: "update", content: { didntRender: true, loading } });
  From the bottom of `disk.js`.

  Add blockchain integration for identity: https://docs.moralis.io/introduction/readme
  
  Re-work the depth buffer (in the rasterizer) before making a simple 3D environment?

  Pass 'diskTime' global into the api.

  Add $api.sound.beatCount counter to `beat`.

  Add scriptProcessorNode fallback so audio can run within insecure contexts. (FigJam)

  Stop tracks in all mediaStreams: https://stackoverflow.com/a/12436772
  (Video and Microphone)

  Refactor (screen.width -> screen.w & screen.height -> screen.h) across the board?
    - To be more consistent with `graph.box`.

  Workers can be wrapped in this... https://benohead.com/blog/2017/12/06/cross-domain-cross-browser-web-workers/


* Ideas

  Sidelight
    - A light you can set the color off.
    - Make it flicker.
    - Have presets.
    - Very useful for making videos with an extra device!

  Generative tone matrix.
    - Make microtonal grids of different sizes that can be easily played on
      any device. Use options to specify or control the parameters of the
      instrument.
    - Sliding your finger across notes is different from tapping.
    - It should be easy to record a video and/or audio.

  Rewrite my old Python `Diary` program.
    - Mint diary entries.

  Remake Shrub

  Improve documentation.
    - In console when the whole thing opens.
    - Have a global keyboard shortcut to spit documentation to console... for each
      function!
    - Get jsDocs working: https://jsdoc.app/about-configuring-jsdoc.html

  Make Shrub.

  Development Improvements
    Would the best way to produce a scripting language be by making a fully
    curry-able system or some domain specific languages using `` then
    combining them?
    -- See here for a notation example of inline s-expressions: https://hag.codes

    Could an editing session or new disk be started from the prompt? Maybe it
    could load a GitHub codespace?

    - How to make use of xterm.js? Could it be used for this project or not...

  Implement drawing / gesture based disk launchers from the prompt.

  Take over right click so no context menu shows up.

  Ink types? ... can they be procedural using a buffer?

  What would a build script for releasing a single disk or
  stack of disks look like?

    1. Make a new directory D for the build.
    2. Copy a subset of /disks/public to D/disks
    3. Copy index.html, style.css, boot-rolled.js and /computer to D.
    4. Modify boot-rolled.js to start loading from the first listed disk.
    5. Generate metadata.json for the work.
    6. Zip and upload to fxHash or put whole directory into Pinata.
    7. Test to make sure everything works.
    8. Mint on a contract (or Cancel and remove files from IPFS).

  What would a full system / suite release look like?

    Using the build script with a set of chosen disks where the main
    disk is a shell interface.

    Document the API by generating the commands inside a disk and print
    them to the console using keyboard shortcuts.

    - [] Generate full API docs in the prompt disk.

  Make my first generative disk / piece and mint it.
    - Test it in Chrome / Safari / and Firefox.
    - In larger multi-disk IPFS exports, a new root path must be defined other
      than `prompt`. See disk.js `load` function.

  Make a quick fullscreen button (make a new keyboard input module).

  Fix Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1247687

  Add a new deployment scheme that actually allows my websocket server to
  function... this might mean leaving behind Vercel or configuring it
  for different directories in my repository, running separate server code
  for sockets.

  Add syntax notification of some kind for disk files, using a comment at
  the top. This would eventually allow me to completely
  change from JavaScript.

  Add stochastic syntax / DSL for basic drawing?
  Example: wipe.ink.line.line.line.ink("red").box;

  What cryptocurrency / web3.js lib would I hook an editor up to
  for minting, uploading edition data, etc?

  Make a video-recording app that generates 3 letter codes? - to augment
  my hand-written notes and pages.

  Add ability to define the logical / simulation framerate.

  Give myself the ability to automate testing of system using "robot".

  Write a simple note taking program with saving and loading of drawings
  and also recording and playback?


🎃 SETUP 💾

`aesthetic.computer` is virtual computer environment / interface designed for
 creative exploration. development requires `nodejs`, `git-lfs`, an up-to-date web browser,
 and knowledge of javascript. if you're interested in learning how to do any of
 this, visit https://discord.gg/digitpain and i'll help you out - jeffrey 2022.04.24.05.05

Make sure `git` and `git-lfs` is installed, (you can do that through `homebrew`) and then get set up for development:
  0. Check `ssl-dev/readme.txt` to generate SSL certificates before running locally for all features to work.
  1. `cd` into `server` and run `npm install` and `npm run dev` to start the socket server. (optional)
  2. `cd` into `system` and run `npm install` and `npm run dev` to start the web server. (required)

🧩 Making a new included piece.
- Run `npm run new-piece -- name-of-your-piece` 
- Then open the file in `system/public/aesthetic.computer/disks` and start working!

📖 This project originally began as two separate repositories with their own
commit history: `digitpain/system` and `digitpain/disks`.