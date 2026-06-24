# Solitaire 2.0

## Table of Contents

- [Description](#description)
- [Badges](#badges)
- [Visuals](#visuals)
- [Installation](#installation)
- [Tech](#tech)
- [Support](#support)
- [Contributing](#contributing)
- [Authors and Acknowledgment](#authors-and-acknowledgment)
- [License](#license)
- [Project Status](#project-status)
- [Tasks](#tasks)

## Description

This is a rebuild and refactor of my first fullstack minesweeper game into a serverless Next.js app, using a zustand store. The database of users was removed and styling was enhanced. I created a first attempt with react-dnd, and then optimized by removing dnd and switching to a DOM-based Pointer Event system.

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react) ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) ![Next JS](https://img.shields.io/badge/Next-black.svg?style=for-the-badge&logo=next.js&logoColor=white) ![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white) ![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF) 

## Visuals

This app has been deployed to Vercel. Visit the site: [Solitaire Next.js](https://nx-solitaire.vercel.app/)

![pic1](https://github.com/user-attachments/assets/952b1607-ce61-4d80-8d27-2fe27363115a)
![pic2](https://github.com/user-attachments/assets/3f3b9608-ea93-4a2e-aff1-ff7d98ccce18)

## Installation

Play through app site, no installation required. Otherwise clone into local machine and open on IDE:

```bash
# clone the repo
git clone https://github.com/sifzerda/nx-solitaire.git

# move into directory
cd nx-solitaire

# install dependencies
npm install

# run server
npm run start
```

## Tech

- Next.js App Router
- custom dnd
- State management:
  - zustand
  - immer for store
- useMemo
- fireworks.js react package [here](https://www.npmjs.com/package/@fireworks-js/react?activeTab=code)
- Vercel

## Support

For support, users can contact me through my portfolio contact form: [here](https://next-portfolio-sifzerdas-projects.vercel.app/contact)

## Contributing

Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". 
1.	Fork the Project
2.	Create your Feature Branch (git checkout -b feature/NewFeature)
3.	Commit your Changes (git commit -m 'Add some NewFeature')
4.	Push to the Branch (git push origin feature/NewFeature)
5.	Open a Pull Request

## Authors and acknowledgment

The author acknowledges and credits those who have contributed to this project, including:

- [fireworks-js](https://github.com/crashmax-dev/fireworks-js)

## License

Distributed under the MIT License. See LICENSE.txt for more information.

## Project status

This project is complete. 

## Tasks:

- [x] restart/redraw game
- [x] win screen, move count, time taken.
- [x] restyle stockpile reset btn
- [x] fix up GUI for pointer event system
- [ ] time, undo move , hint
- [x] when a column is empty, is collapses - make sure they don't
- [x] currently can dnd out anywhere in tableau column, needs fix
- [x] add rust and tauri
- [ ] optimize winscreen