# InstaPopUp

Violentmonkey userscript that removes the login pop-ups Instagram shows to logged-out visitors while browsing public profiles on desktop.

## What it does

- Hides the "Sign up / Log in" pop-ups that appear when scrolling a profile wall, and keeps the page scrollable.
- Opens a post page directly when a thumbnail is clicked. Instagram only shows a login wall for that click, while the post page itself is public.
- Detects pop-ups by structure (short card with sign-up/log-in actions), not by text, so it works in any UI language.
- Leaves the cookie-consent dialog and the real login page (`/accounts/*`) untouched.

## Install

1. Install [Violentmonkey](https://violentmonkey.github.io/).
2. Create a new script, paste the contents of [`instagram-no-login-popup.user.js`](instagram-no-login-popup.user.js) and save.
3. Reload `https://www.instagram.com/`.

## Limitations

- Opening a post reloads the page, so Back returns to the top of the profile wall.
- Instagram changes its markup often; if a pop-up reappears, the structural check in `isLoginDialog` may need adjusting.
