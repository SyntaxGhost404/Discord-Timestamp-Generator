# Discord Timestamp Generator

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=vercel)](https://discord-timestamp-gen.pages.dev/)

A sophisticated, visually stunning Discord Timestamp Generator that operates in real-time. Type any natural language date or time to instantly generate Discord-compatible timestamps, convert timezones, or reverse existing timestamp codes.

![Discord Timestamp Generator Banner](https://i.ibb.co/bF9gV2x/discord-timestamp-generator-banner.png)

## ✨ Features

This tool is designed to be the ultimate utility for all your Discord timestamp needs, packed with features to make the process as intuitive and efficient as possible.

-   **Natural Language Processing**: Simply type dates and times like `"tomorrow at 4pm"`, `"next Friday"`, or `"in 3 hours"` and get instant results. Powered by `chrono-node`.
-   **Manual Date & Time Picker**: Use a beautiful and intuitive calendar and time inputs to select a precise moment.
-   **Timezone Converter**: Easily convert a date and time from one timezone to another, perfect for scheduling international events.
-   **Reverse Generator**: Paste an existing Discord timestamp code (e.g., `<t:1672531200:F>`) to see the human-readable date and time.
-   **Instant Previews**: See how each timestamp format will look inside Discord before you even copy it.
-   **Keyboard Navigation**: Fully accessible via keyboard. Use arrow keys to navigate suggestions and `Enter` to copy.
-   **One-Click Copy**: Copy any generated timestamp code to your clipboard with a single click.
-   **Sleek, Modern UI**: A responsive and aesthetically pleasing interface built with Tailwind CSS and Framer Motion.
-   **Informative FAQ**: An integrated FAQ section explains why and how to use Discord timestamps for each mode.

## 🚀 How to Use

The generator has four distinct modes to cover every use case.

### 1. Natural Mode

This is the default and fastest mode.
1.  Start typing any date, time, or duration in the input box.
2.  As you type, a list of timestamp formats will appear with live previews.
3.  Click on any suggestion or use your arrow keys and `Enter` to copy the timestamp code.

**Examples:**
-   `July 1st`
-   `now`
-   `1pm cst`
-   `in 2 hours`
-   `next Tuesday`

### 2. Manual Mode

For when you need precision.
1.  Select a date from the interactive calendar. You can navigate through months and years.
2.  Adjust the hour, minute, and second using the time input fields.
3.  Click "Set to Current Time" to quickly reset to the present moment.
4.  The generated timestamps will update in real-time below the controls.

### 3. Timezone Mode

Eliminate timezone confusion.
1.  Use the calendar and time inputs to set a source date and time.
2.  Select the "From" timezone and the "To" timezone. The tool will auto-detect your local timezone as a starting point.
3.  The converted time and corresponding timestamps will be generated automatically.

### 4. Reverse Mode

Decode existing timestamps.
1.  Copy a timestamp from a Discord message (e.g., `<t:1672531200:F>`).
2.  Paste it into the input box.
3.  The generator will instantly display the corresponding date and time in your local timezone, UTC, and relative format.

## 💻 Tech Stack

-   **Framework**: [React](https://reactjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Date Parsing**: [Chrono-node](https://github.com/wanasit/chrono)
-   **Date Formatting**: [Moment.js](https://momentjs.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later recommended)
-   A package manager like [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  Clone the repository to your local machine.
    ```sh
    git clone <repository-url>
    ```
2.  Navigate into the project directory.
    ```sh
    cd <project-directory>
    ```
3.  Install the dependencies.
    ```sh
    npm install
    ```
4.  Start the development server.
    ```sh
    npm start
    ```
The application should now be running locally, typically at `http://localhost:3000`.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 🙏 Acknowledgements

-   Heavily inspired by the excellent timestamp generator at [dabric.xyz](https://timestamp.dabric.xyz).
-   Timezone conversion powered by the [timeapi.io](https://timeapi.io/) API.
-   Created by Moin Uddin in collaboration with Oli Ullah.

## 📄 License

Distributed under the MIT License.
