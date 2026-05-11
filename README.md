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

## Description

This is a rebuild and refactor of my first fullstack minesweeper game into a serverless Next.js app, using a zustand store. The database of users was removed and styling was enhanced. I created a first attempt with react-dnd, and then optimized by removing dnd and switching to a DOM-based Pointer Event system.

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) ![Next JS](https://img.shields.io/badge/Next-black.svg?style=for-the-badge&logo=next.js&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=for-the-badge&logo=PostgreSQL&logoColor=white)

## Visuals

This app has been deployed to Vercel. Visit the site: [Solitaire Next.js](https://nx-solitaire.vercel.app/)

![pic1](https://github.com/user-attachments/assets/e15545a2-c388-4fad-a517-22426a19e132)
![pic2](https://github.com/user-attachments/assets/78a042ff-8b67-4f14-8759-2fcb28dd8bd4)
![pic4](https://github.com/user-attachments/assets/74a9d0e0-6ab2-4911-9d22-1ddda94e0905)

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

- SPA App Router in Next.js
- Auth using jose, JWT, bcrypt, AuthContext Provider wrapping Layout
- Prisma Neon DB
- Zustand for store, game state management
- useMemo to avoid memory leaks
- react-draggable
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

The author acknowledges and credits those who have contributed to this project.

## License

Distributed under the MIT License. See LICENSE.txt for more information.

## Project status

This project is complete. Currently highscores page, if any, is just for display, further development is needed to allow users to submit their scores.

## Optimization:

## Lighthouse scores:

Performance = 80
Accessibility = 90
Best Practices = 100
SEO = 100

## TO DO:

- Move Styling into another file, e.g. globals
- Make a highscores page and db storage like minesweeper, recording user name/ref + time taken + number of moves

- [x] foundation dnd order
- [x] foundations have suits
- [x] dnd rules for stockpile
- [x] stockpile cycles
- [x] create dnd game rules for foundation
- [x] create dnd rules for tableau
- [x] front and back/flip cards
- [x] cards are stacked in pile
- [x] Memoized game
- [x] change inline styling to tailwind classes
- [x] optimize memory and efficiency
- [x] enable dragging tableau stacks
- [x] make responsive and enable mobile play
- [x] change card appearance to enable display stacked for card stack dnd
- [x] remove trash debug dropzone
- [x] remove 'column...', 'waste', 'tableau'
- [x] move foundation icon into box

- [ ] restart/redraw game
- [x] win screen, move count, time taken.
- [ ] restyle stockpile reset btn
- [ ] fix up GUI for pointer event system

- [ ] time, undo move , hint

- [ ] when a column is empty, is collapses - make sure they don't