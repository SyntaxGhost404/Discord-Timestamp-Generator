# Word Counter Tool

A powerful, real-time Word Counter Tool designed for writers, students, and professionals. Get instant analysis of your text, including word count, character count, sentences, paragraphs, and a manipulation-proof Words Per Minute (WPM) meter. Save your work locally, manage your revision history with undo/redo, and access your data anytime, even offline.

## ✨ Features

This tool is designed to be the ultimate utility for text analysis, packed with features to make the process as intuitive and efficient as possible.

### 📊 Core Analysis
- **Real-Time Statistics**: Instantly track words, characters, sentences, and paragraphs as you type.
- **Intelligent WPM Meter**: A smart typing speed calculator that intelligently ignores pasted text to provide a true measure of your typing skill.
- **Dynamic Grid Layout**: The statistics cards automatically adapt their grid structure (e.g., 4x1, 2x2, 1x4) based on the character length of the numbers, ensuring perfect rendering for massive documents (supporting up to 18 digits per metric).

### 📝 Advanced Editing
- **Active Editing Mode**: When loading a saved entry, an "Active Editing" banner tracks your session. You can choose to overwrite the original file or save your edits as a brand new copy.
- **Decoupled Clear Action**: Clearing the editor empties the text box but preserves your "Active Editing" link, allowing you to rewrite an entry from scratch before overwriting it.
- **Robust History Management**: Browser-style **Undo** and **Redo** functionality. Your session history is continuously cached in the background every 0.75 seconds without blocking the main UI thread.
- **Quick Actions**: Format text instantly with one-click UPPERCASE, lowercase, and clear actions.

### 💾 Storage & Management
- **Local-First Storage**: Store your text entries securely in your browser using IndexedDB (with a LocalStorage fallback). No servers, complete privacy.
- **Interactive Pagination**: Navigate through your saved entries with a premium, interactive page indicator. Click the current page number to open a "Jump to Page" modal for instant navigation.
- **Manage Saved Entries**: Easily browse, copy to clipboard, load into the editor, or permanently delete your saved work.

### 🎨 UI/UX & Technical
- **Progressive Web App (PWA)**: Fully installable on desktop and mobile devices. Works 100% offline.
- **Modern Dark Theme**: A sleek, modern dark mode aesthetic designed to reduce eye strain, featuring a subtle grid pattern, pixelated typography accents, and fluid Framer Motion animations.
- **Responsive Design**: Optimized for all devices. Work seamlessly across your desktop, tablet, and mobile phone.
- **Dedicated Help Section**: Built-in feature guides and an expandable FAQ section to help you get the most out of the tool.

## 🚀 How to Use

The application is split into three main sections for ease of use.

### 1. Counter Tab
This is the main workspace for text analysis.
1. Start typing or paste text into the main text area.
2. Watch the statistics update in real-time.
3. Use the action toolbar to format text, undo/redo changes, or save your work.
4. If editing a loaded entry, an **Active Editing** banner will appear. You can dismiss it via the 'X' to break the editorial link without losing your text.

### 2. Saved Entries Tab
View and manage your saved work here.
1. Browse your stored texts with the paginated interface.
2. Click the **Page Number button** to quickly jump to a specific page.
3. Use the action icons on each card to **Load** (arrow), **Copy** (clipboard), or **Delete** (trash).

### 3. Help Tab ('?')
Access the built-in documentation.
1. Review the feature cards for a quick overview of the tool's capabilities.
2. Expand the FAQ accordions for answers to common questions and edge cases.

## 💻 Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) with a LocalStorage fallback.
- **Icons**: [Lucide React](https://lucide.dev/)
- **PWA**: Vite PWA Plugin

## 🛠️ Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- A package manager like [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup
1. Clone the repository to your local machine.
   ```sh
   git clone https://github.com/your-username/your-repo-name.git
   ```
2. Navigate into the project directory.
   ```sh
   cd your-repo-name
   ```
3. Install the dependencies.
   ```sh
   npm install
   ```
4. Start the development server.
   ```sh
   npm run dev
   ```
The application should now be running locally, typically at `http://localhost:3000`.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you find this tool helpful, please consider leaving a ⭐ star on the repository! It helps increase visibility and supports the project's growth.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgements

- Created by [Moin Uddin](https://discord.com/users/794482283993235478) in collaboration with [Oli Ullah](https://x.com/itzsimonsmith?t=tkUyIzJRir_McvmapNWpOA&s=09).

## 📄 License

Distributed under the MIT License.
