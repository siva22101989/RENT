# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running the Project

You cannot run a live web application directly on the GitHub.com website. GitHub is for storing and managing code. To run this application, you have two main options:

### Option 1: Running on Your Local Computer (Recommended)

This is the standard way to work on a web application.

1.  **Clone the Repository:**
    Download the code from GitHub to your computer.
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install Dependencies:**
    Open a terminal in the project's root folder and run this command. It installs all the necessary packages for the app to work.
    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    After installation, run this command to start the app.
    ```bash
    npm run dev
    ```

4.  **View the App:**
    Your terminal will show you a local URL, typically `http://localhost:9002`. Open this address in your web browser to see and interact with your running application.

### Option 2: Running with GitHub Codespaces

This method lets you run the project in a development environment in your browser, without installing anything on your computer.

1.  **Open in Codespaces:**
    On your GitHub repository page, click the green **`< > Code`** button.

2.  **Create a Codespace:**
    Go to the **"Codespaces"** tab and click **"Create codespace on main"**. This will set up a virtual machine for you, which may take a minute or two.

3.  **Start the App:**
    Once the Codespace is ready, a terminal will be available at the bottom of the screen. Just like running it locally, type the following command to start the app:
    ```bash
    npm run dev
    ```

4.  **View the App:**
    A notification will appear telling you the app has started. Click **"Open in Browser"** to see your running application on a new public URL.

## Deploying to the Web

To make your application public and accessible to everyone, you need to deploy it to a hosting service. This project is configured for **Firebase App Hosting**. When connected to a Firebase project, any changes pushed to the `main` branch on GitHub will be automatically built and deployed.
