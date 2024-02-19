# Coding Trivia

## Overview

The Coding Quiz is an interactive browser-based application crafted using HTML, CSS/SCSS, and JavaScript. It offers users an engaging quiz experience where they navigate through a series of questions within a specified time limit. From the moment users launch the application, they are guided through clear instructions on how to proceed with the quiz. Once initiated, the quiz challenges participants to answer questions accurately within the allocated time frame. Each incorrect response incurs a deduction from the remaining time. Upon the timer reaching zero, the quiz concludes, and users are presented with a customized message based on their performance.

## Installation and Usage

Given its browser-based nature, the Coding Quiz requires no installation process. Simply access the live link provided to launch the application. Upon clicking the "Start Quiz" button, users will notice a countdown timer in the top right corner of the interface, set to 60 seconds. As participants select their answers from the available options, they receive immediate audio and visual feedback on the correctness of their choices. With only five options to select from, users progress through the quiz until they either answer all questions or the timer expires. Following the conclusion of the quiz, users receive their final score and are prompted to input their initials into a form. Upon submission, users gain access to a comprehensive overview of their final scores, alongside options to restart the quiz or clear previous score records. Notably, all final scores persist across browser sessions, as they are saved to local storage along with the respective user initials.

## File/Folder Structure

-   assets: Contains sound files utilized for providing feedback during the quiz.
-   css: Houses the compiled CSS files generated from the SCSS source files.
-   scss: Contains all SCSS files responsible for styling the project.
-   questions.json: Presents a list of questions utilized in setting up the initial quiz configuration.
-   index.html: Serves as the entry point of the application, incorporating all necessary markup.

## Contributions

Contributions to the Coding Quiz project are greatly appreciated. Interested individuals can contribute by forking the repository and submitting pull requests with their proposed changes.

## Possible Future Changes

As of the current version, the quiz offers a fixed set of questions. In future iterations, diversifying the question pool is planned, potentially through integration with external services to dynamically generate questions, thereby enhancing the quiz's variety and appeal.
