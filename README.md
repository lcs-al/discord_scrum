# Discord Scrum Bot

A Discord bot designed to assist engineering teams with Scrum processes, daily meetings, and CI/CD notifications.

## 🤖 Slash Commands

### Management
- **/devs list**
  - Displays a list of all developers registered in the database (User + Nickname).
- **/devs set `user` `nickname`**
  - Associates a Discord User with a specific nickname (used for accurate notifications from Jira/Bitbucket).
- **/devs remove `user`**
  - Removes a developer from the registry.

### Notifications Configuration
- **/set_ticket_channel `channel`**
  - Sets the text channel where **new Jira ticket** notifications will be posted.
- **/set_deploy_channel `channel`**
  - Sets the text channel where **build and deploy status** updates will be posted.
- **/set_release_channel `channel`**
  - Sets the text channel where **release notes** will be posted.
- **/setup_alarms_channel**
  - Sets the current text channel as the destination for **AWS SNS Alarms**.

### Productivity Tools
- **/links add `key` `url`**
  - Saves a useful link with a quick-access key.
- **/links show `key`**
  - Retrieves a specific link.
- **/links show_all**
  - Lists all saved links for the server.
- **/links delete `key`**
  - Removes a saved link.
- **/whos_missing**
  - Compares users in the text channel vs voice channel to see who is missing from the Daily.
- **/finish_daily**
  - Marks the current daily meeting as finished.
- **/setup_daily**
  - Configures the Daily meeting settings.

---

## 🔌 API Endpoints

The bot exposes an HTTP server (default port 3000) to receive webhooks from external tools (Jira, Bitbucket, CI Pipelines).

### 1. Ticket Notifications
**POST** `/ticket`
- **Source**: Jira Automation / Webhook.
- **Payload**: Standard Jira Issue JSON.
- **Action**: Sends a rich embed to the configured Ticket Channel.

### 2. Comment Notifications
**POST** `/comment/pullrequest`
- **Source**: Bitbucket / Jira Webhook.
- **Payload**: Comment payload containing author and PR details.
- **Action**: Lookups the Discord user via the registered **Nickname** (from `/devs`) and sends a Direct Message (DM).

### 3. Build & Deploy Status
**POST** `/build_status`
- **Source**: CI/CD Pipeline (e.g., Bitbucket Pipelines, Jenkins).
- **Payload**: JSON with `state` ('SUCCESSFUL' or 'FAILED'), `repository`, `commit`, etc.
- **Action**: Sends a status embed to the configured Deploy Channel.

### 4. Release Notes
**POST** `/release`
- **Source**: Release Pipeline / Script.
- **Payload**: JSON `{ version, total, issues: [{ type, key, title }] }`.
- **Action**: Groups issues by type and sends a formatted Release Note embed to the configured Release Channel.

### 5. General Alerts
**POST** `/alert`
- **Source**: External monitoring tools.
- **Action**: Sends a general alert message.

### 6. AWS SNS Alarms
**POST** `/aws/alarms`
- **Source**: AWS Simple Notification Service (SNS).
- **Supports**: `SubscriptionConfirmation` and `Notification` types.
- **Action**:
  - **Confirmation**: Sends a clickable confirmation link to the configured Alarms Channel.
  - **Notification**: Sends a Red Alert Embed with the alarm subject and message.

## 🛠️ Setup

1. **Environment Variables**:
   Create a `.env` file with:
   ```env
   DISCORD_TOKEN=your_token
   CLIENT_ID=your_client_id
   DATA_BASE_URL=your_firebase_url
   PORT=3000
   JIRA_URL=your_jira_url
   ```

2. **Register Commands**:
   Run the deployment script to register slash commands in your guild:
   ```bash
   node src/deploy-commands.js
   ```

3. **Start Bot**:
   ```bash
   npm start
   ```
