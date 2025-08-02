# Friday: An AI-Powered Learning Experience Engine

**Friday** is an AI-powered educational platform that transforms a single user prompt into a complete, interactive learning course, featuring dynamically generated video content.

This project is an end-to-end system designed to tackle significant challenges in asynchronous processing, automated media creation, and maintainable backend architecture.

---

## 🚀 Core Features

* **AI-Driven Course Creation:** Generates a full curriculum, including modules and chapters, from a user's single learning goal.
* **Automated Video Lecture Pipeline:** A server-side system that automatically produces video lectures by rendering React components, synthesizing voiceovers, and processing the media for streaming.
* **Real-time User Feedback:** Provides a live, engaging user experience by showing the progress of the course creation process in real-time.
* **Asynchronous Task Handling:** Manages long-running AI and video generation tasks in the background to ensure the user interface remains fast and responsive.
* **Organized Backend Architecture:** Built with a clear separation between business logic (Service Layer) and database operations (Repository Pattern) for clean, testable code.
* **Contextual Asset Search:** Uses a vector database (Pinecone) to find relevant icons and memes based on the semantic meaning of the content.

---

## 🛠️ Problems Solved & Key Engineering Decisions

This project was built to solve several difficult engineering problems. Here’s a look at the challenges and the solutions I implemented.

### 1. Challenge: Handling Long-Running, Unpredictable Tasks

Simple API requests time out after a few seconds, but AI generation and video rendering can take several minutes. A standard request-response model would fail and create a terrible user experience.

**Solution: Asynchronous Job Processing with Real-time Feedback**

1.  **Offloading Heavy Work:** When a user requests a course, the API immediately pushes the task to a background job runner (**Trigger.dev**). This allows the API to instantly respond to the user, confirming the process has started without getting blocked.
2.  **Ensuring Scalability:** By moving these intensive tasks to a separate process, the main application remains available and responsive to other users.
3.  **Providing Real-time Updates:** The user isn't left waiting. The background job publishes status updates at each stage of the process (e.g., "Generating Modules," "Creating Video Chunks") to a **Pusher** channel. The frontend subscribes to this channel and displays the progress live, creating an engaging and transparent experience.

### 2. Challenge: Automating Video Content Creation from Scratch

Creating video content manually is slow and expensive. The goal was to build a fully automated pipeline that could generate video lectures programmatically based on the AI-generated course content.

**Solution: A Multi-Stage Media Generation Pipeline**

I designed and built a complete, server-side pipeline that turns text into a streamable video:

1.  **AI Script & Slide Generation:** The `VideoService` first uses an LLM to generate a narration script for a chapter, broken down into logical segments (slides). For each segment, it makes another LLM call to generate the visual content for a slide, intelligently choosing the best React component (`HeroSlide`, `CodeDemoSlide`, etc.) and its props.
2.  **Voiceover Synthesis:** Each narration segment is sent to OpenAI's Text-to-Speech (TTS) API to generate an MP3 audio file.
3.  **Headless Component Rendering:** This is the core of the visual generation.
    * The generated slide data (component type + props) is temporarily stored in **Redis**.
    * **Puppeteer**, a headless browser, is launched on the server. It navigates to a special, isolated React route (`/sxzy/[slideId]`).
    * This route fetches the data from Redis and renders the specified React component.
    * Puppeteer waits for all dynamic content on the page (like diagrams or code highlighting) to finish rendering and then takes a high-resolution screenshot.
4.  **Video Chunk Creation:** The screenshot (image) and the corresponding MP3 voiceover (audio) are passed to **FFMPEG**. It combines them into a short MP4 video clip, with the video's duration matching the length of the audio.
5.  **Final Assembly and Streaming Preparation:**
    * Once all video chunks for a chapter are created, **FFMPEG** concatenates them into a single, final video file.
    * This final video is then processed one last time to convert it into the **HLS (HTTP Live Streaming)** format, which breaks the video into small `.ts` segments and creates a `.m3u8` playlist. This is the standard for efficient, adaptive video streaming on the web.
    * The resulting HLS files are uploaded to a blob storage service for delivery.

### 3. Challenge: Building a Maintainable and Testable Backend

As the project's complexity grew, it became critical to avoid tightly-coupled code that would be difficult to debug, maintain, or test.

**Solution: A Decoupled, Layered Architecture**

I implemented a classic **Service Layer** and **Repository Pattern** to structure the backend code:

* **Repository Pattern (`/src/lib/repository`):** This layer is responsible for all direct database interactions. For example, `UserRepository` has methods like `getUser` and `createUser`. It completely abstracts the database, so the rest of the application doesn't need to know how the data is stored.
* **Service Layer (`/src/lib/services`):** This layer contains the core business logic. For instance, the `CourseService` handles the logic for creating a course. It calls the `CourseRepository` to save data but also orchestrates other services, like the `LLMService` to generate content and the `IconsProvider` to find icons.

This separation makes the system much easier to manage. I can test business logic without needing a live database connection (by mocking the repository), and I can change the database in the future by only updating the repository layer.

---

## 💻 Technology Stack

| Category              | Technologies                                     |
| :-------------------- | :----------------------------------------------- |
| **Framework** | Next.js 15 (App Router), React 19                |
| **Language** | TypeScript                                       |
| **Styling** | Tailwind CSS, Framer Motion                      |
| **Database** | MongoDB with Mongoose                            |
| **Authentication** | Clerk                                            |
| **AI / LLM** | OpenAI (GPT-4), LangChain.js, AI SDK             |
| **Background Jobs** | Trigger.dev                                      |
| **Real-time** | Pusher                                           |
| **Vector Database** | Pinecone                                         |
| **Media Processing** | FFMPEG, Puppeteer                                |
| **Validation** | Zod                                              |
| **Testing** | Vitest                                           |
| **Deployment** | Vercel (Frontend), Cloudflare (OpenNext)         |

---

## 🏁 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/dopecape-friday.git](https://github.com/your-username/dopecape-friday.git)
    cd dopecape-friday
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    * Copy the `.env.example` file to `.env.local`.
    * Fill in the required API keys and secrets for Clerk, OpenAI, Pinecone, etc.
    ```bash
    cp env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.
