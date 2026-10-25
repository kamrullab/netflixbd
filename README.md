# NetflixBD

[![Live site](https://img.shields.io/badge/live-netflixbd.pages.dev-e50914)](https://netflixbd.pages.dev/)
[![CI](https://github.com/kamrullab/netflixbd/actions/workflows/ci.yml/badge.svg)](https://github.com/kamrullab/netflixbd/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

NetflixBD is a lightweight, single-page movie and TV discovery interface. It searches IMDb suggestions and uses TMDB metadata to present title details in a clean, responsive interface.

**Live site:** [netflixbd.pages.dev](https://netflixbd.pages.dev/)

> This project is not affiliated with, endorsed by, or sponsored by Netflix. Netflix and related marks belong to their respective owners. Availability and behavior of third-party data and video providers are outside this project's control. Use the project only where permitted by applicable law and the providers' terms.

## Features

- Movie and TV-series search
- Shareable search and title URLs
- Rich title details, genres, ratings, and season counts
- Responsive, framework-free interface
- Progressive Web App manifest and service worker
- No advertising, analytics, popunders, or embedded video providers

## How it works

The browser requests search suggestions through the configured CORS proxy, resolves IMDb identifiers to TMDB identifiers, and displays catalogue metadata. The app has no application server or database.

External services currently used by the app:

- IMDb suggestion data
- TMDB metadata API
- A CORS proxy hosted on Cloudflare Workers
- Google Fonts

Third-party catalogue services may have their own privacy practices and availability limits. NetflixBD does not include a video player or streaming embed.

## Run locally

```bash
git clone https://github.com/kamrullab/netflixbd.git
cd netflixbd
npx serve .
```

Then open the local URL printed by the server. A local server is recommended because service workers and browser security rules may not work correctly when `index.html` is opened directly from disk.

## Deploy

The project is a static site and can be deployed to Cloudflare Pages without a build command:

- Build command: leave empty
- Build output directory: `/`
- Production branch: `main`

## Configuration

Player URLs and third-party endpoints are defined in [`script.js`](script.js). The current TMDB API key is shipped in browser code and should be replaced with your own restricted key or moved behind a server-side function before production use.

## Privacy

This fork does not include ads, analytics, popunders, or streaming embeds. Search, metadata, poster, and font requests still go to the external services listed above, which can receive normal request information such as an IP address and browser headers. See the [Privacy Policy](privacy-policy.html).

## Contributing

Bug reports and pull requests are welcome in the [GitHub repository](https://github.com/kamrullab/netflixbd).

## Credits

This repository is a fork of [pulkitpareek18/netflix](https://github.com/pulkitpareek18/netflix). It uses IMDb and TMDB data and the Pace.js loading indicator. Please retain attribution required by upstream code and third-party services.

## License

Released under the [MIT License](LICENSE).
