# v0


## Overview

v0 is applijobs version 0 Application

Comming soon on production  

## Getting Started

### Prerequisites



1. **Node.js and npm:**
   - Install Node.js, which includes npm (Node Package Manager). You can download the 18.16.0 version from the [official Node.js website](https://nodejs.org/).

2. **MongoDB: (optional )** 
   - Install MongoDB, the NoSQL database used in MEAN stack applications. You can download and install MongoDB from the [official MongoDB website](https://www.mongodb.com/try/download/community).

3. **Angular CLI:**
   - If your MEAN stack application involves an Angular front end, you'll need the Angular Command Line Interface (CLI). Install it globally using npm:
     ```bash
     npm install -g @angular/cli
     ```

4. **Express.js:(optional )**
   - Express.js is the web application framework for Node.js. You can install it as a project dependency using npm:
     ```bash
     npm install express --save
     ```

5. **Additional Node.js Modules:(optional )**
   - Depending on your application requirements, you might need additional Node.js modules. Common ones include:
     ```bash
     npm install body-parser mongoose cors
     ```

6. **Code Editor:**
   - Choose a code editor for development. Popular choices include Visual Studio Code, Atom, or Sublime Text.

7. **Git :**
   - Install Git if you plan to use version control for your project. You can download Git from the [official Git website](https://git-scm.com/).

### Installation
If you prefer to use HTTPS, you can generate a personal access token and use it as your password. Follow these steps:
* Go to your GitHub account settings.
* Navigate to "Developer settings" > "Personal access tokens."
* Generate a new token with the "repo" scope.
* Use the generated token as your password when prompted.
bash
Copy code

or
```bash
git clone https://<your-token>@github.com/Applijobs1/v0.git
```
or
```bash
git clone git clone https://[your Username]@github.com/Applijobs1/v0.git
```
### Install npm packages
Install the npm packages described in the package.json and verify that it works:

*server 
cd v0/job-portal-node-server-master
```bash
npm i
```
```bash
npm start
```
The npm start command runs server on port 5500.

*Client
```bash
cd v0/app
```
```bash
npm i 
```
```bash
ng serve 
```

The ng serve command builds the client application and run on port 4200.





