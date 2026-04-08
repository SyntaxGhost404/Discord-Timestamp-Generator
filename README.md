# Word Counter Tool

A powerful, real-time Word Counter Tool designed for writers, students, and professionals. Get instant analysis of your text, including word count, character count, sentences, paragraphs, and a manipulation-proof Words Per Minute (WPM) meter. Save your work locally, manage your revision history with undo/redo, and access your data anytime, even offline.

## ✨ Features

This tool is designed to be the ultimate utility for text analysis, packed with features to make the process as intuitive and efficient as possible.

-   **Real-Time Analysis**: Instantly see statistics update as you type.
-   **Comprehensive Statistics**: Track words, characters, sentences, and paragraphs with precision.
-   **Advanced WPM Meter**: A smart typing speed calculator that intelligently ignores pasted text to provide a true measure of your typing skill.
-   **Robust History Management**: Browser-style **Undo** and **Redo** functionality. Your session history is continuously cached in the background (via IndexedDB) every 0.75 seconds without blocking the main UI thread.
-   **Save Your Work**: Store your text entries securely in your browser using IndexedDB (with a LocalStorage fallback) for offline access.
-   **Manage Saved Entries**: Easily browse, copy, or delete your saved work with a clean, paginated interface.
-   **Load Entries**: Seamlessly load a saved entry back into the editor for further modification. Includes a confirmation modal to prevent accidental overwriting of your current work.
-   **Text Utilities**: Quickly clear the editor, or convert your entire text to UPPERCASE or lowercase with a single click.
-   **Modern Dark Theme**: A sleek, modern dark mode aesthetic designed to reduce eye strain during long writing sessions, featuring a subtle grid pattern and pixelated typography accents.
-   **Responsive UI**: A beautiful, intuitive interface built with Tailwind CSS and Framer Motion that looks great on any device, featuring a responsive two-row action toolbar.
-   **Offline Functionality**: Works seamlessly without an internet connection thanks to local data storage.

## 🚀 How to Use

The application is split into two main sections for ease of use.

### 1. Counter Tab

This is the main workspace for text analysis.
1.  Start typing or paste text into the main text area.
2.  Watch the statistics for words, characters, sentences, and paragraphs update in real-time below.
3.  Your WPM score will be calculated based on your manual typing speed.
4.  Use the `Clear`, `UPPERCASE`, `lowercase`, `Undo`, `Redo`, and `Save` buttons to manage your content.

### 2. Saved Entries Tab

View and manage your saved work here.
1.  Click the "Saved Entries" toggle to view your stored texts.
2.  Use the "Previous" and "Next" buttons to navigate through pages if you have many entries.
3.  Click the **copy icon** to copy an entry's content to your clipboard.
4.  Click the **load icon** to bring an entry back into the Counter tab for editing.
5.  Click the **trash icon** to permanently delete an entry (you will be asked to confirm).

## 💻 Tech Stack

-   **Framework**: [React](https://reactjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) with a LocalStorage fallback.
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later recommended)
-   A package manager like [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  Clone the repository to your local machine.
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    ```
2.  Navigate into the project directory.
    ```sh
    cd your-repo-name
    ```
3.  Install the dependencies.
    ```sh
    npm install
    ```
4.  Start the development server.
    ```sh
    npm run dev
    ```
The application should now be running locally, typically at `http://localhost:3000`.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you find this tool helpful, please consider leaving a ⭐ star on the repository! It helps increase visibility and supports the project's growth.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 🙏 Acknowledgements

-   Created by [Moin Uddin](https://discord.com/users/794482283993235478) in collaboration with [Oli Ullah](https://x.com/itzsimonsmith?t=tkUyIzJRir_McvmapNWpOA&s=09).

## 📄 License

Distributed under the MIT License.
