
<br />
<p align="center">
  <a href="https://prediqt.com/" style="background: black;">
    <img src="https://prediqt.com/images/prediqt-beta-logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Prediqt Telegram Bot</h3>

  <p align="center">
    Get real-time alerts on Telegram for all the transactions related to PrediQT
    <br />
    <a href="https://docs.prediqt.com/getting-started/what-is-prediqt"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://t.me/PredIQt_DevBot">View Demo</a>
  </p>
</p>


<!-- GETTING STARTED -->
### Features:
-------------------------------------------------------------------

1. Get real-time alerts on Telegram for all the transactions related to PrediQT
2. Alerts when Orders are placed, cancelled, partially filled and filled
3. Alerts for markets you are participating in, when created, ended, resolved, accepted and rejected
4. Alerts when Shares are available to claim, when shares are claimed and transferred to another account
3. No Spam, Alerts are sent for accounts that you are interested in
4. Monitor any account



### Installation
-----------------------------------------------------------
To get a local copy up and running follow these simple steps.

Prerequisites node >= 12 npm >= 6 


1. Clone the repo

   ```sh
   git clone https://github.com/ChaituVR/prediqt_telegram_bot.git
   ```

2. Install NPM packages

   ```sh
   cd prediqt_telegram_bot
   npm install
   ```

3. Edit `.env` file with bot keys and dfuse api keys

    ```sh
    cp .env.example .env
    nano .env
    ```
4. Start server

    ```sh
    npm start
    ```
5. Start server for development

    ```sh
    npm run dev
    ```