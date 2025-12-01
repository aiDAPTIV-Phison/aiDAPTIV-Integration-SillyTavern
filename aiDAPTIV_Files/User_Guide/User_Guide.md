# Phison SillyTavern User Guide

## Overview

Welcome to the Phison SillyTavern User Guide! This comprehensive guide will walk you through the installation, setup, and usage of Phison's integration with SillyTavern.

Phison SillyTavern is an AI-powered roleplay interface that leverages the innovative **aiDAPTIV+** KV Cache technology to provide lightning-fast responses to your questions. By building a knowledge cache of your chat context, it enables near-instantaneous answers and significantly enhances your experience.

This guide covers:

- Understanding the aiDAPTIV+ KV Cache feature
- How to use the application with demo examples
- Installation and setup procedures
- Troubleshooting common issues

Let's get started!

---

## 1. Installation

We have provided an automated PowerShell script to streamline the installation process.

### Step 1: Clone the Repository

Open your terminal (PowerShell recommended) and clone the project:

```powershell
git clone <repository-url>
cd aiDAPTIV-Integration-SillyTavern
```

### Step 2: Run the Auto Installer

Run the installer script to set up Node.js (if not already installed) and install all dependencies.

```powershell
./installer/auto_install.ps1
```

_Note: You may need to run PowerShell as Administrator if Node.js needs to be installed._

This script will:
1. Check for Administrator privileges.
2. Install Node.js (using the MSI installer in the `installer` folder) if needed.
3. Refresh environment variables.
4. Install project dependencies (`npm install`).
5. Start the SillyTavern server automatically.

---

## 2. Prerequisites

Before installing, ensure your system meets the following requirements:

- **OS**: Windows (PowerShell required for the installer script)
- **Node.js**: Version 18 or higher (The installer will attempt to install it if missing)

---

## 3. Feature Showcase: aiDAPTIV+ & Demo

The core feature of this integration is the **Automatic KV Cache Warming**. This ensures that when you interact with an AI agent, the context is pre-processed, resulting in faster response times.

### Demo Scenario

We have provided a demo session to showcase the capabilities.

#### 1. Start with Demo Mode (Recommended)

We have simplified the process with a one-click script that automatically sets up the environment.

1. Navigate to the `Example` folder in the project directory.
2. Double-click on **`Demo_start.bat`**.
3. This script will:
   - Install any missing dependencies.
   - Start the server in Demo mode.
   - **Automatically trigger the KV Cache Warming** immediately upon creation.

#### 2. Triggering the KV Cache Build (Manual)

If you want to see the KV Cache build process in action manually:

1. Open the **Character Settings** (the card icon in the top bar).
2. Select a character or create a new one.
3. Navigate to the **Advanced Definitions** or **Description** fields.
4. Make a small edit to the character's description or scenario.
5. **Wait for a few seconds**.
   - The system automatically detects the change.
   - It sends a background request to the local AI model to "warm up" the KV Cache.

#### 3. Experience the Speed

Once the cache is built:

1. Return to the chat window.
2. Send a message to the character.
3. Notice that the **Time to First Token (TTFT)** is significantly reduced compared to a standard cold start.

---

## 4. Running the Application

Once the installation is complete, you have two options to start the application.

### Option A: Demo Mode (Recommended for Showcase)

1. Go to the `Example` folder.
2. Run `Demo_start.bat`.
3. This will launch the application in a special demo configuration.

### Option B: Standard Mode

1. Go to the project root directory.
2. Run `Start.bat`.
3. This script will:
   - Install dependencies if needed.
   - Launch the server at **<http://localhost:8000>**.
   - Automatically open your default web browser.

---

## 5. Configuration

### Model Provider Settings

By default, the application is configured to connect to a local LLM endpoint.

To verify or change this:

1. Click the **API Connections** icon (plug icon) in the top navigation bar.
2. Select **Text Completion** -> **API Type**.
3. Choose your backend (e.g., **OpenAI Compatible** if using a local server like llama.cpp or aiDAPTIV+ proxy).
4. Ensure the **API URL** is pointing to your local aiDAPTIV+ server (e.g., `http://localhost:13141/v1`).

---

## 6. Troubleshooting

**Q: The application is not starting.**
A: Check the terminal window for error messages. Ensure Node.js is correctly installed and added to your PATH. You can try running `./installer/auto_install.ps1` again.

**Q: The KV Cache doesn't seem to trigger.**
A: The trigger has a debounce timer. Make sure you stop typing for a few seconds after editing character definitions.

---
